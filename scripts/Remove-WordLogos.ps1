<#
.SYNOPSIS
    Removes all embedded images and logos from every .docx file under a specified folder.

.DESCRIPTION
    Iterates every .docx file (recursively) under the target folder and removes all
    embedded images from the document body, headers, and footers using the
    DocumentFormat.OpenXml SDK (.NET). Non-.docx files are skipped.
    A per-file success/failure report and a final summary are printed.

.PARAMETER TargetFolder
    The local path to the folder containing .docx files.
    Defaults to 'Project Documents\721814 SOP\721814 SOP' relative to the script root.

.EXAMPLE
    .\Remove-WordLogos.ps1

.EXAMPLE
    .\Remove-WordLogos.ps1 -TargetFolder "C:\Docs\721814 SOP\721814 SOP"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $false)]
    [string]$TargetFolder = (Join-Path $PSScriptRoot "..\Project Documents\721814 SOP\721814 SOP")
)

# --- Prerequisites ---
$resolvedFolder = Resolve-Path -Path $TargetFolder -ErrorAction SilentlyContinue
if (-not $resolvedFolder) {
    Write-Error "Target folder not found: $TargetFolder"
    exit 1
}
$TargetFolder = $resolvedFolder.Path

# Attempt to load DocumentFormat.OpenXml via NuGet if not already available
$openXmlLoaded = [System.AppDomain]::CurrentDomain.GetAssemblies() |
    Where-Object { $_.GetName().Name -eq "DocumentFormat.OpenXml" } |
    Select-Object -First 1

if (-not $openXmlLoaded) {
    $searchPaths = @(
        "$env:USERPROFILE\.nuget\packages\documentformat.openxml",
        "$env:ProgramFiles\PackageManagement\NuGet\Packages"
    )
    $dllPath = $null
    foreach ($basePath in $searchPaths) {
        if (Test-Path $basePath) {
            $dllPath = Get-ChildItem -Path $basePath -Recurse -Filter "DocumentFormat.OpenXml.dll" |
                Sort-Object FullName -Descending |
                Select-Object -First 1 -ExpandProperty FullName
            if ($dllPath) { break }
        }
    }

    if ($dllPath) {
        Add-Type -Path $dllPath -ErrorAction Stop
        Write-Host "Loaded DocumentFormat.OpenXml from: $dllPath" -ForegroundColor Cyan
    } else {
        Write-Error @"
DocumentFormat.OpenXml assembly not found.
Install it via NuGet:
  Install-Package DocumentFormat.OpenXml -Scope CurrentUser
Then re-run this script.
"@
        exit 1
    }
}

Add-Type -AssemblyName WindowsBase -ErrorAction SilentlyContinue

# Helper: remove all drawing/picture elements from the XML root of an OpenXML part,
# then delete associated ImageParts.
function Remove-ImagesFromPartRoot {
    param(
        [DocumentFormat.OpenXml.OpenXmlPartRootElement]$rootElement
    )

    if ($null -eq $rootElement) { return 0 }

    # Collect all elements that represent inline drawings or VML pictures
    $targets = @(
        $rootElement.Descendants() | Where-Object {
            $typeName = $_.GetType().Name
            $typeName -in @("Drawing", "Picture", "EmbeddedObject")
        }
    )

    $count = 0
    foreach ($el in $targets) {
        $el.Remove()
        $count++
    }
    return $count
}

# --- Scan for .docx files ---
$docxFiles = Get-ChildItem -Path $TargetFolder -Recurse -Filter "*.docx" |
    Where-Object { -not $_.Name.StartsWith("~") }

if ($docxFiles.Count -eq 0) {
    Write-Warning "No .docx files found under: $TargetFolder"
    exit 0
}

Write-Host ""
Write-Host "Found $($docxFiles.Count) .docx file(s) to process under:" -ForegroundColor Yellow
Write-Host "  $TargetFolder" -ForegroundColor Yellow
Write-Host ""

$successCount = 0
$errorCount   = 0

foreach ($file in $docxFiles) {
    $relPath = $file.FullName.Replace($TargetFolder, "").TrimStart("\", "/")
    $wordDoc = $null
    try {
        $wordDoc = [DocumentFormat.OpenXml.Packaging.WordprocessingDocument]::Open(
            $file.FullName, $true)

        $totalRemoved = 0
        $mainPart     = $wordDoc.MainDocumentPart

        # Main document body
        if ($mainPart -and $mainPart.RootElement) {
            $totalRemoved += Remove-ImagesFromPartRoot $mainPart.RootElement
            $mainPart.RootElement.Save()
        }

        # Headers — strip drawing elements and delete header-owned ImageParts
        foreach ($hp in @($mainPart.HeaderParts)) {
            if ($hp.RootElement) {
                $totalRemoved += Remove-ImagesFromPartRoot $hp.RootElement
                $hp.RootElement.Save()
            }
            foreach ($ip in @($hp.ImageParts)) {
                $hp.DeletePart($ip)
                $totalRemoved++
            }
        }

        # Footers — strip drawing elements and delete footer-owned ImageParts
        foreach ($fp in @($mainPart.FooterParts)) {
            if ($fp.RootElement) {
                $totalRemoved += Remove-ImagesFromPartRoot $fp.RootElement
                $fp.RootElement.Save()
            }
            foreach ($ip in @($fp.ImageParts)) {
                $fp.DeletePart($ip)
                $totalRemoved++
            }
        }

        # Delete all ImageParts referenced directly by the main document part
        foreach ($ip in @($mainPart.ImageParts)) {
            $mainPart.DeletePart($ip)
            $totalRemoved++
        }

        if ($totalRemoved -gt 0) {
            Write-Host "  [OK] $relPath — removed $totalRemoved image element(s)" -ForegroundColor Green
        } else {
            Write-Host "  [OK] $relPath — no images found" -ForegroundColor DarkGray
        }
        $successCount++
    }
    catch {
        Write-Host "  [ERROR] $relPath — $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
    finally {
        if ($null -ne $wordDoc) {
            $wordDoc.Dispose()
        }
    }
}

# --- Summary ---
Write-Host ""
Write-Host "Processing complete." -ForegroundColor Cyan
Write-Host "  Processed : $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errors    : $errorCount" -ForegroundColor Red
} else {
    Write-Host "  Errors    : $errorCount" -ForegroundColor Green
}
