/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultButton, DialogFooter, FocusTrapZone, Layer, Overlay, Popup, PrimaryButton, TextField, TooltipHost, mergeStyleSets } from "office-ui-fabric-react";
import { useBoolean, useId } from "@fluentui/react-hooks";

interface IAddHDChoiceOptionProps {
    provider: IDataProvider;
    siteNameId: any;
    Title: string;
    isPopupVisible: boolean;
    onClickClose(isReload: boolean): any;
}



export const AddHDChoiceOption: React.FunctionComponent<IAddHDChoiceOptionProps> = (props: IAddHDChoiceOptionProps): React.ReactElement => {
    const tooltipId = useId('tooltip');
    const [assetTypeOptions, setAssetTypeOptions] = React.useState<any>();
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(props.isPopupVisible);
    const [title, settitle] = React.useState<string>("");
    const [AddedValues, setAddedValues] = React.useState<any[]>([]);
    const [defaultvalue, setDefaultvalue] = React.useState<any>();

    const onClickAdd = (): void => {
        showPopup();
    };

    const onClickClose = (isReload: boolean): void => {
        settitle("");
        hidePopup();
        props.onClickClose(isReload)
    };

    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
    };
    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);
    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '550px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });


    const onClick_SavePeriodic = async (evt: { preventDefault: () => void; }) => {
        try {
            const elementExists = AddedValues.includes(title);
            if (!elementExists) {
                const data: any = {
                    Title: props.Title,
                    ChoiceValue: title,
                    SiteNameId: props.siteNameId,
                    IsActive: true
                };
                await props.provider.createItem(data, ListNames.HelpDeskChoices).then(async (item: any) => {
                    console.log("Insert Successfully");
                    // props.onHDChange(title);
                    setDefaultvalue(title);
                    onClickClose(true);
                    // getHDChoicesList();
                }).catch(err => console.log(err));
            } else {
                // props.onHDChange(title);
                setDefaultvalue(title);
                onClickClose(false);
            }
        } catch (error) {
            console.log(error);
        }
    };

    React.useEffect(() => {
        settitle("");
    }, [props.isPopupVisible])

    return <>
        {isPopupVisible && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopup}
                >
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Add {props.Title}</h2>
                            <TextField className="formControl mt-20" label={props.Title} placeholder="Enter New Value"
                                value={title}
                                required
                                onChange={onChangeTitle} />

                            <DialogFooter>
                                {/* <PrimaryButton text="Save" disabled={title == ""} onClick={onClick_SavePeriodic} className='mrt15 css-b62m3t-container btn btn-primary'
                                /> */}

                                <PrimaryButton
                                    text="Save"
                                    disabled={title.trim() === ""}
                                    onClick={onClick_SavePeriodic}
                                    className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={() => onClickClose(false)} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        <div>
        </div>
    </>;
};