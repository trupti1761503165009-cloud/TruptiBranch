<#
.SYNOPSIS
Update Schema in SharePoint site  
.DESCRIPTION
.EXAMPLE
Script Path
$(System.DefaultWorkingDirectory)/$(ProjectFolder)/drop/Script/SchemaCreateModify.ps1

Argument
 -certificateFile "$(mySecureFile.secureFilePath)" -password "$(CertificatePassword)" -TemplateFilePath "$(System.DefaultWorkingDirectory)/$(ProjectFolder)/drop/Script/Template.xml" -SiteUrl "https://$(Tenant).sharepoint.com/$(SiteURL)" -ClientId "$(AppId)" -TenantId "$(TenantId)" -thumbprint "$(DevThumbprint)"

#>

<#
.EXAMPLE
Following will be used for Certificate
#>

Param(
    [Parameter(Mandatory = $true)]
    [string]$certificateFile,
    [Parameter(Mandatory = $true)]
    [string]$password,
    [Parameter(Mandatory = $true)]
    [string]$TemplateFilePath,
    [Parameter(Mandatory = $true)]
    [string]$SiteUrl,
    [Parameter(Mandatory = $true)]
    [string]$ClientId,
    [Parameter(Mandatory = $true)]
    [string]$TenantId,
    [Parameter(Mandatory = $true)]
    [string]$thumbprint   
)

<#
.EXAMPLE
Following will be used for User Name and Password 
#>

# Param(
#     [Parameter(Mandatory = $true)]
#     [string]$SiteURL,
#     [Parameter(Mandatory = $true)]
#     [string]$UserName,
#     [Parameter(Mandatory = $true)]   
#     [string]$Password,
#     [Parameter(Mandatory = $true)]
#     [string]$TemplateFilePath
# )

Clear-Host

function Remove-ListColumns() {
    try {
        $logRecord = @()
        $ListInstance = $templateDocument.SiteProvisioning.Templates.Remove.ListColumns.ListInstance
        ForEach ($List in $ListInstance) {  
            $ListName = $List.Title
            ForEach ($field in $List.Fields.Field) {  
                try {
                    $fieldName = $field.Name
                    $gotfield = Get-PnPField -List $ListName -Identity $fieldName -ErrorAction SilentlyContinue -InSiteHierarchy
                    If ($null -ne $gotfield.Title) { 
                        Remove-PnPField -List $ListName -Identity $gotfield.Title -Force 
                        $logRecordProp = New-Object -TypeName PSObject;
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove List Columns"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $fieldName  
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "List Column removed $fieldName "
                        $logRecord += $logRecordProp
                    }
                }
                catch {
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove List Columns"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $fieldName  
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "$Error[0]"
                    $logRecord += $logRecordProp
                }
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Remove-Lists() {
    try {
        $logRecord = @()
        $ListInstance = $templateDocument.SiteProvisioning.Templates.Remove.Lists.ListInstance
        ForEach ($List in $ListInstance) {  
            try {
                $ListName = $List.Title 
                $gotList = Get-PnPList -Identity $ListName -ErrorAction SilentlyContinue
                if ($null -ne $gotList.Title) {
                    Remove-PnPList -Identity  $ListName -Force 
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove List"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $ListName 
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "List has been deleted $ListName"
                }
                $logRecord += $logRecordProp
            }
            catch {
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove List"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $ListName 
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "$Error[0]"
                $logRecord += $logRecordProp
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Remove-ContentTypes() {
    try {
        $logRecord = @()
        $ContentTypes = $templateDocument.SiteProvisioning.Templates.Remove.ContentTypes.ContentType
        ForEach ($contentType in $ContentTypes) {  
            try {
                $ContentTypeName = $contentType.Name
                $ContentType = Get-PnPContentType -Identity $ContentTypeName -ErrorAction SilentlyContinue -InSiteHierarchy
                If ($ContentType) { 
                    Remove-PnPContentType -Identity $ContentTypeName -Force
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove CT"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $ContentTypeName 
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Content Type $ContentTypeName Removed"
                    $logRecord += $logRecordProp
                }
            }
            catch {
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove CT"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $ContentTypeName 
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "$Error[0]"
                $logRecord += $logRecordProp
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Remove-SiteColumns() {
    try {
      
        $logRecord = @()
        $SiteFileds = $templateDocument.SiteProvisioning.Templates.Remove.SiteFields.Field
        ForEach ($field in $SiteFileds) {  
            try {
                $fieldName = $field.Name
                $gotfield = Get-PnPField -Identity $fieldName -ErrorAction SilentlyContinue -InSiteHierarchy
                If ($null -ne $gotfield.Title) { 
                    Remove-PnPField -Identity $gotfield.Title -Force 
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove Site Columns"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $fieldName  
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in removing Site Columns $fieldName "
                    $logRecord += $logRecordProp
                }
            }
            catch {
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Remove Site Columns"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $fieldName  
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in removing Site Columns $fieldName "
                $logRecord += $logRecordProp
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

[xml]$templateDocument = Get-Content -Path "$TemplateFilePath"
Connect-PnPOnline -Url $SiteUrl -ClientId $ClientId -Tenant $TenantId -CertificatePath $certificateFile -CertificatePassword $(ConvertTo-SecureString $password -AsPlainText -Force)

# [xml]$templateDocument = Get-Content -Path $TemplateFilePath
# $SecurePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force
# $Cred = New-Object -TypeName System.Management.Automation.PSCredential -argumentlist $UserName, $SecurePassword
# Connect-PnPOnline -Url $SiteURL -Credentials $Cred

$Web = Get-PnPWeb
$webTitle = $Web.Title
Write-Host "Connected Successfully to the $webTitle" -ForegroundColor Green

Write-Host "Removing List from $webTitle" -BackgroundColor Cyan -ForegroundColor Black
Remove-Lists

Write-Host "Removing List Columns from $webTitle" -BackgroundColor Cyan -ForegroundColor Black
Remove-ListColumns

Write-Host "Removing Content Types from $webTitle" -BackgroundColor Cyan -ForegroundColor Black
Remove-ContentTypes

Write-Host "Removing Site Columns from $webTitle" -BackgroundColor Cyan -ForegroundColor Black
Remove-SiteColumns

Disconnect-PnPOnline
Write-Host "Script run successfully"
$scriptRun = $true

Write-Output "##vso[task.setvariable variable=RemoveScriptSuccess]true"

if ($scriptRun -eq $true) {
    exit 0
}
else {
    if ($exitCode -ne 0) {
        Write-Output ("[Error] Failing task since return code was {0} while expected 0." -f $exitCode)
        Write-Host "##vso[task.complete result=Failed;]Failed"
    }
    exit $exitCode
}
