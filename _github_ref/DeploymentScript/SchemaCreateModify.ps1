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


function Get-SiteFieldsXML() {
    param (
        [Parameter(Mandatory = $true, Position = 0)]
        $field
    )

    try {
        $Id = (New-Guid).Guid
        $FieldName = $field.Name
        $FieldDisplayName = $field.DisplayName
        $FieldType = $field.Type
        $FieldGUID = "{$Id}"
        $web = Get-PnPWeb
        $WebId = $web.Id
        $SourceGUID = "{$WebId}"
        $Group = $field.Group
        $EnforceUniqueValues = $field.EnforceUniqueValues
        if ($null -eq $EnforceUniqueValues) {
            $EnforceUniqueValues = "FALSE";
        }
        $Indexed = $field.Indexed
        if ($null -eq $Indexed) {
            $Indexed = "FALSE";
        }
        $MaxLength = $field.MaxLength
        if ($null -eq $MaxLength) {
            $MaxLength = "255";
        }
        $RichText = $field.RichText
        if ($null -eq $RichText) {
            $RichText = "FALSE";
        }
        if ($null -ne $FieldType) {
            if ($FieldType -eq "Choice" -or $FieldType -eq "MultiChoice") {
                $Default = $field.Default
                $allChoices = $field.CHOICES
                $choice = '<Default>' + $Default + '</Default><CHOICES>'
                ForEach ($item in $allChoices.CHOICE) {
                    $choice += '<CHOICE>' + $item + '</CHOICE>'
                }
                $choice += '</CHOICES>'
                
                if ($FieldType -eq "LookupMulti") {
                    $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '" Mult="TRUE">
                '+ $choice + 
                    '</Field>'
                }
                else {
                    $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '">
                '+ $choice + 
                    '</Field>'
                }
            }
            elseif ($FieldType -eq "Lookup" -or $FieldType -eq "LookupMulti") {
                $LookupListName = $field.List
                $lookupList = Get-PnPList -Identity $LookupListName
                if ($null -ne $lookupList.Title) {
                    try {
                        if ($FieldType -eq "LookupMulti") {
                            $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" ID="' + $FieldGUID + '" List="{' + $lookupList.Id + '}" WebId="' + $SourceGUID + '" ShowField="' + $field.ShowField + '" Mult="TRUE" Group="' + $Group + '" SourceID="' + $SourceGUID + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" />'
                        }
                        else {
                            $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" ID="' + $FieldGUID + '" List="{' + $lookupList.Id + '}" WebId="' + $SourceGUID + '" ShowField="' + $field.ShowField + '" Group="' + $Group + '" SourceID="' + $SourceGUID + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '"/>'
                        }
                    }
                    catch {
                    
                    }
                }                 
            }
            elseif ($FieldType -eq "User" -or $FieldType -eq "UserMulti") {
                if ($FieldType -eq "UserMulti") {
                    $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '" UserSelectionMode="0" UserSelectionScope="0" Mult="TRUE"></Field>'
                }
                else {
                    $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '" UserSelectionMode="0" UserSelectionScope="0"></Field>'
                }
                
            }
            elseif ($FieldType -eq "URL") {
                $Format = $field.Format
                $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '" Format="' + $Format + '"></Field>'
            }
            elseif ($FieldType -eq "DateTime") {
                $Format = $field.Format
                $fieldXml = '<Field Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '" Format="' + $Format + '"></Field>'
            }
            elseif ($FieldType -eq "Boolean") {
                $InnerXML = $field.InnerXML
                $fieldXml = '<Field Indexed="' + $Indexed + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '">' + $InnerXML + '</Field>'
            }
            elseif ($FieldType -eq "Note") {
                $fieldXml = '<Field NumLines="6" RichText="' + $RichText + '" MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '"></Field>'
            }
            else {
                $fieldXml = '<Field MaxLength="' + $MaxLength + '" Indexed="' + $Indexed + '" EnforceUniqueValues="' + $EnforceUniqueValues + '" Type="' + $FieldType + '" Group="' + $Group + '" DisplayName="' + $FieldDisplayName + '" Description="" Required="' + $field.Required + '" StaticName="' + $FieldName + '" Name="' + $FieldName + '" ID="' + $FieldGUID + '" SourceID="' + $WebId + '"></Field>'
            }
        }
    
        return $fieldXml;
    }
    catch {
        Write-host -f Red "Error:" $_.Exception.Message
    }
}

