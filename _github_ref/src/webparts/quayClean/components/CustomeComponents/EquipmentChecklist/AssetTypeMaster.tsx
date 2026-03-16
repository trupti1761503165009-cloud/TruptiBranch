/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IColumn, Link, PrimaryButton, SelectionMode, TooltipHost } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { IQuayCleanState } from "../../QuayClean";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { toastService } from "../../../../../Common/ToastService";
import CustomModal from "../../CommonComponents/CustomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getErrorMessage, getErrorMessageValue, logGenerator, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../Common/Util";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
}

export const AssetTypeMaster = (props: IAssociateChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const tooltipId = useId('tooltip');
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const _Data = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,HowManyHours,Manufacturer"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetTypeMaster,
                filter: `IsDeleted ne 1`
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                HowManyHours: data.HowManyHours,
                                Manufacturer: data.Manufacturer
                            }
                        );
                    });
                    setData(ListData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get _data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                const errorMessage = getErrorMessageValue(error.message);
                setError(errorMessage);
                sethasError(true);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };


    const AssetTypeMasterColumn = (): IColumn[] => {
        const columns: any[] = [
            { key: 'Title', name: 'Asset Type', fieldName: 'Title', isResizable: true, minWidth: 200, maxWidth: 340, isSortingRequired: true },
            { key: 'Manufacturer', name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 120, maxWidth: 240, isSortingRequired: true },
            { key: 'HowManyHours', name: 'How Many Hours?', fieldName: 'HowManyHours', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
        ];
        return columns;
    };

    const onclickEdit = () => {
        try {
            setisDisplayEDbtn(false);
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: "Update Asset Type", key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddAssetTypeMaster, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddAssetTypeMaster, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddAssetTypeMaster, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const _onItemSelected = (item: any): void => {

        if (item.length > 0) {
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            setisDisplayEDbtn(false);
        }
    };

    const onclickconfirmdelete = () => {
        toggleHideDialog();
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        const data = {
            IsActive: false
        };
        try {
            if (!!UpdateItem) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.ID,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.ID, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
                items.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        // SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.AssetTypeMaster,
                        EntityId: res?.ID,
                        EntityName: `${res?.Title}`,
                        Details: `Delete Asset Type Master`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                });
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.AssetTypeMaster, newObjects)
                }
                _Data();
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };
    React.useEffect(() => {
        _Data();
    }, [isRefreshGrid]);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />

            <div className="boxCard">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Asset Type Master</h1>
                    </div>
                </div>

                <div className="formGroup mt-3">
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={AssetTypeMasterColumn() as any}
                        items={Data || []}
                        reRenderComponent={true}
                        onSelectedItem={_onItemSelected}
                        searchable={true}
                        CustomselectionMode={SelectionMode.multiple}
                        addEDButton={<>
                            {isDisplayEDbtn && <>
                                <div className='dflex mb-sm-3'>
                                    {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                        <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                            <FontAwesomeIcon icon="edit" />
                                        </TooltipHost>
                                    </Link>}
                                    <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                        <TooltipHost content={"Delete"} id={tooltipId}>
                                            <FontAwesomeIcon icon="trash-alt" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </>}
                        </>}
                        isAddNew={true}
                        addNewContent={
                            <>
                                <div className="dflex mb-sm-3">
                                    <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost
                                            content={"Refresh Grid"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"arrows-rotate"}
                                            />
                                        </TooltipHost>    </Link>
                                    <PrimaryButton text="Add" className="btn btn-primary "
                                        onClick={() => {
                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                            breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddAssetTypeMaster, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddAssetTypeMaster, isAddClient: true, breadCrumItems: breadCrumItems } });
                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddAssetTypeMaster, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                            setIsLoading(false);
                                        }}
                                    />
                                </div>
                            </>
                        } />
                </div>
            </div>
        </>;
    }
};