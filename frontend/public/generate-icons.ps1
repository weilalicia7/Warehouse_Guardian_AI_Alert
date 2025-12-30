# Icon Generation Script for Business Guardian AI (PowerShell/Windows)
# Alternative: Use online tool at https://favicon.io/favicon-converter/

Write-Host "=============================================="  -ForegroundColor Cyan
Write-Host "Icon Generation for Business Guardian AI" -ForegroundColor Cyan
Write-Host "==============================================`n" -ForegroundColor Cyan

Write-Host "Option 1: Online Tool (Recommended)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "1. Go to: https://favicon.io/favicon-converter/"
Write-Host "2. Upload: favicon.svg"
Write-Host "3. Download generated package"
Write-Host "4. Extract: favicon.ico, android-chrome-192x192.png, android-chrome-512x512.png"
Write-Host "5. Rename android-chrome-192x192.png -> logo192.png"
Write-Host "6. Rename android-chrome-512x512.png -> logo512.png"
Write-Host "7. Move files to this directory`n"

Write-Host "Option 2: ImageMagick (if installed)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow

# Check if ImageMagick is installed
$imageMagickPath = Get-Command magick -ErrorAction SilentlyContinue

if ($imageMagickPath) {
    Write-Host "ImageMagick found! Generating icons...`n" -ForegroundColor Green

    # Generate favicon.ico
    Write-Host "[1/3] Generating favicon.ico..."
    magick convert favicon.svg -define icon:auto-resize=64,48,32,16 favicon.ico
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ favicon.ico created" -ForegroundColor Green
    }

    # Generate logo192.png
    Write-Host "[2/3] Generating logo192.png..."
    magick convert favicon.svg -resize 192x192 logo192.png
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ logo192.png created" -ForegroundColor Green
    }

    # Generate logo512.png
    Write-Host "[3/3] Generating logo512.png..."
    magick convert favicon.svg -resize 512x512 logo512.png
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ logo512.png created`n" -ForegroundColor Green
    }

    Write-Host "=============================================="  -ForegroundColor Cyan
    Write-Host "All icons generated successfully!" -ForegroundColor Green
    Write-Host "==============================================`n" -ForegroundColor Cyan

    # List generated files
    Get-ChildItem -Path . -Include favicon.ico,logo192.png,logo512.png | Format-Table Name, Length, LastWriteTime

} else {
    Write-Host "ImageMagick not found." -ForegroundColor Red
    Write-Host "Download from: https://imagemagick.org/script/download.php`n"
    Write-Host "Or use Option 1 (online tool) above.`n"
}

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Check the generated files"
Write-Host "2. Test in browser (npm start)"
Write-Host "3. Commit files to git`n"
