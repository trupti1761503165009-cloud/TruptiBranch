/* eslint-disable no-return-assign */
/* eslint-disable max-lines */
/* eslint-disable @rushstack/no-new-null */
/* eslint-disable no-unmodified-loop-condition */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-case-declarations */
import moment from "moment";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import {
  ComponentNameEnum,
  HoursTypeEnum,
  ListNames,
  defaultValues,
  devSiteURL,
  mainSiteURL,
  qaSiteURL,
  qrcodeSiteURL,
  stageSiteURLNew,
} from "./Enum/ComponentNameEnum";
import {
  AMStatus,
  DataType,
  DateFormat,
  DateTimeFormate,
  ImageTypeCheck,
  dateRangeForServiceDueDate,
  siteGroupsAdmin,
} from "./Constants/CommonConstants";
import IPnPQueryOptions from "../DataProvider/Interface/IPnPQueryOptions";
import * as CryptoJS from "crypto-js";
import { IBreadCrum } from "../Interfaces/IBreadCrum";
import { ILoginUserRoleDetails } from "../Interfaces/ILoginUserRoleDetails";
import { IFileWithBlob } from "../DataProvider/Interface/IFileWithBlob";
import { IReactSelectOptionProps } from "../Interfaces/IReactSelectOptionProps";
import {
  FieldType,
  ICamlQueryFilter,
  LogicalType,
} from "./Constants/DocumentConstants";
import { IExportColumns } from "../webparts/quayClean/components/CustomeComponents/EquipmentChecklist/Question";
import { saveAs } from "file-saver";
import * as ExcelJS from "exceljs";
import CamlBuilder from "camljs";
import { SPComponentLoader } from "@microsoft/sp-loader";
import { ICurrentUser } from "../Interfaces/ICurrentUser";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { appGlobalStateAtom } from "../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { IReactDropOptionProps } from "../webparts/quayClean/components/CommonComponents/reactSelect/IReactDropOptionProps";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { ISelectedZoneDetails } from "../Interfaces/ISelectedZoneDetails";
const NotoSans: string = require("../webparts/quayClean/assets/css/fonts/NotoSans.ttf");
const NotoSansBold: string = require("../webparts/quayClean/assets/css/fonts/NotoSans-Bold.ttf");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notoSansFont: string = require("../webparts/quayClean/assets/css/fonts/NotoSans.ttf");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const notoSansBoldFont: string = require("../webparts/quayClean/assets/css/fonts/NotoSans-Bold.ttf");
// const appGlobalState = useAtomValue(appGlobalStateAtom);
// const { provider, currentUserRoleDetail, context } = appGlobalState;
export interface ISitePermissionParams {
  selectedSiteIds: any;
  currentUserRoleDetail: any;
}
export const getUniueRecordsByColumnName = (
  items: any[],
  columnName: string
) => {
  const lookup: any = {};
  const result: any[] = [];
  if (!!items) {
    for (let index = 0; index < items?.length; index++) {
      const item = items[index];
      const name = item[columnName];
      if (!(name in lookup)) {
        lookup[name] = 1;
        result.push(item);
      }
    }
    return result;
  } else {
    return [];
  }
};

export function SortArray(array: any[]): any[] {
  const sortedArray = array.sort((p1, p2) =>
    p1.label > p2.label ? 1 : p1.label < p2.label ? -1 : 0
  );
  return sortedArray;
}

export function SortArrayWithColumn(array: any[], columnName: string): any[] {
  const sortedArray = array.sort((p1, p2) =>
    p1[`${columnName}`] > p2[`${columnName}`]
      ? 1
      : p1[`${columnName}`] < p2[`${columnName}`]
        ? -1
        : 0
  );
  return sortedArray;
}

export const _getPagedonclick = (
  currentPage: number,
  pageSize: number,
  items: any[]
) => {
  let fromNo;
  let toNo;
  let pagedItems;
  let oddItems = items.length % pageSize;
  let totalPage;
  if (oddItems > 0) {
    totalPage = items.length / pageSize;
    totalPage = totalPage.toString().split(".", 2);
    totalPage = totalPage[1];
    if (totalPage >= "5") {
      let page = items.length / pageSize;
      totalPage = Math.round(page);
    } else {
      let page = items.length / pageSize;
      totalPage = Math.round(Number(page)) + 1;
    }
  } else {
    totalPage = items.length / pageSize;
  }
  if (currentPage == 1) {
    pagedItems = items.slice(0, pageSize);
  } else {
    const roundupPage = Math.ceil(currentPage - 1);
    pagedItems = items.slice(
      roundupPage * pageSize,
      roundupPage * pageSize + pageSize
    );
  }
  if (currentPage == 1) {
    fromNo = 1;
    toNo = totalPage == 1 ? items.length : pageSize;
  } else {
    if (currentPage - 1 == 1) {
      fromNo = pageSize + (currentPage - 1);
    } else {
      fromNo = pageSize * (currentPage - 1) + 1;
    }
    let setToNo = pageSize * currentPage;
    if (setToNo > items.length) {
      toNo = items.length;
    } else {
      toNo = pageSize * currentPage;
    }
  }

  return { pagedItems, fromNo, toNo, totalPage };
};

export const logGenerator = (provider: IDataProvider, errorObj: any) => {
  try {
    return provider.createItem(errorObj, ListNames.ErrorlogGeneratorListName);
  } catch (e) {
    console.log("Error Not Found");
  }
};

export const UserActivityLog = (
  provider: IDataProvider,
  logObj: any,
  roledetails?: any
) => {
  try {
    // const matchedState = roledetails?.stateMasterItems?.find((item: any) => item.ID === logObj?.StateId);
    // let stateName = matchedState ? matchedState.Title : "Unknown";
    // delete logObj?.StateId;
    // logObj.StateName = stateName;
    // return provider.createItem(logObj, ListNames.UserActivityLog);

    const stateId = logObj?.StateId;
    if (stateId !== undefined) {
      const matchedState = roledetails?.stateMasterItems?.find(
        (item: any) => item.ID === stateId
      );
      logObj.StateName = matchedState ? matchedState?.Title : "";
      delete logObj.StateId;
    } else {
      logObj.StateName = "";
    }
    return provider.createItem(logObj, ListNames.UserActivityLog);
  } catch (e) {
    const errorObj = {
      ErrorMethodName: "User Activity Log",
      CustomErrormessage: logObj?.Details,
      ErrorMessage: e.toString(),
      ErrorStackTrace: `${logObj.EntityType} (${logObj.EntityName})`,
      PageName: "QuayClean.aspx",
    };
    void logGenerator(provider, errorObj);
  }
};

export const RemoveSpecialCharacter = (input: string) => {
  return input.replace(/[^a-zA-Z0-9]/g, "");
};

export const getConvertedDate = (date: any) => {
  try {
    if (!!date) return moment(date).format(DateFormat);
    else return "-";
  } catch (error) {
    console.log("[getConvertedDate] method: ", error);
  }
};
export const getConvertedDateTime = (date: any) => {
  try {
    if (!!date) return moment(date).format(DateFormat);
    else return "-";
  } catch (error) {
    console.log("[getConvertedDate] method: ", error);
  }
};

export const onFormatDate = (date?: Date): string => {
  return !date ? "" : moment(date).format(DateFormat);
};

export const onDetailListHeaderRender = (
  headerProps: any,
  defaultRender: any
) => {
  return defaultRender({
    ...headerProps,
    styles: {
      root: {
        selectors: {
          ".ms-DetailsHeader-cell": {
            whiteSpace: "normal",
            textOverflow: "clip",
            lineHeight: "normal",
            background: "#1300a6",
            color: "#fff",
            fontSize: "13px",
          },
          ".ms-DetailsHeader-cell:hover": {
            background: "#213577",
            color: "#fff",
            fontSize: "13px",
          }, // Hover class
          ".ms-DetailsHeader-cellTitle": {
            height: "100%",
            alignItems: "center",
          },
        },
      },
    },
  });
};
export const getNumberValue = (value: any): number => {
  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? 0 : parsedValue;
};

export const getStringValue = (value: any): string => value || "";

export const getLookupValueCAML = (value: any): string =>
  Array.isArray(value) && value.length > 0 ? value[0]?.lookupValue ?? "" : "";

export const getLookupIdCAML = (value: any): number =>
  Array.isArray(value) && value.length > 0 ? value[0]?.lookupId ?? -1 : -1;

export const getPeoplePickerValueCAML = (value: any, field: string): string =>
  Array.isArray(value) && value.length > 0 ? value[0][field] ?? "" : "";

export const getPeoplePickerIdCAML = (value: any): number =>
  Array.isArray(value) && value.length > 0
    ? value[0]?.id ?? null
    : (null as any);

export const getLookUpOrPeoplePickerValue = (
  value: any,
  field: string
): string => {
  return !!value ? value[field] ?? "" : "";
};

export function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
}

export const getStateMasterItems2 = async (
  provider: IDataProvider,
  isFilterApply?: boolean,
  currentUserId?: number
) => {
  let queryOptions: IPnPQueryOptions;
  if (!!isFilterApply) {
    queryOptions = {
      listName: ListNames.StateMaster,
      select: [
        "Id,Title,StateManagerId,StateManager/Title,StateManager/EMail,WHSChairpersonId,WHSChairperson/Title,WHSChairperson/EMail,WHSChairperson/Id",
      ],
      expand: ["StateManager,WHSChairperson"],
      filter: `StateManagerId eq '${currentUserId}'`,
    };
  } else {
    queryOptions = {
      listName: ListNames.StateMaster,
      select: [
        "Id,Title,StateManagerId,StateManager/Title,StateManager/EMail,WHSChairpersonId,WHSChairperson/Title,WHSChairperson/EMail,WHSChairperson/Id",
      ],
      expand: ["StateManager,WHSChairperson"],
    };
  }
  return await provider.getItemsByQuery(queryOptions);
};

export const getAssetTypeMaster = async (provider: IDataProvider) => {
  let queryOptions: IPnPQueryOptions;
  queryOptions = {
    listName: ListNames.AssetTypeMaster,
    select: ["Id,Title"],
  };
  return await provider.getItemsByQuery(queryOptions);
};

export const getSiteMasterItems = async (provider: IDataProvider,
  stateId?: number,
  isFilterApply?: boolean,
  currentUserId?: number,
) => {
  let filterQuery = "";
  if (!!stateId) {
    filterQuery = `QCStateId eq '${stateId}'`;
  }

  if (!!isFilterApply && !!currentUserId) {
    filterQuery = filterQuery ? `${filterQuery} and ADUserId eq '${currentUserId}'` : `ADUserId eq '${currentUserId}'`;
  }
  // if (isClientView && !!siteId && Number(siteId)) {
  //   filterQuery = `Id eq ${siteId}`
  // }

  const queryOptions: IPnPQueryOptions = {
    listName: ListNames.SitesMaster,
    select: ["Id,Title,ADUserId,SiteManagerId,ExistingSiteLink,SiteSupervisorId,SiteImage,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,HelpDesk,Periodic,ClientResponse,Category,SiteZoneId,SiteZone/Title"],
    expand: ["SiteManager,SiteSupervisor,QCState,ADUser,SiteZone"],
    ...(filterQuery ? { filter: filterQuery } : {}),
  };

  return await provider.getItemsByQuery(queryOptions);
};

// export const getSiteMasterItems = async (
//   provider: IDataProvider,
//   isFilterApply?: boolean,
//   currentUserId?: number
// ) => {
//   let queryOptions: IPnPQueryOptions;
//   if (!!isFilterApply) {
//     queryOptions = {
//       listName: ListNames.SitesMaster,
//       select: [
//         "Id,Title,ADUserId,SiteManagerId,ExistingSiteLink,SiteSupervisorId,SiteImage,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,HelpDesk,Periodic,ClientResponse,Category",
//       ],
//       expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
//       filter: `ADUserId eq '${currentUserId}'`,
//     };
//   } else {
//     queryOptions = {
//       listName: ListNames.SitesMaster,
//       select: [
//         "Id,Title,ADUserId,SiteImage,ExistingSiteLink,Category,SiteSupervisorId,SiteManagerId,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,HelpDesk,Periodic,ClientResponse",
//       ],
//       expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
//     };
//   }

//   return await provider.getItemsByQuery(queryOptions);
// };

export const getSiteMasterItemsForDashBoard = async (
  provider: IDataProvider,
  isFilterApply?: boolean,
  currentUser?: any,
  isClientView?: boolean,
  siteId?: number
) => {
  let data: any[] = [];
  let queryOptions: IPnPQueryOptions;

  if (!!isFilterApply) {
    if (currentUser.isStateManager === true && currentUser.isAdmin === false) {
      queryOptions = {
        listName: ListNames.SitesMaster,
        select: [
          "Id,Title,ADUserId,SiteManagerId,SiteSupervisorId,Category,SiteImage,SiteHeader,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse",
        ],
        expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
      };
      let filteredData;
      filteredData = await provider.getItemsByQuery(queryOptions);
      data = filteredData.filter((item) =>
        currentUser?.stateManagerStateItem?.includes(item.QCStateId)
      );
    } else {
      if (currentUser.isSiteManager == true) {
        queryOptions = {
          listName: ListNames.SitesMaster,
          select: [
            "Id,Title,ADUserId,SiteManagerId,SiteSupervisorId,Category,SiteImage,SiteHeader,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse",
          ],
          expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
          filter: currentUser.isAdmin
            ? ""
            : `SiteManagerId eq '${currentUser.Id}'`,
        };
        data = await provider.getItemsByQuery(queryOptions);
      } else {
        if (currentUser.isSiteSupervisor == true) {
          queryOptions = {
            listName: ListNames.SitesMaster,
            select: [
              "Id,Title,ADUserId,SiteManagerId,SiteSupervisorId,Category,SiteImage,SiteHeader,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse",
            ],
            expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
            filter: currentUser.isAdmin
              ? ""
              : `SiteSupervisorId eq '${currentUser.Id}'`,
          };
          data = await provider.getItemsByQuery(queryOptions);
        } else {
          queryOptions = {
            listName: ListNames.SitesMaster,
            select: [
              "Id,Title,ADUserId,SiteManagerId,SiteSupervisorId,Category,SiteImage,SiteHeader,QCStateId,SiteManager/Title,SiteManager/EMail,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImageThumbnailUrl,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse",
            ],
            expand: ["SiteManager,SiteSupervisor,QCState,ADUser"],
            filter: (isClientView && !!siteId) ? `Id eq ${siteId}` : (currentUser.isAdmin ? "" : `ADUserId eq '${currentUser.Id}'`),
          };
          data = await provider.getItemsByQuery(queryOptions);
        }
      }
    }
  }
  return data;
};

export const getclientResponseStatusClassName = (status?: string) => {
  const baseClass = "cr-status-badge ";

  switch ((status || "").trim().toLowerCase()) {
    case "submitted":
    case "completed":
      return baseClass + "badge-submitted";
    case "draft":
      return baseClass + "badge-draft";
    case "resolved":
      return baseClass + "badge-resolved";
    case "not an issue":
      return baseClass + "badge-not-an-issue";
    case "archived":
      return baseClass + "badge-archived";
    default:
      return baseClass + "badge-submitted";
  }
};

export const isWithinNextMonthRange = (givenFullDate: any): boolean => {
  let oneMonthDate =
    moment(new Date())
      .add(dateRangeForServiceDueDate, "day")
      .format(defaultValues.FilterDateFormate) + "T23:59:59Z";
  return givenFullDate <= oneMonthDate;
};

export const isWithinNextMonthRangeOnlyOneMonth = (givenFullDate: string): boolean => {
  const today = moment().startOf("day"); // current date (00:00)
  const oneMonthLater = moment().add(1, "month").endOf("day"); // next one month

  const givenDate = moment(givenFullDate, defaultValues.FilterDateFormate, true);

  if (!givenDate.isValid()) return false;

  return givenDate.isBetween(today, oneMonthLater, "day", "[]");
};

export const _isOverdue = (givenFullDate: string): boolean => {
  if (!givenFullDate) return false;
  return moment(givenFullDate).isBefore(moment());
};


export const getHeight = (topHeight: number): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight =
      document.getElementsByClassName("ms-DetailsList")[0].clientHeight;
    const fullHeight = Math.round(window.innerHeight) - topHeight;
    return detailListHeight < fullHeight ? detailListHeight + 20 : fullHeight;
  } else {
    return Math.round(window.innerHeight) - topHeight;
  }
};

export const setHeightdefault = (): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight =
      document.getElementsByClassName("ms-DetailsList")[0].clientHeight;

    return detailListHeight;
  } else {
    return Math.round(window.innerHeight);
  }
};

export const getHeightById = (topHeight: number, divId: string): number => {
  if (document.getElementsByClassName("ms-DetailsList").length > 0) {
    const detailListHeight = document
      .getElementById(divId)
      ?.getElementsByClassName("ms-DetailsList")[0].clientHeight;
    const fullHeight = Math.round(window.innerHeight) - topHeight;
    const detailHeight = !!detailListHeight ? detailListHeight : 0;
    return detailHeight < fullHeight ? detailHeight + 20 : fullHeight;
  } else {
    return Math.round(window.innerHeight) - topHeight;
  }
};

export const getSiteFilterDropDownItems = (provider: IDataProvider) => {
  const queryOptions: IPnPQueryOptions = {
    listName: ListNames.SitesMaster,
    select: ["Id,Title"],
  };
  let option: any[] = [{ label: "-- Site --", value: "" }];
  void provider.getItemsByQuery(queryOptions).then((items: any) => {
    if (items.length > 0) {
      items.map((i: any) => {
        option.push({
          label: i.Title,
          value: i.Id,
        });
      });
    } else {
      return [];
    }
  });
  return option;
};

export const getStateFilterDropDownItems = (provider: IDataProvider) => {
  const queryOptions: IPnPQueryOptions = {
    listName: ListNames.StateMaster,
    select: ["Id,Title"],
  };
  let option: any[] = [{ label: "-- State --", value: "" }];
  void provider.getItemsByQuery(queryOptions).then((items: any) => {
    if (items.length > 0) {
      items.map((i: any) => {
        option.push({
          label: i.Title,
          value: i.Id,
        });
      });
    } else {
      return [];
    }
  });
  return option;
};
export const getAssetStatusFilterDropDownItems = () => {
  return [
    { label: "--Asset Status--", value: "" },
    { label: AMStatus.InUse, value: AMStatus.InUse },
    { label: AMStatus.Moving, value: AMStatus.Moving },
    { label: AMStatus.NotInUse, value: AMStatus.NotInUse },
    { label: AMStatus.OutofOrder, value: AMStatus.OutofOrder },
  ];
};

export const _onItemSelected = (item: any): any => {
  return item;
};

export const decrypt = (ID: string): string => {
  let bytes = CryptoJS.AES.decrypt(ID, "QuayClean-Key@123");
  let decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
};

export const encrypt = (ID: string): string => {
  let ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(ID.toString()),
    "QuayClean-Key@123"
  ).toString();
  return ciphertext;
};
export const ConvertDateToStringFormat = (date: Date, toFormat: string) => {
  try {
    if (!!date) return moment(date).format(toFormat);
    else return "-";
  } catch (error) {
    console.log("[ConvertDateToStringFormat] method: ", error);
  }
};
export const ConvertUTCToLocalDate = (utcDate?: string | Date): Date | undefined => {
  if (!utcDate) return undefined;

  const d = new Date(utcDate); // parse UTC string
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000); // optional, but not needed if you just want local
};
export const getListImageFieldURL = (
  data: any,
  imageFieldKey: string,
  notFoundImage: string
) => {
  let imageURL = notFoundImage;
  const fixImgURL =
    "/sites/Quaycleandev/Lists/ClientResponse/Attachments/" + data.ID + "/";
  if (data && data[imageFieldKey]) {
    try {
      const objData = JSON.parse(data[imageFieldKey]);
      if (objData && objData.serverRelativeUrl) {
        imageURL = objData.serverRelativeUrl;
      } else if (objData && objData.fileName) {
        imageURL = fixImgURL + objData.fileName;
      }
    } catch (error) {
      console.error("Error parsing ProductPhoto JSON:", error);
    }
  }
  return imageURL;
};

