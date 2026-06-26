---
name: nano-banana
description: Generate AI images using Google's Nano Banana Pro (Gemini 3 Pro Image) with automatic optimization for Expo/React Native apps. Use when user asks to generate images, create product photos, make app assets, generate icons, thumbnails, hero images, or any AI image generation task. Automatically creates @1x/@2x/@3x WebP variants optimized for mobile. Supports 1K/2K/4K resolution, image editing, and remixing multiple images.
---

# Nano Banana Pro Image Generator

Generate high-quality AI images and optimize them for Expo/React Native mobile apps.

## Setup

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your new API key

### 2. Set Your API Key

Choose one of these methods:

**Option A: Shell Config (Recommended)**

Add to `~/.zshrc` or `~/.bashrc`:
```bash
export GEMINI_API_KEY="your-api-key-here"
```
Then reload: `source ~/.zshrc`

**Option B: .env File**

Create `.env` in your project:
```
GEMINI_API_KEY=your-api-key-here
```

**Option C: Inline (One-time use)**
```bash
GEMINI_API_KEY="your-key" python scripts/generate.py "prompt"
```

### 3. Pricing

| Resolution | Cost per Image |
|-----------|----------------|
| 1K | ~$0.04 |
| 2K | ~$0.13 |
| 4K | ~$0.24 |

See [Google AI Pricing](https://ai.google.dev/pricing) for current rates.

## Requirements

- `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable (see Setup above)
- Python 3.10+
- Auto-installs: `gemimg`, `Pillow`

## Quick Reference

| Resolution | Pixels | Cost | Model |
|-----------|--------|------|-------|
| 1K | 1024×1024 | $0.04 | Pro or Flash |
| 2K | 2048×2048 | $0.13 | Pro only |
| 4K | 4096×4096 | $0.24 | Pro only |

| Expo Preset | Base @1x Size | Use Case |
|-------------|---------------|----------|
| icon | 24px | Tab icons, buttons |
| thumbnail | 64px | List items, avatars |
| card | 150px | Card images |
| product | 300px | Product listings |
| hero | 400px | Hero sections |
| full | original/3 | Full-width images |

## Workflows

### Generate + Optimize for Expo (Recommended)

```bash
python scripts/generate_and_optimize.py "Product description" \
  -o ./assets/images \
  -n product-name \
  --size 2K \
  -t product \
  -q 85
```

Output: `product-name@1x.webp`, `product-name@2x.webp`, `product-name@3x.webp`

### Generate Only

```bash
python scripts/generate.py "A luxury handbag, product photography" \
  -o output.png \
  --size 2K \
  --aspect-ratio 1:1
```

### Optimize Existing Image

```bash
python scripts/optimize_for_expo.py input.png \
  -o ./assets \
  -t product \
  -q 85
```

### Edit/Remix Images

```bash
python scripts/generate.py "Add sunset background" \
  -i original.png \
  -o edited.png

python scripts/generate.py "Combine these products" \
  -i product1.png \
  -i product2.png \
  -o combined.png
```

## CLI Options

### generate.py
- `-o, --output`: Output filename (default: output.png)
- `-i, --input`: Input image(s) for editing (repeatable)
- `--size`: 1K, 2K, 4K (default: 2K)
- `--aspect-ratio`: 1:1, 16:9, 9:16, 4:3, 3:4
- `--model`: pro (default), flash
- `--webp`: Save as WebP

### optimize_for_expo.py
- `-o, --output-dir`: Output directory
- `-t, --type`: icon, thumbnail, card, product, hero, full
- `-q, --quality`: 1-100 (default: 85)
- `-f, --format`: webp (default), png, jpg
- `--no-variants`: Skip @1x/@2x/@3x generation

### generate_and_optimize.py
- Combines all options from both scripts
- `-n, --name`: Base filename for outputs

## Prompt Tips

Nano Banana Pro responds well to:
- Detailed descriptions with Markdown formatting
- Photography terms: "product photography", "studio lighting", "DSLR"
- Quality descriptors: "professional", "high-quality", "detailed"
- Style references: "minimalist", "luxury", "modern"

## Usage in Expo Project

Import generated assets:

```tsx
import ProductImage from '@/assets/images/product@2x.webp';

<Image
  source={ProductImage}
  style={{ width: 300, height: 300 }}
  resizeMode="contain"
/>
```

React Native automatically selects @1x/@2x/@3x based on device density.
