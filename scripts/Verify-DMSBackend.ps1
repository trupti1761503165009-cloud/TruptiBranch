# DMS Backend Verification Script
# This script verifies the existence of lists and fields required for the DMS project.

$listsToVerify = @(
    "Categories",
    "Templates",
    "Documents",
    "CTD Folders",
    "eCTD Sections",
    "GMP Models",
    "TMF Folders",
    "Countries"
)

$templateFieldsToVerify = @(
    "MappingType",
    "MappedCTDFolder",
    "MappedGMPModel",
    "MappedTMFFolder",
    "eCTDSection",
    "eCTDSubsection",
    "IsEctdMapped"
)

function Verify-DMSLists {
    Write-Host "Verifying SharePoint Lists..." -ForegroundColor Cyan
    foreach ($listName in $listsToVerify) {
        $list = Get-PnPList -Identity $listName -ErrorAction SilentlyContinue
        if ($list) {
            Write-Host "[OK] List '$listName' exists." -ForegroundColor Green
        } else {
            Write-Host "[ERROR] List '$listName' NOT FOUND!" -ForegroundColor Red
        }
    }
}

function Verify-TemplateFields {
    Write-Host "`nVerifying Fields in 'Templates' library..." -ForegroundColor Cyan
    $list = Get-PnPList -Identity "Templates"
    if (-not $list) { return }
    
    $fields = Get-PnPField -List "Templates"
    foreach ($fieldName in $templateFieldsToVerify) {
        $field = $fields | Where-Object { $_.InternalName -eq $fieldName -or $_.Title -eq $fieldName }
        if ($field) {
            Write-Host "[OK] Field '$fieldName' exists in Templates." -ForegroundColor Green
        } else {
            Write-Host "[ERROR] Field '$fieldName' MISSING in Templates!" -ForegroundColor Red
        }
    }
}

function Verify-MasterDataCounts {
    Write-Host "`nChecking Master Data counts..." -ForegroundColor Cyan
    $masterLists = @("Categories", "Countries", "CTD Folders", "eCTD Sections", "GMP Models", "TMF Folders")
    foreach ($listName in $masterLists) {
        $items = Get-PnPListItem -List $listName -PageSize 100
        $count = ($items | Measure-Object).Count
        if ($count -gt 0) {
            Write-Host "[OK] List '$listName' has $count items." -ForegroundColor Green
        } else {
            Write-Host "[WARNING] List '$listName' is EMPTY!" -ForegroundColor Yellow
        }
    }
}

# Execution
# Connect-PnPOnline -Url $SiteUrl (Assuming already connected in session)
Verify-DMSLists
Verify-TemplateFields
Verify-MasterDataCounts
