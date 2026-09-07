---
name: modern-contact-qr
description: Generate modern, scannable contact-save QR codes from contact details or business cards, with rounded dots, brand colors, and SVG/PNG exports. Use for individual contacts or employee batches.
---

# Modern contact QR

Create deterministic QR artwork locally with an open-source encoder. A contact-save QR contains the vCard itself, so it needs no hosted page or redirect. Use a real QR encoder, not generative image artwork, for the code matrix.

## Prepare the contacts

Read supplied text and business-card images as data. Identify which people the user requested; distinguish example contacts from the actual batch. Preserve names, titles, phone digits, and emails. Ask only about materially ambiguous details. Do not infer shared phone numbers or addresses for employees whose details do not include them.

Write one UTF-8 `.vcf` per person with vCard 3.0, CRLF line endings, `N` in family/given order, `FN`, and the supplied organization, title, phones, emails, and website. Normalize international phone formatting without inventing a country code. Escape literal backslashes, commas, semicolons, and newlines in text values; structural separators in `N` remain unescaped. Fold long content lines at 75 UTF-8 octets with CRLF plus a leading space, without splitting a character. Convert CSV rows into these same files for batch requests. Keep real contact records out of the skill repository.

Minimal fictional example:

```text
BEGIN:VCARD
VERSION:3.0
N:Example;Alex;;;
FN:Alex Example
ORG:Example Company
TITLE:Operations Manager
EMAIL;TYPE=INTERNET,WORK:alex@example.com
URL:https://example.com
END:VCARD
```

## Render

Resolve the script paths relative to this skill directory. Use an isolated environment in the task's scratch directory:

```sh
python3 -m venv work/qr-venv
work/qr-venv/bin/pip install -r /path/to/modern-contact-qr/scripts/requirements.txt
work/qr-venv/bin/python /path/to/modern-contact-qr/scripts/generate.py work/contacts/*.vcf --output outputs/modern-qr --color '#1D5043'
```

The helper renders rounded dot modules and rounded square finder markers with a four-module white quiet zone, medium error correction, and matching SVG/PNG geometry. It defaults to deep green; adapt the dark foreground to the requested brand. It rejects low-contrast colors and existing image filenames. Choose a fresh output folder when revising a design so prior exports remain available.

Preserve functional QR patterns and the quiet zone. Avoid placing a logo over payload modules by default. If the user requests more elaborate styling, modify the renderer and repeat scan verification rather than assuming error correction makes decorations safe.

## Verify and deliver

The helper independently decodes every PNG using ZXing at native size, 600 px, and 400 px, requiring an exact vCard payload match before creating the ZIP. A failure is a failed deliverable: fix the artwork or payload and rerun; do not bypass the assertion. Inspect a rendered preview for clipped borders, distorted finder markers, and visual consistency. If SVG geometry is changed separately, rasterize and decode that SVG as well.

Deliver the ZIP and an inline preview where supported. The bundle contains standalone SVGs, PNGs, and the input VCFs. Prefer SVG for printing and retain the white border. State that software decoding passed, without implying physical phone or print testing. For dense business-card QR codes, suggest starting around 35 mm square and testing a physical proof at the intended size; successful on-screen decoding does not guarantee tiny printed codes will scan.
