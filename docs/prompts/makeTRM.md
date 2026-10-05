# Prompt alias: `makeTRM`

> Reusable prompt. To run it, tell the agent: **`makeTRM`** — or paste the prompt below.

**Description:** Generate (or regenerate) the technical report in Word (.docx) format for the GeberLMS prototype.

## Prompt

Write a technical report in Word format on what has been implemented so far.
Recall the core concepts. Include a manual on how to use the prototype so far.

## Notes

- Output file: `docs/GeberLMS_Technical_Report.docx`
- Generator script (python-docx): `.codewhale/gen_report.py`
- Sources of truth for the content: `docs/spec/01-exigences.md`, `docs/spec/02-architecture.md`, `README.md`, and `.codewhale/handoff.md`.
