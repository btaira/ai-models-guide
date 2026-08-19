# AI Model Evidence Guide

A static, evidence-based guide to current AI model capabilities and training-data transparency. It distinguishes open weights from inspectable corpora, links primary model disclosures and corpus artifacts, and includes an interactive requirement-based advisor.

Run locally:

```powershell
python -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

Run the advisor and evidence-contract tests:

```powershell
node --test tests/site.test.mjs
```
