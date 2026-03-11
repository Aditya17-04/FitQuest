# FitQuest Research Paper Docs

This folder contains the research paper draft and references.

- `research-paper.md` — Main paper (Markdown)
- `references.bib` — BibTeX placeholders you should replace with accurate citations

## Build (Windows PowerShell)

Requires Pandoc. Install with winget:

```powershell
winget install --id JohnMacFarlane.Pandoc -e
```

Then render IEEE‑styled outputs (DOCX/HTML quickly; PDF requires LaTeX):

```powershell
Set-Location "c:\fitquest\FitQuest\docs"

# DOCX with IEEE citation style
pandoc research-paper.md `
  --citeproc `
  --bibliography references.bib `
  --csl https://www.zotero.org/styles/ieee `
  -o research-paper-ieee.docx

# HTML with IEEE citation style
pandoc research-paper.md `
  --citeproc `
  --bibliography references.bib `
  --csl https://www.zotero.org/styles/ieee `
  -o research-paper-ieee.html

# PDF using IEEEtran (requires LaTeX with IEEEtran.cls, e.g., TeX Live/MiKTeX)
# If IEEEtran is installed, this produces two-column IEEE layout
pandoc research-paper.md `
  --from markdown+table_captions+tex_math_dollars `
  --citeproc `
  --bibliography references.bib `
  --csl https://www.zotero.org/styles/ieee `
  -V documentclass=IEEEtran -V classoption=conference `
  --pdf-engine=xelatex `
  -o research-paper-ieee.pdf
```

  ### Generate the architecture.png from Mermaid

  Install Mermaid CLI (requires Node.js):

  ```powershell
  npm install -g @mermaid-js/mermaid-cli
  ```

  Export the diagram:

  ```powershell
  Set-Location "c:\fitquest\FitQuest\docs\figures"
  mmdc -i architecture.mmd -o architecture.png -b transparent -t default
  ```

  Re-run Pandoc after generating `architecture.png` so the image is embedded in the paper.

Notes:
- The Markdown now follows IEEE conventions (Abstract with Index Terms; Roman numeral sections; Acknowledgment; numeric citations via IEEE CSL).
- Replace any placeholder BibTeX metadata in `references.bib` with accurate entries.
- The PDF command requires a LaTeX distribution that includes `IEEEtran.cls` (TeX Live or MiKTeX). DOCX/HTML do not require LaTeX.
- Add figures under `docs/figures/` and reference them from `research-paper.md`. The architecture diagram is `Fig. 1`.
