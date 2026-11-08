param(
    [string]$ProjectId = 'arctic-plasma-468112-v5',
    [Parameter(Mandatory=$true)][string]$CredentialsPath
)
$ErrorActionPreference = 'Stop'
# Use only after the Google-owned OAuth sign-in and live-account API access are verified.
# No credential contents are printed, copied to the repository, or placed in arguments.
$credentialFile = (Resolve-Path -LiteralPath $CredentialsPath).Path
$mcpExe = Join-Path $env:USERPROFILE '.local\bin\google-ads-mcp.exe'
if (-not (Test-Path -LiteralPath $mcpExe)) { throw 'Install the official Google Ads MCP first.' }
if ($credentialFile.StartsWith((Resolve-Path '.').Path, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Keep OAuth credentials outside the repository.'
}
& codex mcp add google-ads-readonly --env "GOOGLE_PROJECT_ID=$ProjectId" --env "GOOGLE_APPLICATION_CREDENTIALS=$credentialFile" -- $mcpExe
if ($LASTEXITCODE -ne 0) { throw 'MCP registration failed.' }
Write-Output 'Registered the read-only MCP. Restart/reload the client if needed, then verify a real account query before reporting it connected.'