export const getCurrentLoginUser = (provider: IDataProvider) => {
  return provider.getCurrentUser();
};

interface YearOption {
  value: string;
  label: string;
}

export const generateYearOptions = (
  start: number,
  end: number
): YearOption[] => {
  const yearOptions: YearOption[] = [];

  for (let year = end; year >= start; year--) {
    yearOptions.push({ value: year.toString(), label: year.toString() });
  }

  return yearOptions;
};
export const removeElementOfBreadCrum = (data: any[]) => {
  const lastElement: number = data.length - 1;
  data.splice(lastElement, 1);
  return data;
};

export const onBreadcrumbItemClicked = (
  ev: React.MouseEvent<HTMLElement>,
  item: IBreadCrum
): void => {
  let breadCrumb = item.manageCompomentItem.breadCrumItems;
  if (!!breadCrumb) {
    if (item.key != breadCrumb[breadCrumb.length - 1].key) {
      breadCrumb = removeElementOfBreadCrum(breadCrumb);
      item.manageComponent({
        ...item.manageCompomentItem,
        breadCrumItems: breadCrumb,
      });
    }
  } else {
    let breadCrumItems: IBreadCrum[] = [
      {
        text: item.text,
        key: item.text,
        currentCompomnetName: item.currentCompomnetName,
        onClick: onBreadcrumbItemClicked,
        manageComponent: item.manageComponent,
        manageCompomentItem: {
          currentComponentName: item.currentCompomnetName,
        },
      },
    ];
    item.manageComponent({
      ...item.manageCompomentItem,
      breadCrumItems: breadCrumItems,
    });
  }
};
export const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};


// Common method to get State by SiteId
export const getStateBySiteId = async (
  provider: IDataProvider,
  siteId: number
): Promise<string> => {
  try {
    const select = ["ID", "QCStateId", "QCState/Title"];
    const expand = ["QCState"];

    const queryStringOptions: IPnPQueryOptions = {
      select: select,
      expand: expand,
      listName: ListNames.SitesMaster,
      filter: `ID eq ${siteId}`,
    };

    const results: any[] = await provider.getItemsByQuery(queryStringOptions);

    if (results && results.length > 0) {
      return results[0]?.QCStateId || null;
    }

    return "";
  } catch (error) {
    console.error("Error in getStateBySiteId:", error);
    return "";
  }
};
export const getStateBySiteNameId = async (
  provider: IDataProvider,
  siteId: number
): Promise<string> => {
  try {
    const select = ["ID", "QCStateId", "QCState/Title"];
    const expand = ["QCState"];

    const queryStringOptions: IPnPQueryOptions = {
      select: select,
      expand: expand,
      listName: ListNames.SitesMaster,
      filter: `ID eq ${siteId}`,
    };

    const results: any[] = await provider.getItemsByQuery(queryStringOptions);

    if (results && results.length > 0) {
      return results[0]?.QCState?.Title || null;
    }

    return "";
  } catch (error) {
    console.error("Error in getStateBySiteNameId:", error);
    return "";
  }
};

export const getCorrectiveId = async (
  provider: IDataProvider,
  correctiveId: number
): Promise<string> => {
  try {
    if (!!correctiveId) {
      const select = ["ID", "IncidentReportId"];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        listName: ListNames.CorrectiveActionReport,
        filter: `IncidentReportId eq ${correctiveId} and IsActive eq 1`,
      };

      const results: any[] = await provider.getItemsByQuery(queryStringOptions);

      if (results && results.length > 0) {
        // return results[0]?.ID || null;
        const correctiveInactive = {
          IsActive: false
        };
        await provider.updateItemWithPnP(correctiveInactive, ListNames.CorrectiveActionReport, results[0]?.ID);
      }
    }


    return "";
  } catch (error) {
    console.error("Error in getStateBySiteId:", error);
    return "";
  }
};



// Common method to get State by SiteId
export const getStateNameBySiteId = async (
  provider: IDataProvider,
  siteId: number
): Promise<string> => {
  try {
    const select = ["ID", "QCStateId", "QCState/Title"];
    const expand = ["QCState"];

    const queryStringOptions: IPnPQueryOptions = {
      select: select,
      expand: expand,
      listName: ListNames.SitesMaster,
      filter: `ID eq ${siteId}`,
    };

    const results: any[] = await provider.getItemsByQuery(queryStringOptions);

    if (results && results.length > 0) {
      return results[0]?.QCState.Title || null;
    }

    return "";
  } catch (error) {
    console.error("Error in getStateBySiteId:", error);
    return "";
  }
};





const GetImgUrlByFileExtension = (extension: string): string => {
  let imgType = "genericfile.png";
  const ext = extension.toLowerCase();

  switch (ext) {
    // Image types
    case "jpg":
    case "jpeg":
    case "jfif":
    case "gif":
    case "png":
      imgType = "photo.png";
      break;

    // Office docs
    case "doc":
    case "docx":
    case "ppt":
    case "pptx":
    case "xls":
    case "xlsx":
      imgType = `${ext}.svg`;
      break;

    // Audio
    case "mp3":
    case "wav":
    case "aac":
    case "ogg":
      imgType = "audio.svg";
      break;

    // Video
    case "mp4":
    case "avi":
    case "mov":
    case "mkv":
    case "webm":
    case "wmv":
      imgType = "video.svg";
      break;

    // Folder
    case "folder":
      imgType = "folder.svg";
      break;

    // Default
    default:
      imgType = `${ext}.svg`; // fallback to extension.svg or default to generic
      break;
  }

  return `https://res-1.cdn.office.net/files/fabric-cdn-prod_20221209.001/assets/item-types/16/${imgType}`;
};
// const GetImgUrlByFileExtension = (extension: string): string => {
//   let imgType = "genericfile.png";
//   imgType = `${extension}.svg`;
//   switch (extension) {
//     case "jpg":
//     case "jpeg":
//     case "jfif":
//     case "gif":
//     case "png":
//       imgType = "photo.png";
//       break;
//     case "ppt":
//     case "doc":
//     case "xls":
//       imgType = `${extension}x.svg`;
//       break;
//     case "folder":
//       imgType = "folder.svg";
//       break;
//   }
//   return `https://res-1.cdn.office.net/files/fabric-cdn-prod_20221209.001/assets/item-types/16/${imgType}`;
// };
export const getFileTypeIcon = (fileName: string): string => {
  const fileType: any = fileName?.split(".").pop();
  return GetImgUrlByFileExtension(fileType);
};

export const getSiteGroupsPermission = async (provider: IDataProvider) => {
  let groups = await provider.getSiteGroups(siteGroupsAdmin);
  return groups;
};

export const getCAMLQueryFilterExpression = (
  filterFields: ICamlQueryFilter[]
) => {
  const categoriesExpressions = filterFields?.map((item: ICamlQueryFilter) => {
    let expression: any;

    switch (item.fieldType) {
      case FieldType.Boolean:
        expression = CamlBuilder.Expression().BooleanField(item.fieldName);
        break;
      case FieldType.Text:
        expression = CamlBuilder.Expression().TextField(item.fieldName);
        break;
      case FieldType.LookupById:
        expression = CamlBuilder.Expression().LookupField(item.fieldName).Id();
        break;
      case FieldType.LookupByValue:
        expression = CamlBuilder.Expression()
          .LookupField(item.fieldName)
          .ValueAsText();
        break;
      case FieldType.Number:
        expression = CamlBuilder.Expression().NumberField(item.fieldName);
        break;
      case FieldType.User:
        expression = CamlBuilder.Expression().UserField(item.fieldName).Id();
        break;
      case FieldType.Choice:
        expression = CamlBuilder.Expression().ChoiceField(item.fieldName);
        break;
      default:
        expression = CamlBuilder.Expression().TextField(item.fieldName);
    }

    switch (item.LogicalType) {
      case LogicalType.EqualTo:
        expression.EqualTo(item.fieldValue);
        break;
      case LogicalType.NotEqualTo:
        expression.NotEqualTo(item.fieldValue);
        break;
      case LogicalType.GreaterThan:
        expression.GreaterThan(item.fieldValue);
        break;
      case LogicalType.GreaterThanOrEqualTo:
        expression.GreaterThanOrEqualTo(item.fieldValue);
        break;
      case LogicalType.LessThan:
        expression.LessThan(item.fieldValue);
        break;
      case LogicalType.LessThanOrEqualTo:
        expression.LessThanOrEqualTo(item.fieldValue);
        break;
      case LogicalType.Contains:
        expression.Contains(item.fieldValue);
        break;
      case LogicalType.IsNotNull:
        expression.IsNotNull();
        break;
      case LogicalType.In:
        expression.In(item.fieldValue);
        break;
    }

    return expression;
  });
  return categoriesExpressions;
};

export const checkThePermission = async (
  provider: IDataProvider,
  currentUser: ICurrentUser,
  isClientView?: boolean,
  siteId?: any,
) => {
  let [groups, data, stateMasterItems] = await Promise.all([
    getSiteGroupsPermission(provider),
    getSiteMasterItems(provider),
    getStateMasterItems2(provider),
  ]);
  let stateId: any[] = [];
  let dataOrg = data;
  if (isClientView && siteId) {
    data = data.filter((i) => Number(i.Id) == Number(siteId)).map((i) => {
      return {
        ...i,
        SiteManagerId: [],
        SiteSupervisorId: []
      }
    });
  }

  let stateMasterItemsOrg = stateMasterItems;
  if (!!data && data.length > 0 && isClientView) {
    stateId = data.map(r => r.QCStateId);
    if (stateId.length > 0) {
      stateMasterItems = stateMasterItems.filter((i) => stateId.includes(i.Id))
    }

  }




  const stateManagerStateId = stateMasterItems
    ?.filter((r) => r.StateManagerId?.includes(currentUser?.userId))
    .map((items) => items.ID);
  const stateManagerStateIdOrg = stateMasterItemsOrg
    ?.filter((r) => r.StateManagerId?.includes(currentUser?.userId))
    .map((items) => items.ID);

  let whsChairpersonItems: any[] =
    stateMasterItems && stateMasterItems.length > 0
      ? stateMasterItems
        .map((i) => i.WHSChairperson)
        .filter((i) => i)
        .flat()
      : [];
  whsChairpersonItems =
    whsChairpersonItems.length > 0
      ? whsChairpersonItems.map((i) => ({
        userId: i.Id,
        title: i.Title,
        email: i.EMail,
      }))
      : [];
  let isCurrentUserZoneSiteAvailable: boolean = false;


  let isWHSChairperson: boolean = false;
  let whsChairpersons: any[] = [];
  let whsChairpersonsStateTitle: any[] = [];
  let whsChairpersonsStateId: any[] = [];
  let whsChairpersonsOrg: any[] = [];
  let whsChairpersonsStateTitleOrg: any[] = [];
  let whsChairpersonsStateIdOrg: any[] = [];
  if (stateMasterItems.length > 0 && !isClientView) {
    whsChairpersons = stateMasterItems.filter((r) => !!r.WHSChairpersonId && r.WHSChairpersonId.indexOf(currentUser.userId) > -1);
    whsChairpersonsStateTitle =
      whsChairpersons.length > 0 ? whsChairpersons.map((r) => r.Title) : [];
    whsChairpersonsStateId =
      whsChairpersons.length > 0 ? whsChairpersons.map((r) => r.Id) : [];
  }
  if (stateMasterItems.length > 0) {
    whsChairpersonsOrg = stateMasterItems.filter((r) => !!r.WHSChairpersonId && r.WHSChairpersonId.indexOf(currentUser.userId) > -1);
    whsChairpersonsStateTitleOrg =
      whsChairpersonsOrg.length > 0 ? whsChairpersonsOrg.map((r) => r.Title) : [];
    whsChairpersonsStateIdOrg =
      whsChairpersonsOrg.length > 0 ? whsChairpersonsOrg.map((r) => r.Id) : [];
  }
  let chairPersonUser = whsChairpersonItems.filter(
    (i) => i.userId == currentUser?.userId
  );
  if (chairPersonUser.length > 0) {
    isWHSChairperson = true;
  } else {
    isWHSChairperson = currentUser.isAdmin;
  }

  const filteredData = {
    adminData: data,
    stateManagerSitesData: data.filter((r) =>
      stateManagerStateId.includes(r?.QCStateId)
    ),
    siteManagerSitesData: data.filter((r) =>
      r.SiteManagerId?.includes(currentUser?.userId)
    ),
    siteSupervisorSitesData: data.filter((r) =>
      r.SiteSupervisorId?.includes(currentUser?.userId)
    ),
    userSitesData: isClientView ? data : data.filter((r) =>
      r.ADUserId?.includes(currentUser?.userId)
    ),
    whsChairpersonSitesData:
      whsChairpersonsStateTitle.length > 0
        ? data.filter(
          (i) => whsChairpersonsStateTitle.indexOf(i?.QCState?.Title) > -1
        )
        : [],
  };
  const filteredDataOrg = {
    adminData: dataOrg,
    stateManagerSitesData: dataOrg.filter((r) =>
      stateManagerStateIdOrg.includes(r?.QCStateId)
    ),
    siteManagerSitesData: dataOrg.filter((r) =>
      r.SiteManagerId?.includes(currentUser?.userId)
    ),
    siteSupervisorSitesData: dataOrg.filter((r) =>
      r.SiteSupervisorId?.includes(currentUser?.userId)
    ),
    userSitesData: data.filter((r) =>
      r.ADUserId?.includes(currentUser?.userId)
    ),
    whsChairpersonSitesData:
      whsChairpersonsStateTitle.length > 0
        ? dataOrg.filter(
          (i) => whsChairpersonsStateTitle.indexOf(i?.QCState?.Title) > -1
        )
        : [],
  };

  const allSitesData = [
    ...(filteredData.stateManagerSitesData ?? []),
    ...(filteredData.siteManagerSitesData ?? []),
    ...(filteredData.siteSupervisorSitesData ?? []),
    ...(filteredData.userSitesData ?? []),
    ...(filteredData.whsChairpersonSitesData ?? []),
  ];
  const allSitesDataOrg = [
    ...(filteredDataOrg.stateManagerSitesData ?? []),
    ...(filteredDataOrg.siteManagerSitesData ?? []),
    ...(filteredDataOrg.siteSupervisorSitesData ?? []),
    ...(filteredDataOrg.userSitesData ?? []),
    ...(filteredDataOrg.whsChairpersonSitesData ?? []),
  ];

  // Extract all IDs from the combined data
  let allSitesCombineIDs: any[] = allSitesData?.map((site) => site.ID);
  let uniqueallSitesCombineIDs = Array.from(new Set(allSitesCombineIDs));
  if (allSitesData.length > 0) {
    isCurrentUserZoneSiteAvailable = allSitesData.filter((i: any) => !!i?.SiteZoneId && Number(i?.SiteZoneId) > 0)?.length > 0
  }
  let isAdmin = (currentUser?.isAdmin || groups.some((r: any) => r.Id === currentUser?.userId))
  if (isAdmin) {
    isCurrentUserZoneSiteAvailable = false
  }
  if (isClientView) {
    isAdmin = false
  }

  let allStateCombineIDs: any[] = allSitesData?.map((site) => site.QCStateId);
  let uniqueallStateCombineIDs = Array.from(new Set(allStateCombineIDs));
  const siteNameArray = data
    ?.filter((item) => stateManagerStateId.includes(item.QCStateId))
    .map((items) => items.ID);
  let roles: ILoginUserRoleDetails = {
    Id: currentUser?.userId,
    title: currentUser?.displayName,
    emailId: currentUser?.email,
    isAdmin: isAdmin,
    isStateManager: isClientView ? false : stateMasterItems.some((r) => r.StateManagerId?.includes(currentUser?.userId)),
    isSiteManager: isClientView ? false : filteredData.siteManagerSitesData?.length > 0,
    isSiteSupervisor: isClientView ? false : filteredData.siteSupervisorSitesData?.length > 0,
    isUser: isClientView ? true : filteredData.userSitesData?.length > 0,
    isWHSChairperson: isClientView ? false : isWHSChairperson,
    isStateManagerOrg: stateMasterItems.some((r) => r.StateManagerId?.includes(currentUser?.userId)),
    isSiteManagerOrg: filteredData.siteManagerSitesData?.length > 0,
    isAdminOrg: (currentUser?.isAdmin || groups.some((r: any) => r.Id === currentUser?.userId)),
    isSiteSupervisorOrg: filteredData.siteSupervisorSitesData?.length > 0,
    isUserOrg: filteredData.userSitesData?.length > 0,
    isWHSChairpersonOrg: isWHSChairperson,
    stateManagerStateItem: stateManagerStateId || [],
    stateManagerStateItemOrg: stateManagerStateIdOrg || [],
    stateManagerSitesItemIds: siteNameArray || [], // this is for State Manager Sites Item Data
    stateManagerSitesItems: filteredData.stateManagerSitesData || [],
    stateMasterItems: stateMasterItems || [],
    siteManagerItem: filteredData.siteManagerSitesData || [],
    siteManagerItemOrg: filteredDataOrg.siteManagerSitesData || [],
    siteSupervisorItem: filteredData.siteSupervisorSitesData || [],
    siteSupervisorItemOrg: filteredDataOrg.siteSupervisorSitesData || [],
    userItems: filteredData.userSitesData || [],
    userRoles: [],
    currentUserAllCombineSites: uniqueallSitesCombineIDs || [],
    currentUserAllCombineStateId: uniqueallStateCombineIDs || [],
    whsChairpersonDetails: whsChairpersons,
    whsChairpersonTitle: whsChairpersonsStateTitle,
    whsChairpersonsStateId: whsChairpersonsStateId,
    whsChairpersonDetailsOrg: whsChairpersonsOrg,
    whsChairpersonTitleOrg: whsChairpersonsStateTitleOrg,
    whsChairpersonsStateOrgId: whsChairpersonsStateIdOrg,
    isShowOnlyChairPerson: false,
    isCurrentUserZoneSiteAvailable: isCurrentUserZoneSiteAvailable
  };
  roles = {
    ...roles,
    isShowOnlyChairPerson: !(
      roles.isAdmin ||
      roles.isStateManager ||
      roles.isSiteManager ||
      roles.isSiteSupervisor ||
      roles.isUser
    ),
  };

  if (
    !roles.isAdmin &&
    !roles.isStateManager &&
    !roles.isSiteManager &&
    roles.isSiteSupervisor
  ) {
    // alert("supervisor only")
  }

  const userRoles: string[] = [];
  if (roles.isAdmin) {
    userRoles.push("Admin");
    roles.currentUserSitesData = filteredData.adminData;
  }
  if (roles.isStateManager) {
    userRoles.push("State Manager");
    roles.currentUserSitesData = filteredData.stateManagerSitesData;
  }
  if (roles.isSiteManager) {
    userRoles.push("Site Manager");
    roles.currentUserSitesData = filteredData.siteManagerSitesData;
  }
  if (roles.isSiteSupervisor) {
    userRoles.push("Site Supervisor");
    roles.currentUserSitesData = filteredData.siteSupervisorSitesData;
  }
  if (roles.isUser) {
    userRoles.push("User");
    roles.currentUserSitesData = filteredData.userSitesData;
  }
  if (roles.isWHSChairperson) {
    userRoles.push("WHS Chairperson");
  }

  roles.userRoles = userRoles;

  console.log();
  return roles;
};

