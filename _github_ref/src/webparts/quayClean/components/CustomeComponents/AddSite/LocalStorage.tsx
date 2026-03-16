// /* eslint-disable @typescript-eslint/no-use-before-define */
// import * as React from "react";
// import { WebPartContext } from "@microsoft/sp-webpart-base";
// import { Button, IColumn, Link, SelectionMode, TooltipHost } from "@fluentui/react";
// import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
// import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
// import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";

// export interface IQuaycleanProps {
//     context: WebPartContext;
//     provider: IDataProvider;
// }
// let _eventDataCache: any[] | null = null;
// export const LocalStorage = (props: IQuaycleanProps) => {
//     const [FilteredData, setFilteredData] = React.useState<any>([]);

//     // Outside the component or in a service file (module-level cache)


//     const getEventitems = () => {
//         try {
//             console.time("FetchEvents");
//             if (_eventDataCache && _eventDataCache.length > 0) {
//                 const time = new Date().toLocaleString(); // Get the current date/time
//                 console.timeEnd("FetchEvents");
//                 // console.log(_eventDataCache); // Optionally log the cached data
//                 setFilteredData(_eventDataCache);
//                 return;
//             }

//             const queryOptions: IPnPQueryOptions = {
//                 listName: ListNames.AuditInspectionData,
//                 select: ['Id', 'TemplateName'],
//                 isSortOrderAsc: false
//             };

//             props.provider.getItemsByQuery(queryOptions).then((results: any[]) => {
//                 if (results?.length > 0) {
//                     const EventsData = results.map((data) => ({
//                         ID: data.ID,
//                         TemplateName: data.TemplateName ?? "",
//                     }));

//                     _eventDataCache = EventsData; // Cache it
//                     setFilteredData(EventsData);
//                     console.timeEnd("FetchEvents");
//                 }
//             }).catch((error: any) => {
//                 console.error("Fetch error:", error);
//             });
//         } catch (ex) {
//             console.error("Exception:", ex);
//         }
//     };

//     const refreshEventItems = () => {
//         _eventDataCache = null; // This clears the cache
//         getEventitems();
//     };

//     return <>
//         <div>Test</div>
//         <Button onClick={getEventitems}>Load from Cache</Button>   // uses cache
//         <Button onClick={refreshEventItems}>Force Refresh</Button> // busts cache
//     </>;

// };