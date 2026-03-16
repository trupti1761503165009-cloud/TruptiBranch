/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IColumn, Link, PrimaryButton, TooltipHost } from "office-ui-fabric-react";
import { SelectionMode } from "@fluentui/react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { getErrorMessageValue, logGenerator, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
}

export const Client = (props: IAssociateChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [ClientData, setClientData] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [columnsClient, setcolumnsClient] = React.useState<any>([]);
    const _clientData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,FirstName,LastName,SiteNameId,SiteName/Title,EmailAddress,StateId,State/Title,Notes,ClientId,Client/Title,Client/Name,Client/EMail"];
            const expand = ["Client,State,SiteName"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: 'IsDeleted ne 1',
                listName: ListNames.Client,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                FirstName: !!data.FirstName ? data.FirstName : '',
                                LastName: !!data.LastName ? data.LastName : '',
                                Email: !!data.EmailAddress ? data.EmailAddress : '',
                                StateId: !!data.StateId ? data.StateId : '',
                                State: !!data.State ? data.State.Title : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                Notes: !!data.Notes ? data.Notes : '',
                                ClientId: !!data.ClientId ? data.ClientId : '',
                                Client: !!data.Client ? data.Client.Title : '',
                            }
                        );
                    });
                    setClientData(UsersListData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "_clientData", CustomErrormessage: "error in get client data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                const errorMessage = getErrorMessageValue(error.message);
                setError(errorMessage);
                sethasError(true);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_clientData", CustomErrormessage: "error in get client data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(ex.message);
            setError(errorMessage);
            sethasError(true);
        }
    };


    const onclickEdit = () => {
        try {
            setisDisplayEDbtn(false);
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddClient, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddClient, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            // void logGenerator(props.provider, errorObj);
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
        // setDeleteRecordId(UpdateItem.Id);
        toggleHideDialog();
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
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
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.Client,
                        EntityId: res?.ID,
                        EntityName: `${res?.FirstName} ${res?.LastName}`,
                        Details: `Delete Client`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                });

                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.Client, newObjects)
                }
                if (Array.isArray(UpdateItem)) {
                    for (let index = 0; index < UpdateItem.length; index++) {
                        // await props.provider.deleteItem(ListNames.Client, UpdateItem[index].ID);
                        await props.provider.RemoveUserFromGroup("Quayclean Clients", UpdateItem[index].ClientId).then((response) => {
                        }).catch((error) => {
                            console.log(error);
                        });
                        if (index === UpdateItem.length - 1) {
                            _clientData();
                        }
                    }
                } else {
                    // await props.provider.deleteItem(ListNames.Client, UpdateItem.ID);
                    await props.provider.RemoveUserFromGroup("Quayclean Clients", UpdateItem.ClientId).then((response) => {
                    }).catch((error) => {
                        console.log(error);
                    });
                    _clientData();
                }
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
        _clientData();
        const columns: any[] = [
            { key: 'FirstName', name: 'First Name', fieldName: 'FirstName', isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true },
            { key: 'LastName', name: 'Last Name', fieldName: 'LastName', isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true },
            { key: 'Email', name: 'Email', fieldName: 'Email', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true },
            { key: 'Venue', name: 'Venue', fieldName: 'SiteName', isResizable: true, minWidth: 100, maxWidth: 200, isSortingRequired: true },
            { key: 'State', name: 'State', fieldName: 'State', minWidth: 80, maxWidth: 150, isSortingRequired: true },
            {
                key: "Notes", name: 'Notes', fieldName: 'Notes', isResizable: true, minWidth: 200, maxWidth: 280, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Notes != "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.Notes} id={tooltipId}>
                                        {/* {item.Notes} */}
                                        {item.Notes.length > 40 ? `${item.Notes.substring(0, 40)}...` : item.Notes}

                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            { key: 'Client', name: 'Client', fieldName: 'Client', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true }
        ];
        setcolumnsClient(columns);
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
                        <h1 className="mainTitle">Clients</h1>
                    </div>
                </div>
                <div className="formGroup mt-3">
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={columnsClient}
                        items={ClientData || []}
                        reRenderComponent={true}
                        onSelectedItem={_onItemSelected}
                        searchable={true}
                        CustomselectionMode={SelectionMode.multiple}
                        addEDButton={<>
                            {isDisplayEDbtn && <>
                                <div className='dflex'>
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
                                <div className="dflex pb-1">
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
                                            breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddClient, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddClient, isAddClient: true, breadCrumItems: breadCrumItems } });
                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddClient, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
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