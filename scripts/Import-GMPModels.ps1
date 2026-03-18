<#
.SYNOPSIS
    Imports GMP Models from an Excel file into the SharePoint 'GMP Models' list.

.DESCRIPTION
    Reads rows from the specified Excel file and adds each row to the 'GMP Models'
    SharePoint list using the fields defined in GMPModels.xml:
    Title, Description, Category.

.PARAMETER SiteUrl
    The SharePoint Online site URL.

.PARAMETER ExcelPath
    The local path to the Excel file (e.g. DIA_GMP_Reference_Model_List.xlsx).

.PARAMETER WorksheetName
    The worksheet name to read from. Defaults to 'GMPModels'.

.EXAMPLE
    .\Import-GMPModels.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\DIA_GMP_Reference_Model_List.xlsx"

.EXAMPLE
    .\Import-GMPModels.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\DIA_GMP_Reference_Model_List.xlsx" -WorksheetName "Sheet1"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [string]$ExcelPath,

    [Parameter(Mandatory = $false)]
    [string]$WorksheetName = "GMPModels"
)

# --- Prerequisites ---
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it using: Install-Module PnP.PowerShell"
    exit 1
}

if (-not (Get-Module -ListAvailable ImportExcel)) {
    Write-Error "ImportExcel module is required. Install it using: Install-Module ImportExcel"
    exit 1
}

if (-not (Test-Path $ExcelPath)) {
    Write-Error "Excel file not found: $ExcelPath"
    exit 1
}

# --- Connection ---
Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# --- Load Data ---
Write-Host "Reading worksheet '$WorksheetName' from: $ExcelPath" -ForegroundColor Cyan

$availableSheets = (Get-ExcelSheetInfo -Path $ExcelPath).Name
if ($WorksheetName -notin $availableSheets) {
    Write-Error "Worksheet '$WorksheetName' not found in the workbook. Available sheets: $($availableSheets -join ', ')"
    Write-Host "Use -WorksheetName to specify the correct sheet name." -ForegroundColor Yellow
    exit 1
}

$data = Import-Excel -Path $ExcelPath -WorksheetName $WorksheetName -ErrorAction Stop

if (-not $data -or $data.Count -eq 0) {
    Write-Warning "No data found in worksheet '$WorksheetName'. Exiting."
    exit 0
}

Write-Host "Found $($data.Count) rows to import." -ForegroundColor Yellow

# --- Import ---
$successCount = 0
$errorCount   = 0
$rowIndex     = 0

foreach ($row in $data) {
    $rowIndex++

    $title       = if ($row.PSObject.Properties["Title"])       { "$($row.Title)".Trim() }       else { "" }
    $description = if ($row.PSObject.Properties["Description"]) { "$($row.Description)".Trim() } else { "" }
    $category    = if ($row.PSObject.Properties["Category"])    { "$($row.Category)".Trim() }    else { "" }

    if (-not $title) {
        Write-Warning "Row $rowIndex skipped — Title is blank."
        continue
    }

    $fields = @{
        "Title"       = $title
        "Description" = $description
        "Category"    = $category
    }

    try {
        Add-PnPListItem -List "GMP Models" -Values $fields | Out-Null
        Write-Host "  [OK] Row $rowIndex imported: $title" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  [ERROR] Row $rowIndex failed: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

# --- Summary ---
Write-Host ""
Write-Host "Import complete." -ForegroundColor Cyan
Write-Host "  Success : $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errors  : $errorCount" -ForegroundColor Red
} else {
    Write-Host "  Errors  : $errorCount" -ForegroundColor Green
}
