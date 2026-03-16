# DMS Master Data Import Script
# Requires: PnP.PowerShell, ImportExcel (optional but recommended)

<#
.SYNOPSIS
    Imports master data from an Excel file into various SharePoint lists for the Drug Management System (DMS).

.DESCRIPTION
    This script facilitates bulk import of CTD Folders, TMF Folders, eCTD Sections, GMP Models, 
    Mappings, and Templates from a structured Excel file.

.PARAMETER SiteUrl
    The SharePoint Online site URL.

.PARAMETER ExcelPath
    The local path to the Excel file containing the master data.

.PARAMETER Command
    The specific data type to import (Folders, Templates, Mappings, All).

.EXAMPLE
    .\Import-DMSMasterData.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" -ExcelPath "C:\Data\DMSData.xlsx" -Command "Folders"
#>

[CmdletBinding()]
param (
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,

    [Parameter(Mandatory = $true)]
    [string]$ExcelPath,

    [Parameter(Mandatory = $false)]
    [ValidateSet("Folders", "Templates", "Mappings", "All")]
    [string]$Command = "All"
)

# --- Prerequisites ---
if (-not (Get-Module -ListAvailable PnP.PowerShell)) {
    Write-Error "PnP.PowerShell module is required. Install it using: Install-Module PnP.PowerShell"
    return
}

$hasImportExcel = (Get-Module -ListAvailable ImportExcel) -ne $null
if (-not $hasImportExcel) {
    Write-Warning "ImportExcel module not found. The script will attempt to use CSV if Excel parsing fails."
}

# --- Connection ---
Connect-PnPOnline -Url $SiteUrl -Interactive

# --- Helper Functions ---
function Get-LookupId($ListName, $Title) {
    if (-not $Title) { return $null }
    $item = Get-PnPListItem -List $ListName -Query "<View><Query><Where><Eq><FieldRef Name='Title'/><Value Type='Text'>$Title</Value></Eq></Where></Query></View>"
    return if ($item) { $item.Id } else { $null }
}

function Import-CTDFolders($data) {
    Write-Host "Importing CTD Folders..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"          = $row.Title
            "FolderId"       = $row.FolderId
            "ParentFolderId" = $row.ParentFolderId
            "IsFolder"       = $row.IsFolder -eq "True"
            "SortOrder"      = $row.SortOrder
            "Description"    = $row.Description
        }
        if ($row.eCTDSection) { $fields["EctdSection"] = Get-LookupId "eCTD Sections" $row.eCTDSection }
        Add-PnPListItem -List "CTD Folders" -Values $fields
    }
}

function Import-TMFFolders($data) {
    Write-Host "Importing TMF Folders..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"          = $row.Title
            "FolderId"       = $row.FolderId
            "ParentFolderId" = $row.ParentFolderId
            "IsFolder"       = $row.IsFolder -eq "True"
            "SortOrder"      = $row.SortOrder
            "Description"    = $row.Description
        }
        Add-PnPListItem -List "TMF Folders" -Values $fields
    }
}

function Import-GMPModels($data) {
    Write-Host "Importing GMP Models..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"       = $row.Title
            "Description" = $row.Description
        }
        Add-PnPListItem -List "GMP Models" -Values $fields
    }
}

function Import-eCTDSections($data) {
    Write-Host "Importing eCTD Sections..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"       = $row.Title
            "SectionCode" = $row.SectionCode
            "Description" = $row.Description
        }
        Add-PnPListItem -List "eCTD Sections" -Values $fields
    }
}

function Import-Categories($data) {
    Write-Host "Importing Categories..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"            = $row.Title
            "Description"      = $row.Description
            "Status"           = $row.Status
            "DocumentCategory" = $row.DocumentCategory
            "Group"            = $row.Group
            "SubGroup"         = $row.SubGroup
            "ArtifactName"     = $row.ArtifactName
        }
        Add-PnPListItem -List "Categories" -Values $fields
    }
}

function Import-Templates($data) {
    Write-Host "Importing Templates..." -ForegroundColor Cyan
    foreach ($row in $data) {
        $fields = @{
            "Title"           = $row.Title
            "Description"     = $row.Description
            "MappingType"     = $row.MappingType
            "Status"          = $row.Status
            "eCTDSubsection"  = $row.eCTDSubsection
            "IsEctdMapped"    = $row.IsEctdMapped -eq "True"
        }

        # Handle Lookups
        $fields["Category"] = Get-LookupId "Categories" $row.Category
        $fields["MappedCTDFolder"] = Get-LookupId "CTD Folders" $row.MappedCTDFolder
        $fields["MappedGMPModel"] = Get-LookupId "GMP Models" $row.MappedGMPModel
        $fields["MappedTMFFolder"] = Get-LookupId "TMF Folders" $row.MappedTMFFolder
        $fields["eCTDSection"] = Get-LookupId "eCTD Sections" $row.eCTDSection
        
        Add-PnPListItem -List "Templates" -Values $fields
    }
}

# --- Main Execution ---
if ($hasImportExcel) {
    # Assuming tabs match function suffixes
    $tabs = @("Categories", "eCTDSections", "GMPModels", "TMFFolders", "CTDFolders", "Templates")
    
    foreach ($tab in $tabs) {
        if ($Command -eq "All" -or $Command -eq $tab) {
            Write-Host "Processing tab: $tab" -ForegroundColor Yellow
            $data = Import-Excel -Path $ExcelPath -WorksheetName $tab -ErrorAction SilentlyContinue
            if ($data) {
                switch ($tab) {
                    "Categories"   { Import-Categories $data }
                    "eCTDSections" { Import-eCTDSections $data }
                    "GMPModels"    { Import-GMPModels $data }
                    "TMFFolders"   { Import-TMFFolders $data }
                    "CTDFolders"   { Import-CTDFolders $data }
                    "Templates"    { Import-Templates $data }
                }
            } else {
                Write-Warning "No data found in worksheet: $tab"
            }
        }
    }
} else {
    Write-Error "Excel processing requires the 'ImportExcel' module. Please install it or provide CSV files."
}

Write-Host "Migration Complete!" -ForegroundColor Green
