# --------------------------
# Load EPPlus Assembly
# --------------------------
$epplusDllPath = Get-ChildItem -Path $env:USERPROFILE -Recurse -Filter EPPlus.dll -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $epplusDllPath) {
    Write-Error "EPPlus.dll not found. Please make sure EPPlus.dll is available."
    exit
}
Add-Type -Path $epplusDllPath.FullName

# --------------------------
# Set Paths and Load Excel File
# --------------------------
$xlPath = "/sites/HRMS/ProjectsPA/Trupti Chaudhari/2025-2026/Trupti Chaudhari_Project_PA.xlsx"
if (-not (Test-Path $xlPath)) {
    Write-Error "Excel file not found at $xlPath"
    exit
}

$package = New-Object OfficeOpenXml.ExcelPackage -ArgumentList (New-Object IO.FileInfo($xlPath))
$worksheet = $package.Workbook.Worksheets[3]  # EPPlus uses 1-based index. 3rd sheet = index 3

# --------------------------
# Mock Project Data
# --------------------------
$projects = @(
    @{ ProjectName = "AI Platform"; ProjectManager = "Alice Johnson" },
    @{ ProjectName = "Cloud Infra"; ProjectManager = "Bob Smith" },
    @{ ProjectName = "Web Revamp"; ProjectManager = "Charlie Lee" }
)

# --------------------------
# Block Copying and Value Filling
# --------------------------
$blockHeight = 62
$currentOffset = 0
$colorHeaderRowCount = 3

foreach ($project in $projects) {
    for ($r = 1; $r -le $blockHeight; $r++) {
        if ($currentOffset -gt 0 -and $r -le $colorHeaderRowCount) {
            continue  # Skip header rows on second block onward
        }

        $sourceRow = $worksheet.Cells[$r, 1, $r, $worksheet.Dimension.End.Column]
        $targetRow = $worksheet.Cells[$currentOffset + $r, 1, $currentOffset + $r, $worksheet.Dimension.End.Column]
        $sourceRow.Copy($targetRow)
    }

    # Replace Label values within the new block
    for ($r = $currentOffset + 1; $r -le ($currentOffset + $blockHeight); $r++) {
        for ($c = 1; $c -le $worksheet.Dimension.End.Column; $c++) {
            $cell = $worksheet.Cells[$r, $c]
            if ($cell.Text -eq "Project Title  :") {
                $worksheet.Cells[$r, $c + 1].Value = $project.ProjectName
            } elseif ($cell.Text -eq "Project Manager/PL") {
                $worksheet.Cells[$r, $c + 1].Value = $project.ProjectManager
            }
        }
    }

    $currentOffset += $blockHeight + 2  # Leave 2 rows between blocks
}

# --------------------------
# Save Workbook
# --------------------------
$package.Save()
Write-Host "Excel file updated successfully at $xlPath"