function Add-ListsOnly() {
    try {
        $ListInstance = $templateDocument.SiteProvisioning.Templates.Lists.ListInstance
        $logRecord = @()
        ForEach ($List in $ListInstance) {  
            $ListName = $List.Title 
            $ListUrl = $List.Url 
            $TemplateType = $List.TemplateType 
            $ContentTypesEnabled = $List.ContentTypesEnabled 
            $listExists = Get-PnPList -Identity $ListName -ErrorAction SilentlyContinue
            if ($null -eq $listExists) {
                if ($ContentTypesEnabled.ToLower() -eq "true") {
                    New-PnPList -Title $ListName -Url $ListUrl -Template $TemplateType -EnableContentType | Out-Null
                }
                else {
                    New-PnPList -Title $ListName -Url $ListUrl -Template $TemplateType | Out-Null
                }
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Empty List"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "True"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $ListName
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "List Created $ListName"
                $logRecord += $logRecordProp
            }
            else {
                Set-PnPList -Identity $listExists.Title -Title $ListName | Out-Null
                # Write-Host "`rList $ListName is already exists with the same name" -ForegroundColor Yellow
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Empty List"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "Skip"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $ListName
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "List Already Exists $ListName"
                $logRecord += $logRecordProp
            } 
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Add-SiteColumns() {
    try {
        $SiteFields = $templateDocument.SiteProvisioning.Templates.SiteFields.Field
        $logRecord = @()
        ForEach ($field in $SiteFields) { 
            try {
                $FieldName = $field.Name 
                $getField = Get-PnPField -List $ListName -Identity $FieldName -ErrorAction SilentlyContinue -InSiteHierarchy  | Where-Object Group -ne _Hidden
                if ($null -eq $getField) {
                    $fieldXML = Get-SiteFieldsXML -field $field
                    $FieldCreate = Add-PnPFieldFromXml -FieldXml $fieldXML
                    #Write-Host "`r`nSuccessfully create $FieldName" -BackgroundColor Green -ForegroundColor Black
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Site Filed"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $FieldName
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Field Created $FieldName"
                    $logRecord += $logRecordProp
                }
                else {
                    #Write-Host "`r`Already Exists field $FieldName" -BackgroundColor Yellow -ForegroundColor Black
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Site Filed"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "Skip"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $FieldName
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Field Already Exists $FieldName"
                    $logRecord += $logRecordProp
                }
            }
            catch {
                Write-Host "Error in $FieldName"
                $formatstring = "{0} : {1}`n{2}`n" +
                "    + CategoryInfo          : {3}`n" +
                "    + FullyQualifiedErrorId : {4}`n"
                $fields = $_.InvocationInfo.MyCommand.Name,
                $_.ErrorDetails.Message,
                $_.InvocationInfo.PositionMessage,
                $_.CategoryInfo.ToString(),
                $_.FullyQualifiedErrorId

                $formatstring -f $fields
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Add-ContentTypes() {
    try {
        $logRecord = @()
        $ContentTypes = $templateDocument.SiteProvisioning.Templates.ContentTypes.ContentType
        ForEach ($contentType in $ContentTypes) {  
            try {
                $contentTypeName = $contentType.Name
                $contentTypeDescription = $contentType.Description
                $contentTypeGroup = $contentType.Group
                $contentTypeID = "" + [System.Guid]::NewGuid().ToString("N"); #$contentType.ID
                $IsContentTypeExists = Get-PnPContentType -Identity $contentTypeName -ErrorAction SilentlyContinue
                if ($null -eq $IsContentTypeExists) {
                    $ParentContentType = $contentType.ParentContentType
                    if ($ParentContentType -eq "Document") {
                        $addContentType = Add-PnPContentType -Name $contentTypeName -Description $contentTypeDescription -Group $contentTypeGroup -ParentContentType (Get-PnPContentType -Identity "0x0101" -InSiteHierarchy)
                    }
                    elseif ($ParentContentType -eq "Item") {
                        $addContentType = Add-PnPContentType -Name $contentTypeName -Description $contentTypeDescription -Group $contentTypeGroup -ParentContentType (Get-PnPContentType -Identity "0x01" -InSiteHierarchy)
                    }
                    elseif ($ParentContentType -eq "Event") {
                        $addContentType = Add-PnPContentType -Name $contentTypeName -Description $contentTypeDescription -Group $contentTypeGroup -ParentContentType (Get-PnPContentType -Identity "0x0102" -InSiteHierarchy)
                    }
                    else {
                        $addContentType = Add-PnPContentType -Name $contentTypeName -Description $contentTypeDescription -Group $contentTypeGroup -ParentContentType $ct
                    }
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Content Type"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $contentTypeName 
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Content Type Created $contentTypeName"
                    $logRecord += $logRecordProp
                }
                else {
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Content Type"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "Skip"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $contentTypeName 
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Content Type Already exists $contentTypeName"
                    $logRecord += $logRecordProp
                }
                ForEach ($fieldRef in $contentType.FieldRefs.FieldRef) {  
                    try {
                        $ctFieldName = $fieldRef.Name
                        $field = Get-PnPField -Identity $ctFieldName -InSiteHierarchy  | Where-Object Group -ne _Hidden
                        if ($null -ne $field) {
                            Add-PnPFieldToContentType -Field $field.Id -ContentType $contentTypeName -ErrorAction SilentlyContinue
                            $logRecordProp = New-Object -TypeName PSObject;
                            $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Content Type Field"
                            $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                            $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value "$contentTypeName - $ctFieldName" 
                            $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Field $ctFieldName added to $contentTypeName"
                            $logRecord += $logRecordProp
                        }
                    }
                    catch {
                        #Write-Error "Error in adding Content Type Field $ctFieldName in $contentTypeName"
                        $logRecordProp = New-Object -TypeName PSObject;
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Content Type Field"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value "$contentTypeName - $ctFieldName" 
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in adding field in $ctFieldName to $contentTypeName"
                        $logRecord += $logRecordProp
                    }
                }
                #Write-Host "`rContent Type $contentTypeName has been created Successfully" -ForegroundColor Green
           
            }
            catch {
                Write-Error "Error in Creating Content Type $contentTypeName"
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Content Type"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value "$contentTypeName" 
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in creating content type $contentTypeName"
            }
        }
        $logRecord | Format-Table
    }
    catch {
        Write-Host $Error[0]
    }
}

function Add-ContentTypeAndCreateFieldsToLists() {
    try {
        $ListInstance = $templateDocument.SiteProvisioning.Templates.Lists.ListInstance
   
        ForEach ($List in $ListInstance) {  
            $logRecord = @()
            $ListName = $List.Title 
            Write-Host "Add-Content Type and Create Fields to $ListName" -ForegroundColor Blue
            $ContentTypesEnabled = $List.ContentTypesEnabled 
            if ($ContentTypesEnabled.ToLower() -eq "true") {
                ForEach ($contentType in $List.ContentTypeBindings.ContentTypeBinding) {  
                    $ContentTypeName = $contentType.ContentTypeName 
                    if ($contentType.Default.ToLower() -eq "true") {
                        Add-PnPContentTypeToList -List $ListName -ContentType $ContentTypeName -DefaultContentType
                    }
                    else {
                        Add-PnPContentTypeToList -List $ListName -ContentType $ContentTypeName
                    }
                }
            }

            # Creating List Fields
            ForEach ($field in $List.Fields.Field) {  
                try {
                    $FieldName = $field.Name
                    $getField = Get-PnPField -List $ListName -Identity $FieldName -ErrorAction SilentlyContinue -InSiteHierarchy | Where-Object Group -ne _Hidden
                    if ($null -eq $getField) {
                        $fieldXML = Get-SiteFieldsXML -field $field
                        Add-PnPFieldFromXml -List $ListName -FieldXml $fieldXML  | Out-Null

                        $displayName = $field.DisplayName
                        $logRecordProp = New-Object -TypeName PSObject;
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "List Filed"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $displayName
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "$displayName Field Created in $ListName"
                        $logRecord += $logRecordProp
                    }
                    else {
                        Set-PnPField -List $ListName -Identity $FieldName -Values @{Title = $field.DisplayName } | Out-Null
                    }
                }
                catch {
                    #Write-Host "Error in Creating Field" $FieldName -ForegroundColor Red
                    $displayName = $field.DisplayName
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "List Filed"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $displayName
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in creating $displayName in $ListName"
                    $logRecord += $logRecordProp
                }
            }
    
            #Creating Views in all Lists
            try {
                ForEach ($view in $List.Views.View) {
                    $defaultView = $view.DefaultView;
                    $displayName = $view.DisplayName
                    $type = $view.Type
                    $Url = Split-Path $view.Url -Leaf
                    if ($null -ne $Url) {
                        $Url = $Url.Split(".")[0]
                    }

                    $ViewFields = @();
                    [System.Collections.ArrayList]$ViewFields = @()

                    foreach ($fieldRef in $view.ViewFields.FieldRef) {
                        if (-not ($fieldRef.Name -contains "_x003a_")) {
                            $ViewFields.Add($fieldRef.Name) | Out-Null
                        }
                    }
                    $rowLimit = $view.RowLimit
                    $rowLimitCount = $rowLimit.InnerXML;
                    if ($null -ne $rowLimitCount) {
                        $rowLimitCount = $rowLimitCount.Trim()
                    }
                    else {
                        $rowLimitCount = 100
                    }
                    $getView = Get-PnPView -List $ListName -Identity $displayName -ErrorAction SilentlyContinue
                    if ($null -ne $getView.Title) {
                        Remove-PnPView -List $ListName -Identity $displayName -Force
                    }
           
                    Add-PnPView -List $ListName -Title $Url -Fields $ViewFields -ViewType $type -RowLimit $rowLimitCount -Query $view.Query.InnerXml | Out-Null
                    Set-PnPView -Identity $Url -List $ListName -Values @{Title = $displayName } | Out-Null      

                    try {
                        if ($null -ne $defaultView -and $defaultView.ToLower() -eq "true") {
                            $ListView = Get-PnPView -Identity $displayName -List $ListName -ErrorAction SilentlyContinue
                            $ListView.DefaultView = $True
                            $ListView.Update()
                            $ListView.Context.ExecuteQuery()
                        }
                        $logRecordProp = New-Object -TypeName PSObject;
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "View"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "True"
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $displayName 
                        $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "$displayName View Created in $ListName"
                        $logRecord += $logRecordProp
                    }
                    catch {
                        Write-Warning "Error in Setting up Default View"
                    
                    }
                }
            }
            catch {
                Write-Host  $ListName $Error[0]
                Write-Host "Error in Creating PnP View"
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "View"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success' -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name' -Value $displayName 
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message' -Value "Error in adding $displayName View to $ListName"
                $logRecord += $logRecordProp
            }
            $logRecord | Format-Table
        }
    }
    catch {
        Write-Host $Error[0]
    }
}

function Add-SitePages() {
    try {
        $SitePages = $templateDocument.SiteProvisioning.Templates.SitePages.Page
        ForEach ($Page in $SitePages) {  
            $AddedPage = Add-PnPPage -Name $Page.Name -LayoutType Article -ErrorAction SilentlyContinue
            if ($null -ne $AddedPage) {
                Set-PnPPage -Identity $AddedPage -Title $Page.Title -CommentsEnabled:$False -HeaderType None | Out-Null
                Add-PnPPageSection -Page $AddedPage -SectionTemplate OneColumn | Out-Null
                Add-PnPPageWebPart -Page $AddedPage -Component $Page.Component -Section 1 -Column 1 | Out-Null
                $AddedPage.Publish()

                Write-Host "`rSite Page "$Page.Title" has been created Successfully" -ForegroundColor Green
            }
            else {
                Write-Host "`rSite Page "$Page.Title" is already exists" -ForegroundColor Green 
            }
        }
    }
    catch {
        Write-Host $Error[0]
    }
}

function Add-SiteGroups() {
    try {
        $Groups = $templateDocument.SiteProvisioning.Templates.Groups.Group
        $logRecord = @()
        ForEach ($group in $Groups) {  
            try {
                $findGroup = Get-PnPGroup -Identity $group.Title -ErrorAction SilentlyContinue
                if ($null -eq $findGroup) {
                    $GroupName = $group.Title
                    New-PnPGroup -Title $GroupName -Description $group.Description -Owner $group.Owner -DisallowMembersViewMembership | Out-Null
                    $logRecordProp = New-Object -TypeName PSObject;
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Group Creation"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "True"
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $GroupName
                    $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Group Created $GroupName"
                    $logRecord += $logRecordProp
                }
            }
            catch {
                Write-Host $Error[0]
                $logRecordProp = New-Object -TypeName PSObject;
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Type'  -Value "Group Creation"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Success'  -Value "False"
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Name'  -Value $GroupName
                $logRecordProp | Add-Member -MemberType Noteproperty -Name 'Message'  -Value "Error in Group Creation - $GroupName"
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

# $SecurePassword = ConvertTo-SecureString -String $Password -AsPlainText -Force
# $Cred = New-Object -TypeName System.Management.Automation.PSCredential -argumentlist $UserName, $SecurePassword
# Connect-PnPOnline -Url $SiteURL -Credentials $Cred

$Web = Get-PnPWeb
$webTitle = $Web.Title

Write-Host "Connected Successfully to the $webTitle" -ForegroundColor Green

Write-Host "Creating Empty Lists in $SiteURL" -BackgroundColor Cyan -ForegroundColor Black
Add-ListsOnly

Write-Host "Creating Site Columns in $SiteURL" -BackgroundColor Cyan -ForegroundColor Black
Add-SiteColumns

Write-Host "Creating Content Types  in $SiteURL" -BackgroundColor Cyan -ForegroundColor Black
Add-ContentTypes

Write-Host "Creating Lists and Add Content Type to list in $SiteURL" -BackgroundColor Cyan -ForegroundColor Black
Add-ContentTypeAndCreateFieldsToLists

Write-Host "Creating Pages in $SiteURL" -BackgroundColor Cyan -ForegroundColor Black
Add-SitePages

Write-Host "Creating Site Groups in $webTitle" -BackgroundColor Cyan -ForegroundColor Black
Add-SiteGroups

Disconnect-PnPOnline
Write-Host "Script run successfully"
$scriptRun = $true
Write-Output "##vso[task.setvariable variable=SchemaScriptSuccess]true"

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