import { Checkbox, ICheckboxStyles, IColumn, Link, TooltipHost } from "@fluentui/react";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useId } from "@fluentui/react-hooks";
import { ClientResponseFields, ClientResponseViewFields, IListSiteArea } from "../ClientResponseFields";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { generateExcelTable, logGenerator, UserActivityLog } from "../../../../../../Common/Util";
import { generateCommonExcelFileName, getCRSiteAreaQRCodeURL } from "../../../CommonComponents/CommonMethods";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { toastService } from "../../../../../../Common/ToastService";
import { LazyLoadImage } from "react-lazy-load-image-component";
const notFoundImage = require('../../../../assets/images/NotFoundImg.png');

const headerCheckboxStyles: ICheckboxStyles = {
    checkbox: {
        borderColor: '#00d5c9 !important',
    },
    checkmark: {
        color: '#000000 !important',
    },
    root: {
        selectors: {
            '.ms-Checkbox-checkbox': {
                borderColor: '#00d5c9 !important',
            },
            '.ms-Checkbox-checkmark': {
                color: '#000000 !important',
            },
        },
    },
    label: {
        color: '#ff0000',
        fontWeight: 'bold',
        fontSize: 14,
    },
};
interface ISiteAreaProps {
    isRefresh: boolean;
    selectedSiteAreaItem: any;
    CRQRCodeImage: any;
    // isManageStaff: boolean;
    isOpenManageModal: boolean;
    isOpenDeleteModal: boolean;
    isQrModelOpen: boolean;
    isMultipleQrModelOpen: boolean;
}

