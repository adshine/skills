# 🍌 Nano Banana Pro - AI Image Generator for Expo/React Native

Generate high-quality AI images using Google's **Nano Banana Pro** (Gemini 3 Pro Image) with automatic optimization for Expo/React Native mobile apps.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-green.svg)

## Features

- 🎨 **AI Image Generation** - Generate images from text prompts using Nano Banana Pro
- 📱 **Expo/React Native Optimized** - Auto-generates @1x, @2x, @3x WebP variants
- 🖼️ **Multiple Resolutions** - Support for 1K, 2K, and 4K output
- ✏️ **Image Editing** - Edit existing images with natural language
- 🔀 **Image Remixing** - Combine multiple images into one

## Quick Start

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your new API key

### 2. Set Your API Key

Open your terminal and add this line to your shell config file (`~/.zshrc` on Mac or `~/.bashrc` on Linux):

```bash
export GEMINI_API_KEY="your-api-key-here"
```

Replace `your-api-key-here` with the API key you copied from Google AI Studio.

Then reload your config:
```bash
source ~/.zshrc  # or source ~/.bashrc on Linux
```

**Windows users:** Set the environment variable via System Properties → Environment Variables, or run:
```cmd
setx GEMINI_API_KEY "your-api-key-here"
```

### 3. Install Dependencies

```bash
pip install gemimg Pillow
```

### 4. Generate Images

```bash
# Generate a 2K image
python scripts/generate.py "A luxury handbag, product photography" -o handbag.png --size 2K

# Generate and optimize for Expo (creates @1x, @2x, @3x variants)
python scripts/generate_and_optimize.py "Product photo" -o ./assets -n product -t product
```

## Usage

### Generate Only

```bash
python scripts/generate.py "Your prompt here" \
  -o output.png \
  --size 2K \
  --aspect-ratio 1:1
```

**Options:**
- `-o, --output`: Output filename (default: output.png)
- `--size`: Resolution - 1K, 2K, 4K (default: 2K)
- `--aspect-ratio`: 1:1, 16:9, 9:16, 4:3, 3:4 (default: 1:1)
- `--model`: pro or flash (default: pro)
- `--webp`: Save as WebP format
- `-i, --input`: Input image(s) for editing/remixing

### Generate + Optimize for Expo

```bash
python scripts/generate_and_optimize.py "Product description" \
  -o ./assets/images \
  -n product-name \
  --size 2K \
  -t product \
  -q 85
```

**Output:** `product-name@1x.webp`, `product-name@2x.webp`, `product-name@3x.webp`

**Size Presets:**
| Preset | Base @1x Size | Use Case |
|--------|---------------|----------|
| icon | 24px | Tab icons, buttons |
| thumbnail | 64px | List items, avatars |
| card | 150px | Card images |
| product | 300px | Product listings |
| hero | 400px | Hero sections |
| full | original/3 | Full-width images |

### Optimize Existing Images

```bash
python scripts/optimize_for_expo.py input.png \
  -o ./assets \
  -t product \
  -q 85
```

### Edit/Remix Images

```bash
# Edit an image
python scripts/generate.py "Add sunset background" -i original.png -o edited.png

# Combine multiple images
python scripts/generate.py "Combine these products" -i img1.png -i img2.png -o combined.png
```

## Pricing

| Resolution | Pixels | Cost per Image |
|-----------|--------|----------------|
| 1K | 1024×1024 | ~$0.04 |
| 2K | 2048×2048 | ~$0.13 |
| 4K | 4096×4096 | ~$0.24 |

See [Google AI Pricing](https://ai.google.dev/pricing) for current rates.

## Usage in Expo/React Native

```tsx
import ProductImage from '@/assets/images/product@2x.webp';

<Image
  source={ProductImage}
  style={{ width: 300, height: 300 }}
  resizeMode="contain"
/>
```

React Native automatically selects @1x/@2x/@3x based on device pixel density.

## Prompt Tips

Nano Banana Pro responds well to:
- Detailed descriptions with Markdown formatting
- Photography terms: "product photography", "studio lighting", "DSLR"
- Quality descriptors: "professional", "high-quality", "detailed"
- Style references: "minimalist", "luxury", "modern"

## Requirements

- Python 3.10+
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` environment variable
- Dependencies: `gemimg`, `Pillow` (auto-installed)

## Claude Code Skill

This repo can also be used as a Claude Code skill. Copy the `SKILL.md` and `scripts/` folder to your Claude Code skills directory.

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
