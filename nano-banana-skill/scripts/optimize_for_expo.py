#!/usr/bin/env python3
"""
Optimize images for Expo/React Native apps.
Creates @1x, @2x, @3x variants in WebP format with optimal compression.
"""

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "-q"])
    from PIL import Image


# Expo/React Native optimal sizes
SCALE_FACTORS = {
    "@1x": 1.0,
    "@2x": 2.0,
    "@3x": 3.0,
}

# Target base sizes for common use cases
TARGET_SIZES = {
    "icon": 24,
    "thumbnail": 64,
    "card": 150,
    "product": 300,
    "hero": 400,
    "full": None,  # Keep original proportions
}


def optimize_for_expo(
    input_path: str,
    output_dir: str = None,
    target_type: str = "product",
    quality: int = 85,
    generate_variants: bool = True,
    format: str = "webp",
) -> list:
    """
    Optimize an image for Expo/React Native.

    Args:
        input_path: Source image path
        output_dir: Output directory (default: same as input)
        target_type: Size preset (icon, thumbnail, card, product, hero, full)
        quality: Compression quality 1-100 (default: 85)
        generate_variants: Create @1x, @2x, @3x variants
        format: Output format (webp, png, jpg)

    Returns:
        List of generated file paths
    """
    input_path = Path(input_path)
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    output_dir = Path(output_dir) if output_dir else input_path.parent
    output_dir.mkdir(parents=True, exist_ok=True)

    img = Image.open(input_path)
    original_width, original_height = img.size
    aspect_ratio = original_width / original_height

    # Determine base size for @1x
    base_size = TARGET_SIZES.get(target_type)
    if base_size is None:
        # "full" mode - use original size / 3 as @1x base
        base_size = max(original_width, original_height) // 3

    generated = []
    stem = input_path.stem.replace("@1x", "").replace("@2x", "").replace("@3x", "")
    ext = f".{format}"

    if generate_variants:
        for suffix, scale in SCALE_FACTORS.items():
            target_size = int(base_size * scale)

            # Calculate dimensions maintaining aspect ratio
            if original_width >= original_height:
                new_width = target_size
                new_height = int(target_size / aspect_ratio)
            else:
                new_height = target_size
                new_width = int(target_size * aspect_ratio)

            # Don't upscale beyond original
            if new_width > original_width or new_height > original_height:
                new_width = original_width
                new_height = original_height

            resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            output_path = output_dir / f"{stem}{suffix}{ext}"
            save_kwargs = {"quality": quality}
            if format == "webp":
                save_kwargs["method"] = 6  # Best compression

            resized.save(output_path, **save_kwargs)
            generated.append(output_path)

            # Get file size
            size_kb = output_path.stat().st_size / 1024
            print(f"  {suffix}: {new_width}x{new_height} ({size_kb:.1f} KB) -> {output_path.name}")
    else:
        # Single optimized output
        output_path = output_dir / f"{stem}{ext}"
        save_kwargs = {"quality": quality}
        if format == "webp":
            save_kwargs["method"] = 6
        img.save(output_path, **save_kwargs)
        generated.append(output_path)
        size_kb = output_path.stat().st_size / 1024
        print(f"  Optimized: {original_width}x{original_height} ({size_kb:.1f} KB)")

    return generated


def main():
    parser = argparse.ArgumentParser(description="Optimize images for Expo/React Native")
    parser.add_argument("input", help="Input image path")
    parser.add_argument("-o", "--output-dir", help="Output directory")
    parser.add_argument(
        "-t", "--type",
        default="product",
        choices=list(TARGET_SIZES.keys()),
        help="Target size type"
    )
    parser.add_argument("-q", "--quality", type=int, default=85, help="Quality 1-100")
    parser.add_argument("--no-variants", action="store_true", help="Skip @1x/@2x/@3x")
    parser.add_argument(
        "-f", "--format",
        default="webp",
        choices=["webp", "png", "jpg"],
        help="Output format"
    )
    args = parser.parse_args()

    print(f"Optimizing {args.input} for Expo ({args.type})...")
    optimize_for_expo(
        input_path=args.input,
        output_dir=args.output_dir,
        target_type=args.type,
        quality=args.quality,
        generate_variants=not args.no_variants,
        format=args.format,
    )
    print("Done!")


if __name__ == "__main__":
    main()
