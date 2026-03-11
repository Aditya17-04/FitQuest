# FitQuest: An AI‑Personalized, Family‑Centric Intervention to Increase Children’s Physical Activity

Authors: FitQuest Team  
Affiliation: —  
Contact: —  
Version: 2.0 (Draft)

## Abstract

Abstract—Physical inactivity and excessive screen time in childhood are linked to adverse health and developmental outcomes [@WHO-PA; @AAP-ScreenTime]. FitQuest is a gamified, family‑centric application that delivers brief (2–5 minute), age‑appropriate physical activity challenges personalized by contextual signals (weather, space constraints, parental preferences). The system comprises a Vite/React frontend (Tailwind + shadcn‑ui), Supabase for authentication/database/storage, and a Deno edge function that invokes an LLM to generate safe, schema‑constrained challenges conditioned on current weather. This paper describes the motivation, literature basis, and design, and presents a comparative discussion of FitQuest versus static challenge sets, exergames, and generic habit trackers. We conclude with limitations and future directions including sensor‑based validation and adaptive personalization.

Index Terms—Gamification, children’s physical activity, personalization, context‑aware systems, large language models, family‑centric design, Supabase, React, weather‑aware recommendations.

## I. Introduction

Physical inactivity and excessive screen exposure remain stubbornly high among children despite clear public‑health guidance on daily activity and media use [@WHO-PA; @AAP-ScreenTime]. Beyond knowledge of guidelines, families face practical barriers—limited indoor space, inclement weather, constrained time windows, and uneven parental bandwidth—that raise the activation energy for healthy play. Traditional solutions (long exercise sessions, equipment‑heavy exergames, or generic habit trackers) often misalign with these day‑to‑day constraints, contributing to low adherence.

FitQuest targets this gap with a pragmatic, family‑centric design that meets children where they are—at home, between tasks, and within short attention spans. The core idea is to transform activity into brief, playful “snacks” (2–5 minutes) that are immediately achievable and intrinsically motivating, while giving caregivers clear guardrails and control. Our design is guided by three principles: (1) lower friction by making the next best action obvious and doable; (2) adapt to context (age, household space, weather) so suggestions feel safe and feasible; and (3) sustain interest with a light engagement loop rather than heavy game mechanics, consistent with autonomy‑supportive motivation [@SDT].

Design goals
- Lower activation energy: Offer one‑tap, equipment‑free challenges that fit micro‑breaks.
- Context fit: Tailor tasks to age, apartment size/backyard access, and current weather.
- Family governance: Keep parents in control of time budgets, profiles, and visibility.
- Gentle engagement: Use points, chapters, and a digital pet for feedback—not compulsion.
- Privacy by default: Minimize data; store only what is needed for function and progress.

System overview (high‑level)
- Client: A React (Vite/TypeScript/Tailwind/shadcn‑ui) app renders challenges, manages profiles, and enforces a screen‑time budget.
- Platform: Supabase provides Auth (JWT), Postgres with Row‑Level Security (RLS), and Storage for optional photos.
- Edge intelligence: A Deno edge function fetches weather, prompts a large language model (LLM), and returns schema‑constrained challenges that pass safety checks.

This paper makes the following contributions:
1) A safety‑constrained, weather‑ and space‑aware challenge generation pipeline that uses strict JSON schemas to improve LLM controllability and client/server validation.  
2) A family‑centric product architecture that combines parental controls (screen‑time budgeting, multi‑child profiles, photo settings) with a lightweight engagement loop (points, chapters, digital pet).  
3) A practical evaluation frame emphasizing feasibility and early efficacy signals (daily completion rate, weekly active days, and time‑to‑drop‑off), with clear limitations and a path to objective sensing in future work.

Scope: We focus on feasibility and short‑term engagement in home settings. Clinical efficacy, sensor‑validated MVPA, and large‑scale RCTs are out of scope for this iteration but discussed as future directions.

## II. Methodology

This section details how FitQuest implements the architecture in Fig. 1, from client authentication to AI‑assisted challenge generation, data persistence, guardrails, and observability.

