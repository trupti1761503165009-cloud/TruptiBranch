import * as React from "react";
import { useState, useEffect } from "react";
import { Dropdown, IDropdownOption, MessageBar, MessageBarType } from "@fluentui/react";
import { PrimaryButton, DefaultButton } from "@fluentui/react/lib/Button";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";


interface IAuditInspectionFieldProps {
    isOpen: boolean;
    siteMasterId: number;
    onClose: () => void;
}

export const AuditInspectionField: React.FC<IAuditInspectionFieldProps> = ({
    isOpen,
    siteMasterId,
    onClose,
}) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isLoading, setIsLoading] = useState(false);
    const [fieldData, setFieldData] = useState<any[]>([]);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showSaveMessageBar, setSaveShowMessageBar] = useState(false);
    const [showUpdateMessageBar, setUpdateShowMessageBar] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState<IDropdownOption[]>([]);


    const buildDropdownOptions = () => {
        const options = [
            "Help Desk Description",
            "Caller",
            "Starting Date",
            "Location",
            "Sub Location",
            "Area",
            "Category",
            "Status",
            "Help Desk Name",
            "Priority",
            "Event Name",
            "Reported Help Desk",
            "Call Type",
            "Completion Date",
        ].map((text) => ({ key: text, text }));

        setDropdownOptions(options);
    };

    const onClickFieldData = async () => {
        setIsLoading(true);
        try {
            const queryStringOptions = {
                select: ["ID", "Title", "Field", "SiteNameId"],
                listName: ListNames.AuditInspectionPermission,
                filter: `SiteNameId eq '${siteMasterId}'`,
            };

            const results: any[] = await provider.getItemsByQuery(queryStringOptions);
            if (results?.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Title: data.Title,
                    Field: data.Field || "",
                }));

                setFieldData(listData);
                setSelectedOptions(listData[0]?.Field || []);
            } else {
                setFieldData([]);
                const allFields = dropdownOptions.map((o) => o.key.toString());
                setSelectedOptions(allFields);
            }
        } catch (error) {
            console.error("Error loading field data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const onClickYes = async () => {
        setIsLoading(true);
        const FieldDataObj = {
            Field: selectedOptions || [],
            SiteNameId: Number(siteMasterId),
        };

        try {
            if (fieldData.length > 0) {
                await provider.updateItemWithPnP(FieldDataObj, ListNames.HelpDeskField, fieldData[0]?.ID);
                setUpdateShowMessageBar(true);
            } else {
                await provider.createItem(FieldDataObj, ListNames.HelpDeskField);
                setSaveShowMessageBar(true);
            }
            await onClickFieldData();
            setTimeout(() => {
                setSaveShowMessageBar(false);
                setUpdateShowMessageBar(false);
            }, 4000);
            onClose();
        } catch (error) {
            console.error("Save/Update error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDropdownChange = (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        if (!option) return;

        setSelectedOptions((prev: string[]) => {
            // Get all options except "Select All"
            const allKeys = dropdownOptions
                .filter((opt) => opt.key !== 'selectAll')
                .map((opt) => opt.key as string);

            if (option.key === 'selectAll') {
                // Toggle Select All
                const isSelectedAll = prev.length === allKeys.length;
                return isSelectedAll ? [] : allKeys; // Select all or clear all
            } else {
                // Normal selection/deselection
                const newSelection = option.selected
                    ? [...prev, option.key as string] // Add selection
                    : prev.filter((key) => key !== option.key); // Remove selection

                const isAllSelected = newSelection.length === allKeys.length;
                return isAllSelected ? allKeys : newSelection;
            }
        });
    };
    useEffect(() => {
        if (isOpen) {
            onClickFieldData();
            buildDropdownOptions();
        }
    }, [isOpen]);
    return (
        <CustomModal
            isModalOpenProps={isOpen}
            dialogWidth="500px"
            subject="Configure Help Desk Field"
            message={
                <>
                    <div className="mt-2">
                        {showSaveMessageBar && (
                            <MessageBar messageBarType={MessageBarType.success}>
                                <div className="inputText">Columns has been saved successfully!</div>
                            </MessageBar>
                        )}
                        {showUpdateMessageBar && (
                            <MessageBar messageBarType={MessageBarType.success}>
                                <div className="inputText">   Columns have been updated successfully!</div>
                            </MessageBar>
                        )}
                    </div>

                    <div className="mt-2">
                        <b>Select Column</b>
                    </div>

                    <div className="formControl custdd-multiple mt img-mt">
                        <Dropdown
                            placeholder="Select"
                            multiSelect
                            options={dropdownOptions}
                            selectedKeys={
                                selectedOptions.length === dropdownOptions.length - 1
                                    ? ['selectAll', ...selectedOptions] // Ensure "Select All" appears selected when all options are selected
                                    : selectedOptions
                            }
                            onChange={handleDropdownChange}
                        />

                    </div>
                </>
            }
            closeButtonText="Cancel"
            yesButtonText="Save"
            onClickOfYes={onClickYes}
            onClose={onClose}
        />
    );
};
