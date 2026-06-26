#!/usr/bin/env python3
"""
Combined workflow: Generate image with Nano Banana Pro, then optimize for Expo.
"""

import argparse
import os
import sys
import tempfile
from pathlib import Path

# Import sibling modules
script_dir = Path(__file__).parent
sys.path.insert(0, str(script_dir))

from generate import generate
from optimize_for_expo import optimize_for_expo


def generate_and_optimize(
    prompt: str,
    output_dir: str,
    name: str = "image",
    size: str = "2K",
    aspect_ratio: str = "1:1",
    target_type: str = "product",
    quality: int = 85,
    model: str = "pro",
    input_images: list = None,
) -> list:
    """
    Generate an image and optimize it for Expo in one step.

    Args:
        prompt: Text prompt for image generation
        output_dir: Directory for output files
        name: Base name for output files
        size: Generation size (1K, 2K, 4K)
        aspect_ratio: Aspect ratio (1:1, 16:9, etc.)
        target_type: Expo size preset (icon, thumbnail, card, product, hero, full)
        quality: WebP compression quality
        model: Nano Banana model (pro or flash)
        input_images: Optional input images for editing/remixing

    Returns:
        List of generated file paths
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate to temp file first
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name

    try:
        print(f"Generating with Nano Banana Pro ({size})...")
        generate(
            prompt=prompt,
            output=tmp_path,
            size=size,
            aspect_ratio=aspect_ratio,
            model=model,
            input_images=input_images,
        )
        print("Generation complete!")

        # Optimize for Expo
        print(f"\nOptimizing for Expo ({target_type})...")

        # Rename temp to desired name for optimization
        final_input = output_dir / f"{name}_original.png"
        Path(tmp_path).rename(final_input)

        generated = optimize_for_expo(
            input_path=str(final_input),
            output_dir=str(output_dir),
            target_type=target_type,
            quality=quality,
            generate_variants=True,
            format="webp",
        )

        # Optionally keep or remove original
        # final_input.unlink()  # Uncomment to delete original PNG

        return generated

    finally:
        # Clean up temp file if it still exists
        if Path(tmp_path).exists():
            Path(tmp_path).unlink()


def main():
    parser = argparse.ArgumentParser(
        description="Generate image with Nano Banana Pro and optimize for Expo"
    )
    parser.add_argument("prompt", help="Text prompt for generation")
    parser.add_argument("-o", "--output-dir", default=".", help="Output directory")
    parser.add_argument("-n", "--name", default="image", help="Base filename")
    parser.add_argument("--size", default="2K", choices=["1K", "2K", "4K"])
    parser.add_argument("--aspect-ratio", default="1:1", choices=["1:1", "16:9", "9:16", "4:3", "3:4"])
    parser.add_argument(
        "-t", "--type",
        default="product",
        choices=["icon", "thumbnail", "card", "product", "hero", "full"],
        help="Expo size preset"
    )
    parser.add_argument("-q", "--quality", type=int, default=85)
    parser.add_argument("--model", default="pro", choices=["pro", "flash"])
    parser.add_argument("-i", "--input", action="append", help="Input image(s)")
    args = parser.parse_args()

    generate_and_optimize(
        prompt=args.prompt,
        output_dir=args.output_dir,
        name=args.name,
        size=args.size,
        aspect_ratio=args.aspect_ratio,
        target_type=args.type,
        quality=args.quality,
        model=args.model,
        input_images=args.input,
    )
    print("\nAll done!")


if __name__ == "__main__":
    main()
