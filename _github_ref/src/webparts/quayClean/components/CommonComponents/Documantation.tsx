/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { IBreadCrum } from "../../../../Interfaces/IBreadCrum";
import { ILoginUserRoleDetails } from "../../../../Interfaces/ILoginUserRoleDetails";
import { IQuayCleanState } from "../QuayClean";
import { Accordion } from "@pnp/spfx-controls-react";
import IPnPQueryOptions from "../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../../../../Common/Enum/ComponentNameEnum";
import { logGenerator, getErrorMessageValue } from "../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretRight } from "@fortawesome/free-solid-svg-icons";
import HtmlContent from "./htmlContent";
import { TextField } from "@fluentui/react";

export interface IQuaycleanProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
}

export const Documentation = (props: IQuaycleanProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any>([]);
    const [expandedItems, setExpandedItems] = React.useState<{ [key: number]: boolean }>({});
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredData = Data.filter((item: any) =>
        item.Title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleExpand = (id: number) => {
        setExpandedItems((prev: any) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };
    const _QuaycleanUserGuideData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Link,Description"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.QuaycleanUserGuide,
                filter: `DocType eq 'Main'`,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : '',
                                Link: !!data.Link ? data.Link : '',
                                Description: !!data.Description ? data.Description : ''
                            }
                        );
                    });
                    setData(ListData);

                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "_userGuideData", CustomErrormessage: "error in get user guide data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                const errorMessage = getErrorMessageValue(error.message);

            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_userGuideData", CustomErrormessage: "error in get user guide data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(ex.message);

        }
    };

    React.useEffect(() => {
        _QuaycleanUserGuideData();
    }, []);

    return <>
        <div className='ms-Grid-row p-14'>
            <div className='ms-md12 ms-sm12 ms-Grid-col'>
                <div className='dashboard-card p00'>
                    <div className='height211 lightgrey2'>
                        <div className="doc-body">
                            <div className="doc-container">
                                <div className="dflex doc-bor-bot">
                                    <div>
                                        <h1 className="doc-title">📄 Documentation</h1>
                                    </div>
                                    <div className="mla">
                                        <TextField className="formControl mt-3"
                                            onChange={(e: any) => setSearchTerm(e.target.value)}
                                            placeholder="Search..."
                                            value={searchTerm} />
                                    </div>
                                </div>
                                {filteredData.map((item: any) => {
                                    const absoluteLink = props.context.pageContext.web.absoluteUrl + item.Link;
                                    const updatedDescription = item?.Description?.replace(/href="#"/g, `href="${absoluteLink}"`);
                                    return (
                                        <details className="doc-details" key={item.ID}>
                                            <summary className="doc-summary">{item.Title}</summary>
                                            <div className="doc-section-content">
                                                <HtmlContent id={`btn-${item.ID}`} className="mb5 rich-text-display" html={updatedDescription} />
                                            </div>
                                        </details>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>;

};