$albums = @{}
$folders = @("portfolio-images", "Environment camp", "Siam paracetamol")

foreach ($folder in $folders) {
    $folderPath = Join-Path "C:\Users\User\.gemini\antigravity\scratch\photographer-portfolio\public" $folder
    if (Test-Path $folderPath) {
        $files = (Get-ChildItem -Path $folderPath -File).Name
        $key = $folder
        if ($folder -eq "portfolio-images") {
            $key = "9'th NISC"
        }
        $albums[$key] = $files
    }
}

ConvertTo-Json -InputObject $albums -Depth 5 | Out-File -Encoding UTF8 "C:\Users\User\.gemini\antigravity\scratch\photographer-portfolio\public\albums.json"