### A. System Architecture

Figure 1 depicts the system architecture comprising the React client, Supabase services (Auth, Postgres with RLS, Storage), a Deno edge function for challenge generation, and external providers (WeatherAPI.com and a Groq‑hosted OpenAI‑compatible LLM).

![Fig. 1. FitQuest system architecture.](figures/architecture.png)

### B. System Components and Responsibilities

- Client (React): Presents the play experience, handles sign‑in/sign‑up with Supabase Auth, reads/writes profile and completion data, uploads optional photos, and invokes the edge function to fetch personalized challenges.
- Supabase:
	- Auth issues a JWT session after successful sign‑in/sign‑up; the client attaches the token to subsequent requests.
	- Postgres (with Row‑Level Security, RLS) stores `profiles`, `children`, and `challenge_completions`; RLS ensures users access only their rows.
	- Storage holds optional photos tied to completions.
- Edge Function (`generate-challenges`, Deno): Receives a signed request from the client, fetches current weather, constructs a constrained LLM prompt, validates and returns a JSON array of challenges plus normalized weather.
- External Services: WeatherAPI.com for conditions; Groq LLM (OpenAI‑compatible) for controlled text generation.

### C. End‑to‑End Data Flow

1) Authentication: The user signs in from the client; Supabase Auth returns a JWT session.  
2) Context collection: The client collects household context (child age, space, backyard access) from parent settings.  
3) Invocation: The client calls the edge function with context and location (if provided).  
4) Weather acquisition: The function queries WeatherAPI.com and derives descriptors (e.g., hot/cold, rainy).  
5) Prompting: The function constructs a strict prompt requiring a JSON array of exactly three challenges with fixed keys and embedded safety constraints.  
6) Validation: The function strips code fences, parses JSON, checks schema and safety rules, and returns `{ challenges, weather }`.  
7) Persistence: On completion, the client writes a row to `challenge_completions`; optional photo goes to Storage with the row ID as reference.

### D. Prompt Design and Output Schema

Inputs include `childAge`, `hasBackyard`, `apartmentSize`, and normalized weather. The prompt enforces:
- Exactly three challenges, each with: `title`, `description`, `instruction`, `type`, `isIndoor`, `count`, `reward`.
- Duration 2–5 minutes; age appropriateness; space awareness; indoor‑only if rainy/very cold.
- Fixed JSON output; no preface or trailing commentary.

Post‑processing:
- Remove code fences if present; attempt parse; on failure, retry with backoff.  
- Validate keys and types; drop or correct out‑of‑policy items; return a safe subset.

### E. Safety, Privacy, and Access Control

- Safety policy in prompt and client UI (e.g., indoor‑only in rainfall/extreme cold; no hazardous movements for the stated age).  
- RLS restricts data to owners; JWT identifies the user on every query.  
- Photos are optional; guidance discourages faces/PII; users can delete uploads.  
- Minimal data principle: location is transient for weather and not stored by default.

### F. Observability and Evaluation Signals

- Client emits analytics events for challenge generation, starts, completions, and cancellations.  
- Edge logs weather coverage, retries, and JSON sanitation failures.  
- Derived metrics for pilots: daily completion rate, weekly active days, time‑to‑drop‑off, and parent sentiment.

### G. Reliability, Errors, and Fallbacks

- Timeouts and structured error codes at the edge function.  
- On LLM or parsing failure after N retries, fall back to a small curated challenge set consistent with the same safety rules.  
- Client‑side debouncing to avoid duplicate invocations; idempotent completion writes where feasible.

### H. Pseudocode for Challenge Generation (Edge)

```text
handleRequest(ctx) {
	input = getContextFromJWTAndBody(ctx)
	weather = fetchWeather(input.location)
	prompt = buildPrompt(input.childAge, input.space, weather)
	for attempt in 1..MAX_RETRY {
		raw = callLLM(prompt)
		json = tryParseStrictJSON(stripFences(raw))
		if (isValid(json) && passesSafety(json, input, weather)) break
		prompt = reinforceSchemaAndSafety(prompt, lastError)
	}
	if (!json) json = curatedFallback(input, weather)
	return { challenges: normalize(json), weather: summarize(weather) }
}
```

