#!/usr/bin/env python3
"""
Nano-Banana Pro Image Generator
Generates images using Google's Gemini 3 Pro Image (Nano Banana Pro).
"""

import argparse
import os
import sys
import subprocess
from pathlib import Path


def ensure_dependencies():
    """Ensure gemimg is installed, using uv if available."""
    try:
        from gemimg import GemImg
        return GemImg
    except ImportError:
        pass

    print("Installing gemimg...")

    # Try uv first (fastest)
    try:
        subprocess.check_call(["uv", "pip", "install", "gemimg", "-q"], stderr=subprocess.DEVNULL)
        from gemimg import GemImg
        return GemImg
    except (subprocess.CalledProcessError, FileNotFoundError):
        pass

    # Try pip with --user flag
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gemimg", "--user", "-q"])
        from gemimg import GemImg
        return GemImg
    except subprocess.CalledProcessError:
        pass

    # Try pip with --break-system-packages
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "gemimg", "--break-system-packages", "-q"])
        from gemimg import GemImg
        return GemImg
    except subprocess.CalledProcessError:
        print("Error: Could not install gemimg. Please run:")
        print("  pip install gemimg")
        print("Or use a virtual environment.")
        sys.exit(1)


GemImg = ensure_dependencies()

MODELS = {
    "pro": "gemini-3-pro-image-preview",
    "flash": "gemini-2.5-flash-image",
}


def generate(
    prompt: str,
    output: str = "output.png",
    size: str = "2K",
    aspect_ratio: str = "1:1",
    model: str = "pro",
    input_images: list = None,
    webp: bool = False,
) -> Path:
    """Generate an image with Nano Banana Pro."""
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("Set GEMINI_API_KEY or GOOGLE_API_KEY environment variable")

    if model == "flash" and size != "1K":
        size = "1K"

    g = GemImg(api_key=api_key, model=MODELS[model])

    imgs = None
    if input_images:
        from PIL import Image
        imgs = [Image.open(img) for img in input_images]

    result = g.generate(
        prompt,
        imgs=imgs,
        aspect_ratio=aspect_ratio,
        image_size=size
    )

    if result is None or result.image is None:
        raise RuntimeError("Generation failed (possibly content moderation)")

    output_path = Path(output)
    if webp:
        output_path = output_path.with_suffix(".webp")

    result.image.save(output_path)
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Generate images with Nano Banana Pro")
    parser.add_argument("prompt", help="Text prompt")
    parser.add_argument("-o", "--output", default="output.png", help="Output file")
    parser.add_argument("-i", "--input", action="append", help="Input image(s)")
    parser.add_argument("--size", default="2K", choices=["1K", "2K", "4K"])
    parser.add_argument("--aspect-ratio", default="1:1", choices=["1:1", "16:9", "9:16", "4:3", "3:4"])
    parser.add_argument("--model", default="pro", choices=["pro", "flash"])
    parser.add_argument("--webp", action="store_true")
    args = parser.parse_args()

    output = generate(
        prompt=args.prompt,
        output=args.output,
        size=args.size,
        aspect_ratio=args.aspect_ratio,
        model=args.model,
        input_images=args.input,
        webp=args.webp,
    )
    print(f"Generated: {output}")


if __name__ == "__main__":
    main()
