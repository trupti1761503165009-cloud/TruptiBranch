/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";


import { ActionMeta } from "react-select";


import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultButton, DialogFooter, FocusTrapZone, Layer, Overlay, Popup, PrimaryButton, TextField, TooltipHost, mergeStyleSets } from "office-ui-fabric-react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../webparts/quayClean/components/CommonComponents/ReactDropdown";
import IPnPQueryOptions from "../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "./Enum/ComponentNameEnum";
import { Dropdown } from "@fluentui/react";

interface IQuayCleanChoicesProps {
    onChange: (text: any) => void;
    provider: IDataProvider;
    siteNameId?: any;
    keyTitle: string;
    label: string;
    placeHolder?: string,
    defaultOption?: string;
    isAddNew?: boolean;
    className?: string
    header: string;
    isClearable?: boolean;
    isStateFilterApply?: boolean;
    qcStateId?: number;
    isDisable?: boolean;
    isAssetLocation?: boolean;
    isMultiSelect?: boolean;
    isShowAnotherDropDown?: boolean;
    isCloseMenuOnSelect?: boolean
}



export const QuayCleanChoices: React.FunctionComponent<IQuayCleanChoicesProps> = (props: IQuayCleanChoicesProps): React.ReactElement => {

    const _onHDChange = (option: any, actionMeta: any): void => {

        if (props.isMultiSelect) {
            if (!!option && option.length > 0) {
                let value = option.map((i: any) => i.text);
                setDefaultvalue(value);
                props.onChange(value);
            } else {
                setDefaultvalue([]);
                props.onChange([]);
            }

        } else {
            setDefaultvalue(option.text as string);
            props.onChange(option.text as string);
        }

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
                let data: any = {
                    Title: !!props.keyTitle ? props.keyTitle : "",
                    ChoiceValue: title,
                    SiteNameId: !!props.siteNameId ? props.siteNameId : null,
                    IsActive: true
                };
                if (!!props.qcStateId && props.qcStateId > 0) {
                    data = {
                        ...data,
                        QCStateId: props.qcStateId
                    }

                }
                await props.provider.createItem(data, props?.isAssetLocation ? ListNames.AssetLocationChoices : ListNames.QuaycleanChoices).then(async (item: any) => {
                    console.log("Insert Successfully");
                    props.onChange(title);
                    setDefaultvalue(title);
                    onClickClose();
                    getHDChoicesList();
                }).catch(err => console.log(err));
            } else {
                props.onChange(title);
                setDefaultvalue(title);
                onClickClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getHDChoicesList = (): void => {
        let dropvalue: any = [];
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        let filterQuery = props.isAssetLocation ? 'IsActive eq 1' : `Title eq '${props.keyTitle}' and IsActive eq 1`;

        // Conditionally add the SiteNameId filter
        if (props.siteNameId !== null && props.siteNameId !== undefined) {
            filterQuery += ` and SiteNameId eq '${props.siteNameId}'`;
        }

        if (!!props.isStateFilterApply && props.isStateFilterApply && !!props.qcStateId && props.qcStateId) {
            filterQuery += ` and QCStateId eq '${props.qcStateId}'`;
        }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: props?.isAssetLocation ? ListNames.AssetLocationChoices : ListNames.QuaycleanChoices,
            filter: filterQuery
        };
        props.provider.getItemsByQuery(queryStringOptions).then((response) => {
            const titleArray = response.map(item => item.ChoiceValue);
            setAddedValues(titleArray);
            response.map((CV: any) => {
                dropvalue.push({ value: CV.ChoiceValue, key: CV.ChoiceValue, text: CV.ChoiceValue, label: CV.ChoiceValue });
            });
            if (!!dropvalue && dropvalue.length > 0) {
                setAssetTypeOptions(dropvalue);
            } else {
                setAssetTypeOptions([]);
            }



        }).catch((error) => {
            console.log(error);
        });
    };


    const getChoicesList = (): void => {
        let dropvalue: any = [];
        const select = ["Id,Title,SiteNameId,IsActive"];
        let filterQuery = props.isAssetLocation ? 'IsActive eq 1' : `Title eq '${props.keyTitle}' and IsActive eq 1`;

        // Conditionally add the SiteNameId filter
        if (props.siteNameId !== null && props.siteNameId !== undefined) {
            filterQuery += ` and SiteNameId eq '${props.siteNameId}'`;
        }

        if (!!props.isStateFilterApply && props.isStateFilterApply && !!props.qcStateId && props.qcStateId) {
            filterQuery += ` and QCStateId eq '${props.qcStateId}'`;
        }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: props?.isAssetLocation ? ListNames.AssetLocationChoices : ListNames.QuaycleanChoices,
            filter: filterQuery
        };
        props.provider.getItemsByQuery(queryStringOptions).then((response) => {
            const titleArray = response.map(item => item.Title);
            setAddedValues(titleArray);
            response.map((CV: any) => {
                dropvalue.push({ value: CV.Title, key: CV.Title, text: CV.Title, label: CV.Title });
            });
            if (!!dropvalue && dropvalue.length > 0) {
                setAssetTypeOptions(dropvalue);
            } else {
                setAssetTypeOptions([]);
            }



        }).catch((error) => {
            console.log(error);
        });
    };
    React.useEffect(() => {

        if (!!props.isAssetLocation && props.isAssetLocation) {
            getChoicesList()
        } else {
            getHDChoicesList();
        }


    }, []);

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
                            <h2 className="mt-10">{props.header ? props.header : ""}</h2>
                            <TextField className="formControl mt-20" label={props.label} placeholder="Enter New Value"
                                value={title}
                                required
                                onChange={onChangeTitle} />

                            <DialogFooter>
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

            {(props.isAddNew && (props.isDisable == undefined || props.isDisable == false)) &&
                <>
                    <div className="ttadd">
                        <TooltipHost content="Add New Value" id={tooltipId}>
                            <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAdd} />
                        </TooltipHost>
                    </div>
                </>
            }

            <div className={!!props.className ? props.className : ""}>
                <ReactDropdown
                    isDisabled={props.isDisable || false}
                    options={assetTypeOptions}
                    isMultiSelect={props.isMultiSelect ? props.isMultiSelect : false}
                    placeholder={props.placeHolder}
                    defaultOption={defaultvalue ? defaultvalue : props.defaultOption}
                    onChange={_onHDChange}
                    isClearable={props.isClearable ? props.isClearable : false}
                    isCloseMenuOnSelect={!!props?.isCloseMenuOnSelect ? props.isCloseMenuOnSelect : false}

                />
            </div>
        </div>
    </>;
};