## III. Literature Review

- Motivation and behavior change: Self‑Determination Theory emphasizes autonomy, competence, and relatedness; short mastery‑oriented tasks with immediate feedback can foster internal motivation [@SDT].
- Gamified health for youth: Meta‑analyses of exergames and active play apps show improvements in energy expenditure and activity, but adherence and contextual fit remain challenges [@Exergames-Meta].
- Context‑aware design: Weather and seasonal factors affect physical activity; constraints should adapt recommendations to maintain feasibility and safety [@Weather-Reco].
- Family involvement: Parental scaffolding and co‑play features can strengthen norms and increase sustained engagement in children’s health behaviors.

## IV. Results and Discussion (Comparative Study)

We compare FitQuest conceptually with (1) static challenge sets, (2) exergames, and (3) generic habit trackers, along five dimensions: personalization, safety/context fit, engagement, family involvement, and implementation complexity.

- Static challenge sets: Offer low complexity and predictable content but lack personalization. FitQuest’s weather‑ and space‑aware generation increases feasibility (e.g., indoor balance tasks on rainy days) and variety without manual curation.
- Exergames: Provide high engagement via game mechanics, but often require specific hardware, larger spaces, or long sessions. FitQuest focuses on short, equipment‑free activities that fit micro‑breaks and small apartments, potentially improving adherence for time‑constrained families.
- Generic habit trackers: Facilitate logging and streaks but rarely suggest context‑aware actions. FitQuest proactively suggests actionable, age‑appropriate activities aligned with constraints, reducing decision friction.
- Safety and ethics: FitQuest constrains generation by age and environment and routes control to caregivers; this safety‑first posture contrasts with open‑ended content sources. Data collection is minimized by design, aligning with family‑privacy expectations.
- Implementation tradeoffs: LLM‑based generation adds failure modes (parsing, guardrails); we mitigate with strict schema prompts, retry/backoff, and client‑side validation. When the model is unavailable or returns invalid JSON, the app can fall back to a small curated set.

Limitations: The current evaluation does not yet include objective MVPA; outcomes are initially engagement‑centric. Comparative effectiveness versus exergames still requires prospective study with sensor‑based endpoints.

## V. Future Scope

- Sensor integration: Optional step counts and coarse activity classification via phone or wearables for objective metrics and ground‑truth.
- Adaptive personalization: On‑device bandits or lightweight models to tailor challenge types, durations, and rewards to each child’s response history.
- Safety knowledge base: Curated movement library by age and space, with explicit constraints to strengthen guardrails around LLM outputs.
- Social and family modes: Co‑play quests, sibling coordination, and asynchronous challenges to increase enjoyment and norms.
- Accessibility: Multimodal instructions (audio), adjustable difficulty, and inclusive movement options.

## VI. Conclusion

FitQuest operationalizes brief, context‑aware activity prompts for children within a family‑centric design. By coupling safety‑constrained LLM generation with simple rewards and parental controls, the system aims to reduce activation energy for healthy play. Early use should prioritize feasibility and engagement; future work will add sensor validation and adaptive personalization to strengthen evidence of efficacy.

## Acknowledgment

We thank early testers and participating families for formative feedback on usability and safety.

## References

References are managed in `docs/references.bib` and rendered via Pandoc citations (e.g., [@WHO-PA]).

---

Appendix. Implementation Snapshot (for reproducibility)

- UI: Vite + React (TypeScript), Tailwind, shadcn‑ui.
- Backend: Supabase Auth/Postgres/Storage with RLS.
- Edge function: Deno `serve`, WeatherAPI.com, Groq LLM API (OpenAI‑compatible). Key files include `src/components/AIChallengeSection.tsx` and `supabase/functions/generate-challenges/`.
- Guardrails: Strict JSON schema in prompt, retry/backoff, and client parsing; indoor‑only rules under rain/cold; age‑appropriateness.