export const getNavlinks = async (provider: IDataProvider) => {
  const filter = `IsActive eq 1 and LinkFor eq 'Client Dashboard'`;
  const queryOptions: IPnPQueryOptions = {
    listName: ComponentNameEnum.NavigationLinks,
    select: [
      "Title,NavType,URL,ComponentName,QROrder,IsActive,IsLabel,Parent,TargetAudience",
    ],
    filter: filter,
    orderBy: "QROrder",
  };
  const navLinksData = await provider.getItemsByQuery(queryOptions);
  const navLink = navLinksData.map((i: any) => {
    return {
      Title: !!i.Title ? i.Title : "",
      NavType: !!i.NavType ? i.NavType : "",
      URL: !!i.URL ? i.URL.Url : "",
      ComponentName: !!i.ComponentName ? i.ComponentName : "",
      QROrder: !!i.QROrder ? i.QROrder : 0,
      IsActive: !!i.IsActive ? i.IsActive : false,
      IsLabel: !!i.IsLabel ? i.IsLabel : false,
      Parent: !!i.Parent ? i.Parent : "",
      TargetAudience: !!i.TargetAudience ? i.TargetAudience : [],
    };
  });
  return navLink;
};

export const showPremissionDeniedPage = (roles: ILoginUserRoleDetails) => {
  let permssiion: any[] = [];
  if (roles.isAdmin) {
    permssiion.push({ isAdmin: true });
  } else if (roles.isStateManager) {
    permssiion.push({ isStateManager: true });
  } else if (roles.isSiteManager) {
    permssiion.push({ isSiteManager: true });
  } else if (roles.isUser) {
    permssiion.push({ isUser: true });
  } else if (roles.isSiteSupervisor) {
    permssiion.push({ isSiteSupervisor: true });
  } else if (roles.isWHSChairperson) {
    permssiion.push({ isWHSChairperson: true });
  }
  return permssiion;
};

export const saveThumbNailImage = async (
  provider: IDataProvider,
  file: any,
  listName: string,
  isUpdate?: boolean,
  oldFileUrl?: string
) => {
  let nameWithoutSpace = file?.file?.name?.replace(/[\s.]+/g, "");
  let extension = file?.file?.name?.split(".").pop();
  const timestamp = new Date().getTime();
  nameWithoutSpace = nameWithoutSpace?.replace(extension, "");
  let fileObj: IFileWithBlob = {
    name: `${timestamp}${nameWithoutSpace}.${extension}`,
    file: file.file,
  };

  if (
    isUpdate == true &&
    !!oldFileUrl &&
    oldFileUrl.split("/").pop() !=
    "NotFoundImg_15f37076872698f99e30750028e2f28e.png" &&
    !oldFileUrl.includes("SiteAssets")
  ) {
    // delete the old
    const isAvailable = await provider.isAvailbleDocumnetByServerRelativePath(
      oldFileUrl
    );
    if (isAvailable) {
      let data: any = await provider.getDocumentByServerRelativePath(
        oldFileUrl
      );
      if (!!data && data.ID != 0) await provider.deleteItem(listName, data.ID);
    }
  }
  let fileUpload: any = await provider.createTheThumbLine(listName, fileObj);
  let data: any = await provider.getDocumentByServerRelativePath(
    fileUpload.data.ServerRelativeUrl
  );
  let Photo = JSON.stringify({
    serverRelativeUrl: fileUpload.data.ServerRelativeUrl,
  });
  let retrun = {
    Photo: !!Photo ? Photo : JSON.stringify({ serverRelativeUrl: "" }),
    EncodedAbsThumbnailUrl: !!data.EncodedAbsThumbnailUrl
      ? data.EncodedAbsThumbnailUrl
      : "",
  };
  return retrun;
};
export const saveNewThumbNailImage = async (
  provider: IDataProvider,
  fileUrl: string,
  listName: string
) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error("Failed to download image from URL");

  const blob = await response.blob();

  const oldFileName = fileUrl.split("/").pop() ?? `CopiedFile_${Date.now()}.png`;
  const extension = oldFileName.split(".").pop();
  const nameWithoutExt = oldFileName.replace(`.${extension}`, "").replace(/[\s.]+/g, "");
  const timestamp = new Date().getTime();

  const fileObj: IFileWithBlob = {
    name: `${timestamp}_${nameWithoutExt}.${extension}`,
    file: blob
  };

  const fileUpload = await provider.createTheThumbLine(listName, fileObj);
  const data: any = await provider.getDocumentByServerRelativePath(fileUpload.data.ServerRelativeUrl);

  return {
    Photo: JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl }),
    EncodedAbsThumbnailUrl: data?.EncodedAbsThumbnailUrl ?? ""
  };
};

export const saveCopyThumbNailImage = async (
  provider: IDataProvider,
  fileUrl: string,
  listName: string
) => {
  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error("Failed to download image from URL");

  const blob = await response.blob();

  const oldFileName = fileUrl.split("/").pop() ?? `CopiedFile_${Date.now()}.png`;
  const extension = oldFileName.split(".").pop();
  const nameWithoutExt = oldFileName.replace(`.${extension}`, "").replace(/[\s.]+/g, "");
  const timestamp = new Date().getTime();

  const fileObj: IFileWithBlob = {
    name: `Copy_${nameWithoutExt}.${extension}`,
    file: blob
  };

  const fileUpload = await provider.createTheThumbLine(listName, fileObj);
  const data: any = await provider.getDocumentByServerRelativePath(fileUpload.data.ServerRelativeUrl);

  return {
    Photo: JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl }),
    EncodedAbsThumbnailUrl: data?.EncodedAbsThumbnailUrl ?? ""
  };
};

export const copyListAttachmentToAnotherList = async (
  provider: IDataProvider,
  sourceAttachmentUrl: string,
  targetListName: string,
  targetItemId: number
): Promise<any> => {
  try {
    const fileName = sourceAttachmentUrl.split("/").pop();
    if (!fileName) throw new Error("Invalid file name in URL.");

    const fileBlob = await provider.getFileBlobByUrl(sourceAttachmentUrl);

    const attachment: any = {
      name: fileName,
      fileContent: fileBlob,
    };

    await provider.addAttachment(targetListName, targetItemId, attachment);
  } catch (error) {
    console.error("Error copying attachment:", error);
    return '';
  }
};

export const onlyDeleteThumbNail = async (
  provider: IDataProvider,
  listName: string,
  oldFileUrl: string
) => {
  let isDeleted: boolean = false;

  if (!!oldFileUrl && !oldFileUrl.includes("SiteAssets")) {
    let data: any = await provider.getDocumentByServerRelativePath(oldFileUrl);
    if (!!data && data.ID != 0) {
      await provider.deleteItem(listName, data.ID);
      isDeleted = true;
    }
  }
  return { isDeleted: isDeleted };
};

export const getChoicesListOptions = async (
  provider: IDataProvider,
  listNames: string,
  columnName: string,
  isAllDefault?: boolean
) => {
  let opt;
  try {
    opt = await provider.choiceOption(listNames, columnName);
  } catch (error) {
    console.log(error);
  }

  let dropDownOption: IReactSelectOptionProps[] = [];
  if (opt?.length > 0) {
    dropDownOption = opt.map((opt: any) => {
      return {
        value: opt,
        label: opt,
        key: opt,
      };
    });
  }
  if (isAllDefault) {
    dropDownOption.push({ key: "", value: "", label: " --All--" });
  }
  return dropDownOption;
};

export const htmlToText = (html: any) => {
  let tempDivElement = document.createElement("div");
  tempDivElement.innerHTML = html;
  return tempDivElement.textContent || tempDivElement.innerText || "";
};

export const scrollFunction = (height: number) => {
  let elm = document.getElementById("detailBlock");
  let addSpace = document.getElementById("addBlank");
  const className =
    document.querySelector("ARTICLE")?.children[0].children[0].classList[0];

  if (
    document.getElementsByClassName(!!className ? className : "")[0].scrollTop >
    height ||
    document.getElementsByClassName(!!className ? className : "")[0].scrollTop >
    height
  ) {
    if (!!elm) {
      elm.classList.add("detailHeaderSticky");
      addSpace?.classList.remove("addBlank");
      addSpace?.classList.add("addSpace");
    }
  } else {
    if (!!elm) {
      elm.classList.remove("detailHeaderSticky");
      addSpace?.classList.add("addBlank");
      addSpace?.classList.remove("addSpace");
    }
  }
};
export const imgValidation = (filename: any) => {
  const isValid = ImageTypeCheck.includes(filename.split(".").pop());
  return isValid;
};

export const delay = (ms: any) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const GetSortOrder = (
  prop: any,
  isAscending: boolean = true,
  type: string = "SP.FieldText"
) => {
  return (x: any, y: any) => {
    let a = x[prop],
      b = y[prop];
    if (type == "SP.FieldText") {
      a = !!x[prop] ? x[prop].toUpperCase() : "";
      b = !!y[prop] ? y[prop].toUpperCase() : "";
      if (isAscending) return a == b ? 0 : a > b ? 1 : -1;
      else return a == b ? 0 : a < b ? 1 : -1;
    } else if (type == "SP.FieldDateTime") {
      a = new Date(a || 0);
      b = new Date(b || 0);
      if (isAscending) return a - b;
      else return b - a;
    } else {
      if (isAscending) return a == b ? 0 : a > b ? 1 : -1;
      else return a == b ? 0 : a < b ? 1 : -1;
    }
  };
};
export const genrateDropDownFormate = (items: any[]) => {
  let dropDownOption: IReactSelectOptionProps[] = [];

  if (!!items && items.length > 0) {
    dropDownOption = items.map((opt) => {
      return { value: opt, label: opt, key: opt };
    });
  }
  return dropDownOption;
};

export const getAssetHistory = async (provider: IDataProvider) => {
  const queryOptions: IPnPQueryOptions = {
    listName: ListNames.AssetHistory,
    select: ["Id,SiteNameId,Created,AssetMasterId"],
    orderBy: "Id",
    isSortOrderAsc: false,
  };
  return await provider.getItemsByQuery(queryOptions);
};

export const isLink = (text: any) => {
  // Regular expression for matching URLs
  const urlRegex = /(https?:\/\/[^\s]+)/;

  // Check if the text contains a URL
  return urlRegex.test(text);
};

