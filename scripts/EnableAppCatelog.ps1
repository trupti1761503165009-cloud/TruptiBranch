# Variables
$AdminUrl = "https://redgreens-admin.sharepoint.com"
$SiteUrl  = "https://redgreens.sharepoint.com/sites/DrugManagementSystem"

# Connect to SharePoint Online Admin
Connect-SPOService -Url $AdminUrl

# Confirm the site exists (optional)
$site = Get-SPOSite $SiteUrl

# Enable the Site Collection App Catalog
Add-SPOSiteCollectionAppCatalog -Site $site

Write-Host "App Catalog enabled for $SiteUrl" -ForegroundColor Green

# Disconnect
Disconnect-SPOService