export const ManageSiteAreaData = (props: IListSiteArea) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : (window.innerWidth <= 768 ? 'card' : 'grid'));
    const [isLoading, setIsLoading] = useState(true);
    const tooltipId = useId('tooltip');
    const [columns, setColumns] = useState<any>([]);
    const [selectedRows, setSelectedRows] = React.useState<any[]>([]);
    const SiteAreaListDataRef = React.useRef<any>([]);
    // const qrLinkURL = useRef("");
    const [state, setState] = React.useState<ISiteAreaProps>({
        isRefresh: false,
        selectedSiteAreaItem: null,
        // isManageStaff: false,
        isOpenManageModal: false,
        CRQRCodeImage: "",
        isOpenDeleteModal: false,
        isQrModelOpen: false,
        isMultipleQrModelOpen: false
    });

    const onClickDelete = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedSiteAreaItem: itemID,
            isOpenDeleteModal: true
        }));
    };

    const onClickEdit = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedSiteAreaItem: itemID,
            isOpenManageModal: true,
            // isManageStaff: false,
        }));
    };

    const handleOpenQRModal = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedSiteAreaItem: itemID,
            isQrModelOpen: true
        }));
    };

    const onCheckboxChange = (item: any, checked: boolean) => {
        SiteAreaListDataRef.current = SiteAreaListDataRef.current.map((row: any) =>
            row.ID === item.ID ? { ...row, IsSelected: checked } : row
        );
        setSelectedRows(() => SiteAreaListDataRef.current.filter((r: any) => r.IsSelected));
    };

    const toggleAllRows = (_e: any, checked?: boolean) => {
        SiteAreaListDataRef.current = SiteAreaListDataRef.current.map((r: any) => ({
            ...r,
            IsSelected: !!checked
        }));
        setSelectedRows(checked ? [...SiteAreaListDataRef.current] : []);
    };

    const CRListColumn = (): IColumn[] => {
        let columns: any[] = [

            {
                key: "Action", name: 'Action', fieldName: 'Action', isResizable: true, minWidth: 90, maxWidth: 110,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>
                            <Link className="actionBtn btnEdit iconSize dticon" onClick={() => onClickEdit(itemID)}>
                                <TooltipHost content={"Edit Record"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="edit" />
                                </TooltipHost>
                            </Link>
                            <Link className="actionBtn iconSize btnDanger dticon" onClick={() => { onClickDelete(itemID) }}>
                                <TooltipHost content={"Delete Record"} id={tooltipId}>
                                    <FontAwesomeIcon icon="trash-alt" />
                                </TooltipHost>
                            </Link>

                        </div>
                    </>;
                })
            },

            { key: 'SiteArea', name: ClientResponseViewFields.SiteArea, fieldName: 'SiteArea', isResizable: true, minWidth: 210, maxWidth: 260, isSortingRequired: true },
            {
                key: "StaffMembers", name: 'Staff Members', fieldName: 'StaffMembersName', isResizable: true, minWidth: 260, maxWidth: 420, isSortingRequired: true,
                onRender: (itemID: any) => {
                    const maxDisplayCount = 3;
                    const displayedItems = itemID?.StaffMembersName?.slice(0, maxDisplayCount) || [];
                    const remainingItems = itemID?.StaffMembersName?.slice(maxDisplayCount) || [];
                    const totalItems = itemID?.StaffMembersName || [];
                    const tooltipContent = (
                        <div className="tooltip-persona-list">
                            {totalItems.map((item: any) => (
                                <div className="attendees-badge-cls">
                                    {item}
                                </div>
                            ))}
                        </div>
                    );
                    return (
                        <>
                            <div className="cls-pointer">
                                {displayedItems.map((item: any) => (
                                    <div className="attendees-badge-cls-2">
                                        {item}
                                    </div>
                                ))}
                                {remainingItems.length > 0 && (
                                    <Link className="tooltipcls">
                                        <TooltipHost content={tooltipContent} className="cls-pointer" id={`tooltipId`}>
                                            <div className="remaining-count-cls">
                                                +{remainingItems.length} more
                                            </div>
                                        </TooltipHost>
                                    </Link >
                                )}
                            </div>
                        </>
                    );
                },
            },
            {
                key: 'DefaultSireArea', name: ClientResponseViewFields.IsDefaultSiteArea, fieldName: 'IsDefaultSiteArea', isResizable: true, minWidth: 120, maxWidth: 140, isSortingRequired: true,
                onRender: (item: any) => {
                    return (
                        <>
                            {item?.IsDefaultSiteArea ? <div className='badge-available'>Yes</div> :
                                <div className='badge-no'>No</div>
                            }
                        </>
                    );
                }
            },
            {
                key: 'Photo',
                name: 'QR Code',
                fieldName: 'QRCodeUrl',
                minWidth: 100,
                maxWidth: 110,
                isResizable: false,
                className: 'courseimg-column',
                headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    const tooltipId = `tooltip-${item.ID || item.Id || Math.random()}`;
                    return (
                        <div
                            style={{ display: 'inline-block', cursor: 'pointer' }}
                            aria-describedby={tooltipId}
                            onClick={() => handleOpenQRModal(item)}>
                            <LazyLoadImage
                                src={item.QRCodeUrl}
                                width={75}
                                height={75}
                                placeholderSrc={notFoundImage}
                                alt="photo"
                                className="course-img-first"
                                effect="blur"
                            />
                        </div>
                    );
                }
            },
            {
                key: 'select',
                name: 'Print',
                fieldName: 'select',
                minWidth: 40,
                maxWidth: 50,

                onRender: (item: any) => (
                    <Checkbox
                        checked={!!item.IsSelected}
                        onChange={(_e, checked) => onCheckboxChange(item, !!checked)}
                    />
                ),
                onRenderHeader: () => {
                    const rows = SiteAreaListDataRef.current || [];
                    const allSelected = rows.length > 0 && rows.every((r: any) => r.IsSelected);
                    const someSelected = rows.some((r: any) => r.IsSelected) && !allSelected;

                    return (
                        <Checkbox
                            styles={headerCheckboxStyles}
                            checked={allSelected}
                            indeterminate={someSelected}
                            onChange={toggleAllRows}
                            className="header-checkbox"
                            aria-label="Select all"
                        />
                    );
                },
            },
        ];
        return columns;
    };

    const getSiteAreaData = async () => {

        const select = [
            ClientResponseFields.Id,
            ClientResponseFields.SiteArea,
            ClientResponseFields.SiteName,
            ClientResponseFields.StaffMembers,
            ClientResponseFields.SiteNameTitle,
            ClientResponseFields.StaffMembersName,
            ClientResponseFields.StaffMembersEmail,
            ClientResponseFields.StaffMembersId,
            ClientResponseFields.IsDefaultSiteArea
        ];

        const queryStringOptions: IPnPQueryOptions = {
            select,
            expand: [ClientResponseFields.SiteName, ClientResponseFields.StaffMembers],
            listName: ListNames.SiteAreas,
            filter: `SiteNameId eq ${props.siteMasterId} and IsDeleted eq 0`,
            orderBy: "Modified",
            isSortOrderAsc: false
        };

        try {
            const results: any[] = await provider.getItemsByQuery(queryStringOptions);
            // const siteAreaData = (results ?? []).map((item) => ({
            //     ID: item.ID,
            //     Id: item.ID,
            //     SiteArea: item.SiteArea,
            //     SiteName: item.SiteName?.Title,
            //     StaffMembers: item.StaffMembers,
            //     StaffMembersId: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.Id) : [],
            //     StaffMembersName: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.Title) : [],
            //     StaffMembersEmail: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.EMail) : []
            // }));
            const siteId = props.siteMasterId ? props.siteMasterId : props.componentProps?.dataObj?.Id;
            const siteAreaData = await Promise.all(
                (results ?? []).map(async (item) => {

                    const qrUrl = await getCRSiteAreaQRCodeURL(context, siteId, item.ID);

                    return {
                        ID: item.ID,
                        SiteArea: item.SiteArea,
                        SiteName: item.SiteName?.Title,
                        StaffMembers: item.StaffMembers,
                        StaffMembersId: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.Id) : [],
                        StaffMembersName: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.Title) : [],
                        // StaffMembersEmail: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.EMail) : [],
                        StaffMembersNameDisplay: Array.isArray(item.StaffMembers) ? item.StaffMembers.map((m: any) => m.Title).join(";") : [],
                        QRCodeUrl: qrUrl,
                        IsDefaultSiteArea: item.IsDefaultSiteArea
                    };
                })
            );

            SiteAreaListDataRef.current = siteAreaData;
            setState(prev => ({
                ...prev,
                isRefresh: false
            }));
        } catch (error) {
            console.error("Error fetching site area data:", error);
            SiteAreaListDataRef.current = [];
            setState(prev => ({
                ...prev,
                isRefresh: false
            }));
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        const loadData = async () => {
            let columns = CRListColumn();
            // let qrCodeURL = "";
            // try {
            //     const [qrCode, copylink, _] = await Promise.all([
            //         getCRSiteQRCodeURL(context, props.componentProps?.dataObj?.Id),
            //         getCRSiteLinkURL(context, props.componentProps?.dataObj?.Id),
            //         getSiteAreaData()
            //     ]);
            //     qrCodeURL = qrCode;
            //     qrLinkURL.current = copylink;
            // } catch (err) {
            //     console.error("Error generating CR QR code & URL:", err);
            // }
            // setState((prev) => ({
            //     ...prev,
            //     CRQRCodeImage: qrCodeURL,
            // }));
            await getSiteAreaData();
            setColumns(columns);
        };
        loadData()
    }, []);

    React.useEffect(() => {
        if (state.isRefresh) {
            setIsLoading(true);
            getSiteAreaData();
        }
    }, [state.isRefresh]);

    const onclickRefreshGrid = () => {
        setState((prev) => ({
            ...prev,
            isRefresh: true
        }));
    };

    const onCloseModal = (isRefresh: boolean) => {
        setState(prevState => ({
            ...prevState,
            // isManageStaff: false,
            selectedSiteAreaItem: null,
            isOpenManageModal: false,
            isRefresh: !!isRefresh
        }));
    };

    const onManageSiteAreaClick = () => {
        setState(prevState => ({
            ...prevState,
            // isManageStaff: false,
            selectedSiteAreaItem: null,
            isOpenManageModal: true
        }));
    };

    // const onManageStaffClick = () => {
    //     setState(prevState => ({
    //         ...prevState,
    //         isManageStaff: true,
    //         selectedSiteAreaItem: null,
    //         isOpenManageModal: true
    //     }));
    // };

    const onClickConfirmDelete = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Deleting...');
        const objUpdate = {
            IsDeleted: true
        }
        try {
            await provider.updateItemWithPnP(objUpdate, ListNames.SiteAreas, state.selectedSiteAreaItem?.ID);
            const logObj = {
                UserName: currentUserRoleDetail?.title,
                SiteNameId: props.componentProps?.dataObj?.ID,
                ActionType: UserActivityActionTypeEnum.Delete,
                EntityType: UserActionEntityTypeEnum.ClientResponse,
                EntityId: state.selectedSiteAreaItem?.ID,
                EntityName: state.selectedSiteAreaItem?.SiteArea,
                Details: `Deleted site area`,
                LogFor: UserActionLogFor.Both,
                StateId: props.componentProps?.dataObj?.QCStateId,
                Email: currentUserRoleDetail?.emailId,
                Count: 1
            };
            void UserActivityLog(provider, logObj, currentUserRoleDetail);
            setState(prev => ({
                ...prev,
                isRefresh: true,
                selectedSiteAreaItem: null,
                isOpenDeleteModal: false
            }));
            setIsLoading(false);
            toastService.updateLoadingWithSuccess(toastId, Messages.DeleteRecordSuccess);
        } catch (error) {
            console.log('Error in deleting data', error);
        }
    }

    const closeDeleteModal = () => {
        setState(prev => ({
            ...prev,
            selectedSiteAreaItem: null,
            isOpenDeleteModal: false
        }));
    };

    const oncloseQRModal = () => {
        setState(prev => ({
            ...prev,
            selectedSiteAreaItem: null,
            isQrModelOpen: false
        }));
    };

    const onclickPrint = () => {
        setState(prev => ({
            ...prev,
            isMultipleQrModelOpen: true
        }));
    };

    const onMultipleQRClose = () => {
        setState(prevState => ({
            ...prevState,
            isMultipleQrModelOpen: false
        }));
        SiteAreaListDataRef.current = SiteAreaListDataRef.current.map((row: any) => ({
            ...row,
            IsSelected: false,
        }));
        setSelectedRows([]);
    }

    const onclickExportToExcel = async () => {
        try {
            const siteName = props?.componentProps?.dataObj?.Title;
            const fileName = generateCommonExcelFileName(siteName ? `${siteName}-ClientResponse` : 'ClientResponse')
            let exportColumns: any[] = [
                { header: ClientResponseViewFields.SiteName, key: "SiteName" },
                { header: ClientResponseViewFields.SiteArea, key: "SiteArea" },
                { header: ClientResponseViewFields.StaffMembers, key: "StaffMembersNameDisplay" }
            ];

            generateExcelTable(SiteAreaListDataRef.current, exportColumns, fileName);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(provider, errorObj);
        }
    };

    const _onItemSelected = (item: any): void => {
    };

    return {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        SiteAreaListDataRef,
        currentView,
        state,
        tooltipId,
        columns,
        selectedRows,
        onclickPrint,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        onCloseModal,
        onManageSiteAreaClick,
        onClickConfirmDelete,
        closeDeleteModal,
        oncloseQRModal,
        onMultipleQRClose
    }

}