# Download referenced images for the PREFICTION static site
# Run this from the project root in PowerShell (Windows):
#   Set-Location 'D:\PREFICTION-FINAL'
#   .\scripts\download_images.ps1

$images = @(
    @{ url = 'https://source.unsplash.com/collection/1163637/600x400'; outfile = 'assets/images/collection-1163637-600x400.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/1245976/600x400'; outfile = 'assets/images/collection-1245976-600x400.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/947345/1200x800'; outfile = 'assets/images/collection-947345-1200x800.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/1163637/1200x800'; outfile = 'assets/images/collection-1163637-1200x800.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/1072004/1200x800'; outfile = 'assets/images/collection-1072004-1200x800.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/1245976/1200x800'; outfile = 'assets/images/collection-1245976-1200x800.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/190727/1200x800'; outfile = 'assets/images/collection-190727-1200x800.jpeg' },
    @{ url = 'https://source.unsplash.com/collection/827743/1200x800'; outfile = 'assets/images/collection-827743-1200x800.jpeg' }
)

# Ensure destination folder exists
New-Item -ItemType Directory -Force -Path assets/images | Out-Null

foreach ($it in $images) {
    $url = $it.url
    $out = $it.outfile
    Write-Host "Downloading $url -> $out"
    try {
        Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download $url : $_"
    }
}

Write-Host "Done. Verify files in assets/images/. If you want different filenames or sizes, edit this script and re-run."