export function generateExcelTable<T>(
  rows: T[],
  columns: IExportColumns[],
  fileName: string = "DataFile.xlsx"
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");
  // Add table to the worksheet
  const tableColumns = columns?.filter((col: any) => {
    const lowerCaseName = col.header?.toString().toLowerCase();
    return lowerCaseName !== "action" && lowerCaseName !== "actions";
  });

  worksheet.addTable({
    name: "MyTable",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: tableColumns.map((col) => ({
      name: col.header,
      filterButton: true,
    })),
    rows: rows.map((row: any) => tableColumns.map((col: any) => row[col.key])),
  });

  // Enable word wrap for each cell in the table
  for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
    // +1 to include header row
    for (let colIndex = 0; colIndex < tableColumns.length; colIndex++) {
      const cell = worksheet.getCell(
        `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
      );
      cell.alignment = { wrapText: true };
    }
  }

  // Adjust column widths to fit content
  tableColumns.forEach((col, colIndex) => {
    const columnLetter = String.fromCharCode(65 + colIndex); // Convert colIndex to corresponding column letter (A, B, C, etc.)
    let maxLength = col.header.length; // Start with header length

    rows.forEach((row: any) => {
      const cellValue = row[col.key] ? row[col.key].toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });

    worksheet.getColumn(columnLetter).width = maxLength + 5; // Add some padding
  });

  // Generate Excel file buffer and save
  workbook.xlsx.writeBuffer().then((buffer: any) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  });
}

export function generateExcelTableHelpDesk<T>(
  rows: any[],
  columns?: IExportColumns[],
  fileName: string = "DataFile.xlsx"
) {
  if (!rows || rows.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("My Sheet");

  // ✅ Auto-detect columns from first row if not provided
  const tableColumns: IExportColumns[] =
    columns && columns.length > 0
      ? columns
      : Object.keys(rows[0]).map((key) => ({
        header: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize header
        key: key,
      }));

  // ✅ Filter out 'action' or 'actions' columns
  const filteredColumns = tableColumns.filter((col) => {
    const lowerCaseName = col.header.toString().toLowerCase();
    return lowerCaseName !== "action" && lowerCaseName !== "actions";
  });

  // ✅ Add table to worksheet
  worksheet.addTable({
    name: "MyTable",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleMedium9",
      showRowStripes: true,
    },
    columns: filteredColumns.map((col) => ({
      name: col.header,
      filterButton: true,
    })),
    rows: rows.map((row: any) =>
      filteredColumns.map((col: any) =>
        row[col.key] !== undefined && row[col.key] !== null
          ? row[col.key].toString()
          : ""
      )
    ),
  });

  // ✅ Enable word wrap for each cell
  for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) {
    for (let colIndex = 0; colIndex < filteredColumns.length; colIndex++) {
      const cell = worksheet.getCell(
        `${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`
      );
      cell.alignment = { wrapText: true };
    }
  }

  // ✅ Auto-fit column width
  filteredColumns.forEach((col, colIndex) => {
    const column = worksheet.getColumn(colIndex + 1);
    let maxLength = col.header.length;

    rows.forEach((row: any) => {
      const cellValue = row[col.key] ? row[col.key].toString() : "";
      maxLength = Math.max(maxLength, cellValue.length);
    });

    column.width = maxLength + 5;
  });

  // ✅ Generate and save Excel file
  workbook.xlsx.writeBuffer().then((buffer: any) => {
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, fileName);
  });
}

export const getErrorMessage = (error: any) => {
  try {
    return JSON.parse(error.message);
  } catch (e) {
    return e;
  }
};

export const getErrorObjectCommon = async (error: any): Promise<any> => {
  const _error = { message: "", name: "" };
  if (error) {
    try {
      const json = await error.response.json();
      _error.message =
        typeof json["odata.error"] === "object"
          ? json["odata.error"].message.value
          : error.message;
      if (error.status === 404) {
        console.error(error.statusText);
      }
    } catch (e) {
      console.error("Error parsing JSON response", e);
      _error.message = error.message;
    }
  } else {
    console.log(error.message);
    _error.message = error.message;
  }
};

export const getErrorMessageValue = (errorMessage: any) => {
  try {
    const errorJsonPart = errorMessage.split(" ::> ")[1];
    const errorObject = JSON.parse(errorJsonPart);
    return errorObject["odata.error"].message.value;
  } catch (error) {
    console.error("Error parsing error message:", error);
    return "An unexpected error occurred";
  }
};

// Helper function to convert image to Base64
export const convertImageToBase64 = (imgUrl: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Ensure CORS compliance
    img.src = imgUrl;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject("Unable to get canvas context");
      }
    };

    img.onerror = () => reject(`Failed to load image: ${imgUrl}`);
  });
};

// export const generateAndSaveKendoPDF = async (
//     divID: string,
//     pdfName: string,
//     isDisplayNone?: boolean,
//     downloadPDF?: boolean,
// ): Promise<Blob | null> => {
//     try {
//         // Load jQuery and Kendo libraries
//         const jQueryUrl = 'https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js';
//         const kendoUrl = "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
//         await SPComponentLoader.loadScript(jQueryUrl, { globalExportsName: 'jQuery' });
//         await SPComponentLoader.loadScript(kendoUrl, { globalExportsName: 'kendo' });

//         try {
//             (window as any).kendo.pdf.defineFont({
//                 // "Helvetica": ttfFont,
//                 // "Gilroy": ttfGilroyRegular,
//                 // "Gilroy|Bold": ttfGilroyBold,
//                 "NotoSans": NotoSans
//             });

//             const logoElement = document.querySelector(`#${divID} img.qclogoims`);
//             if (logoElement) {
//                 const imageSRC = (logoElement as HTMLImageElement).src;
//                 const logoBase64 = await convertImageToBase64(imageSRC);
//                 (logoElement as HTMLImageElement).src = logoBase64;
//             }
//         } catch (fontError) {
//             console.error("Error defining font:", fontError);
//         }

//         const element = document.getElementById(divID);
//         if (!element) {
//             throw new Error(`Element with ID ${divID} not found.`);
//         }
//         else {
//             element.classList.remove('dnone');
//         }
//         document.querySelectorAll(`#${divID} .noExport`).forEach((el: HTMLElement) => {
//             el.style.display = 'none';
//         });

//         await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay

//         // Generate PDF and return the Blob
//         const pdfData: Blob | null = await new Promise<Blob | null>((resolve, reject) => {
//             (window as any).kendo.drawing.drawDOM(`#${divID}`, {
//                 forcePageBreak: ".page-break",
//                 paperSize: "Letter",
//                 margin: {
//                     top: "0.1in",
//                     bottom: "0.1in",
//                     left: "0.1in",
//                     right: "0.1in"
//                 },
//                 multiPage: true,
//                 scale: 0.8,
//                 keepTogether: ".keep-together"
//             }).then((group: any) => {
//                 return (window as any).kendo.drawing.exportPDF(group);
//             }).then((dataURI: string) => {
//                 document.querySelectorAll(`#${divID} .noExport`).forEach((el: HTMLElement) => {
//                     el.style.display = 'block';
//                 });

//                 if (downloadPDF) {
//                     (window as any).kendo.saveAs({
//                         dataURI: dataURI,
//                         fileName: `${pdfName}.pdf`
//                     });
//                 }

//                 if (isDisplayNone != false && element) {
//                     element.classList.add('dnone');
//                 }

//                 // Convert the data URI to a blob
//                 const byteCharacters = atob(dataURI.split(',')[1]);
//                 const byteNumbers = new Array(byteCharacters.length);
//                 for (let i = 0; i < byteCharacters.length; i++) {
//                     byteNumbers[i] = byteCharacters.charCodeAt(i);
//                 }
//                 const byteArray = new Uint8Array(byteNumbers);
//                 const blob = new Blob([byteArray], { type: "application/pdf" });

//                 resolve(blob);
//             }).catch((error: any) => {
//                 console.error("Failed to generate PDF:", error);
//                 reject(error);
//             });
//         });

//         return pdfData; // Return the generated Blob

//     } catch (error) {
//         console.error('Error generating or saving PDF:', error);
//         return null;
//     }
// };
const SECRET_KEY = "Quayclean123"; // 🔑 Change this to a secure value
const wasteSecret_key = "QuaycleanSiteName@123";

// Encrypt a number (e.g., ID)
export const encryptValue = (value: number): string => {
  return CryptoJS.AES.encrypt(value.toString(), SECRET_KEY).toString();
};

// Decrypt to get original number
export const decryptValue = (encrypted: string): number => {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return parseInt(decrypted, 10);
};
export const encryptWasteValue = (value: string): string => {
  const encrypted = CryptoJS.AES.encrypt(value, wasteSecret_key).toString();
  return encodeURIComponent(encrypted);
};

export const decryptWasteValue = (encryptedValue: string): string => {
  const decoded = decodeURIComponent(encryptedValue);
  const bytes = CryptoJS.AES.decrypt(decoded, wasteSecret_key);
  return bytes.toString(CryptoJS.enc.Utf8);
};



export const generateAndSaveKendoPDF = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
  isLandScape?: any
): Promise<Blob | null> => {
  try {
    // Load jQuery and Kendo scripts
    const jQueryUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js";
    const kendoUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, {
      globalExportsName: "jQuery",
    });
    await SPComponentLoader.loadScript(kendoUrl, {
      globalExportsName: "kendo",
    });
    try {
      (window as any).kendo.pdf.defineFont({
        NotoSans: NotoSans,
        "NotoSans|Bold": NotoSansBold,
      });

      // Force logo to base64
      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    const element = document.getElementById(divID);
    if (!element) {
      throw new Error(`Element with ID ${divID} not found.`);
    } else {
      element.classList.remove("dnone");
    }

    // Hide elements with .noExport class
    document
      .querySelectorAll(`#${divID} .noExport`)
      .forEach((el: HTMLElement) => {
        el.style.display = "none";
      });

    // Apply NotoSans font to all text inside the div
    const style = document.createElement("style");
    style.innerHTML = `
            #${divID}, #${divID} * {
                font-family: 'NotoSans' !important;
            }
        `;
    document.head.appendChild(style);

    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay

    const pdfData: Blob | null = await new Promise<Blob | null>(
      (resolve, reject) => {
        (window as any).kendo.drawing
          .drawDOM(`#${divID}`, {
            forcePageBreak: ".page-break",
            paperSize: "Letter",
            margin: {
              top: "0.1in",
              bottom: "0.1in",
              left: "0.1in",
              right: "0.1in",
            },
            multiPage: true,
            // landscape: isLandScape ? isLandScape : false,
            scale: 0.8,
            keepTogether: ".keep-together",
            pdf: {
              font: "NotoSans",
            },
          })
          .then((group: any) => {
            return (window as any).kendo.drawing.exportPDF(group);
          })
          .then((dataURI: string) => {
            document
              .querySelectorAll(`#${divID} .noExport`)
              .forEach((el: HTMLElement) => {
                el.style.display = "block";
              });

            if (downloadPDF) {
              (window as any).kendo.saveAs({
                dataURI: dataURI,
                fileName: `${pdfName}.pdf`,
              });
            }

            if (isDisplayNone != false && element) {
              element.classList.add("dnone");
            }

            // Convert data URI to Blob
            const byteCharacters = atob(dataURI.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            resolve(blob);
          })
          .catch((error: any) => {
            console.error("Failed to generate PDF:", error);
            reject(error);
          });
      }
    );

    return pdfData;
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    return null;
  }
};

export const generateAndSaveKendoHazardPDF = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
  isLandScape?: any
): Promise<Blob | null> => {
  try {
    // Load jQuery and Kendo scripts
    const jQueryUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js";
    const kendoUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, {
      globalExportsName: "jQuery",
    });
    await SPComponentLoader.loadScript(kendoUrl, {
      globalExportsName: "kendo",
    });
    try {
      (window as any).kendo.pdf.defineFont({
        NotoSans: NotoSans,
        "NotoSans|Bold": NotoSansBold,
      });

      // Force logo to base64
      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    const element = document.getElementById(divID);
    if (!element) {
      throw new Error(`Element with ID ${divID} not found.`);
    } else {
      element.classList.remove("dnone");
    }

    // Hide elements with .noExport class
    document
      .querySelectorAll(`#${divID} .noExport`)
      .forEach((el: HTMLElement) => {
        el.style.display = "none";
      });

    // Apply NotoSans font to all text inside the div
    const style = document.createElement("style");
    style.innerHTML = `
            #${divID}, #${divID} * {
                font-family: 'NotoSans' !important;
            }
        `;
    document.head.appendChild(style);

    const tempStyle = document.createElement('style');
    //   #${divID} #pdf-border-wrap {
    //     border: 1px solid #444 !important;
    //     padding: 6px 0px !important;
    //     border-radius: 6px !important;
    // }
    // #${divID} .qchazard-form-content {
    //   padding:0px !important;
    //     }
    //     #${divID} .qc-row>* {
    //       padding-right: 5px;
    //       padding-left: 5px;
    //     }
    // #${divID} .qc-row>* {
    //   padding-right: 5px;
    //   padding-left: 5px;
    // }
    //   #${divID} .bt-2 {
    //     border-top: 1px solid #ddd;
    //  }
    //   #${divID} .pdf-hazard-mb0 {
    //     margin-bottom: 0px !important;

    //  }
    tempStyle.innerHTML = `
            #${divID}.pdfHazardDiv {
        font-size: 13px !important;
    }

       #${divID}.pdfHazardDiv label {
  font-size:13px !important;
    }
 
       #${divID} .qc-row>* {
      padding-right: 5px;
       padding-left: 5px;
    }
               
        #${divID} .hazard-ans-wrapper {
       border-bottom: none;
       padding-bottom: 2px !important;
    }
   #${divID} .dnone {
        display:block !important;
 }
        `;
    document.head.appendChild(tempStyle);
    tempStyle.id = 'pdf-temp-style';
    await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay

    const pdfData: Blob | null = await new Promise<Blob | null>(
      (resolve, reject) => {
        (window as any).kendo.drawing
          .drawDOM(`#${divID}`, {
            forcePageBreak: ".page-break",
            paperSize: "Letter",
            margin: {
              top: "0.1in",
              bottom: "0.1in",
              left: "0.1in",
              right: "0.1in",
            },
            multiPage: true,
            // landscape: isLandScape ? isLandScape : false,
            scale: 0.8,
            keepTogether: ".keep-together",
            pdf: {
              font: "NotoSans",
            },
          })
          .then((group: any) => {
            return (window as any).kendo.drawing.exportPDF(group);
          })
          .then((dataURI: string) => {
            document
              .querySelectorAll(`#${divID} .noExport`)
              .forEach((el: HTMLElement) => {
                el.style.display = "block";
              });

            if (downloadPDF) {
              (window as any).kendo.saveAs({
                dataURI: dataURI,
                fileName: `${pdfName}.pdf`,
              });
            }

            if (isDisplayNone != false && element) {
              element.classList.add("dnone");
            }

            // Convert data URI to Blob
            const byteCharacters = atob(dataURI.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            resolve(blob);
            document.getElementById('pdf-temp-style')?.remove();
          })
          .catch((error: any) => {
            console.error("Failed to generate PDF:", error);
            reject(error);
          });
      }
    );

    return pdfData;
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    return null;
  }
};

export const generateAndSaveKendoPDFHelpDesk = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
  isNotApplyFontFamily?: boolean

): Promise<Blob | null> => {
  try {
    // Load jQuery and Kendo libraries
    const jQueryUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js";
    const kendoUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, {
      globalExportsName: "jQuery",
    });
    await SPComponentLoader.loadScript(kendoUrl, {
      globalExportsName: "kendo",
    });

    try {
      (window as any).kendo.pdf.defineFont({
        NotoSans: NotoSans,
        "NotoSans|Bold": NotoSansBold,
      });

      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    const element = document.getElementById(divID);
    if (!element) {
      throw new Error(`Element with ID ${divID} not found.`);
    } else {
      element.classList.remove("dnone");
    }
    document
      .querySelectorAll(`#${divID} .noExport`)
      .forEach((el: HTMLElement) => {
        el.style.display = "none";
      });
    const style = document.createElement("style");
    if (!isNotApplyFontFamily) {
      style.innerHTML = `
            #${divID}, #${divID} * {
                font-family: 'NotoSans' !important;
            }
        `;
      document.head.appendChild(style);
    }


    await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay

    // Generate PDF and return the Blob
    const pdfData: Blob | null = await new Promise<Blob | null>(
      (resolve, reject) => {
        (window as any).kendo.drawing
          .drawDOM(`#${divID}`, {
            forcePageBreak: ".page-break",
            // paperSize: "Letter",
            paperSize: "A4",
            // orientation: "landscape",
            landscape: true,
            // fitMode: "fit",
            margin: {
              top: "0.1in",
              bottom: "0.1in",
              left: "0.1in",
              right: "0.1in",
            },
            multiPage: true,
            scale: 0.8,
            keepTogether: ".keep-together",
            pdf: {
              font: "NotoSans",
            },
          })
          .then((group: any) => {
            return (window as any).kendo.drawing.exportPDF(group);
          })
          .then((dataURI: string) => {
            document
              .querySelectorAll(`#${divID} .noExport`)
              .forEach((el: HTMLElement) => {
                el.style.display = "block";
              });

            if (downloadPDF) {
              (window as any).kendo.saveAs({
                dataURI: dataURI,
                fileName: `${pdfName}.pdf`,
              });
            }

            if (isDisplayNone != false && element) {
              element.classList.add("dnone");
            }

            // Convert the data URI to a blob
            const byteCharacters = atob(dataURI.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            resolve(blob);
          })
          .catch((error: any) => {
            console.error("Failed to generate PDF:", error);
            reject(error);
          });
      }
    );

    return pdfData; // Return the generated Blob
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    return null;
  }
};
export const generateAndSaveKendoPDFQR = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
  isNotApplyFontFamily?: boolean

): Promise<Blob | null> => {
  try {
    // Load jQuery and Kendo libraries
    const jQueryUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js";
    const kendoUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, {
      globalExportsName: "jQuery",
    });
    await SPComponentLoader.loadScript(kendoUrl, {
      globalExportsName: "kendo",
    });

    try {
      (window as any).kendo.pdf.defineFont({
        NotoSans: NotoSans,
        "NotoSans|Bold": NotoSansBold,
      });

      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    const element = document.getElementById(divID);
    if (!element) {
      throw new Error(`Element with ID ${divID} not found.`);
    } else {
      element.classList.remove("dnone");
    }
    document
      .querySelectorAll(`#${divID} .noExport`)
      .forEach((el: HTMLElement) => {
        el.style.display = "none";
      });
    const style = document.createElement("style");
    if (!isNotApplyFontFamily) {
      style.innerHTML = `
            #${divID}, #${divID} * {
                font-family: 'NotoSans' !important;
            }
        `;
      document.head.appendChild(style);
    }


    await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay

    // Generate PDF and return the Blob
    const pdfData: Blob | null = await new Promise<Blob | null>(
      (resolve, reject) => {
        (window as any).kendo.drawing
          .drawDOM(`#${divID}`, {
            forcePageBreak: ".page-break",
            // paperSize: "Letter",
            paperSize: "A4",
            // orientation: "landscape",
            // landscape: true,
            // fitMode: "fit",
            margin: {
              top: "0.1in",
              bottom: "0.1in",
              left: "0.1in",
              right: "0.1in",
            },
            multiPage: true,
            scale: 0.7,
            keepTogether: ".keep-together",
            pdf: {
              font: "NotoSans",
            },
          })
          .then((group: any) => {
            return (window as any).kendo.drawing.exportPDF(group);
          })
          .then((dataURI: string) => {
            document
              .querySelectorAll(`#${divID} .noExport`)
              .forEach((el: HTMLElement) => {
                el.style.display = "block";
              });

            if (downloadPDF) {
              (window as any).kendo.saveAs({
                dataURI: dataURI,
                fileName: `${pdfName}.pdf`,
              });
            }

            if (isDisplayNone != false && element) {
              element.classList.add("dnone");
            }

            // Convert the data URI to a blob
            const byteCharacters = atob(dataURI.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            resolve(blob);
          })
          .catch((error: any) => {
            console.error("Failed to generate PDF:", error);
            reject(error);
          });
      }
    );

    return pdfData; // Return the generated Blob
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    return null;
  }
};

export const _getIMSTemplateDetail = async (
  provider: IDataProvider,
  context: WebPartContext,
  stateId: number,
  formType: string,
  notFoundImage: string = ""
) => {
  try {
    const select = [
      "ID",
      "Title",
      "FormType",
      "StateId",
      "State/Title",
      "State/Id",
      "EnabledChecklistId",
      "DiscussionPoints",
      "Comments",
      "MattersfromPreviousMeetings",
      "NewMattersforDiscussion",
      "IsActive",
      "Attachments",
      "AttachmentFiles",
      "TemplateName",
      "MasterComment",
    ];
    const expand = ["State", "AttachmentFiles"];
    const queryStringOptions: IPnPQueryOptions = {
      select,
      expand,
      filter: `FormType eq '${formType}' and IsActive eq 1 and State/ID eq ${stateId}`,
      listName: ListNames.IMSTemplateMaster,
    };

    const results = await provider.getItemsByQuery(queryStringOptions);

    if (results?.length) {
      const templateData = results.map((data) => {
        const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/IMSTemplateMaster/Attachments/${data.ID}/`;
        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs
        let creatorFileAttachments: string[] = []; // CreatorFile URLs
        let masterFileAttachments: string[] = []; // MasterFile URLs

        if (data.AttachmentFiles.length > 0) {
          try {
            data.AttachmentFiles.forEach(
              (AttachmentData: {
                ServerRelativeUrl: string;
                FileName: string;
              }) => {
                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                  attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                  // Separate filtering based on FileName
                  if (AttachmentData.FileName.includes("CreatorFile")) {
                    creatorFileAttachments.push(
                      AttachmentData.ServerRelativeUrl
                    );
                  } else if (AttachmentData.FileName.includes("MasterFile")) {
                    masterFileAttachments.push(
                      AttachmentData.ServerRelativeUrl
                    );
                  }
                } else if (AttachmentData && AttachmentData.FileName) {
                  const fileUrl = fixImgURL + AttachmentData.FileName;
                  attachmentFiledata.push(fileUrl);

                  // Separate filtering based on FileName
                  if (AttachmentData.FileName.includes("CreatorFile")) {
                    creatorFileAttachments.push(fileUrl);
                  } else if (AttachmentData.FileName.includes("MasterFile")) {
                    masterFileAttachments.push(fileUrl);
                  }
                } else {
                  attachmentFiledata.push(notFoundImage);
                }
              }
            );
          } catch (error) {
            console.error("Error parsing AttachmentFiles JSON:", error);
            attachmentFiledata.push(notFoundImage);
          }
        } else {
          attachmentFiledata = [];
        }

        return {
          ID: data.ID,
          Title: data.Title,
          StateId: data.StateId ?? "",
          DiscussionPoints: data.DiscussionPoints ?? "",
          TemplateName: data.TemplateName ?? "",
          Comments: data.Comments ?? "",
          MattersfromPreviousMeetings: data.MattersfromPreviousMeetings ?? "",
          NewMattersforDiscussion: data.NewMattersforDiscussion ?? "",
          IsActive: data.IsActive ?? false,
          EnabledChecklistId: data.EnabledChecklistId ?? "",
          Attachment: attachmentFiledata,
          CreatorAttachment: creatorFileAttachments,
          MasterAttachment: masterFileAttachments,
          AttachmentFiles: data.AttachmentFiles,
          MasterComment: !!data.MasterComment ? data.MasterComment : "",
        };
      });

      // return templateData.length > 0 ? templateData[0] : null;
      return templateData.length > 0 ? templateData : null;
    }
  } catch (error) {
    console.error("Error fetching template details:", error);
    return null;
  }
};

export const getCurrentDateTimeStamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  // Format the date and time as 'YYYYMMDD_HHmmss'
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
};

export const deleteToolboxTalkMaster = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.ToolboxTalkMasterData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.ToolboxTalkMasterData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteToolboxTalkDetails = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.ToolboxTalkDetailsData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.ToolboxTalkDetailsData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteToolboxIncidentMaster = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.ToolboxIncidentMasterData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.ToolboxIncidentMasterData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteToolboxIncidentDetails = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.ToolboxIncidentDetailsData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.ToolboxIncidentDetailsData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteWICMaster = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.WorkplaceInspectionChecklistMasterData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.WorkplaceInspectionChecklistMasterData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteWICMDetails = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.WorkplaceInspectionChecklistMasterDetailsData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.WorkplaceInspectionChecklistMasterDetailsData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteCARMaster = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.CorrectiveActionReportMasterData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.CorrectiveActionReportMasterData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const deleteCARMDetails = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `MasterId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,MasterId"],
      filter: filterQuery,
      listName: ListNames.CorrectiveActionReportDetailsData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.CorrectiveActionReportDetailsData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};
// export const deleteSkillMatrixInfo = async (
//   provider: IDataProvider,
//   deleteIDsArray: any
// ) => {
//   try {
//     if (deleteIDsArray && deleteIDsArray.length > 0) {
//       const updateItems = deleteIDsArray.map((id: any) => ({
//         Id: id,
//         IsDeleted: true,
//       }));

//       await provider.updateListItemsInBatchPnP(
//         ListNames.SkillMatrixInfo,
//         updateItems
//       );
//     }
//   } catch (error) {
//     console.log("Error in deleteSkillMatrixInfo:", error);
//   }
// };

export const deleteSkillMatrixInfo = async (
  provider: IDataProvider,
  deleteIDsArray: any,
  siteNameId: number
) => {
  try {
    if (!Array.isArray(deleteIDsArray) || deleteIDsArray.length === 0 || !siteNameId) {
      console.warn("Missing deleteIDsArray or SiteNameId");
      return;
    }

    // Create filter for SkillMatrixId + SiteNameId
    const filterQuery = `(${deleteIDsArray
      .map((id: any) => `SkillMatrixId eq '${id}'`)
      .join(" or ")}) and SiteNameId eq '${siteNameId}'`;

    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID", "SkillMatrixId", "SiteNameId"],
      filter: filterQuery,
      listName: ListNames.SkillMatrixInfo,
    };

    const results = await provider.getItemsByQuery(queryStringOptions);

    if (results && results.length > 0) {
      const UpdateItem = results.map((item) => ({
        Id: item.ID,
        IsDeleted: true,
      }));

      await provider.updateListItemsInBatchPnP(ListNames.SkillMatrixInfo, UpdateItem);
    }
  } catch (ex) {
    console.log("Error in deleteSkillMatrixInfo:", ex);
  }
};


export const deleteSkillMatrixMaster = async (
  provider: IDataProvider,
  deleteIDsArray: any
) => {
  try {
    const filterQuery = deleteIDsArray
      .map((id: any) => `SkillMatrixId eq '${id}'`)
      .join(" or ");
    const queryStringOptions: IPnPQueryOptions = {
      select: ["ID,SkillMatrixId"],
      filter: filterQuery,
      listName: ListNames.SkillMatrixMasterData,
    };
    provider
      .getItemsByQuery(queryStringOptions)
      .then(async (results: any[]) => {
        if (!!results && results.length > 0) {
          const UpdateItem = results.map((item) => ({
            Id: item.Id,
            IsDeleted: true,
          }));
          await provider.updateListItemsInBatchPnP(
            ListNames.SkillMatrixMasterData,
            UpdateItem
          );
        }
      })
      .catch((error: any) => {
        console.log(error);
      });
  } catch (ex) {
    console.log(ex);
  }
};

export const getDataSorted = (items: any[], columnName: string) => {
  let sortedItems = [];
  sortedItems = items?.sort(function (a, b) {
    return a[columnName] > b[columnName]
      ? 1
      : a[columnName] < b[columnName]
        ? -1
        : 0;
  });
  return sortedItems;
};
export const formatPriceDecimal = (price: any, locale = "en-US", currency = "USD") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};
export const parsePriceNumber = (price: any): number | null => {
  if (!price) return null;

  return Number(
    price
      .toString()
      .replace(/,/g, "")     // remove thousand separators
      .replace(/[^\d.]/g, "") // remove currency symbols if any
  );
};

export const formatPrice = (price: any, locale = "en-US", currency = "USD") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

export const _isExpired = (givenFullDate: string): boolean => {
  if (!givenFullDate) return false;
  return moment(givenFullDate).isBefore(moment());
};

export const _isWithinNextMonthRange = (givenFullDate: string): boolean => {
  if (!givenFullDate) return false;
  const today = moment().startOf('day');
  const oneMonthFromNow = moment().add(1, 'month').endOf('day');
  const date = moment(givenFullDate);
  return date.isSameOrAfter(today) && date.isSameOrBefore(oneMonthFromNow);
};




export const getUserProfilePicture = (
  context: any,
  accountName: string,
  size?: string | "M"
) => {
  try {
    return `${context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${accountName}&size=${size}`;
  } catch (ex) { }
};

export function parseIndianFormattedNumber(str: any) {
  if (typeof str === "string") {
    const cleaned = str.replace(/,/g, "");
    return Number(cleaned);
  } else {
    // Remove all commas
    let value = String(str);
    const cleaned = value?.replace(/,/g, "");
    // Convert to number
    return Number(cleaned);
  }
}

export const mapSingleValue = (
  value: any,
  type: DataType,
  defaultValue?: any,
  Id?: number,
  context?: any,
  ListInternalName?: string,
  lookWithDate?: boolean
): any => {
  switch (type) {
    case DataType.number:
      return !!value ? Number(value) : defaultValue ? defaultValue : 0;
      break;
    case DataType.numberOnly:
      return !!value
        ? parseIndianFormattedNumber(value)
        : defaultValue
          ? defaultValue
          : 0;
      break;
    case DataType.JsonParse:
      let valueJson = !!value ? value : "";
      return !!valueJson ? JSON.parse(valueJson) : ""
      break;

    case DataType.ImageJson:
      // eslint-disable-next-line no-case-declarations
      let valueImage = !!value ? value : "";
      // eslint-disable-next-line no-case-declarations
      let imageUrl: string = "";
      if (!!valueImage) {
        let imageData = JSON.parse(valueImage);
        if (imageData.serverRelativeUrl) {
          imageUrl = imageData.serverRelativeUrl;
        } else {
          const fixImgURL =
            context.pageContext.web.serverRelativeUrl +
            `/Lists/${ListInternalName}/Attachments/` +
            mapSingleValue(Id, DataType.number) +
            "/";
          const fileName = imageData.fileName;
          imageUrl = `${fixImgURL}${fileName}`;
        }
      }
      return imageUrl;
      break;
    case DataType.ImageName:
      // eslint-disable-next-line no-case-declarations
      let valueImageName = !!value ? value : "";
      // eslint-disable-next-line no-case-declarations
      let imageName: string = "";
      if (!!valueImageName) {
        let imageDataName = JSON.parse(valueImageName);
        if (imageDataName.fileName) {
          imageName = imageDataName.fileName;
        } else {
          const fileName = imageDataName.fileName;
          imageName = fileName;
        }
      }
      return imageName;
      break;

    case DataType.Image:
      if (!!value) {
        let imageUrl: string = "";
        if (!!value.serverRelativeUrl) {
          imageUrl = value.serverRelativeUrl;
        } else {
          const fixImgURL =
            context.pageContext.web.serverRelativeUrl +
            `/Lists/${ListInternalName}/Attachments/` +
            mapSingleValue(Id, DataType.number) +
            "/";
          const fileName = value.fileName;
          imageUrl = `${fixImgURL}${fileName}`;
        }
        return imageUrl;
      } else {
        return "";
      }

      break;
    case DataType.string:
      return !!value ? value : !!defaultValue ? defaultValue : "";
      break;
    case DataType.lookup:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return {
          Id: mapSingleValue(item.lookupId, DataType.number),
          value: !!lookWithDate
            ? mapSingleValue(item.lookupValue, DataType.Date)
            : mapSingleValue(item.lookupValue, DataType.string),
        };
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.ChoiceMultiple:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((i) => i);
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.lookupMuilt:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((i) => {
          return {
            Id: mapSingleValue(i.lookupId, DataType.number),
            value: !!lookWithDate
              ? mapSingleValue(i.lookupValue, DataType.Date)
              : mapSingleValue(i.lookupValue, DataType.string),
          };
        });
      }
      return !!defaultValue ? defaultValue : "";

    case DataType.lookupIdMuilt:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((i: any) =>
          mapSingleValue(i.lookupId, DataType.number)
        );
      }
      return !!defaultValue ? defaultValue : "";
    case DataType.lookupValue:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return !!value
          ? !!lookWithDate
            ? mapSingleValue(item.lookupValue, DataType.Date)
            : mapSingleValue(item.lookupValue, DataType.string)
          : "";
      }
      return !!defaultValue ? defaultValue : "";
    case DataType.lookupId:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return !!value ? mapSingleValue(item.lookupId, DataType.number) : "";
      }
      return !!defaultValue ? defaultValue : "";

    case DataType.YesNo:
      return !!value ? String(value) : "";
      break;
    case DataType.TrueYesNo:
      return value != undefined ? (value ? "Yes" : "No") : "";
      break;
    case DataType.Boolean:
      return value != undefined ? value : "";
      break;
    case DataType.YesNoTrue:
      return !!value ? (value == "Yes" ? true : false) : "";
      break;
    case DataType.YesNoTrueOnly:
      return !!value ? (value == "Yes" ? true : false) : false;
      break;
    case DataType.peoplePicker:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return {
          Id: mapSingleValue(item.id, DataType.number),
          emailId: mapSingleValue(item.email, DataType.string),
          title: mapSingleValue(item.title, DataType.string),
        };
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.peoplePickerMultiple:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((i) => {
          return {
            Id: mapSingleValue(i.id, DataType.number),
            emailId: mapSingleValue(i.email, DataType.string),
            title: mapSingleValue(i.title, DataType.string),
            imageURl: mapSingleValue(
              i.email,
              DataType.userImage,
              null,
              0,
              context
            ),
          };
        });
      }
      return !!defaultValue ? defaultValue : [];
      break;
    case DataType.peopleIdMuilt:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((i) => mapSingleValue(i.id, DataType.number));
      }
      return !!defaultValue ? defaultValue : [];
      break;
    case DataType.peoplePickerExpand:
      if (!!value) {
        return {
          Id: mapSingleValue(value.Id, DataType.number),
          emailId: mapSingleValue(value.EMail, DataType.string),
          title: mapSingleValue(value.Title, DataType.string),
        };
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.peopleExpandMuilt:
      if (!!value && Array.isArray(value) && value.length > 0) {
        return value.map((val) => {
          return {
            Id: mapSingleValue(val.Id, DataType.number),
            emailId: mapSingleValue(val.EMail, DataType.string),
            title: mapSingleValue(val.Title, DataType.string),
          };
        });
      }
      return !!defaultValue ? defaultValue : [];
      break;
    case DataType.peopleEmail:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return item.email ? mapSingleValue(item.email, DataType.string) : "";
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.peopleId:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return item.id ? mapSingleValue(item.id, DataType.number) : "";
      }
      return !!defaultValue ? defaultValue : "";
      break;
    case DataType.peopleTitle:
      if (!!value && Array.isArray(value) && value.length > 0) {
        const item = value[0];
        return item.title ? mapSingleValue(item.title, DataType.string) : "";
      }
      return !!defaultValue ? defaultValue : "";
      break;

    case DataType.stringArray:
      return !!value && Array.isArray(value) && value.length > 0 ? value : [];
      break;
    case DataType.Date:
      return !!value ? moment(value).format(DateFormat) : "";
      break;
    case DataType.newDate:
      return !!value ? new Date(value) : undefined;
      break;
    case DataType.DateRUndefined:
      return !!value ? moment(value).format(DateFormat) : undefined;
      break;
    case DataType.DateTime:
      return !!value
        ? moment(value).format(DateTimeFormate)
        : defaultValue
          ? defaultValue
          : undefined;
      break;
    case DataType.DateDDMMYYY:
      return !!value
        ? moment(value).format("DD-MM-YYYY")
        : defaultValue
          ? defaultValue
          : undefined;
      break;
    case DataType.userImage:
      return !!value ? getUserProfilePicture(context, value) : "";
      break;

    case DataType.Hyperlink:
      return {
        Description: value?.Description,
        Url: value?.Url,
      };
      break;
    default:
      console.warn(`Unsupported data type: ${type}`);
      return value;
  }
};

