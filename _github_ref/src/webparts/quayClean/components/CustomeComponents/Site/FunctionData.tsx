import * as React from "react";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";

export interface IAssociateChemicalProps {
    Data: any;
    isChartOnly?: boolean;
}


export const FunctionData = (props: IAssociateChemicalProps) => {
    const [filterData, setfilterData] = React.useState<any[]>([]);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;

    const _sitemasterData = (filter: any, filterdData: any) => {
        try {
            const select = ["ID,QCStateId,Title,QCState/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                expand: ["QCState"],
                listName: ListNames.SitesMaster,
            };
            provider.getItemsByQuery(queryStringOptions).then(async (results: any[]) => {
                if (!!results) {
                    const SitesData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                StateId: !!data.QCStateId ? data.QCStateId : 0,
                                StateName: !!data.QCStateId ? data.QCState.Title : "",
                                Title: !!data.Title ? data.Title : "",
                            }
                        );
                    });
                    const matchedData = filterdData
                        .filter((dataItem: any) => !!dataItem.SiteNameId) // filter out empty/null SiteNameId
                        .map((dataItem: any) => {
                            const site = SitesData.find(siteItem => siteItem.ID === Number(dataItem.SiteNameId));
                            if (site) {
                                return {
                                    Id: Number(dataItem.ID),
                                    StateName: site.StateName
                                };
                            }
                            return null;
                        })
                        .filter((item: any) => item !== null); // remove unmatched/nulls

                    const chunkArray = (array: any[], size: number) => {
                        const result = [];
                        for (let i = 0; i < array.length; i += size) {
                            result.push(array.slice(i, i + size));
                        }
                        return result;
                    };

                    const batches = chunkArray(matchedData, 25);

                }
            }).catch((error: any) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    React.useEffect(() => {
        const filteredData = props.Data.filter(
            (item: any) => item.SiteNameId !== ""
        );
        setfilterData(filteredData);

        const siteNameIds: number[] = Array.from(
            new Set(
                filteredData
                    .map((item: any) => item.SiteNameId)
                    .filter((id: any) => id !== "" && id !== null && id !== undefined)
            )
        ) as number[];

        const filter = siteNameIds
            .map(id => `Id eq ${id}`)
            .join(' or ');

        _sitemasterData(filter, filteredData);
    }, [props.Data]);

    return (
        <>
            Test
        </>
    );
};


