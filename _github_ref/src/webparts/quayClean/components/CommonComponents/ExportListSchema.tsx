/* eslint-disable  */
import { Label, PrimaryButton, Toggle } from "@fluentui/react"

import { useAtomValue } from "jotai";
import { saveAs } from 'file-saver';

import * as XLSX from 'xlsx';
import * as React from "react";

import { ReactDropdown } from "./ReactDropdown";
import { _copyAndSort } from "../../../../Common/Util";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";



export const excludingFields: any[] = [
    "Edit", "DocIcon", "ItemChildCount", "FolderChildCount", "_ComplianceFlags",
    "_ComplianceTag", "_ColorTag", "_ComplianceTagWrittenTime", "_ComplianceTagUserId", "_IsRecord", "ComplianceAssetId", "AppAuthor", "AppEditor", "ContentType", "LinkTitleNoMenu", "_UIVersionString", "Attachments", "LinkTitle"
];
export const excludingLists: any[] = [
    "Pages", "Apps for SharePoint", "Shared Documents", "_catalogs", "Lists/ContentTypeSyncLog", "/IWConvertedForms", "FormServerTemplates", "Lists/PublishedFeed", "/ProjectPolicyItemList", "Site Assets", "Site Pages", "Style Library", "Lists/TaxonomyHiddenList", "Documents"
];

interface IState {
    AllList: any[];
    selectedList: any;
    listOptions: any[];
    isLoading: boolean;
    isDefaultColumn: boolean;
    isExtraExpandColumn: boolean;
}

export const ExportListSchema = () => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<IState>({
        AllList: [],
        selectedList: "",
        listOptions: [],
        isLoading: true,
        isDefaultColumn: false,
        isExtraExpandColumn: false
    })

    const onClickExportListSchema = async () => {
        let data = await provider.getlistSchema(state.selectedList.label)
        // Get list fields
        // Prepare data for Excel
        if (state.isDefaultColumn) {
            data = data.filter((i: any) => !i.Hidden)
        } else {
            data = data.filter((i: any) => !i.Hidden && i.CanBeDeleted)
        }

        data = data.filter((items: any) => excludingFields.indexOf(items.InternalName) < 0);
        let schemaData = data.map((field: any) => {
            const isMultiSelect =
                field.TypeAsString === 'MultiChoice' ||
                ((field.TypeAsString === 'Lookup' || field.TypeAsString === 'LookupMulti') && field.AllowMultipleValues) ||
                ((field.TypeAsString === 'User' || field.TypeAsString === 'UserMulti') && field.AllowMultipleValues);
            const formula = field.TypeAsString === 'Calculated' ? field.Formula : '-';
            let dataType: string;
            let feildName: string = field.InternalName
            switch (field.TypeAsString) {
                case 'Text':
                case 'Note':
                case 'Choice':
                    dataType = 'string';
                    break
                case 'MultiChoice':
                    dataType = 'string[]';
                    break
                case 'LookupMulti':
                case 'UserMulti':
                    dataType = 'number[]';
                    feildName = `${feildName}Id`
                    break
                case 'User':
                case 'Lookup':
                    dataType = 'number';
                    feildName = `${feildName}Id`
                    break;
                case 'Number':
                case 'Currency':
                    dataType = 'number';
                    break;
                case 'DateTime':
                    // Check if this is for item creation or modification
                    dataType = 'Date | any';
                    break;
                case 'Boolean':
                    dataType = 'boolean';
                    break;

                case 'Calculated':
                    dataType = 'string';
                    break;
                default:
                    dataType = 'unknown';
            }

            return {

                Title: field.Title,
                InternalName: field.InternalName,
                Type: field.TypeDisplayName,
                InterFace: `${feildName} : ${dataType};`,
                // Hidden: field.Hidden ? "Yes" : "No",
                Choices: field.Choices ? field.Choices.join(', ') : '-', // Handle choice fields
                AllowMultipleValues: isMultiSelect ? 'Yes' : '-',
                Formula: formula, // Include formula for calculated fields
                LookUpFeildColumn: !!field.LookupField ? field.LookupField : "-",
                isExtraExpanded: field.IsDependentLookup ? "Yes" : '-',
                Required: field.Required ? "Yes" : "-",

            }
        });
        schemaData = _copyAndSort(schemaData, "Type", false)
        if (state.isExtraExpandColumn == false) {
            schemaData = schemaData.filter((i: any) => i.isExtraExpanded != "Yes")
        }
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const ws = XLSX.utils.json_to_sheet(schemaData);
        const wb = { Sheets: { 'TechnologyPartner': ws }, SheetNames: ['TechnologyPartner'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

        const data2 = new Blob([excelBuffer], { type: fileType });
        saveAs(data2, `${state.selectedList.label}` + fileExtension);
    }


    const onChangeList = (options: any, name: any) => {
        setState((prevState: any) => ({ ...prevState, selectedList: options }))

    }

    const getAllList = async () => {
        let allList = await provider.getSiteList();
        excludingLists
        allList = allList.filter((items: any) => excludingFields.indexOf(items.InternalName) < 0);
        if (allList.length > 0) {
            let options = allList.map((i: any) => {
                return {
                    value: i.Title,
                    label: i.Title
                }
            });
            setState((prevState: any) => ({ ...prevState, listOptions: options, isLoading: false }))
        }

    }

    React.useEffect(() => {
        getAllList()
    }, [])

    return <div>
        {/* {state.isLoading && <Loader />} */}
        <div className="boxCard" id="boxCard">
            <div style={{ width: "20%" }}>
                <Label >Select The List</Label>
                <ReactDropdown
                    options={state.listOptions || []}
                    isMultiSelect={false}
                    onChange={onChangeList}
                    defaultOption={state.selectedList.value}
                />
            </div>
            <div style={{ width: "20%" }}>
                <Label >Share Point Default Column</Label>
                <Toggle
                    onChange={(e, checked) => setState((prevState: any) => ({ ...prevState, isDefaultColumn: checked }))}
                />
            </div>
            <div style={{ width: "20%" }}>
                <Label > Is Extra Expand Column</Label>
                <Toggle
                    onChange={(e, checked) => setState((prevState: any) => ({ ...prevState, isExtraExpandColumn: checked }))}
                />
            </div>
            <PrimaryButton text="Download" style={{ marginTop: "10px" }} onClick={onClickExportListSchema} />
        </div>
    </div>
}