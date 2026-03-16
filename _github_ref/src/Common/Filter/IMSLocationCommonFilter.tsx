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

interface IIMSLocationCommonFilterProps {
    selectedIMSLocation: any;
    onIMSLocationChange: (assetTypeId: string) => void;
    provider: IDataProvider;
    siteNameId: any;
    Title: string;
    Label: string;
    placeHolder?: string,
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    IsUpdate?: boolean;
}

export const IMSLocationCommonFilter: React.FunctionComponent<IIMSLocationCommonFilterProps> = (props: IIMSLocationCommonFilterProps): React.ReactElement => {
    const _onIMSLocationChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onIMSLocationChange(option.text as string);
        setDefaultvalue(option.text as string);
    };
    const tooltipId = useId('tooltip');
    const [assetTypeOptions, setAssetTypeOptions] = React.useState<any>();
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [AddedValues, setAddedValues] = React.useState<any[]>([]);
    const [defaultvalue, setDefaultvalue] = React.useState<any>(props.defaultOption);

    const onClickAdd = (): void => {
        showPopup();
    };

    const onClickClose = (): void => {
        settitle("");
        hidePopup();
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


    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
    };

    const onClick_SaveIMSLocation = async (evt: { preventDefault: () => void; }) => {
        try {
            const elementExists = AddedValues.includes(title);
            if (!elementExists) {
                const data: any = {
                    Title: props.Title,
                    ChoiceValue: title,
                    SiteNameId: props.siteNameId,
                    IsActive: true
                };
                await props.provider.createItem(data, ListNames.IMSChoices).then(async (item: any) => {
                    console.log("Insert Successfully");
                    props.onIMSLocationChange(title);
                    setDefaultvalue(title);
                    onClickClose();
                    getIMSLocationChoicesList();
                }).catch(err => console.log(err));
            } else {
                props.onIMSLocationChange(title);
                setDefaultvalue(title);
                onClickClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getIMSLocationChoicesList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All IMSLocation--" });
        }
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.IMSChoices,
            filter: `Title eq '${props.Title}' and SiteNameId eq '${props.siteNameId}' and IsActive eq 1`
        };
        let countryNameOptions;
        props.provider.getItemsByQuery(queryStringOptions).then((response) => {
            const titleArray = response.map(item => item.ChoiceValue);
            setAddedValues(titleArray);
            response.map((CV: any) => {
                dropvalue.push({ value: CV.ChoiceValue, key: CV.ChoiceValue, text: CV.ChoiceValue, label: CV.ChoiceValue });
            });
            setAssetTypeOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };
    React.useEffect(() => {
        getIMSLocationChoicesList();
        setDefaultvalue("");
    }, [props.siteNameId]);

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
                            <h2 className="mt-10">Add {props.Label}</h2>
                            <TextField className="formControl mt-20" label={props.Label || 'Location'} placeholder="Enter New Value"
                                value={title}
                                required
                                onChange={onChangeTitle} />
                            <DialogFooter>
                                {/* <PrimaryButton text="Save" onClick={onClick_SaveIMSLocation} className='mrt15 css-b62m3t-container btn btn-primary'
                                /> */}
                                <PrimaryButton
                                    text="Save"
                                    disabled={title.trim() === ""}
                                    onClick={onClick_SaveIMSLocation}
                                    className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
                                />

                                <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickClose} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        <div>
            <div className="ttadd-2">
                {props.siteNameId &&
                    <TooltipHost content="Add New Value" id={tooltipId}>
                        <FontAwesomeIcon className="ml-5 ddadd mt-10" icon='plus' onClick={onClickAdd} />
                    </TooltipHost>}
            </div>
            <div>
                <ReactDropdown
                    isDisabled={props?.siteNameId == undefined}
                    options={assetTypeOptions} isMultiSelect={false}
                    placeholder={props.placeHolder}
                    defaultOption={defaultvalue ? defaultvalue : props.IsUpdate ? props.defaultOption : ""}
                    onChange={_onIMSLocationChange}
                />
            </div>
        </div>
    </>;
};