export function _copyAndSort<T>(
  items: T[],
  columnKey: string,
  isSortedDescending?: boolean
): T[] {
  const key = columnKey as keyof T;
  return items
    .slice(0)
    .sort((a: T, b: T) =>
      (isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1
    );
}
// export const convertStringToPhoneMask = (value: string, pattern: any) => {
//     value = value.replace(/[^0-9]/g, "");
//     let i = 0, v = value.toString();
//     let convertedValue = pattern.replace(/_/g, (_: any) => v[i++]);
//     return convertedValue;
// }

export const convertStringToPhoneMask = (
  value: string | undefined,
  pattern: any
) => {
  value = value || ""; // Default to empty string if undefined
  value = value.replace(/[^0-9]/g, "");
  let i = 0,
    v = value.toString();
  let convertedValue = pattern.replace(/_/g, (_: any) => v[i++] ?? "");
  return convertedValue;
};

export function _copyAndSortNew<T>(
  items: T[],
  columnKey: string,
  isSortedDescending?: boolean
): T[] {
  const key = columnKey as keyof T;

  // Check if the column key refers to a Date or a string that can be parsed into a Date
  return items.slice(0).sort((a: T, b: T) => {
    const valueA: any = a[key];
    const valueB: any = b[key];

    // Check if the values are Date objects or date strings that can be parsed into Date
    const isDate = (date: any) =>
      date instanceof Date || !isNaN(Date.parse(date));

    let comparison = 0;

    if (isDate(valueA) && isDate(valueB)) {
      // If both values are Date-like, compare them as Dates
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      comparison = dateA.getTime() - dateB.getTime(); // Compare the timestamps
    } else {
      // For non-date values, perform a regular comparison
      comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    }

    // If sorting in descending order, reverse the comparison result
    return isSortedDescending ? -comparison : comparison;
  });
}

export const getTableHeight = (topHeight: number): number => {
  if (document.getElementsByClassName("table-container-inline").length > 0) {
    const detailListHeight = document.getElementsByClassName(
      "table-container-inline"
    )[0].clientHeight;
    const fullHeight = Math.round(window.innerHeight) - topHeight;
    return detailListHeight < fullHeight ? detailListHeight + 20 : fullHeight;
  } else {
    return Math.round(window.innerHeight) - topHeight;
  }
};
export const generateId = () => {
  return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const allowOnlyNumericInput = (value: string): string => {
  value = value.replace(/[^\d.-]/g, "");
  if (value.indexOf("-") > 0) {
    value = value.replace(/-/g, "");
  } else {
    const parts = value.split("-");
    if (parts.length > 2) {
      value = "-" + parts.join("");
    }
  }
  const parts = value.split(".");
  if (parts.length > 2) {
    value = parts[0] + "." + parts.slice(1).join("");
  }
  return value;
};

export function sortByMonth(
  arr: any[],
  columnName: string,
  descending = false
) {
  return arr.sort((a, b) => {
    // return descending ? b.month - a.month : a.month - b.month;
    return descending
      ? b[columnName] - a[columnName]
      : a[columnName] - b[columnName];
  });
}

export const getCurrentFinancialYear = () => {
  const today = new Date();
  const month = today.getMonth(); // 0 = Jan, 6 = July
  const year = today.getFullYear();

  if (month >= 6) {
    // July to December
    return { startYear: year, label: `${year}-${year + 1}` };
  } else {
    // January to June
    return { startYear: year - 1, label: `${year - 1}-${year}` };
  }
};

// export const generateFinancialWeeksAuto = (pastWeeksCount: number = 2) => {
//     const { startYear, label } = getCurrentFinancialYear();
//     const startDate = new Date(startYear, 6, 1); // July 1
//     const endDate = new Date(startYear + 1, 5, 30); // June 30

//     const formatDate = (date: Date): string => {
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const year = date.getFullYear();
//         return `${day}-${month}-${year}`;
//     };

//     const day = startDate.getDay();
//     const offset = day === 0 ? -6 : 1 - day;
//     let currentStart = new Date(startDate);
//     currentStart.setDate(currentStart.getDate() + offset);

//     const weeks: any[] = [];
//     let weekNumber = 1;
//     const today = new Date();
//     let currentWeekIndex = -1;

//     while (currentStart <= endDate) {
//         const currentEnd = new Date(currentStart);
//         currentEnd.setDate(currentStart.getDate() + 6);

//         const startStr = formatDate(currentStart);
//         const endStr = formatDate(currentEnd > endDate ? endDate : currentEnd);

//         const week = {
//             weekNumber: weekNumber,
//             startDate: startStr,
//             endDate: endStr,
//             label: `Week ${weekNumber}-(${startStr} - ${endStr})`,
//             value: weekNumber
//         };

//         weeks.push(week);

//         // Determine if today's date falls within this week
//         if (today >= currentStart && today <= currentEnd) {
//             currentWeekIndex = weekNumber - 1;
//         }

//         weekNumber++;
//         currentStart.setDate(currentStart.getDate() + 7);
//     }

//     const selectedWeeks =
//         currentWeekIndex >= 0
//             ? weeks.slice(Math.max(0, currentWeekIndex - pastWeeksCount), currentWeekIndex + 1)
//             : [];

//     return {
//         financialYear: label,
//         currentWeek: currentWeekIndex >= 0 ? weeks[currentWeekIndex] : null,
//         selectedWeeks, // current week + past N weeks
//         allWeeks: weeks
//     };
// };

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};
// export const generateFinancialWeeksAuto = (
//     financialYearLabel: string,
//     pastWeeksCount: number = 2
// ) => {
//     // Parse financial year string, e.g., "2024-2025"
//     const [startYearStr, endYearStr] = financialYearLabel.split('-');
//     const startYear = parseInt(startYearStr, 10);

//     const startDate = new Date(startYear, 6, 1); // July 1
//     const endDate = new Date(startYear + 1, 5, 30); // June 30 next year

//     const formatDate2 = (date: Date): string => {
//         const day = String(date.getDate()).padStart(2, '0');
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         return `${day}-${month}`;
//     };

//     const day = startDate.getDay();
//     const offset = day === 0 ? -6 : 1 - day;
//     let currentStart = new Date(startDate);
//     currentStart.setDate(currentStart.getDate() + offset);

//     const weeks: any[] = [];
//     let weekNumber = 1;
//     const today = new Date();
//     let currentWeekIndex = -1;

//     while (currentStart <= endDate) {
//         const currentEnd = new Date(currentStart);
//         currentEnd.setDate(currentStart.getDate() + 6);

//         const startStr = formatDate(currentStart);
//         const endStr = formatDate(currentEnd > endDate ? endDate : currentEnd);
//         const labelStart = formatDate2(currentStart);
//         const labelEnd = formatDate2(currentEnd > endDate ? endDate : currentEnd);

//         const week = {
//             weekNumber: weekNumber,
//             startDate: startStr,
//             endDate: endStr,
//             label: `Week ${weekNumber} - (${labelStart} to ${labelEnd})`,
//             // label: `Week ${weekNumber}`,
//             value: weekNumber,
//             year: financialYearLabel
//         };

//         weeks.push(week);

//         if (today >= currentStart && today <= currentEnd) {
//             currentWeekIndex = weekNumber - 1;
//         }

//         weekNumber++;
//         currentStart.setDate(currentStart.getDate() + 7);
//     }

//     const selectedWeeks =
//         currentWeekIndex >= 0
//             ? weeks.slice(Math.max(0, currentWeekIndex - pastWeeksCount), currentWeekIndex + 1)
//             : [];

//     const selectedMonthsSet = new Set<number>();
//     selectedWeeks.forEach((week) => {
//         const [day, month] = week.startDate.split('-');
//         selectedMonthsSet.add(Number(month));
//     });

//     const selectedMonths = Array.from(selectedMonthsSet);

//     return {
//         financialYear: financialYearLabel,
//         currentWeek: currentWeekIndex >= 0 ? weeks[currentWeekIndex] : null,
//         selectedWeeks,
//         selectedMonths,
//         allWeeks: weeks
//     };
// };

export const generateFinancialWeeksAuto = (
  financialYearLabel: string,
  pastWeeksCount: number = 2
) => {
  // Parse financial year string, e.g., "2024-2025"
  const [startYearStr, endYearStr] = financialYearLabel.split("-");
  const startYear = parseInt(startYearStr, 10);

  const startDate = new Date(startYear, 6, 1); // July 1
  const endDate = new Date(startYear + 1, 5, 30); // June 30 next year

  const formatDate2 = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}`;
  };

  const day = startDate.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  let currentStart = new Date(startDate);
  currentStart.setDate(currentStart.getDate() + offset);

  const weeks: any[] = [];
  let weekNumber = 1;
  const today = new Date();
  let currentWeekIndex = -1;

  const getTotalWorkingDaysInMonth = (month: number, year: number): number => {
    // Get the number of days in the given month
    const date = new Date(year, month, 0);
    const daysInMonth = date.getDate(); // Number of days in the month

    let workingDaysInMonth = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month - 1, i).getDay();
      if (day >= 1 && day <= 5) {
        workingDaysInMonth++; // Count Monday to Friday as working days
      }
    }
    return workingDaysInMonth;
  };

  const getWorkingDaysCountByMonth = (
    start: Date,
    end: Date
  ): { month: number; year: number; workingCount: number }[] => {
    const workingDays: { [key: string]: number } = {}; // key = "month-year", value = count of working days

    let current = new Date(start);
    while (current <= end) {
      if (current.getDay() >= 1 && current.getDay() <= 5) {
        // Monday to Friday are working days
        const month = current.getMonth() + 1; // Get 1-12 for months
        const year = current.getFullYear(); // Get the year (important if spanning across years)
        const key = `${month}-${year}`;

        if (!workingDays[key]) {
          workingDays[key] = 0;
        }
        workingDays[key]++;
      }
      current.setDate(current.getDate() + 1);
    }

    return Object.entries(workingDays).map(([key, count]) => {
      const [month, year] = key.split("-");
      const totalWorkingDaysInMonth = getTotalWorkingDaysInMonth(
        Number(month),
        Number(year)
      );
      return {
        month: Number(month),
        year: Number(year),
        workingCount: count,
        totalworkingCount: totalWorkingDaysInMonth,
      };
    });
  };

  while (currentStart <= endDate) {
    const currentEnd = new Date(currentStart);
    currentEnd.setDate(currentStart.getDate() + 6);

    const startStr = formatDate(currentStart);
    const endStr = formatDate(currentEnd > endDate ? endDate : currentEnd);
    const labelStart = formatDate2(currentStart);
    const labelEnd = formatDate2(currentEnd > endDate ? endDate : currentEnd);

    const week = {
      weekNumber: weekNumber,
      startDate: startStr,
      endDate: endStr,
      label: `Week ${weekNumber} - (${labelStart} to ${labelEnd})`,
      // label: `Week ${weekNumber}`,
      value: weekNumber,
      year: financialYearLabel,
      weekFilter: `Week-${weekNumber}`,
      workingDaysCountByMonth: getWorkingDaysCountByMonth(
        currentStart,
        currentEnd
      ),
    };

    weeks.push(week);

    if (today >= currentStart && today <= currentEnd) {
      currentWeekIndex = weekNumber - 1;
    }

    weekNumber++;
    currentStart.setDate(currentStart.getDate() + 7);
  }

  const selectedWeeks =
    currentWeekIndex >= 0
      ? weeks.slice(
        Math.max(0, currentWeekIndex - pastWeeksCount),
        currentWeekIndex + 1
      )
      : [];

  const selectedMonthsSet = new Set<number>();
  selectedWeeks.forEach((week) => {
    const [day, month] = week.startDate.split("-");
    selectedMonthsSet.add(Number(month));
  });

  const selectedMonths = Array.from(selectedMonthsSet);

  return {
    financialYear: financialYearLabel,
    currentWeek: currentWeekIndex >= 0 ? weeks[currentWeekIndex] : null,
    // selectedWeeks: weeks.slice(46, 49),
    selectedWeeks: selectedWeeks,
    selectedMonths,
    allWeeks: weeks,
  };
};

export function getFinancialYearYear(month: number, financialYear: string) {
  if (typeof month !== "number" || month < 1 || month > 12) {
  }

  const [startYear, endYear] = financialYear.split("-").map(Number);

  if (!startYear || !endYear || endYear !== startYear + 1) {
  }

  // Months 7 to 12 belong to the start year, 1 to 6 belong to the end year
  return month >= 7 ? startYear : endYear;
}

export const getFinancialYearOptions = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 6 = July, 11 = Dec

  // Determine current financial year start
  let startYear = month >= 6 ? year : year - 1;

  const formatFY = (start: number) => {
    const end = start + 1;
    const label = `${String(start % 100).padStart(2, "0")}-${String(
      end % 100
    ).padStart(2, "0")}`;
    const value = `${start}-${end}`;
    return { label, value };
  };

  const currentFY = formatFY(startYear);

  const finYearOption = [
    formatFY(startYear - 2),
    formatFY(startYear - 1),
    currentFY,
  ];

  return {
    currentFinancialYear: currentFY,
    finYearOption,
  };
};

const monthLabels = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const getMonthOptions = (
  year: number = new Date().getFullYear()
): any[] => {
  const getWorkingDaysCountByMonth = (
    start: Date,
    end: Date
  ): { month: number; year: number; count: number } => {
    let workingDaysCount = 0;

    let current = new Date(start);
    while (current <= end) {
      if (current.getDay() >= 1 && current.getDay() <= 5) {
        // Monday to Friday are working days
        workingDaysCount++;
      }
      current.setDate(current.getDate() + 1);
    }

    return {
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      count: workingDaysCount,
    };
  };

  let monthOptions: any[] = [];

  for (let index = 0; index < 12; index++) {
    const start = new Date(year, index, 1);
    const end = new Date(year, index + 1, 0);

    const workingDays = getWorkingDaysCountByMonth(start, end);

    monthOptions.push({
      label: monthLabels[index] || "",
      value: index + 1,
      startDate: formatDate(start),
      endDate: formatDate(end),
      workingDaysCountByMonth: [
        {
          month: workingDays.month,
          year: workingDays.year,
          workingCount: workingDays.count,
          totalworkingCount: workingDays.count,
        },
      ],
    });
  }

  return monthOptions;
};

// export const isDateInRange = (dateStr: any, startDateStr: any, endDateStr: any) => {
//     // Convert date strings into Date objects
//     const formatDate = (dateStr: any) => {
//         const [day, month, year] = dateStr.split('-').map((num: any) => parseInt(num));
//         return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
//     };

//     const date = formatDate(dateStr);
//     const startDate = formatDate(startDateStr);
//     const endDate = formatDate(endDateStr);

//     // Check if the date is within the range (inclusive)
//     return date >= startDate && date <= endDate;
// }

export const getObjectWithDateInRange = (
  dateArr: any[],
  startDateStr: string,
  endDateStr: string
) => {
  // Convert date strings into Date objects
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr
      .split("-")
      .map((num: any) => parseInt(num));
    return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
  };

  const startDate = formatDate(startDateStr);
  const endDate = formatDate(endDateStr);

  // Loop through the array and check for a date match
  const result = dateArr.filter((obj: any) => {
    const date = formatDate(obj.Date);
    return date >= startDate && date <= endDate;
  });

  // If a match is found, return the object, otherwise return an empty string
  return result || "";
};

export const getObjectWithDate = (dateArr: any[], targetDateStr: string) => {
  // Convert date strings into Date objects
  const formatDate = (dateStr: string) => {
    const [day, month, year] = dateStr
      .split("-")
      .map((num: any) => parseInt(num));
    return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
  };

  const targetDate = formatDate(targetDateStr);

  // Loop through the array and check for a date match (by year, month, day)
  const result = dateArr.filter((obj: any) => {
    const date = formatDate(obj.Date);
    return (
      date.getFullYear() === targetDate.getFullYear() &&
      date.getMonth() === targetDate.getMonth() &&
      date.getDate() === targetDate.getDate()
    );
  });

  // Return the matching object(s), or an empty string if none found
  return result.length > 0 ? result : "";
};

export const uniqueArray = (arr: any) => {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (result.indexOf(arr[i]) === -1) {
      result.push(arr[i]);
    }
  }
  return result;
};

export const transformData = (data: any) => {
  let parsedData: any;

  if (!data) {
    return [];
  }
  try {
    parsedData = typeof data === "string" ? JSON.parse(data) : data;
  } catch (error) {
    // If an error occurs during JSON.parse, return an empty string
    console.error("Error parsing JSON:", error);
    return [];
  }

  // If parsing is successful, proceed with transformation
  return Object.entries(parsedData).map(([key, value]) => {
    // Handle the case where value is an empty string ("")
    const hours = value === "" ? 0 : Number(value);

    return {
      dateDay: Number(key),
      hours: hours,
    };
  });
};

export const transformMonthData = (data: string) => {
  // Parse the input data
  let parsedData: any;
  if (!data) {
    return [];
  }
  try {
    parsedData = JSON.parse(data);
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return [];
  }

  // Month names map for reference
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Transform the data
  return Object.entries(parsedData).map(([monthName, value]) => {
    // Get the month number (1-12)
    const monthNumber = monthNames.indexOf(monthName) + 1;

    return {
      label: monthName,
      hours: Number(value),
      month: monthNumber,
    };
  });
};

export function processDays(
  obj: any
): { dayName: string; hours: number; isPublicHoliday: boolean }[] {
  const daysOfWeek = [
    "PublicHoliday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const result = [];

  for (let day of daysOfWeek) {
    const dayData = {
      dayName: day,
      hours: Number(obj[day]) || 0, // You can replace 0 with a default value you prefer
      isPublicHoliday: day === "PublicHoliday" ? true : false,
    };
    result.push(dayData);
  }

  return result;
}

export function getFinancialYearStartDate(
  financialYear: string,
  effectiveFrom: string
): string {
  const [startYear, endYear] = financialYear.split("-").map(Number);

  const month = parseInt(effectiveFrom.split("-")[1]);

  let year = startYear;
  if (month < 7) {
    year = endYear;
  }
  const startDate = new Date(year, month - 1, 1); // Month is 0-indexed in JavaScript Date

  const day = String(startDate.getDate()).padStart(2, "0");
  const formattedMonth = String(startDate.getMonth() + 1).padStart(2, "0");
  const formattedYear = startDate.getFullYear();
  return `${day}-${formattedMonth}-${formattedYear}`;
}

export const transformDataPeriodicHours = (
  data: any,
  month?: number,
  year?: string
) => {
  // Default to current month and year if not provided
  month = month ?? new Date().getMonth() + 1; // month is 0-indexed, so add 1
  year = year ?? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

  // Split the year input to get the starting year and ending year (e.g., '2024-2025')
  const [startYear, endYear] = year.split("-");

  // Determine the correct year based on the month
  let adjustedYear = "";
  if (month >= 7 && month <= 12) {
    // If month is between July and December, use the start year (e.g., 2024)
    adjustedYear = startYear;
  } else {
    // If month is between January and June, use the end year (e.g., 2025)
    adjustedYear = endYear;
  }

  // Format the date as DD-MM-YYYY for each entry
  return data.map((entry: any) => {
    const { dateDay, hours } = entry;

    // Pad the day and month to ensure they are two digits (e.g., 01, 02, ...)
    const day = String(dateDay).padStart(2, "0");
    const formattedMonth = String(month).padStart(2, "0");
    const formattedDate = `${day}-${formattedMonth}-${adjustedYear}`;

    return {
      Date: formattedDate, // Full date in DD-MM-YYYY format
      hours: Number(hours),
      year: adjustedYear, // The calculated financial year
    };
  });
};

// export const calculateTotalFromDayValues = (
//     yearRange: string,  // '2024-2025'
//     month: number,
//     publicHolidays: string[] | null,
//     dayValues: { dayName: string, hours: number, isPublicHoliday: boolean }[],
//     weekRange: any[]
// ) => {
//     // Split the year range into startYear and endYear
//     const [startYear, endYear] = yearRange.split('-').map(year => parseInt(year, 10));

//     // Determine the correct year to use based on the month
//     const year = month <= 6 ? endYear : startYear;

//     // Create a Set of public holidays for fast lookup
//     const publicHolidaySet = new Set(
//         // (publicHolidays || []).map(date => moment(date).format("YYYY-MM-DD"))
//         (publicHolidays || []).map(date => moment(date).format("YYYY-MM-DD"))
//     );

//     const daysInMonth = moment(`${year}-${month}`, "YYYY-M").daysInMonth();
//     let total = 0;

//     console.log("Date-wise Breakdown:");
//     let fullMonth: any[] = []
//     for (let day = 1; day <= daysInMonth; day++) {
//         const date = moment({ year, month: month - 1, day });
//         const dateStr = date.format("YYYY-MM-DD");
//         const dayName = date.format("dddd"); // Get day of the week (e.g., "Monday")

//         // Check if the current date is a public holiday
//         const isPublicHoliday = publicHolidaySet.has(dateStr);

//         // Find the corresponding dayValue entry based on the dayName
//         const dayValue = dayValues.find(item => item.dayName === dayName);

//         let hours = 0;

//         if (dayValue) {
//             if (isPublicHoliday || dayValue.isPublicHoliday) {
//                 // If it's a public holiday, take the holiday hours
//                 hours = dayValue.isPublicHoliday ? dayValue.hours : 0;
//             } else {
//                 // Otherwise, use the day-specific hours
//                 hours = dayValue.hours;
//             }
//         }

//         total += hours;
//         console.log(`${dateStr} (${dayName}) => ${hours} hrs`);
//         fullMonth.push({
//             date: moment(dateStr).format('DD-MM-YYYY'),
//             dayName: dayName,
//             hours: hours
//         })
//     }

//     console.log("Total Hours:", total);
//     return { total, fullMonth };
// };
export const calculateTotalFromDayValues = (
  yearRange: string, // '2024-2025'
  month: number,
  publicHolidays: string[] | null,
  dayValues: { dayName: string; hours: number; isPublicHoliday: boolean }[],
  weekRange: any[] // Array of week objects with startDate and endDate
) => {
  // Split the year range into startYear and endYear
  const [startYear, endYear] = yearRange
    .split("-")
    .map((year) => parseInt(year, 10));

  // Determine the correct year to use based on the month
  const year = month <= 6 ? endYear : startYear;

  // Create a Set of public holidays for fast lookup
  const publicHolidaySet = new Set(
    (publicHolidays || []).map((date) => moment(date).format("YYYY-MM-DD"))
  );

  const daysInMonth = moment(`${year}-${month}`, "YYYY-M").daysInMonth();
  let total = 0;

  let fullMonth: any[] = [];

  // Loop through each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment({ year, month: month - 1, day });
    const dateStr = date.format("YYYY-MM-DD");
    const dayName = date.format("dddd"); // Get day of the week (e.g., "Monday")

    // Check if the current date is a public holiday
    const isPublicHoliday = publicHolidaySet.has(dateStr);

    // Find the corresponding dayValue entry based on the dayName
    const dayValue = dayValues.find((item) => item.dayName === dayName);

    let hours = 0;

    // Check if the current date falls within the week range
    const weekInRange = weekRange.find((week) => {
      const weekStart = moment(week.startDate, "DD-MM-YYYY");
      const weekEnd = moment(week.endDate, "DD-MM-YYYY");
      return date.isBetween(weekStart, weekEnd, "day", "[]"); // Check if date is between start and end
    });

    // If the date is within the week range, calculate hours
    if (weekInRange) {
      if (dayValue) {
        if (isPublicHoliday || dayValue.isPublicHoliday) {
          // If it's a public holiday, take the holiday hours
          hours = dayValue.isPublicHoliday ? dayValue.hours : 0;
        } else {
          // Otherwise, use the day-specific hours
          hours = dayValue.hours;
        }
      }

      total += hours;
      fullMonth.push({
        date: date.format("DD-MM-YYYY"),
        dayName: dayName,
        hours: hours,
      });
    }
  }

  return { total, fullMonth };
};

export const convertToUSDateFormat = (dateStr: string): string => {
  const [day, month, year] = dateStr.split("-");
  return `${month}-${day}-${year}`;
};

export const isHoliday = (dateStr: any) => {
  // Split the input string into day, month, and year
  const [day, month, year] = dateStr.split("-").map(Number);

  // Note: months in JavaScript Date are 0-indexed (0 = January, 11 = December)
  const date = new Date(year, month - 1, day);

  // Get the day of the week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay();

  // Return true if it's Saturday (6) or Sunday (0), otherwise false
  return dayOfWeek === 0 || dayOfWeek === 6;
};

// export const generateCalendar = (startDateStr: any, endDateStr: any) => {
//     const parseDate = (dateStr: any) => {
//         const [day, month, year] = dateStr.split('-').map(Number);
//         return new Date(year, month - 1, day);
//     };

//     const formatDate = (date: any) => {
//         const dd = String(date.getDate()).padStart(2, '0');
//         const mm = String(date.getMonth() + 1).padStart(2, '0');
//         const yyyy = date.getFullYear();
//         return `${dd}-${mm}-${yyyy}`;
//     };

//     const startDate = parseDate(startDateStr);
//     const endDate = parseDate(endDateStr);
//     const calendar = [];

//     for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
//         const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
//         const dayName = date.toLocaleString('en-US', { weekday: 'long' });

//         calendar.push({
//             date: formatDate(date),
//             day: dayName,
//             isWeekend: dayOfWeek === 0 || dayOfWeek === 6
//         });
//     }

//     return calendar;
// }

// Example usage:

export const getOverallStartAndEndDate = (weeks: any) => {
  if (!weeks || weeks.length === 0)
    return {
      startDate: "",
      endDate: "",
    };

  const startDates = weeks.map(
    (week: any) => new Date(week.startDate.split("-").reverse().join("-"))
  );
  const endDates = weeks.map(
    (week: any) => new Date(week.endDate.split("-").reverse().join("-"))
  );

  const minStartDate = new Date(Math.min(...startDates));
  const maxEndDate = new Date(Math.max(...endDates));

  // Format back to 'dd-mm-yyyy'
  const formatDate = (date: any) =>
    String(date.getDate()).padStart(2, "0") +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    date.getFullYear();

  return {
    startDate: formatDate(minStartDate),
    endDate: formatDate(maxEndDate),
  };
};

// export const addMissingDates = (mainData: any, calendarDates: any,) => {
//     // calendarDates is an array of date strings, e.g. ['02-06-2025', '03-06-2025', ...]

//     for (const date of mainData) {
//         if (!calendarDates.includes(date)) {
//             calendarDates.push(date);
//         }
//     }

//     return calendarDates;
// }
// export const addMissingDates = (mainData: any[], calendarData: any[]) => {
//     // calendarData is an array of objects with a 'date' property among others

//     // Extract existing dates to check for duplicates
//     // const existingDates = calendarData.map(item => item.date);
//     const existingDates = calendarData;
//     let updateData = mainData

//     for (const date of mainData) {
//         if (!existingDates.includes(date.date)) {
//             // Add new object with blank/default values but updated date
//             updateData.push({
//                 break_Category: "",
//                 client_Business: "",
//                 client_ID: "",
//                 clock_Off: "",
//                 clock_On: "",
//                 count: 1,
//                 daily_Shifts: "",
//                 date: date,  // changed here
//                 employeeNameAdjusted: "",
//                 employee_ID: "",
//                 employee_Name: "",
//                 hours: "",
//                 hours_hh_mm: "",
//                 job: "",
//                 jobCode: "",
//                 jobCodeSub: "",
//                 job_ID: "",
//                 job_Title2: "",
//                 job_Title_Official: "",
//                 location: "",
//                 method: "",
//                 method_Off: "",
//                 method_On: "",
//                 // month: date?.split("-")[1],  // extract month from date string
//                 month: "",  // extract month from date string
//                 monthYear: "",  // "06-2025"
//                 // monthYear: `${date?.split("-")[1]}-${date?.split("-")[2]}`,  // "06-2025"
//                 multiple_Shift_Daily: "",
//                 ordinary_Hours: "",
//                 original_Off: "",
//                 original_On: "",
//                 owner: "",
//                 paid_Breaks: "",
//                 payroll_ID: "",
//                 public_Holiday: "",
//                 service_Territory: "",
//                 shift: "",
//                 shift_Classification: "",
//                 shift_Non_Shift_Check: "",
//                 site_Manager: "",
//                 third_Party_Job_ID: "",
//                 unpaid_Breaks: "",
//                 user: "",
//                 username: "",
//                 week: null,
//                 weekday: "",  // Could be empty or you could calculate based on date
//                 work_Window: "",
//                 // year: date?.split("-")[2]
//                 year: ""
//             });
//         }
//     }

//     return updateData;
// };
export const addMissingDates = (mainData: any[], calendarData: any[]) => {
  // Extract existing dates from mainData
  const existingDates = mainData.map((item) => item.date);

  // Create a shallow copy so original mainData is not mutated
  const updatedData = [...mainData];

  for (const calendarDateObj of calendarData) {
    const dateStr = calendarDateObj;

    if (!existingDates.includes(dateStr)) {
      updatedData.push({
        break_Category: "",
        client_Business: "",
        client_ID: "",
        clock_Off: "",
        clock_On: "",
        count: 1,
        daily_Shifts: "",
        date: dateStr,
        employeeNameAdjusted: "",
        employee_ID: "",
        employee_Name: "",
        hours: "",
        hours_hh_mm: "",
        job: "",
        jobCode: "",
        jobCodeSub: "",
        job_ID: "",
        job_Title2: "",
        job_Title_Official: "",
        location: "",
        method: "",
        method_Off: "",
        method_On: "",
        month: dateStr?.split("-")[1], // "06"
        monthYear: `${dateStr?.split("-")[1]}-${dateStr.split("-")[2]}`, // "06-2025"
        multiple_Shift_Daily: "",
        ordinary_Hours: "",
        original_Off: "",
        original_On: "",
        owner: "",
        paid_Breaks: "",
        payroll_ID: "",
        public_Holiday: "",
        service_Territory: "",
        shift: "",
        shift_Classification: "",
        shift_Non_Shift_Check: "",
        site_Manager: "",
        third_Party_Job_ID: "",
        unpaid_Breaks: "",
        user: "",
        username: "",
        week: null,
        weekday: "", // Optional: derive using new Date(dateStr).getDay()
        work_Window: "",
        year: dateStr?.split("-")[2], // "2025"
      });
    }
  }

  return updatedData;
};

function parseDate(dateStr: any) {
  // Helper function to parse a date string in DD-MM-YYYY format
  const parts = dateStr.split("-");
  if (parts.length !== 3) {
    return null; // Invalid format
  }
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return null; // Not a number
  }
  // Month is 0-indexed in JavaScript Date objects
  const date = new Date(year, month - 1, day);
  // Validate the date (check if the parsed date matches the input)
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null; // Invalid date (e.g., 31-02-2024)
  }
  return date;
}

export const generateCalendar = (startDateStr: any, endDateStr: any) => {
  // Function to generate a calendar (list of dates) between a start and end date.
  // Dates are provided and returned in DD-MM-YYYY format.
  const startDate = parseDate(startDateStr);
  const endDate = parseDate(endDateStr);
  if (!startDate || !endDate) {
    console.error("Invalid date format. Please use DD-MM-YYYY.");
    return [];
  }
  if (startDate > endDate) {
    console.error("Start date must be before end date.");
    return [];
  }
  let currentDate = new Date(startDate); // Create a copy to avoid modifying the original
  const calendar = [];
  while (currentDate <= endDate) {
    calendar.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1); // Increment to the next day
  }
  return calendar;
};

function formatWeeklyHours(weeklyHoursData: any) {
  const weeklyHours: any = {};
  weeklyHoursData.forEach((dayData: any) => {
    weeklyHours[dayData.dayName] = dayData.hours;
  });
  return weeklyHours;
}

export function getDistributedHours(
  startDate: any,
  endDate: any,
  weeklyHours: any[],
  holiday: any[]
) {
  const results = [];
  startDate = moment(startDate, "DD-MM-YYYY").format("YYYY-MM-DD");
  endDate = moment(endDate, "DD-MM-YYYY").format("YYYY-MM-DD");
  let current = moment(startDate);
  const end = moment(endDate);
  const weekData = formatWeeklyHours(weeklyHours); // Format weeklyHours data
  while (current.isSameOrBefore(end)) {
    const dayName = current.format("dddd"); // e.g., "Monday"
    const date = current.format("DD-MM-YYYY");
    let hours = 0;
    if (holiday?.length > 0) {
      const isHoliday = holiday.includes(date); // Use includes for array check
      hours = isHoliday
        ? weekData["PublicHoliday"] || 0
        : weekData[dayName] || 0;
    } else {
      hours = weekData[dayName] || 0;
    }
    results.push({
      date: date,
      day: dayName,
      hours: hours,
    });
    current.add(1, "day");
  }
  return results;
}

// export function getDistributedHours(startDate: any, endDate: any, weeklyHours: any[], holiday: any[]) {
//     if (!startDate || !endDate || !weeklyHours) {
//         throw new Error('startDate, endDate, and weeklyHours are required.');
//     }

//     const results = [];
//     startDate = moment(startDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
//     endDate = moment(endDate, 'DD-MM-YYYY').format('YYYY-MM-DD')
//     let current = moment(startDate);
//     const end = moment(endDate);

//     if (!current.isValid() || !end.isValid()) {
//         throw new Error('Invalid date format. Use YYYY-MM-DD.');
//     }
//     const weekData = formatWeeklyHours(weeklyHours);
//     while (current.isSameOrBefore(end)) {
//         const dayName: any = current.format('dddd'); // 'Monday', 'Tuesday', etc.
//         results.push({
//             date: current.format('DD-MM-YYYY'),
//             day: dayName,
//             hours: weekData[dayName] || 0
//         });
//         current.add(1, 'day');
//     }

//     return results;
// }

export function isWeekInDynamicRange(inputWeekNumber: any, selectedWeeks: any) {
  // Extract the week numbers from the selected weeks
  const weekNumbers = selectedWeeks.map((week: any) => week.weekNumber);
  // Get min and max week number from the selected list
  const minWeek = Math.min(...weekNumbers);
  const maxWeek = Math.max(...weekNumbers);
  // Define the dynamic allowed range (1 week before and after)
  const allowedMin = minWeek - 1;
  const allowedMax = maxWeek + 1;
  if (inputWeekNumber >= allowedMin && inputWeekNumber <= allowedMax) {
    return {
      isValid: true,
      message: `Week ${inputWeekNumber} is in the allowed range (${allowedMin} to ${allowedMax}).`,
    };
  } else {
    return {
      isValid: false,
      message: `Week ${inputWeekNumber} is NOT in the allowed range (${allowedMin} to ${allowedMax}).`,
    };
  }
}

export const aggregateDataByDate = (
  data: any[],
  weekFilter: any[],
  holiday: any[]
) => {
  const aggregatedData: Record<
    string,
    { actualHours: number; bgtHours: number; roasterHours: number }
  > = {};
  const parseHours = (value: string | number) => {
    const n = typeof value === "number" ? value : parseFloat(value);
    return isNaN(n) ? 0 : n;
  };
  data.forEach((item) => {
    const jobCodeTotals = sumHours([item], weekFilter, holiday);
    const allTimeSheet = jobCodeTotals.timeSheetData;
    allTimeSheet.forEach((ts) => {
      const dateKey = ts.date; // Use the date as the key
      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = {
          actualHours: 0,
          bgtHours: 0,
          roasterHours: 0,
        };
      }
      aggregatedData[dateKey].actualHours += parseHours(ts.ordinary_Hours || 0);
      aggregatedData[dateKey].bgtHours += parseHours(ts.perDayBgtHours || 0);
    });
    const allRoasterData = item.roasterData;
    allRoasterData.forEach((r: any) => {
      const dateKey = r.date; // Use the date as the key
      if (!aggregatedData[dateKey]) {
        aggregatedData[dateKey] = {
          actualHours: 0,
          bgtHours: 0,
          roasterHours: 0,
        };
      }
      aggregatedData[dateKey].roasterHours += parseHours(r.rosterTime);
    });
  });
  return Object.entries(aggregatedData).map(([date, hours]) => ({
    date,
    ...hours,
  }));
};

const sumHours = (items: any[], weekFilter: any[], holiday: any[]) => {
  let totalBGT: any = 0;
  let totalRoaster: any = 0;
  let totalActual: any = 0;
  const allUpdatedTimesheets: any[] = [];
  const parseHours = (value: string | number) => {
    const n = typeof value === "number" ? value : parseFloat(value);
    return isNaN(n) ? 0 : n;
  };

  const getAdditionalHours = (item: any, date: string): number => {
    if (!Array.isArray(item.AdditionDetails)) return 0;
    const additionsInRange = getObjectWithDate(item.AdditionDetails, date);
    return (additionsInRange || []).reduce(
      (sum: number, detail: any) => sum + (detail?.hours || 0),
      0
    );
  };
  let totalBGTAdditional: any = 0;

  items.forEach((item) => {
    if (item.HoursType == HoursTypeEnum.Daily) {
      const roasterByJidDate = item.roasterData.reduce((acc: any, r: any) => {
        const key = `${r.jid}__${r.date}`;
        acc[key] = (acc[key] || 0) + parseHours(r.rosterTime);
        return acc;
      }, {} as Record<string, number>);

      const timesheetByJobDate = item.timeSheetDayVice.reduce(
        (acc: any, ts: any) => {
          const key = `${ts.job_ID}__${ts.date}`;
          acc[key] = (acc[key] || 0) + parseHours(ts.ordinary_Hours);
          return acc;
        },
        {} as Record<string, number>
      );

      let basePerDayHours = 0;

      let data = getOverallStartAndEndDate(weekFilter);
      let dayHours = getDistributedHours(
        data.startDate,
        data.endDate,
        item.AllWeekData,
        holiday
      );
      // calculateTotalFromDayValues()
      let { startDate, endDate } = getOverallStartAndEndDate(weekFilter);
      let dataDate = generateCalendar(startDate, endDate);

      let missingDataAdded = addMissingDates(item.timeSheetDayVice, dataDate);
      const updatedTimesheets = missingDataAdded.map((ts) => {
        let additional = getAdditionalHours(item, ts.date) || 0;
        // let isHolidayDate = isHoliday(ts.date);
        basePerDayHours =
          dayHours.length > 0
            ? dayHours.find((j) => j.date == ts.date)?.hours || 0
            : 0;
        // totalBGTAdditional += (additional + basePerDayHours);
        return {
          ...ts,
          perDayBgtHours: additional + basePerDayHours,
        };
      });

      allUpdatedTimesheets.push(...updatedTimesheets);

      for (const [key, rosterHours] of Object.entries(roasterByJidDate)) {
        totalRoaster += rosterHours;
        totalActual += timesheetByJobDate[key] || 0;
      }

      for (const [key, actualHours] of Object.entries(timesheetByJobDate)) {
        if (!roasterByJidDate[key]) {
          totalActual += actualHours;
        }
      }
      totalBGTAdditional += item.BGTMonthHours;
    } else {
      const roasterByJidDate = item.roasterData.reduce((acc: any, r: any) => {
        const key = `${r.jid}__${r.date}`;
        acc[key] = (acc[key] || 0) + parseHours(r.rosterTime);
        return acc;
      }, {} as Record<string, number>);

      const timesheetByJobDate = item.timeSheetDayVice.reduce(
        (acc: any, ts: any) => {
          const key = `${ts.job_ID}__${ts.date}`;
          acc[key] = (acc[key] || 0) + parseHours(ts.ordinary_Hours);
          return acc;
        },
        {} as Record<string, number>
      );

      const bgtHoursMonth: number = Number(item.onlyBGTMonthHours) || 0;
      let basePerDayHours = 0;

      if (bgtHoursMonth && weekFilter?.length) {
        const relevantWorkingDays = weekFilter
          .flatMap((r) =>
            (r.workingDaysCountByMonth || []).map((j: any) => ({
              ...j,
              startDate: r.startDate,
              endDate: r.endDate,
            }))
          )
          .filter((d: any) =>
            item.timeSheetDayVice.some(
              (ts: any) =>
                Number(ts.month) === d.month && Number(ts.year) === d.year
            )
          );

        const uniqueTimesheetDates = getUniueRecordsByColumnName(
          item.timeSheetDayVice,
          "date"
        );

        if (relevantWorkingDays.length > 0) {
          const totalWorkingCount = relevantWorkingDays.reduce(
            (sum: number, d: any) => sum + (d.workingCount || 0),
            0
          );
          basePerDayHours = relevantWorkingDays[0].totalworkingCount
            ? bgtHoursMonth / relevantWorkingDays[0].totalworkingCount
            : 0;

          totalBGT += basePerDayHours * totalWorkingCount;

          uniqueTimesheetDates.forEach((ts: any) => {
            totalBGT += getAdditionalHours(item, ts.date);
          });
        }
      }
      let { startDate, endDate } = getOverallStartAndEndDate(weekFilter);
      let dataDate = generateCalendar(startDate, endDate);

      let missingDataAdded = addMissingDates(item.timeSheetDayVice, dataDate);

      const updatedTimesheets = missingDataAdded.map((ts) => {
        // const updatedTimesheets = item.timeSheetDayVice.map(ts => {
        let additional = getAdditionalHours(item, ts.date) || 0;
        let isHolidayDate = isHoliday(ts.date);
        // totalBGTAdditional += isHolidayDate ? additional : basePerDayHours + additional;
        return {
          ...ts,
          perDayBgtHours: isHolidayDate
            ? additional
            : basePerDayHours + additional,
        };
      });

      allUpdatedTimesheets.push(...updatedTimesheets);

      for (const [key, rosterHours] of Object.entries(roasterByJidDate)) {
        totalRoaster += rosterHours;
        totalActual += timesheetByJobDate[key] || 0;
      }

      for (const [key, actualHours] of Object.entries(timesheetByJobDate)) {
        if (!roasterByJidDate[key]) {
          totalActual += actualHours;
        }
      }
      totalBGTAdditional += item.BGTMonthHours;
    }
  });

  return {
    act: totalActual,
    bgt: totalBGT,
    totalBGTAdditional: totalBGTAdditional,
    roaster: totalRoaster,
    timeSheetData: allUpdatedTimesheets,
  };
};

type PersonDiff = {
  Title: string;
  Name: string;
  Email: string;
  TypeName: "added" | "removed";
  PersonType: "Site Manager" | "Site Supervisor";
  SiteName: string;
  StateName: string;
};

export const getPeopleDifferences = (
  OldSM: { Id: number; Title: string; EMail: string }[] = [],
  NewSM: { id: number; text: string; secondaryText: string }[] = [],
  OldSS: { Id: number; Title: string; EMail: string }[] = [],
  NewSS: { id: number; text: string; secondaryText: string }[] | null,
  SiteName: string,
  StateName: string
): PersonDiff[] => {
  const differences: PersonDiff[] = [];

  // --- Site Managers ---
  if (!!NewSM && (NewSM != null) && (NewSM.length > 0)) {
    const oldSMMap = new Map(OldSM.map((item) => [item.Id, item]));
    const newSMMap = new Map(NewSM.map((item) => [item.id, item]));

    // Removed Site Managers
    OldSM.forEach((oldItem) => {
      if (!newSMMap.has(oldItem.Id)) {
        differences.push({
          Title: "manager",
          Name: oldItem.Title,
          Email: oldItem.EMail,
          TypeName: "removed",
          PersonType: "Site Manager",
          SiteName: SiteName,
          StateName: StateName,
        });
      }
    });

    // Added Site Managers
    NewSM.forEach((newItem) => {
      if (!oldSMMap.has(newItem.id)) {
        differences.push({
          Title: "manager",
          Name: newItem.text,
          Email: newItem.secondaryText,
          TypeName: "added",
          PersonType: "Site Manager",
          SiteName: SiteName,
          StateName: StateName,
        });
      }
    });
  }

  // --- Site Supervisors ---
  // if (NewSS !== null) {
  if (!!NewSS && (NewSS !== null) && (NewSS.length > 0)) {
    const oldSSMap = new Map(OldSS.map((item) => [item.Id, item]));
    const newSSMap = new Map(NewSS.map((item) => [item.id, item]));

    // Removed Site Supervisors
    OldSS.forEach((oldItem) => {
      if (!newSSMap.has(oldItem.Id)) {
        differences.push({
          Title: "supervisor",
          Name: oldItem.Title,
          Email: oldItem.EMail,
          TypeName: "removed",
          PersonType: "Site Supervisor",
          SiteName: SiteName,
          StateName: StateName,
        });
      }
    });

    // Added Site Supervisors
    NewSS.forEach((newItem) => {
      if (!oldSSMap.has(newItem.id)) {
        differences.push({
          Title: "supervisor",
          Name: newItem.text,
          Email: newItem.secondaryText,
          TypeName: "added",
          PersonType: "Site Supervisor",
          SiteName: SiteName,
          StateName: StateName,
        });
      }
    });
  }

  return differences;
};

export const calculateDuration = (data: any): string => {
  if (!data.StartingDateTime || !data.CompletionDateTime) return "";
  const start = new Date(data.StartingDateTime);
  const end = new Date(data.CompletionDateTime);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return "";
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMsAfterHours = diffMs % (1000 * 60 * 60);
  const diffMinutes = Math.ceil(remainingMsAfterHours / (1000 * 60));
  const parts = [];
  if (diffDays > 0) parts.push(`${diffDays} day${diffDays !== 1 ? 's' : ''}`);
  if (diffHours > 0) parts.push(`${diffHours} hour${diffHours !== 1 ? 's' : ''}`);
  if (diffMinutes > 0) parts.push(`${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`);
  return parts.slice(0, 2).join(" ");
};
export const calculateDurationForHistory = (data: any): { display: string, totalHours: number } => {
  if (!data.StartDateTime || !data.EndDate) return {
    display: "Not Available", totalHours: 0
  };

  const start = new Date(data.SD);
  const end = new Date(data.ED);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start)
    return { display: "Available", totalHours: 0 };

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const remainingMsAfterHours = diffMs % (1000 * 60 * 60);
  const diffMinutes = Math.ceil(remainingMsAfterHours / (1000 * 60));

  const parts: string[] = [];
  if (diffDays > 0) parts.push(`${diffDays} day${diffDays !== 1 ? 's' : ''}`);
  if (diffHours > 0) parts.push(`${diffHours} hour${diffHours !== 1 ? 's' : ''}`);
  if (diffMinutes > 0 && parts.length < 2) parts.push(`${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`);

  const display = parts.join(" ") || "0 minute";
  const totalHours = diffDays * 24 + diffHours + diffMinutes / 60;

  return { display, totalHours };
};

export const validateDateTimeRows = (excelData: any[]): any[] => {
  const invalidRows: any[] = [];

  for (const item of excelData) {
    if (item?.StartingDateTime && item?.CompletionDateTime) {
      let start: Date;
      let end: Date;

      // ---  Parse StartingDateTime ---
      if (typeof item.StartingDateTime === "string" && item.StartingDateTime.includes("-")) {
        const [day, month, yearAndTime] = item.StartingDateTime.split("-");
        const [year, time] = yearAndTime.trim().split(" ");
        // use T to parse as local time
        start = new Date(`${year}-${month}-${day}T${time}`);
      } else {
        start = new Date(item.StartingDateTime);
      }

      // --- Parse CompletionDateTime ---
      if (typeof item.CompletionDateTime === "string" && item.CompletionDateTime.includes("-")) {
        const [day, month, yearAndTime] = item.CompletionDateTime.split("-");
        const [year, time] = yearAndTime.trim().split(" ");
        end = new Date(`${year}-${month}-${day}T${time}`);
      } else {
        end = new Date(item.CompletionDateTime);
      }

      // ---  Normalize seconds & milliseconds ---
      start.setSeconds(0, 0);
      end.setSeconds(0, 0);

      // ---  Validate ---
      if (end.getTime() <= start.getTime()) {
        invalidRows.push(item);
      }
    }
  }

  return invalidRows;
};



export const isUpcomingDate = (dateString: string): boolean => {
  const givenDate = new Date(dateString);
  const now = new Date();
  return givenDate.getTime() > now.getTime();
};



// export const getScoreStats = (scores: any) => {
//   // convert all to numbers
//   const numericScores = scores.map((obj: any) => Number(obj?.Score) || 0);

//   const total = numericScores.reduce((acc: any, val: any) => acc + val, 0);
//   const average = total / numericScores.length;
//   const high = Math.max(...numericScores) || 0;
//   const low = Math.min(...numericScores) || 0;

//   return {
//     average: average.toFixed(2), // keeping 2 decimals
//     high,
//     low
//   };
// }
export const getScoreStatsWithOwners = (data: any) => {
  const numericScores = data.map((obj: any) => Number(obj.Score));

  const total = numericScores.reduce((acc: any, val: any) => acc + val, 0);
  const average = total / numericScores.length || 0;
  const high = Math.max(...numericScores) || 0;
  const low = Math.min(...numericScores) || 0;

  // Unique owner count
  const uniqueOwners = new Set(data.map((obj: any) => obj.Owner));

  return {
    average: average.toFixed(2),
    high,
    low,
    uniqueOwnerCount: uniqueOwners.size
  };
}

// Example

export const processATRoles = (data: any) => {
  // Step 1: Count occurrences
  const roleCountMap: any = {};
  data.forEach((item: any) => {
    const role = item.ATRole;
    roleCountMap[role] = (roleCountMap[role] || 0) + 1;
  });

  // Step 2: Convert to array
  const groupedRoles = Object.entries(roleCountMap)
    .map(([name, count]) => ({ name, count }))
    // Sort descending by count
    .sort((a: any, b: any) => b.count - a.count);

  // Step 3: Separate top 3 and others
  const top3 = groupedRoles.slice(0, 3);
  const others = groupedRoles.slice(3);
  const othersCount = others.reduce((acc: any, cur: any) => acc + cur.count, 0);

  // Step 4: Add Others if any
  if (othersCount > 0) {
    top3.push({ name: "Others", count: othersCount });
  }

  return { top3, all: groupedRoles };
}



export const genratePDFSiteSummeryDetails = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,

): Promise<Blob | null> => {
  try {
    // Load jQuery and Kendo libraries
    const jQueryUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js";
    const kendoUrl =
      "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, {
      globalExportsName: "jQuery",
    });
    await SPComponentLoader.loadScript(kendoUrl, {
      globalExportsName: "kendo",
    });

    try {
      (window as any).kendo.pdf.defineFont({
        NotoSans: NotoSans,
        "NotoSans|Bold": NotoSansBold,
      });

      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    const element = document.getElementById(divID);
    if (!element) {
      throw new Error(`Element with ID ${divID} not found.`);
    } else {
      element.classList.remove("dnone");
    }
    document
      .querySelectorAll(`#${divID} .noExport`)
      .forEach((el: HTMLElement) => {
        el.style.display = "none";
      });
    const style = document.createElement("style");

    style.innerHTML = `
            #${divID}, #${divID} {
                font-family: 'NotoSans' !important;
            }
        `;
    document.head.appendChild(style);



    await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay

    // Generate PDF and return the Blob
    const pdfData: Blob | null = await new Promise<Blob | null>(
      (resolve, reject) => {
        (window as any).kendo.drawing
          .drawDOM(`#${divID}`, {
            // forcePageBreak: ".page-break",

            // paperSize: "A4",

            // landscape: true,

            margin: {
              top: "0in",
              bottom: "0in",
              left: "0in",
              right: "0in",
            },
            // multiPage: true,
            // scale: 0.8,
            // keepTogether: ".keep-together",
            // pdf: {
            //   font: "NotoSans",
            // },
            forcePageBreak: ".page-break",
            paperSize: "A4",
            //margin: "2cm",
            multiPage: false,
            //scale: 0.6,
            scale: 0.6,
            keepTogether: ".keep-together"
          })
          .then((group: any) => {
            return (window as any).kendo.drawing.exportPDF(group);
          })
          .then((dataURI: string) => {
            document
              .querySelectorAll(`#${divID} .noExport`)
              .forEach((el: HTMLElement) => {
                el.style.display = "block";
              });

            if (downloadPDF) {
              (window as any).kendo.saveAs({
                dataURI: dataURI,
                fileName: `${pdfName}.pdf`,
              });
            }

            if (isDisplayNone != false && element) {
              element.classList.add("dnone");
            }

            // Convert the data URI to a blob
            const byteCharacters = atob(dataURI.split(",")[1]);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            resolve(blob);
          })
          .catch((error: any) => {
            console.error("Failed to generate PDF:", error);
            reject(error);
          });
      }
    );

    return pdfData; // Return the generated Blob
  } catch (error) {
    console.error("Error generating or saving PDF:", error);
    return null;
  }
};

export const generateAndSaveKendoPDFForReports = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
): Promise<Blob | null> => {
  let element: HTMLElement | null = null;
  let pdfData: Blob | null = null;

  try {
    // Load scripts
    const jQueryUrl = 'https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js';
    const kendoUrl = "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, { globalExportsName: 'jQuery' });
    await SPComponentLoader.loadScript(kendoUrl, { globalExportsName: 'kendo' });

    // Fonts
    try {
      (window as any).kendo.pdf.defineFont({
        "NotoSans": notoSansFont,
        "NotoSans|Bold": notoSansBoldFont,
      });

      const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      if (logoElement) {
        const imageSRC = (logoElement as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (logoElement as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    element = document.getElementById(divID);
    if (!element) throw new Error(`Element with ID ${divID} not found.`);
    // element.classList.remove('dnone');
    document.querySelectorAll(`#${divID} .dnone`).forEach(el => {
      (el as HTMLElement).style.display = 'block';
    });

    // Hide elements not to export
    const noExportEls = document.querySelectorAll(`#${divID} .noExport`);
    // eslint-disable-next-line no-return-assign
    noExportEls.forEach((el) => (el as HTMLElement).style.display = 'none');

    // Show "pdfShow" elements
    document.querySelectorAll(`#${divID} .pdfShow`).forEach((el: Element) => {
      if (el instanceof HTMLElement) el.style.display = "block";
    });
    // const elementsToStack = document.querySelectorAll(`#${divID} .ms-Grid-col`);
    // elementsToStack.forEach(el => el.classList.add("stack-for-pdf"));

    // Add temp style
    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = `
          #${divID}, #${divID} * {
              font-family: 'NotoSans' !important;
          }    
      #${divID} .small-size {
     font-size: 12px !important;
  }
#${divID} .echarts-chart-container {
    width: 1250px !important;
    max-width: 1250px !important;
    min-width: 1250px !important;
}

#${divID} .echarts-toolbox {
    display: none !important;
}

     #${divID} .report-col-width {
      width: 100% !important;
      min-width: 1036px !important;
  }
       #${divID} .report-col-overview {
      width: 100% !important;
        max-width: 950px
  }

  #${divID} .badge-border {
      margin-left: 10px;
      border: 1px solid #dddddd;
    }
      #${divID} .echarts-toolbox {
    display: none !important;
  }

      `;
    document.head.appendChild(tempStyle);
    element.classList.add('pdf-temp-font');
    tempStyle.id = 'pdf-temp-style';
    // element.querySelectorAll('.report-col').forEach(col => {
    //     col.classList.add('pdf-full-width');
    // });

    await new Promise(resolve => setTimeout(resolve, 200)); // Delay

    // Generate PDF
    pdfData = await new Promise<Blob | null>((resolve, reject) => {
      (window as any).kendo.drawing.drawDOM(`#${divID}`, {
        forcePageBreak: ".page-break",
        paperSize: "A4",
        // paperSize: "Letter",
        landscape: true,
        margin: {
          top: "0.1in", bottom: "0.1in",
          left: "0.1in", right: "0.1in"
        },
        multiPage: true,
        scale: 0.6,
        keepTogether: ".keep-together",
        forceVector: false,
        pdf: { font: "NotoSans" }
      }).then((group: any) => {
        return (window as any).kendo.drawing.exportPDF(group);
      }).then((dataURI: string) => {
        if (downloadPDF) {
          (window as any).kendo.saveAs({
            dataURI: dataURI,
            fileName: `${pdfName}.pdf`
          });
        }

        // Convert to Blob
        const byteCharacters = atob(dataURI.split(',')[1]);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        // Hide "pdfShow" elements
        document.querySelectorAll(`#${divID} .pdfShow`).forEach((el: Element) => {
          if (el instanceof HTMLElement) el.style.display = "none";
        });

        resolve(new Blob([byteArray], { type: "application/pdf" }));
      }).catch(reject);
    });

  } catch (error) {
    console.error('Error generating or saving PDF:', error);
  } finally {
    if (element) {
      element.classList.remove('pdf-temp-font');
    }
    document.querySelectorAll(`#${divID} .dnone`).forEach((el) => { (el as HTMLElement).style.display = 'none' });

    // Show hidden elements
    document.querySelectorAll(`#${divID} .noExport`).forEach((el) => {
      (el as HTMLElement).style.display = 'block';
    });

    // Remove stacked layout
    // document.querySelectorAll(`#${divID} .ms-Grid-col`).forEach(el => {
    //     el.classList.remove("stack-for-pdf");
    // });
    document.querySelectorAll(`#${divID} .export-button`).forEach((el) => {
      (el as HTMLElement).style.removeProperty('display');
    });
    // Remove temp style
    document.getElementById('pdf-temp-style')?.remove();
  }

  return pdfData;
};

export const _siteDataUtil = async (provider: any): Promise<any[]> => {
  try {
    let camlQuery;
    camlQuery = new CamlBuilder().View(["ID", "QCState"]).Scope(CamlBuilder.ViewScope.RecursiveAll).RowLimit(5000, true).Query()
    const results = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, camlQuery.ToString())
    if (results) {
      const siteData = results.map((data: any) => ({
        ID: parseInt(data.ID),
        QCStateId: data.QCState ? data.QCState[0].lookupId : '',
        QCState: data.QCState ? data.QCState[0].lookupValue : '',
      }));

      return siteData;
    }
    return [];
  } catch (error) {
    console.error("Error fetching site master :", error);
    const errorObj = {
      ErrorMessage: error.toString(),
      ErrorStackTrace: "",
      CustomErrormessage: "Error is occurring while fetching site master ",
      PageName: "QuayClean.aspx",
      ErrorMethodName: "_siteDataUtil"
    };
    await logGenerator(provider, errorObj);
    return [];
  }
};

export const getFileViewerUrl = (context: any, fileUrl: string) => {
  const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
  switch (fileExtension) {
    case 'pdf':
      return fileUrl;
    case 'doc':
    case 'docx':
    case 'ppt':
    case 'pptx':
    case 'xls':
    case 'xlsx':
      return `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(fileUrl)}&action=embedview`;
    default:
      return fileUrl;
  }
};

export const cleanLink = (link: string): string => {
  // Use regex to remove spaces before and after slashes
  return link.replace(/\s*\/\s*/g, '/');
};

export const generateAndSaveKendoPDFPrint = async (
  divID: string,
  pdfName: string,
  isDisplayNone?: boolean,
  downloadPDF?: boolean,
  isPortrait?: boolean
): Promise<Blob | null> => {
  let element: HTMLElement | null = null;
  let pdfData: Blob | null = null;

  try {
    // Load scripts
    const jQueryUrl = 'https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js';
    const kendoUrl = "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";
    await SPComponentLoader.loadScript(jQueryUrl, { globalExportsName: 'jQuery' });
    await SPComponentLoader.loadScript(kendoUrl, { globalExportsName: 'kendo' });

    // Fonts
    try {
      (window as any).kendo.pdf.defineFont({
        "NotoSans": NotoSans,
        "NotoSans|Bold": NotoSansBold
      });

      // const logoElement = document.querySelector(`#${divID} img.qclogoims`);
      // if (logoElement) {
      //   const imageSRC = (logoElement as HTMLImageElement).src;
      //   const logoBase64 = await convertImageToBase64(imageSRC);
      //   (logoElement as HTMLImageElement).src = logoBase64;
      // }

      const logoElements = document.querySelectorAll(`#${divID} img.qclogoims`);
      for (const img of Array.from(logoElements)) {
        const imageSRC = (img as HTMLImageElement).src;
        const logoBase64 = await convertImageToBase64(imageSRC);
        (img as HTMLImageElement).src = logoBase64;
      }
    } catch (fontError) {
      console.error("Error defining font:", fontError);
    }

    element = document.getElementById(divID);
    if (!element) throw new Error(`Element with ID ${divID} not found.`);
    // element.classList.remove('dnone');
    document.querySelectorAll(`#${divID} .dnone`).forEach((el: HTMLElement) => { el.style.display = 'block' });
    // Hide elements not to export
    const noExportEls = document.querySelectorAll(`#${divID} .noExport`);
    noExportEls.forEach((el: HTMLElement) => el.style.display = 'none');

    // const elementsToStack = document.querySelectorAll(`#${divID} .ms-Grid-col`);
    // elementsToStack.forEach(el => el.classList.add("stack-for-pdf"));

    // Add temp style
    const tempStyle = document.createElement('style');
    tempStyle.innerHTML = `
          #${divID}, #${divID} * {
              font-family: 'NotoSans' !important;
          }    
      #${divID} .small-size {
     font-size: 12px !important;
  }

     #${divID} .report-col-width {
      width: 100% !important;
      max-width: 1250px !important;
  }
       #${divID} .report-col-overview {
      width: 100% !important;
        max-width: 950px
  }
        
      `;
    document.head.appendChild(tempStyle);
    element.classList.add('pdf-temp-font');
    tempStyle.id = 'pdf-temp-style';
    // element.querySelectorAll('.report-col').forEach(col => {
    //     col.classList.add('pdf-full-width');
    // });

    await new Promise(resolve => setTimeout(resolve, 200)); // Delay

    let isLandscape = true;
    if (isPortrait) {
      isLandscape = false;
    }
    // Generate PDF
    pdfData = await new Promise<Blob | null>((resolve, reject) => {
      (window as any).kendo.drawing.drawDOM(`#${divID}`, {
        forcePageBreak: ".page-break",
        paperSize: "A4",
        landscape: isLandscape,
        margin: {
          top: "0.1in", bottom: "0.1in",
          left: "0.1in", right: "0.1in"
        },
        multiPage: true,
        scale: 0.6,
        keepTogether: ".keep-together",
        forceVector: false,
        pdf: { font: "NotoSans" }
      }).then((group: any) => {
        return (window as any).kendo.drawing.exportPDF(group);
      }).then((dataURI: string) => {
        if (downloadPDF) {
          (window as any).kendo.saveAs({
            dataURI: dataURI,
            fileName: `${pdfName}.pdf`
          });
        }

        // Convert to Blob
        const byteCharacters = atob(dataURI.split(',')[1]);
        const byteArray = new Uint8Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteArray[i] = byteCharacters.charCodeAt(i);
        }

        resolve(new Blob([byteArray], { type: "application/pdf" }));
      }).catch(reject);
    });

  } catch (error) {
    console.error('Error generating or saving PDF:', error);
  } finally {
    if (element) {
      element.classList.remove('pdf-temp-font');
    }
    document.querySelectorAll(`#${divID} .dnone`).forEach((el: HTMLElement) => { el.style.display = 'none' });

    // Show hidden elements
    document.querySelectorAll(`#${divID} .noExport`).forEach((el: HTMLElement) => {
      el.style.display = 'block';
    });

    // Remove stacked layout
    // document.querySelectorAll(`#${divID} .ms-Grid-col`).forEach(el => {
    //     el.classList.remove("stack-for-pdf");
    // });
    document.querySelectorAll(`#${divID} .export-button`).forEach((el: HTMLElement) => {
      el.style.removeProperty('display');
    });
    // Remove temp style
    document.getElementById('pdf-temp-style')?.remove();
  }

  return pdfData;
};



// export const groupByColumnName = (items: any[], columnName: string) => {
//   try {
//     const groupedByZone = items?.reduce((acc: any[], item: any) => {
//       const zone = item[columnName];

//       const existingZone = acc.find(z => z[columnName] === zone);

//       if (existingZone) {
//         existingZone.items.push(item);
//       } else {
//         acc.push({
//           [columnName]: zone,
//           items: [item]
//         });
//       }

//       return acc;
//     }, []);

//     return groupedByZone
//   } catch (error) {
//     return []
//   }


// }


export const groupByColumnName = (
  items: any[],
  columnName: string,
  columnIdValue: string,
  moveToLastValue?: any
) => {
  try {
    // 1️⃣ Grouping
    const grouped = items?.reduce((acc: any[], item: any) => {
      const key = item[columnName];
      const columnId = item[columnIdValue] || ""

      let group = acc.find(g => g[columnIdValue] === columnId);

      if (!group) {
        group = { [columnName]: key, items: [], [columnIdValue]: columnId };
        acc.push(group);
      }

      group.items.push(item);
      return acc;
    }, []);

    // 2️⃣ Sort groups by name, but move one value to last
    grouped.sort((a: any, b: any) => {
      const aKey = a[columnName];
      const bKey = b[columnName];

      // Move selected value to last
      if (moveToLastValue !== undefined) {
        if (aKey === moveToLastValue) return 1;
        if (bKey === moveToLastValue) return -1;
      }

      // Normal alphabetical sort
      return String(aKey).localeCompare(String(bKey));
    });

    return grouped;
  } catch (error) {
    return [];
  }
};

export const _siteData = async (provider: any, selectedSite: any) => {
  try {
    let filterFields: any[] = [];
    if (selectedSite !== "" && selectedSite !== undefined) {
      filterFields.push({
        fieldName: "ID",
        fieldValue: Number(selectedSite),
        fieldType: FieldType.Number,
        LogicalType: LogicalType.EqualTo
      });
    }
    let camlQuery = new CamlBuilder()
      .View([
        "ID",
        "Title",
        "SiteManager",
        "QCState",
        "Category"
      ])
      .Scope(CamlBuilder.ViewScope.RecursiveAll)
      .RowLimit(5000, true)
      .Query();

    if (filterFields.length > 0) {
      const expressions = getCAMLQueryFilterExpression(filterFields);
      camlQuery.Where().All(expressions);
    }

    const results: any[] = await provider.getItemsByCAMLQuery(
      ListNames.SitesMaster,
      camlQuery.ToString()
    );
    if (results?.length > 0) {
      const SiteData = results.map((data: any) => ({
        ID: data?.ID,
        Title: data?.Title,
        SiteManagerId: !!data?.SiteManager ? data.SiteManager?.map((i: any) => i.id) : null,
        SiteManagerName: !!data?.SiteManager ? data.SiteManager?.map((i: any) => i.title) : '',
        SiteManagerEmail: !!data?.SiteManager ? data.SiteManager?.map((i: any) => i.email) : '',
        StateId: data?.QCState ? data.QCState[0]?.lookupId : null
      }));
      return { SiteData, StateId: SiteData[0]?.StateId };
    }
    return { SiteData: [], StateId: null };
  } catch (ex) {
    console.log(ex);
    return { SiteData: [], StateId: null };
  }
};


export const onSearch = (arrayList: any[], searchkey: string): any[] => {
  if (!!searchkey && searchkey.trim().length > 0) {
    searchkey = searchkey.trim().toString().toLowerCase();
    return arrayList.filter((obj: any) => {
      return Object.keys(obj).some((key: string) => {
        return !!obj[key] ? obj[key].toString().toLowerCase().includes(searchkey) : false;
      });
    });
  } else {
    return arrayList;
  }
};

export function sortLevel2Dynamic<T>(
  items: T[],
  primaryKey: keyof T,
  primaryDesc: boolean,
  secondaryKey: keyof T,
  secondaryDesc: boolean
): T[] {

  const isDateLike = (val: any) =>
    val instanceof Date || !isNaN(Date.parse(val));

  const compare = (a: any, b: any): number => {
    // Boolean handling (true > false)
    if (typeof a === "boolean" && typeof b === "boolean") {
      return a === b ? 0 : a ? 1 : -1;
    }

    // Date handling
    if (isDateLike(a) && isDateLike(b)) {
      return new Date(a).getTime() - new Date(b).getTime();
    }

    // String handling
    if (typeof a === "string" && typeof b === "string") {
      return a.localeCompare(b);
    }

    // Number handling
    return a > b ? 1 : a < b ? -1 : 0;
  };

  return [...items].sort((x, y) => {
    // 🔹 PRIMARY SORT
    let result = compare(x[primaryKey], y[primaryKey]);
    if (result !== 0) {
      return primaryDesc ? -result : result;
    }

    // 🔹 SECONDARY SORT (applied only if primary is equal)
    result = compare(x[secondaryKey], y[secondaryKey]);
    return secondaryDesc ? -result : result;
  });
}
export const canShowSiteActionButtons = (
  selectedSiteIds: any[] = [],
  currentUserRoleDetail: any,
): boolean => {

  const isSiteManagerForSelectedSites = currentUserRoleDetail?.siteManagerItem?.some((site: any) =>
    selectedSiteIds.includes(site.Id) &&
    site.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1
  );

  const isSiteSupervisorForSelectedSites = currentUserRoleDetail?.siteSupervisorItem?.some((site: any) =>
    selectedSiteIds.includes(site.Id) &&
    site.SiteSupervisorId?.indexOf(currentUserRoleDetail.Id) > -1
  );

  return (
    currentUserRoleDetail?.isAdmin || currentUserRoleDetail?.isStateManager || (selectedSiteIds.length === 0 && currentUserRoleDetail?.siteManagerItem?.filter((r: any) =>
      r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1
    ).length > 0
    ) ||

    (selectedSiteIds.length > 0 && isSiteManagerForSelectedSites &&
      !(selectedSiteIds.length === 1 && isSiteSupervisorForSelectedSites && !isSiteManagerForSelectedSites
      )
    )
  );
};


