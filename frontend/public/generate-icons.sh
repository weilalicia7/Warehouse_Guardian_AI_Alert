#!/bin/bash
# Icon Generation Script for Business Guardian AI
# This script uses ImageMagick to convert favicon.svg to required formats

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null
then
    echo "ImageMagick is not installed!"
    echo "Install it first:"
    echo "  macOS: brew install imagemagick"
    echo "  Ubuntu: sudo apt-get install imagemagick"
    echo "  Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Navigate to public directory
cd "$(dirname "$0")"

echo "=============================================="
echo "Generating icons for Business Guardian AI..."
echo "=============================================="

# Generate favicon.ico (multi-size ICO file)
echo "[1/3] Generating favicon.ico..."
convert favicon.svg -define icon:auto-resize=64,48,32,16 favicon.ico
echo "✓ favicon.ico created"

# Generate logo192.png
echo "[2/3] Generating logo192.png..."
convert favicon.svg -resize 192x192 logo192.png
echo "✓ logo192.png created"

# Generate logo512.png
echo "[3/3] Generating logo512.png..."
convert favicon.svg -resize 512x512 logo512.png
echo "✓ logo512.png created"

echo "=============================================="
echo "All icons generated successfully!"
echo "=============================================="
echo ""
echo "Generated files:"
ls -lh favicon.ico logo192.png logo512.png

echo ""
echo "Next steps:"
echo "1. Check the generated files"
echo "2. Optionally optimize PNGs: pngquant logo*.png"
echo "3. Commit the files to git"
