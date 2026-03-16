/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import {
    DefaultButton,
    DialogFooter,
    FocusTrapZone,
    Layer,
    Overlay,
    Popup,
    PrimaryButton,
    TextField,
    TooltipHost,
    mergeStyleSets
} from "office-ui-fabric-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ListNames } from "../Enum/ComponentNameEnum";
interface IQuayCleanSimpleListDropdownProps {
    provider: IDataProvider;
    listName: ListNames;
    label: string;
    header: string;
    placeHolder?: string;
    defaultOption?: string;
    isAddNew?: boolean;
    isDisabled?: boolean;
    className?: string;
    onChange: (item: { Id: number; Title: string }) => void;
}

export const QuayCleanSimpleListDropdown: React.FC<IQuayCleanSimpleListDropdownProps> = (props) => {

    const tooltipId = useId("tooltip");

    const [options, setOptions] = React.useState<any[]>([]);
    const [addedValues, setAddedValues] = React.useState<string[]>([]);
    const [defaultValue, setDefaultValue] = React.useState<string | undefined>(props.defaultOption);
    const [title, setTitle] = React.useState<string>("");

    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

    /* ================= Load List Items ================= */
    const loadListItems = (): void => {
        const queryOptions: IPnPQueryOptions = {
            listName: props.listName,
            select: ["Id", "Title"],
            orderBy: "Title",
            isSortOrderAsc: true
        };

        props.provider.getItemsByQuery(queryOptions)
            .then((items: any[]) => {
                console.log(items);
                setAddedValues(items.map(i => i.Title));

                setOptions(
                    items.map((i: any) => ({
                        key: i.Id,
                        value: i.Title,
                        text: i.Title,
                        label: i.Title
                    }))
                );
            })
            .catch(console.error);
    };

    React.useEffect(() => {
        if (props.defaultOption) {
            setDefaultValue(props.defaultOption);
        }
    }, [props.defaultOption]);

    React.useEffect(() => {
        loadListItems();
    }, []);

    /* ================= Dropdown Change ================= */
    const onDropdownChange = (option: any): void => {
        if (!option) return;

        setDefaultValue(option.text);

        props.onChange({
            Id: option.key,
            Title: option.text
        });
    };

    /* ================= Save New Item ================= */
    const onSave = async (): Promise<void> => {
        try {
            const trimmed = title.trim();
            if (!trimmed) return;

            const exists = addedValues.some(
                v => v.toLowerCase() === trimmed.toLowerCase()
            );

            let newItemId: number | undefined;

            if (!exists) {
                const result = await props.provider.createItem(
                    { Title: trimmed },
                    props.listName
                );

                // ✅ Capture newly created item ID
                newItemId = result?.data?.Id || result?.Id;
            } else {
                // ✅ Find existing item's ID
                const existingItem = options.find(
                    o => o.text.toLowerCase() === trimmed.toLowerCase()
                );
                newItemId = existingItem?.key;
            }

            if (!newItemId) return;

            // ✅ Correct onChange call (lookup-safe)
            props.onChange({
                Id: newItemId,
                Title: trimmed
            });

            setDefaultValue(trimmed);
            setTitle("");
            hidePopup();
            loadListItems();

        } catch (error) {
            console.error(error);
        }
    };

    /* ================= Popup Styles ================= */
    const popupStyles = mergeStyleSets({
        root: {
            background: "rgba(0,0,0,0.3)",
            position: "fixed",
            inset: 0
        },
        content: {
            background: "white",
            width: "420px",
            padding: "20px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderTop: "3px solid #1300a6"
        }
    });

    return (
        <>
            {/* ================= Add Popup ================= */}
            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <div className={popupStyles.content}>
                                <h3>{props.header}</h3>

                                <TextField
                                    label={props.label}
                                    placeholder="Enter value"
                                    value={title}
                                    onChange={(_, val) => setTitle(val || "")}
                                    required
                                />

                                <DialogFooter>
                                    <PrimaryButton
                                        text="Save"
                                        onClick={onSave}
                                        disabled={!title.trim()}
                                    />
                                    <DefaultButton text="Cancel" onClick={hidePopup} />
                                </DialogFooter>
                            </div>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}

            {/* ================= Add Icon ================= */}
            {props.isAddNew && !props.isDisabled && (
                <div className="ttadd">
                    <TooltipHost content="Add new" id={tooltipId}>
                        <FontAwesomeIcon
                            icon="plus"
                            className="ddadd"
                            onClick={showPopup}
                        />
                    </TooltipHost>
                </div>
            )}

            {/* ================= Dropdown ================= */}
            <div className={props.className || ""}>
                <ReactDropdown
                    options={options}
                    isMultiSelect={false}
                    placeholder={props.placeHolder}
                    defaultOption={defaultValue}
                    onChange={onDropdownChange}
                    isDisabled={props.isDisabled || false}
                    isClearable={true}
                />
            </div>
        </>
    );
};