<#
.SYNOPSIS
    Imports TMF Folders from an Excel file into the SharePoint 'TMF Folders' list.

.DESCRIPTION
    Reads rows from the specified Excel file and adds each row to the 'TMF Folders'
    SharePoint list using all fields defined in TMFFolders.xml:
    FolderId, ParentFolderId, IsFolder, SortOrder, Zone, ZoneName, Section,
    SectionName, ArtifactId, ArtifactName, Description, Reference,
    DocumentType, TMFStatus, RetentionPeriodYears, Notes.
    Blank/optional fields are handled gracefully and omitted when empty.

.PARAMETER SiteUrl
    The SharePoint Online site URL.

.PARAMETER ExcelPath
    The local path to the Excel file (e.g. DIA_TMF_Document_List.xlsx).

.PARAMETER WorksheetName
    The worksheet name to read from. Defaults to 'TMFFolders'.

.EXAMPLE
    .\Import-TMFFolders.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\DIA_TMF_Document_List.xlsx"

.EXAMPLE
    .\Import-TMFFolders.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Docs\DIA_TMF_Document_List.xlsx" -WorksheetName "Sheet1"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [string]$ExcelPath,

    [Parameter(Mandatory = $false)]
    [string]$WorksheetName = "TMFFolders"
)

# --- Helper ---
function Get-StringValue($row, $propName) {
    if ($row.PSObject.Properties[$propName]) {
        $val = $row.PSObject.Properties[$propName].Value
        if ($null -ne $val) { return "$val".Trim() }
    }
    return ""
}

function Get-NumberValue($row, $propName) {
    if ($row.PSObject.Properties[$propName]) {
        $val = $row.PSObject.Properties[$propName].Value
        if ($null -ne $val -and "$val".Trim() -ne "") {
            $parsed = 0
            if ([int]::TryParse("$val".Trim(), [ref]$parsed)) { return $parsed }
        }
    }
    return $null
}

function Get-BoolValue($row, $propName) {
    if ($row.PSObject.Properties[$propName]) {
        $val = "$($row.PSObject.Properties[$propName].Value)".Trim().ToLower()
        return $val -in @("true", "1", "yes")
    }
    return $false
}

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

    $artifactId   = Get-StringValue $row "ArtifactId"
    $artifactName = Get-StringValue $row "ArtifactName"
    $folderId     = Get-StringValue $row "FolderId"

    # Determine a meaningful Title — prefer ArtifactName, fall back to ArtifactId or FolderId
    $title = if ($artifactName) { $artifactName } elseif ($artifactId) { $artifactId } else { $folderId }

    if (-not $title) {
        Write-Warning "Row $rowIndex skipped — no usable Title (ArtifactName, ArtifactId, or FolderId is blank)."
        continue
    }

    # Build field set — required fields first
    $fields = [ordered]@{
        "Title"        = $title
        "ArtifactName" = $artifactName
        "ArtifactId"   = $artifactId
        "IsFolder"     = Get-BoolValue $row "IsFolder"
    }

    # Optional text fields — only add if non-empty
    $optionalTextFields = @{
        "FolderId"       = Get-StringValue $row "FolderId"
        "ParentFolderId" = Get-StringValue $row "ParentFolderId"
        "ZoneName"       = Get-StringValue $row "ZoneName"
        "Section"        = Get-StringValue $row "Section"
        "SectionName"    = Get-StringValue $row "SectionName"
        "Description"    = Get-StringValue $row "Description"
        "Reference"      = Get-StringValue $row "Reference"
        "DocumentType"   = Get-StringValue $row "DocumentType"
        "TMFStatus"      = Get-StringValue $row "TMFStatus"
        "Notes"          = Get-StringValue $row "Notes"
    }

    foreach ($key in $optionalTextFields.Keys) {
        if ($optionalTextFields[$key]) { $fields[$key] = $optionalTextFields[$key] }
    }

    # Optional number fields — only add if parseable
    $zone = Get-NumberValue $row "Zone"
    if ($null -ne $zone) { $fields["Zone"] = $zone }

    $sortOrder = Get-NumberValue $row "SortOrder"
    if ($null -ne $sortOrder) { $fields["SortOrder"] = $sortOrder }

    $retention = Get-NumberValue $row "RetentionPeriodYears"
    if ($null -ne $retention) { $fields["RetentionPeriodYears"] = $retention }

    try {
        Add-PnPListItem -List "TMF Folders" -Values $fields | Out-Null
        Write-Host "  [OK] Row $rowIndex imported: $artifactId - $artifactName" -ForegroundColor Green
        $successCount++
    }
    catch {
        Write-Host "  [ERROR] Row $rowIndex failed ($artifactId): $($_.Exception.Message)" -ForegroundColor Red
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
