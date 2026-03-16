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

interface IHDCommonFilterProps {
    selectedHD?: number;
    onHDChange: (assetTypeId: string) => void;
    provider: IDataProvider;
    siteNameId: any;
    Title: string;
    placeHolder?: string,
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isAsset?: boolean;
    isHideAddNew?: boolean;
    className?: string
    // isReload?:boolean
}



export const HDCommonFilter: React.FunctionComponent<IHDCommonFilterProps> = (props: IHDCommonFilterProps): React.ReactElement => {

    const _onHDChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onHDChange(option.text as string);
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
                    props.onHDChange(title);
                    setDefaultvalue(title);
                    onClickClose();
                    getHDChoicesList();
                }).catch(err => console.log(err));
            } else {
                props.onHDChange(title);
                setDefaultvalue(title);
                onClickClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getHDChoicesList = async (): Promise<void> => {
        let dropvalue: any = [];
        const label = ` --All ${props.Title}--`;
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: label });
        }
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        let filterQuery = `Title eq '${props.Title}' and IsActive eq 1`;

        // Conditionally add the SiteNameId filter
        if (props.siteNameId !== null && props.siteNameId !== undefined) {
            filterQuery += ` and SiteNameId eq '${props.siteNameId}'`;
        }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.HelpDeskChoices,
            filter: filterQuery
            // filter: `Title eq '${props.Title}' and SiteNameId eq '${props.siteNameId}' and IsActive eq 1`
        };
        let countryNameOptions;
        props.provider.getItemsByQuery(queryStringOptions).then((response) => {
            // const titleArray = response.map(item => item.ChoiceValue);
            // setAddedValues(titleArray);
            // response.map((CV: any) => {
            //     dropvalue.push({ value: CV.ChoiceValue, key: CV.ChoiceValue, text: CV.ChoiceValue, label: CV.ChoiceValue });
            // });
            // setAssetTypeOptions(dropvalue);

            const dropvalue: any[] = [];
            const titleArray: string[] = [];
            const seen = new Set<string>();

            if (props.Title === "Status") {
                dropvalue.push({ key: 'Pending', text: 'Pending', value: 'Pending', label: 'Pending' });
            }
            for (const item of response) {
                const value = item.ChoiceValue;
                if (value && !seen.has(value)) {
                    seen.add(value);
                    titleArray.push(value);
                    dropvalue.push({ value, key: value, text: value, label: value });
                }
            }
            setAddedValues(titleArray);
            setAssetTypeOptions(dropvalue);

        }).catch((error) => {
            console.log(error);
        });
    };
    React.useEffect(() => {
        getHDChoicesList();
    }, []);

    // React.useMemo(() => {
    //     getHDChoicesList();
    // }, [props.isReload]);
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
                            <h2 className="mt-10">{props?.isAsset ? 'Add Asset Location choice' : 'Add Help Desk choice'}</h2>
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


                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickClose} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        <div>

            {/* {(props.AllOption == false || props.AllOption == undefined) &&
                <>
                    <div className="ttadd">
                        <TooltipHost content="Add New Value" id={tooltipId}>
                            <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAdd} />
                        </TooltipHost>
                    </div>
                </>
            } */}
            {((props.isHideAddNew == undefined ? true : false) && props.isHideAddNew == false) && ((props.AllOption == false || props.AllOption == undefined) &&
                <>
                    <div className="ttadd">
                        <TooltipHost content="Add New Value" id={tooltipId}>
                            <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAdd} />
                        </TooltipHost>
                    </div>
                </>)
            }

            <div className={!!props.className ? props.className : ""}>
                <ReactDropdown
                    options={assetTypeOptions} isMultiSelect={false}
                    placeholder={props.placeHolder}
                    defaultOption={defaultvalue ? defaultvalue : props.defaultOption}
                    onChange={_onHDChange}
                />
            </div>
        </div>
    </>;
};