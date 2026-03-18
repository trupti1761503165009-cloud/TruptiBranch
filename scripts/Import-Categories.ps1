<#
.SYNOPSIS
    Imports Categories into the SharePoint 'Categories' list.

.DESCRIPTION
    In seed mode (no ExcelPath), creates the 6 department categories:
    Bios, Clinical Supplies, DCT, Medical, Regulatory, RSU — all with Status=Active.

    When ExcelPath is provided, reads rows from the specified worksheet and imports
    every row into the 'Categories' SharePoint list using all fields defined in
    Categories.xml: Title, Description, Status, DocumentCategory, Group, SubGroup,
    ArtifactName, TemplateName, ArtifactDescription, CTDModule, eCTDSection,
    eCTDSubsection, eCTDCode.

.PARAMETER SiteUrl
    The SharePoint Online site URL.

.PARAMETER ExcelPath
    (Optional) The local path to an Excel file containing category rows.
    If omitted, the script runs in seed mode and creates the 6 default departments.

.PARAMETER WorksheetName
    The worksheet name to read from when ExcelPath is provided. Defaults to 'Categories'.

.EXAMPLE
    # Seed mode — create the 6 default department categories
    .\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS"

.EXAMPLE
    # Excel mode — import from a spreadsheet
    .\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\Categories.xlsx"

.EXAMPLE
    .\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\Categories.xlsx" -WorksheetName "Sheet1"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $false)]
    [string]$ExcelPath = "",

    [Parameter(Mandatory = $false)]
    [string]$WorksheetName = "Categories"
)

# --- Helper ---
function Get-StringValue($obj, $propName) {
    if ($obj -is [System.Collections.IDictionary]) {
        if ($obj.Contains($propName) -and $null -ne $obj[$propName]) {
            return "$($obj[$propName])".Trim()
        }
    } elseif ($obj.PSObject.Properties[$propName]) {
        $val = $obj.PSObject.Properties[$propName].Value
        if ($null -ne $val) { return "$val".Trim() }
    }
    return ""
}

# --- Prerequisites ---
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it using: Install-Module PnP.PowerShell"
    exit 1
}

$useExcel = $false
if ($ExcelPath -and $ExcelPath -ne "") {
    if (-not (Get-Module -ListAvailable ImportExcel)) {
        Write-Error "ImportExcel module is required when using -ExcelPath. Install it using: Install-Module ImportExcel"
        exit 1
    }
    if (-not (Test-Path $ExcelPath)) {
        Write-Error "Excel file not found: $ExcelPath"
        exit 1
    }
    $useExcel = $true
}

# --- Connection ---
Write-Host "Connecting to SharePoint site: $SiteUrl" -ForegroundColor Cyan
Connect-PnPOnline -Url $SiteUrl -Interactive

# --- Load Data ---
$data = @()

if ($useExcel) {
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
} else {
    Write-Host "Running in seed mode — creating 6 default department categories." -ForegroundColor Yellow

    $data = @(
        [ordered]@{ Title = "Bios";              Description = "Bios department category";              Status = "Active" },
        [ordered]@{ Title = "Clinical Supplies";  Description = "Clinical Supplies department category"; Status = "Active" },
        [ordered]@{ Title = "DCT";               Description = "DCT department category";               Status = "Active" },
        [ordered]@{ Title = "Medical";           Description = "Medical department category";           Status = "Active" },
        [ordered]@{ Title = "Regulatory";        Description = "Regulatory department category";        Status = "Active" },
        [ordered]@{ Title = "RSU";               Description = "RSU department category";               Status = "Active" }
    )
}

# --- Import ---
$successCount = 0
$errorCount   = 0
$rowIndex     = 0

foreach ($row in $data) {
    $rowIndex++

    $title = Get-StringValue $row "Title"

    if (-not $title) {
        Write-Warning "Row $rowIndex skipped — Title is blank."
        continue
    }

    # Build the fields hashtable — required fields first
    $fields = @{ "Title" = $title }

    # Optional text/choice fields — only include if non-empty
    $optionalFields = @(
        "Description", "Status", "DocumentCategory", "Group", "SubGroup",
        "ArtifactName", "TemplateName", "ArtifactDescription",
        "CTDModule", "eCTDSection", "eCTDSubsection", "eCTDCode"
    )

    foreach ($fieldName in $optionalFields) {
        $val = Get-StringValue $row $fieldName
        if ($val) { $fields[$fieldName] = $val }
    }

    # Default Status to Active if not supplied
    if (-not $fields.ContainsKey("Status")) {
        $fields["Status"] = "Active"
    }

    try {
        Add-PnPListItem -List "Categories" -Values $fields | Out-Null
        Write-Host "  [OK] Row $rowIndex imported: $title" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  [ERROR] Row $rowIndex failed ($title): $($_.Exception.Message)" -ForegroundColor Red
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
