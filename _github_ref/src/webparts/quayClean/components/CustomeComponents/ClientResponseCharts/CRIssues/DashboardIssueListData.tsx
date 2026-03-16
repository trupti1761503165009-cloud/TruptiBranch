import { useAtomValue } from "jotai";
import { useState } from "react";
import { useId } from "@fluentui/react-hooks";
import { Link } from "office-ui-fabric-react";
import React from "react";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { ClientResponseFields, ClientResponseViewFields, IClientResponseDashboardData } from "../../QRClientResponse/ClientResponseFields";
import { generateExcelTable, logGenerator } from "../../../../../../Common/Util";
import { generateCommonExcelFileName } from "../../../CommonComponents/CommonMethods";
import ClientResponseActionMenu from "../../QRClientResponse/IssuesList/ClientResponseActionMenu";

export const DashboardIssueListData = (props: any) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const currentView = props.view;
    const setCurrentView = props.onViewChange;
    const [isLoading, setIsLoading] = useState(false);
    const tooltipId = useId('tooltip');
    const [columns, setColumns] = useState<any>([]);

    const [state, setState] = React.useState<IClientResponseDashboardData>({
        ClientResponseData: [],
        selectedIssueItem: null,
        isOpenArchiveModal: false,
        filteredClientResponseData: [],
        isAttachmentModalOpen: false,
        isResolveModalOpen: false,
        isReassignOpen: false,
    });

    const onClickAttachment = (item: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: item,
            isAttachmentModalOpen: true
        }));
    };
    const onClickResolveIssue = (item: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: item,
            isResolveModalOpen: true
        }));
    };

    const onClickReassignIssue = (item: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: item,
            isReassignOpen: true
        }));
    };

    const onClickView = (itemID: any) => {
        props.onViewDetails(itemID.ID);
    };

    React.useEffect(() => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: 'Action', isResizable: true, minWidth: 60, maxWidth: 80,
                onRender: ((item: any) => {
                    return <>
                        <ClientResponseActionMenu
                            data={item}
                            onView={onClickView}
                            onAttachment={onClickAttachment}
                            onResolve={onClickResolveIssue}
                            onReassign={onClickReassignIssue}
                        />
                    </>;
                })
            },
            {
                key: 'SiteName', name: ClientResponseViewFields.SiteName, fieldName: 'SiteName', isResizable: true, minWidth: 220, maxWidth: 280, isSortingRequired: true,
                onRender: (item: any) => (
                    <Link className="tooltipcls" onClick={() => onClickView(item)}>
                        {item.SiteName}
                    </Link>
                )
            },
            { key: 'ID', name: ClientResponseViewFields.ResponseFormId, fieldName: ClientResponseFields.ResponseFormId, isResizable: true, minWidth: 120, maxWidth: 140, isSortingRequired: true },
            { key: 'Category', name: ClientResponseViewFields.Category, fieldName: ClientResponseFields.Category, isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true },
            { key: 'SubCategory', name: ClientResponseViewFields.SubCategory, fieldName: ClientResponseFields.SubCategory, isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true },
            { key: 'Status', name: ClientResponseViewFields.ClientResponseStatus, fieldName: ClientResponseFields.ClientResponseStatus, isResizable: true, minWidth: 160, maxWidth: 180, isSortingRequired: true },
            { key: 'ReportedBy', name: ClientResponseViewFields.ReportedBy, fieldName: ClientResponseFields.ReportedBy, isResizable: true, minWidth: 160, maxWidth: 180, isSortingRequired: true },
            {
                key: 'SubmittedDate', name: ClientResponseViewFields.SubmissionDate, fieldName: 'SubmissionDateDisplay', isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <div className="badge rounded-pill text-bg-info date-badge">{item?.SubmissionDateDisplay}</div>
                    );
                },
            },
            { key: 'ResolvedBy', name: ClientResponseViewFields.ResolvedBy, fieldName: ClientResponseFields.ResolvedBy, isResizable: true, minWidth: 160, maxWidth: 180, isSortingRequired: true },
            {
                key: 'ResolvedDate', name: ClientResponseViewFields.ResolvedDate, fieldName: 'ResolvedDate', isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        item?.ResolvedDate ? <div className="badge rounded-pill text-bg-info date-badge">{item?.ResolvedDate}</div> : ""
                    );
                },
            },

        ];

        setColumns(columns);
        setState(prevState => ({
            ...prevState,
            filteredClientResponseData: props.responseData
        }));

    }, [props.responseData]);

    const onclickExportToExcel = async () => {
        try {
            const siteName = props?.componentProps?.siteName;
            const fileName = generateCommonExcelFileName(siteName ? `${siteName}-ClientResponse` : 'ClientResponse')
            let exportColumns: any[] = [
                { header: ClientResponseViewFields.SiteName, key: "SiteName" },
                { header: ClientResponseViewFields.ResponseFormId, key: "ResponseFormId" },
                { header: ClientResponseViewFields.Category, key: ClientResponseFields.Category },
                { header: ClientResponseViewFields.SubCategory, key: ClientResponseFields.SubCategory },
                { header: ClientResponseViewFields.ReportedBy, key: "ReportedBy" },
                { header: ClientResponseViewFields.SubmissionDate, key: "SubmissionDateDisplay" },
                { header: ClientResponseViewFields.ResolvedDate, key: "ResolvedDate" },
                { header: ClientResponseViewFields.ResolvedBy, key: "ResolvedBy" },
                { header: ClientResponseViewFields.ClientResponseStatus, key: "Status" }

            ];

            generateExcelTable(state.filteredClientResponseData, exportColumns, fileName);
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

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    return {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        currentView,
        state,
        tooltipId,
        columns,
        onclickExportToExcel,
        _onItemSelected,
        handleViewChange,
        onClickView,
        setState,
        onClickAttachment,
        onClickReassignIssue,
        onClickResolveIssue
    }

}