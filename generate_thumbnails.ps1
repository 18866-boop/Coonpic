Add-Type -AssemblyName System.Drawing

$publicDir = "C:\Users\User\.gemini\antigravity\scratch\photographer-portfolio\public"
$thumbDir = Join-Path $publicDir "thumbnails"
if (-not (Test-Path $thumbDir)) { New-Item -ItemType Directory -Path $thumbDir | Out-Null }

$folders = @("portfolio-images", "Environment camp", "Siam paracetamol")

foreach ($folder in $folders) {
    $srcFolder = Join-Path $publicDir $folder
    $destFolder = Join-Path $thumbDir $folder
    if (-not (Test-Path $destFolder)) { New-Item -ItemType Directory -Path $destFolder | Out-Null }

    $files = Get-ChildItem -Path $srcFolder -File -Include *.jpg,*.jpeg,*.png,*.webp -Recurse
    foreach ($file in $files) {
        $destFile = Join-Path $destFolder $file.Name
        if (-not (Test-Path $destFile)) {
            try {
                $img = [System.Drawing.Image]::FromFile($file.FullName)
                
                # Calculate new size (max width 250px)
                $width = 250
                $ratio = $width / $img.Width
                $height = [math]::Round($img.Height * $ratio)
                
                if ($ratio -lt 1) {
                    $thumb = New-Object System.Drawing.Bitmap($width, $height)
                    $graph = [System.Drawing.Graphics]::FromImage($thumb)
                    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $graph.DrawImage($img, 0, 0, $width, $height)
                    $thumb.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Jpeg)
                    $graph.Dispose()
                    $thumb.Dispose()
                } else {
                    Copy-Item $file.FullName $destFile
                }
                $img.Dispose()
                Write-Host "Processed $($file.Name)"
            } catch {
                Write-Host "Error processing $($file.Name): $($_.Exception.Message)"
            }
        }
    }
}
Write-Host "Thumbnail generation complete."
