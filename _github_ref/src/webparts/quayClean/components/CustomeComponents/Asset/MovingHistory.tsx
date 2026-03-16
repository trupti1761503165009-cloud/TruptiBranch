import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { IColumn, IDetailsHeaderProps, IRenderFunction, Panel, PanelType, SelectionMode, ShimmeredDetailsList, Sticky, StickyPositionType } from "@fluentui/react";
import { logGenerator, onDetailListHeaderRender } from "../../../../../Common/Util";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { PrimaryButton } from "office-ui-fabric-react";
import moment from "moment";
import { DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
export interface IMovingHistoryProps {
    provider: IDataProvider;
    siteNameId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    onClickClose(): any;
    SiteURL?: string;
    assetMasterId: number;
    movingHistory: any;
}
export interface IMovingHistoryState {
    isModelOpen: boolean;
    column: IColumn[];
    detailList: any;
    assetMovingItems: IAssetHistory[];
    isPanelOpen: boolean;
    url: string;
}

export const MovingHistory = (props: IMovingHistoryProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [state, setState] = React.useState<IMovingHistoryState>({
        isModelOpen: props.isModelOpen,
        column: [],
        detailList: null,
        assetMovingItems: [],
        isPanelOpen: false,
        url: ""
    });


    const assetHistoryColumn = (): IColumn[] => {
        let columns: IColumn[] = [
            { key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', minWidth: 140, maxWidth: 270 },
            { key: 'Modified', name: 'Date', fieldName: 'Modified', minWidth: 120, maxWidth: 160 },
            { key: 'CurrentOwner', name: 'Moved By', fieldName: 'CurrentOwner', minWidth: 100, maxWidth: 150 },
        ];

        return columns;
    };

    const Detaillist = (column: any, items: IAssetHistory[]) => {
        return <>
            {items.length > 0 ?
                <ShimmeredDetailsList
                    items={items}
                    columns={column}
                    onRenderDetailsHeader={(detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>) =>
                    (<Sticky stickyPosition={StickyPositionType.Header}>
                        {onDetailListHeaderRender(detailsHeaderProps, defaultRender)}
                    </Sticky>)}
                    selectionMode={SelectionMode.none}
                /> :
                <NoRecordFound />
            }
        </>;

    };

    React.useEffect(() => {
        try {
            void (async () => {
                let column = assetHistoryColumn();
                let formattedData: any[] = [];
                if (!!props.movingHistory) {
                    formattedData = props.movingHistory.map((item: {
                        Editor: any;
                        SiteName: any;
                        Modified: moment.MomentInput;
                        CurrentOwner: any
                    }) => {
                        if (item.Modified) {
                            item.Modified = moment(item.Modified).format(DateTimeFormate);
                        }
                        if (item.SiteName) {
                            item.SiteName = item.SiteName.LookupValue;
                        }
                        if (item.Editor) {
                            // item.CurrentOwner = item.CurrentOwner.LookupValue;
                            item.CurrentOwner = item.Editor.LookupValue;
                        }
                        return item;
                    });

                }

                let detailList = Detaillist(column, formattedData);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList, assetMovingItems: formattedData }));
            })();


        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in useEffect  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Error In Asset Moving History "
            };
            console.log(errorObj);
            void logGenerator(props.provider, errorObj);
        }

    }, []);

    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };
    const onPanelclose = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };
    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onPanelclose} text="Close" />
        </div>;
    };

    return <>
        <Panel
            isOpen={state.isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
            onRenderFooterContent={onRenderFooterContent}
        >
            <iframe
                src={state.url}
                style={{ width: "100%", height: "75vh" }}
            />

        </Panel>
        <CustomModal dialogWidth="700px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Moving History"} message={state.detailList} closeButtonText={"Close"} isBlocking={true}
            isModeless={false} />
    </>;

};