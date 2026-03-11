import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChallengeRequest {
  childAge: number;
  hasBackyard: boolean;
  apartmentSize: 'small' | 'medium' | 'large';
  latitude?: number;
  longitude?: number;
}
 
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { childAge, hasBackyard, apartmentSize, latitude, longitude }: ChallengeRequest = await req.json();

    console.log('Generating challenges for:', { childAge, hasBackyard, apartmentSize, latitude, longitude });

    let weatherData: any = null;
    let weatherDescription = "pleasant weather";
    let isRaining = false;
    let temperature = 20;

    if (latitude && longitude) {
      try {
        const weatherResponse = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=bbd4aa507d074fbaa0184828251611&q=${latitude},${longitude}&aqi=no`
        );
        weatherData = await weatherResponse.json();

        temperature = weatherData.current?.temp_c || 20;
        const condition = weatherData.current?.condition?.text?.toLowerCase() || '';

        isRaining = condition.includes('rain') || condition.includes('drizzle') || condition.includes('shower');

        if (isRaining) {
          weatherDescription = "rainy";
        } else if (temperature < 5) {
          weatherDescription = "cold";
        } else if (temperature > 30) {
          weatherDescription = "very hot";
        } else if (temperature > 25) {
          weatherDescription = "warm and sunny";
        } else if (condition.includes('cloud')) {
          weatherDescription = "cloudy";
        } else if (condition.includes('clear') || condition.includes('sunny')) {
          weatherDescription = "nice weather";
        } else {
          weatherDescription = "pleasant weather";
        }

        console.log('Weather data:', { temperature, condition, weatherDescription, isRaining });
      } catch (error) {
        console.error('Weather API error:', error);
      }
    }

    const spaceContext = apartmentSize === 'small'
      ? 'limited indoor space'
      : apartmentSize === 'large'
        ? 'spacious indoor area'
        : 'moderate indoor space';

    const outdoorContext = hasBackyard
      ? 'has access to outdoor space like a backyard'
      : 'limited outdoor access';

    const systemPrompt = `You are an expert child activity coordinator creating fun, age-appropriate physical challenges for kids. 
Your goal is to get children moving and being active while having fun.

Generate exactly 3 personalized physical activity challenges based on the following conditions:
- Child's age: ${childAge} years old
- Space: ${spaceContext}
- Outdoor access: ${outdoorContext}
- Weather: ${weatherDescription}, temperature ${temperature}°C${isRaining ? ' (raining)' : ''}

IMPORTANT RULES:
1. If it's raining or very cold (< 10°C), suggest ONLY indoor activities
2. If weather is nice and they have outdoor access, include at least 1-2 outdoor activities
3. Activities must be age-appropriate and safe for a ${childAge} year old
4. Each challenge should take 2-5 minutes to complete
5. Vary the types: movement, dance, balance, stretching, fun games
6. Make activities creative and exciting for kids
7. Consider the space constraints
8. Return ONLY a valid JSON array with no additional text or markdown

Response format (MUST be valid JSON only):
[
  {
    "title": "Activity name",
    "description": "Brief description",
    "instruction": "Clear step-by-step instruction for the child",
    "type": "movement",
    "isIndoor": true,
    "count": 10,
    "reward": 60
  }
]

Types: "movement", "dance", "balance", "strength", "stretching"
Reward points: 50-100 based on difficulty
Count: number of repetitions if applicable`;

    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY not configured');
    }

    const callAIWithRetry = async (maxRetries = 3): Promise<Response> => {
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Calling Groq AI (attempt ${attempt}/${maxRetries})...`);

          const aiResponse = await fetch(`https://api.groq.com/openai/v1/chat/completions`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GROQ_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: 'You are an expert child activity coordinator. Always respond with valid JSON only, no markdown formatting.'
                },
                {
                  role: 'user',
                  content: `${systemPrompt}\n\nGenerate 3 personalized physical activity challenges now.`
                }
              ],
              temperature: 0.8,
              max_tokens: 1024,
            }),
          });

          if (aiResponse.status === 429) {
            return new Response(
              JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
              { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (aiResponse.status === 402) {
            return new Response(
              JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
              { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (aiResponse.status === 502 || aiResponse.status === 503 || aiResponse.status === 500) {
            const errorText = await aiResponse.text();
            console.error(`AI gateway error (${aiResponse.status}), attempt ${attempt}/${maxRetries}:`, errorText);
            lastError = new Error(`AI gateway temporarily unavailable (${aiResponse.status})`);

            if (attempt < maxRetries) {
              const waitTime = Math.pow(2, attempt) * 1000;
              console.log(`Waiting ${waitTime}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              continue;
            }
          }

          if (!aiResponse.ok) {
            const errorText = await aiResponse.text();
            console.error('Groq AI error:', aiResponse.status, errorText);
            throw new Error(`AI request failed: ${aiResponse.status}`);
          }

          return aiResponse;

        } catch (error) {
          console.error(`Error on attempt ${attempt}:`, error);
          lastError = error instanceof Error ? error : new Error('Unknown error');

          if (attempt < maxRetries) {
            const waitTime = Math.pow(2, attempt) * 1000;
            console.log(`Waiting ${waitTime}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
      }

      throw lastError || new Error('AI request failed after retries');
    };

    const aiResponse = await callAIWithRetry();

    if (aiResponse.status !== 200) {
      return aiResponse;
    }

    const aiData = await aiResponse.json();
    console.log('AI response received:', JSON.stringify(aiData));

    // Groq uses OpenAI-compatible response format
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Unexpected AI response structure:', aiData);
      throw new Error('Invalid AI response format');
    }

    const content = aiData.choices[0].message.content;
    console.log('AI generated content:', content);

    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const challenges = JSON.parse(cleanedContent);

    if (!Array.isArray(challenges) || challenges.length === 0) {
      throw new Error('AI did not generate valid challenges');
    }

    console.log('Generated challenges:', challenges);

    return new Response(
      JSON.stringify({
        challenges,
        weather: {
          temperature,
          description: weatherDescription,
          isRaining
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating challenges:', error);

    let errorMessage = 'Failed to generate challenges. Please try again.';
    let status = 500;

    if (error instanceof Error) {
      if (error.message.includes('temporarily unavailable') || error.message.includes('502') || error.message.includes('503')) {
        errorMessage = 'The AI service is temporarily busy. Please try again in a moment.';
        status = 503;
      } else if (error.message.includes('GROQ_API_KEY')) {
        errorMessage = 'AI service not configured properly.';
      }
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error instanceof Error ? error.message : undefined
      }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});