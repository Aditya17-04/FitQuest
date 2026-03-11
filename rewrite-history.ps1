# PowerShell script to rewrite commit messages
$env:FILTER_BRANCH_SQUELCH_WARNING = '1'

# Create a temporary message filter script
$filterScript = @'
$msg = [Console]::In.ReadToEnd()
$msg = $msg -replace 'Connect to Lovable Cloud', 'Connect to cloud backend'
$msg = $msg -replace '(?i)lovable', 'fitquest'  
$msg = $msg -replace '\[skip fitquest\]', '[skip ci]'
Write-Host $msg -NoNewline
'@

Set-Content -Path "$PSScriptRoot\msg-filter.ps1" -Value $filterScript

# Run git filter-branch
git filter-branch -f --msg-filter "powershell -NoProfile -ExecutionPolicy Bypass -File $PSScriptRoot\msg-filter.ps1" refs/heads/main

# Clean up
Remove-Item "$PSScriptRoot\msg-filter.ps1" -ErrorAction SilentlyContinue
