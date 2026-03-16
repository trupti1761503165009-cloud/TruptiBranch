/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { Label, TextField } from "@fluentui/react";
import CustomModal from "../../CommonComponents/CustomModal";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { toastService } from "../../../../../Common/ToastService";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";

export interface IAssetTypeMasterProps {
    provider: IDataProvider;
    MasterId: number;
    isModelOpen: boolean;
    context?: WebPartContext;
    onClickClose(): any;
    CurrentCardData: any;
}

export interface IAssetTypeMasterState {
    siteMasterOptions: IReactSelectOptionProps[];
    dialogContent: any;
    isModelOpen: boolean;
    SiteMasterId?: number;
}

export const ForceFullyCheckList = (props: any) => {
    const [state, SetState] = React.useState<IAssetTypeMasterState>({
        siteMasterOptions: [],
        dialogContent: null,
        isModelOpen: props.isModelOpen,
    });

    const [selectedOption, setSelectedOption] = React.useState<any>();
    const [Options, setOptions] = React.useState<any>();
    const [comment, setcomment] = React.useState<string>("");
    const [ErrorOption, setErrorOption] = React.useState<boolean>(false);
    const [ErrorComment, setErrorComment] = React.useState<boolean>(false);

    const onOptionChange = (option: any): void => {
        setSelectedOption(option.value);
        if (option.value === "" || option.value === undefined) {
            setErrorOption(true);
        } else {
            setErrorOption(false);
        }
    };

    const onChangeComment = (event: any): void => {
        setcomment(event.target.value);
        if (event.target.value === "" || event.target.value === undefined) {
            setErrorComment(true);
        } else {
            setErrorComment(false);
        }
    };

    const onCloseModel = () => {
        props.onClickClose();
        SetState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const onClickOfYes = async () => {
        if (selectedOption === null || selectedOption === undefined || comment === "" || comment === undefined) {
            if (selectedOption === null || selectedOption === undefined || selectedOption === "") {
                setErrorOption(true);
            }
            else {
                setErrorOption(false);
            }
            if (comment === undefined || comment === "") {
                setErrorComment(true);
            }
            else {
                setErrorComment(false);
            }
        } else {

            try {
                const toastMessage = 'Checkout successfully!';
                const currentDateDate = new Date();
                let CreateObj: any = {
                    SiteNameId: props?.SiteNameId,
                    AssetMasterId: props?.AssetMasterId,
                    ConductedOn: currentDateDate.toISOString(),
                    OperatorName: props?.CurrentCardData?.OperatorName,
                    ChecklistType: "Post",
                    AssetTypeMasterId: props?.CurrentCardData?.AssetTypeMasterId,
                    AssociatedTeamId: props?.CurrentCardData?.AssociatedTeamId,
                    IsForceFully: selectedOption,
                    Comment: comment,
                    ReferencePairId: props?.CurrentCardData?.PreReferencePairId || ""
                };
                let UpdateObj: any = {
                    ChecklistStatus: "Available",
                    CurrentChecklistUserId: null,
                };
                await props.provider.updateItemWithPnP(UpdateObj, ListNames.AssetMaster, props?.AssetMasterId);
                await props.provider.createItem(CreateObj, ListNames.ChecklistResponseMaster).then((response: any) => {
                    const toastId = toastService.loading('Loading...');
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickClear();
                }).catch((error: any) => {
                    console.log(error);
                });
            } catch (error) {
                console.log(error);
            }
        }
    };



    const onClickClear = (): void => {
        setSelectedOption(null);
        setcomment("");
        props.onClickClose();
        SetState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const optionOperatorType: any[] = [
        { value: 'Yes', key: 'Yes', text: 'Yes', label: 'Yes' },
        { value: 'No', key: 'No', text: 'No', label: 'No' },
        { value: 'N/A', key: 'N/A', text: 'N/A', label: 'N/A' },
    ];

    React.useEffect(() => {
        setOptions(optionOperatorType);
    }, []);

    return <>
        <CustomModal isModalOpenProps={state.isModelOpen}
            setModalpopUpFalse={onCloseModel}
            subject="Manual Checkout "
            message={<>
                <div>
                    <Label className="formLabel">Have you discussed with the Operator?<span className="required"> *</span></Label>
                    <div className="formControl">
                        < ReactDropdown
                            options={Options}
                            isMultiSelect={false}
                            defaultOption={!!selectedOption ? selectedOption : ""}
                            onChange={onOptionChange}
                            placeholder={"Checkout Type"}
                        />
                        {ErrorOption &&
                            <div className="requiredlink">Checkout Type is Required</div>}
                    </div>
                    <TextField
                        className="formControl"
                        name='comment'
                        label="Comment"
                        required
                        multiline rows={3}
                        placeholder="Enter Comment"
                        value={comment}
                        onChange={onChangeComment} />
                    {ErrorComment &&
                        <div className="requiredlink">Comment is Required</div>}
                </div>
            </>}
            closeButtonText={"Close"}
            onClickOfYes={onClickOfYes}
            isYesButtonDisbale={false}
            yesButtonText={"Submit"}
        />
    </>;
};