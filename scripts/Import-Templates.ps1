<#
.SYNOPSIS
    Uploads .docx template files from a local folder into the SharePoint 'Templates' document library.

.DESCRIPTION
    Recursively scans the specified local folder for .docx files and uploads each one to
    the SharePoint Templates document library using Add-PnPFile. For each file the script:
      - Sets Title to the filename (without extension)
      - Resolves Category lookup ID from the Categories list using the subfolder name
        (e.g. a file in /Bios/ maps to Category = "Bios")
      - Sets Status = Active
      - Sets MappingType = None
    Reports per-file success/failure and a final summary.

.PARAMETER SiteUrl
    The SharePoint Online site URL.

.PARAMETER TemplateFolder
    Local path to the folder containing .docx files organised in department subfolders.
    Defaults to 'Project Documents\721814 SOP\721814 SOP' relative to the script root.

.PARAMETER LibraryName
    The name of the SharePoint document library. Defaults to 'Templates'.

.EXAMPLE
    .\Import-Templates.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS"

.EXAMPLE
    .\Import-Templates.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
        -TemplateFolder "C:\Docs\721814 SOP\721814 SOP" `
        -LibraryName "Templates"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$TemplateFolder = (Join-Path $PSScriptRoot "..\Project Documents\721814 SOP\721814 SOP"),

    [Parameter(Mandatory = $false)]
    [string]$LibraryName = "Templates"
)

# --- Prerequisites ---
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it using: Install-Module PnP.PowerShell"
    exit 1
}

$resolvedFolder = Resolve-Path -Path $TemplateFolder -ErrorAction SilentlyContinue
if (-not $resolvedFolder) {
    Write-Error "Template folder not found: $TemplateFolder"
    exit 1
}
$TemplateFolder = $resolvedFolder.Path

# --- Connection ---
Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# --- Build category lookup cache (case-insensitive title matching) ---
Write-Host "Loading Categories list to resolve lookup IDs..." -ForegroundColor Cyan
$categoryCache = [System.Collections.Generic.Dictionary[string,int]](
    [System.StringComparer]::OrdinalIgnoreCase)
try {
    $catItems = Get-PnPListItem -List "Categories" -Fields "ID", "Title" -ErrorAction Stop
    foreach ($item in $catItems) {
        $catTitle = "$($item["Title"])".Trim()
        if ($catTitle -and -not $categoryCache.ContainsKey($catTitle)) {
            $categoryCache[$catTitle] = $item.Id
        }
    }
    Write-Host "  Loaded $($categoryCache.Count) category entries." -ForegroundColor Yellow
}
catch {
    Write-Error "Could not load Categories list: $($_.Exception.Message)"
    Write-Error "Run Import-Categories.ps1 first to populate the Categories list, then retry."
    exit 1
}

# --- Scan for .docx files ---
$docxFiles = Get-ChildItem -Path $TemplateFolder -Recurse -Filter "*.docx" |
    Where-Object { -not $_.Name.StartsWith("~") }

if ($docxFiles.Count -eq 0) {
    Write-Warning "No .docx files found under: $TemplateFolder"
    exit 0
}

Write-Host ""
Write-Host "Found $($docxFiles.Count) .docx file(s) to upload." -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$errorCount   = 0

foreach ($file in $docxFiles) {
    $relPath = $file.FullName.Replace($TemplateFolder, "").TrimStart("\", "/")

    # Determine category from the first subfolder level under TemplateFolder
    $relativeParts = $relPath -split "[/\\]"
    $categoryName  = if ($relativeParts.Count -gt 1) { $relativeParts[0] } else { "" }

    $title = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)

    # Build metadata
    $metadata = @{
        "Title"           = $title
        "Status"          = "Active"
        "MappingType"     = "None"
        "TemplateVersion" = "1.0"
        "IsLatestVersion" = $true
        "ParentTemplateId" = $null
    }

    # Resolve Category lookup ID — required when a subfolder name is present
    if ($categoryName) {
        if ($categoryCache.ContainsKey($categoryName)) {
            $metadata["Category"] = $categoryCache[$categoryName]
        } else {
            Write-Host "  [ERROR] $relPath — Category '$categoryName' not found in Categories list. Run Import-Categories.ps1 first." -ForegroundColor Red
            $errorCount++
            continue
        }
    }

    try {
        Add-PnPFile -Path $file.FullName -Folder $LibraryName -Values $metadata | Out-Null
        $catLabel = if ($categoryName) { " [Category: $categoryName]" } else { "" }
        Write-Host "  [OK] $relPath$catLabel" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  [ERROR] $relPath — $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

# --- Summary ---
Write-Host ""
Write-Host "Upload complete." -ForegroundColor Cyan
Write-Host "  Success : $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errors  : $errorCount" -ForegroundColor Red
} else {
    Write-Host "  Errors  : $errorCount" -ForegroundColor Green
}
