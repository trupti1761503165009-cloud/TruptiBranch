# DMS SharePoint Import Scripts

This folder contains PowerShell scripts that provision and populate the SharePoint Online
Document Management System (DMS) with master data and template files.

---

## Prerequisites

All scripts require the following PowerShell modules:

| Module | Install Command |
|---|---|
| PnP.PowerShell | `Install-Module PnP.PowerShell` |
| ImportExcel | `Install-Module ImportExcel` *(only required by Excel-based scripts)* |

The `Remove-WordLogos.ps1` script additionally requires the **DocumentFormat.OpenXml**
NuGet package. Install it with:
```
Install-Package DocumentFormat.OpenXml -Scope CurrentUser
```

---

## Scripts

### 1. `Remove-WordLogos.ps1`

**Purpose:** Strips all embedded images and logos from every `.docx` file under the SOP
folder before uploading to SharePoint, ensuring clean templates are uploaded.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-TargetFolder` | No | `../Project Documents/721814 SOP/721814 SOP` | Path to the folder containing `.docx` files |

**Example:**
```powershell
# Use default folder (relative to script location)
.\Remove-WordLogos.ps1

# Specify explicit path
.\Remove-WordLogos.ps1 -TargetFolder "C:\Docs\721814 SOP\721814 SOP"
```

---

### 2. `Import-Categories.ps1`

**Purpose:** Imports department categories into the SharePoint **Categories** list.
Supports a seed mode (no Excel file) that creates the 6 default department entries, or
an Excel mode for bulk import.

**Fields imported:** Title, Description, Status, DocumentCategory, Group, SubGroup,
ArtifactName, TemplateName, ArtifactDescription, CTDModule, eCTDSection,
eCTDSubsection, eCTDCode.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-SiteUrl` | Yes | — | SharePoint site URL |
| `-ExcelPath` | No | *(empty — seed mode)* | Path to Excel file with category rows |
| `-WorksheetName` | No | `Categories` | Worksheet name within the Excel file |

**Example:**
```powershell
# Seed mode — creates Bios, Clinical Supplies, DCT, Medical, Regulatory, RSU
.\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS"

# Excel mode — imports additional rows from spreadsheet
.\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
    -ExcelPath "C:\Docs\Categories.xlsx"
```

> **Note:** The script operates in one mode at a time. To load the 6 default departments
> **plus** additional rows from Excel, run seed mode first, then run Excel mode:
> ```powershell
> # Step 1 — seed the 6 departments
> .\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS"
>
> # Step 2 — import extra rows from Excel
> .\Import-Categories.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
>     -ExcelPath "C:\Docs\Categories.xlsx"
> ```

---

### 3. `Import-eCTDSections.ps1`

**Purpose:** Imports eCTD Section codes and names into the SharePoint **eCTD Sections** list
from an Excel file.

**Fields imported:** SectionCode, SectionName, Description.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-SiteUrl` | Yes | — | SharePoint site URL |
| `-ExcelPath` | Yes | — | Path to the eCTD Excel file (e.g. `CTOC_eCTDv4_0_v2_2_n2.xlsx`) |
| `-WorksheetName` | No | `eCTDSections` | Worksheet name within the Excel file |

**Example:**
```powershell
.\Import-eCTDSections.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
    -ExcelPath "C:\Docs\CTOC_eCTDv4_0_v2_2_n2.xlsx"
```

---

### 4. `Import-GMPModels.ps1`

**Purpose:** Imports GMP Reference Model entries into the SharePoint **GMP Models** list
from an Excel file.

**Fields imported:** Title, Description, Category.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-SiteUrl` | Yes | — | SharePoint site URL |
| `-ExcelPath` | Yes | — | Path to the GMP Excel file (e.g. `DIA_GMP_Reference_Model_List.xlsx`) |
| `-WorksheetName` | No | `GMPModels` | Worksheet name within the Excel file |

**Example:**
```powershell
.\Import-GMPModels.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
    -ExcelPath "C:\Docs\DIA_GMP_Reference_Model_List.xlsx"
```

---

### 5. `Import-TMFFolders.ps1`

**Purpose:** Imports TMF folder/artifact metadata into the SharePoint **TMF Folders** list
from an Excel file.

**Fields imported:** FolderId, ParentFolderId, IsFolder, SortOrder, Zone, ZoneName,
Section, SectionName, ArtifactId, ArtifactName, Description, Reference, DocumentType,
TMFStatus, RetentionPeriodYears, Notes.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-SiteUrl` | Yes | — | SharePoint site URL |
| `-ExcelPath` | Yes | — | Path to the TMF Excel file (e.g. `DIA_TMF_Document_List.xlsx`) |
| `-WorksheetName` | No | `TMFFolders` | Worksheet name within the Excel file |

**Example:**
```powershell
.\Import-TMFFolders.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
    -ExcelPath "C:\Docs\DIA_TMF_Document_List.xlsx"
```

---

### 6. `Import-Templates.ps1`

**Purpose:** Uploads cleaned `.docx` template files from the local SOP folder into the
SharePoint **Templates** document library. Derives the Category from the subfolder name
and resolves the lookup ID from the Categories list.

**Metadata set per file:** Title (filename without extension), Category (lookup to
Categories list by subfolder name), Status = Active, MappingType = None.

**Parameters:**

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-SiteUrl` | Yes | — | SharePoint site URL |
| `-TemplateFolder` | No | `../Project Documents/721814 SOP/721814 SOP` | Local path to the SOP folder |
| `-LibraryName` | No | `Templates` | SharePoint document library name |

**Example:**
```powershell
# Use default folder
.\Import-Templates.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS"

# Specify explicit path
.\Import-Templates.ps1 -SiteUrl "https://contoso.sharepoint.com/sites/DMS" `
    -TemplateFolder "C:\Docs\721814 SOP\721814 SOP" `
    -LibraryName "Templates"
```

---

## Recommended Run Order

Run the scripts in this order to satisfy lookup dependencies:

```
Step 1  Remove-WordLogos.ps1       — strip images from .docx files (no SharePoint needed)
Step 2  Import-eCTDSections.ps1    — populate eCTD Sections list
Step 3  Import-GMPModels.ps1       — populate GMP Models list
Step 4  Import-TMFFolders.ps1      — populate TMF Folders list
Step 5  Import-Categories.ps1      — populate Categories list (seed or Excel)
Step 6  Import-Templates.ps1       — upload .docx files and set Category lookups
```

> **Important:** `Import-Categories.ps1` must run before `Import-Templates.ps1` because
> Templates resolves Category lookup IDs from the Categories list.
