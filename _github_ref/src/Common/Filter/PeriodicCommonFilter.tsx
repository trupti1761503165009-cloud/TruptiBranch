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

interface IPeriodicCommonFilterProps {
    selectedPeriodic: number;
    onPeriodicChange: (assetTypeId: string) => void;
    provider: IDataProvider;
    siteNameId: any;
    Title: string;
    placeHolder?: string,
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
    isFocus?: any;
    HideAddOption?: any;
    isRefresh?: any;
}

export const PeriodicCommonFilter: React.FunctionComponent<IPeriodicCommonFilterProps> = (props: IPeriodicCommonFilterProps): React.ReactElement => {

    const _onPeriodicChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onPeriodicChange(option.text as string);
        setDefaultvalue(option.text as string);
    };

    const tooltipId = useId('tooltip');
    const [assetTypeOptions, setAssetTypeOptions] = React.useState<any>();
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [AddedValues, setAddedValues] = React.useState<any[]>([]);
    const [defaultvalue, setDefaultvalue] = React.useState<any>();

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
                await props.provider.createItem(data, ListNames.PeriodicChoices).then(async (item: any) => {
                    console.log("Insert Successfully");
                    props.onPeriodicChange(title);
                    setDefaultvalue(title);
                    onClickClose();
                    getPeriodicChoicesList();
                }).catch(err => console.log(err));
            } else {
                props.onPeriodicChange(title);
                setDefaultvalue(title);
                onClickClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getPeriodicChoicesList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Periodic--" });
        }
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.PeriodicChoices,
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
        getPeriodicChoicesList();
    }, [props.isRefresh]);

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
                            <h2 className="mt-10">Add Periodic Area choice</h2>
                            <TextField className="formControl mt-20" label={props.Title} placeholder="Enter New Value"
                                value={title}
                                required
                                onChange={onChangeTitle} />
                            <DialogFooter>
                                {/* <PrimaryButton text="Save" onClick={onClick_SavePeriodic} className='mrt15 css-b62m3t-container btn btn-primary'
                                /> */}
                                <PrimaryButton
                                    text="Save"
                                    disabled={title.trim() === ""}
                                    onClick={onClick_SavePeriodic}
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
            {props.HideAddOption !== true && <div className="ttadd">
                {(props.AllOption == false || props.AllOption == undefined) &&
                    <TooltipHost content="Add New Value" id={tooltipId}>
                        <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAdd} />
                    </TooltipHost>}
            </div>}
            <div className={props?.isReq && !defaultvalue && !props?.defaultOption ? "req-border-red" : ""}>
                <ReactDropdown
                    selectRef={props?.isFocus}
                    options={assetTypeOptions} isMultiSelect={false}
                    placeholder={props.placeHolder}
                    defaultOption={defaultvalue ? defaultvalue : props.defaultOption}
                    onChange={_onPeriodicChange}
                />
            </div>
        </div>
    </>;
};