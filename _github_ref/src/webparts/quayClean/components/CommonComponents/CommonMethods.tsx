import moment from "moment";
import { devSiteURL, ListNames, mainSiteURL, qaSiteURL, qrcodeSiteURL, stageSiteURLNew } from "../../../../Common/Enum/ComponentNameEnum";
import { ChartDataItem, HazardData, HazardFields, HZStateColor } from "../../../../Common/Enum/HazardFields";
import { encryptValue } from "../../../../Common/Util";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import IPnPQueryOptions from "../../../../DataProvider/Interface/IPnPQueryOptions";
// const notFoundImage = require('../../assets/images/NotFoundImg.png');
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import * as qrcode from 'qrcode';
import { ClientResponseViewFields, CRGridTitles } from "../CustomeComponents/QRClientResponse/ClientResponseFields";
import { NO_SITE_CATEGORY_ID } from "../../../../Common/Constants/CommonConstants";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";

export const _getDocumentData = async (ChemicalRegistrationId: any, provider: IDataProvider) => {
    try {
        let filter = `ChemicalRegistrationId eq ${ChemicalRegistrationId}`;

        const select = ["ID,Title,ChemicalRegistrationId,FileLeafRef,FileRef,FileDirRef"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            top: 5000,
            listName: ListNames.ChemicalRegistrationSDS,
        };
        const results = await provider.getItemsByQuery(queryStringOptions);

        if (!!results) {
            return results;
        } else {
            return [];
        }
    } catch (ex) {
        console.error(ex);
        return [];
    }
};
export const _getAllSDSDocuments = async (provider: IDataProvider) => {
    try {
        const select = [
            "ID",
            "ChemicalRegistrationId",
            "FileLeafRef",
            "FileRef",
            "FileDirRef"
        ];

        const queryStringOptions: IPnPQueryOptions = {
            select,
            top: 5000,
            listName: ListNames.ChemicalRegistrationSDS,
        };

        const results = await provider.getItemsByQuery(queryStringOptions);
        return results ?? [];
    } catch (ex) {
        console.error(ex);
        return [];
    }
};

export const _getAllDocumentData = async (provider: IDataProvider) => {
    try {
        const select = ["ID,Title,ChemicalRegistrationId,FileLeafRef,FileRef,FileDirRef"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            top: 5000,
            listName: ListNames.ChemicalRegistrationSDS,
        };
        const results = await provider.getItemsByQuery(queryStringOptions);

        if (!!results) {
            return results;
        } else {
            return [];
        }
    } catch (ex) {
        console.error(ex);
        return [];
    }
};

export const getCallTypeOptions = async (provider: IDataProvider) => {
    try {
        const response = await provider.choiceOption(ListNames.HelpDesk, "CallType");
        const dropvalue = response.map((value: any) => ({ value, key: value, text: value, label: value }));
        return dropvalue;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const getParsedImageUrl = (jsonData: string, baseUrl: string, defaultImage: string) => {
    try {
        const data = JSON.parse(jsonData);
        return data.serverRelativeUrl || (data.fileName ? `${baseUrl}${data.fileName}` : defaultImage);
    } catch {
        return defaultImage;
    }
};

export const getAttachmentDataUrl = (attachmentFiles: any[], baseUrl: string, defaultImage: string) => {
    if (attachmentFiles?.length > 0) {
        const attachment = attachmentFiles[0];
        return attachment.ServerRelativeUrl || (attachment.FileName ? `${baseUrl}${attachment.FileName}` : defaultImage);
    }
    return null;
};

export const _getTenantName = (context: any): string => {
    const url = context.pageContext.web.absoluteUrl;
    const match = url.match(/^https?:\/\/([^.]+)\.sharepoint\.com/i);
    return match?.[1]?.toLowerCase() || "";
};

export const _getSiteName = (context: any): string => {
    const url = context.pageContext.web.absoluteUrl;
    const match = url.match(/\/sites\/([^/]+)/i);
    return match && match[1] ? match[1] : "";
};

export const getHazardQRCodeURL = async (context: any, itemID: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://qhreportform.tretainfotech.com/Hazard/Index?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://hazardreport.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    }

    const qrCodeURL = await qrcode.toDataURL(siteUrl);
    return qrCodeURL;
};

export const getHazardLinkURL = async (context: any, itemID: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://qhreportform.tretainfotech.com/Hazard/Index?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://hazardreport.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    }

    return siteUrl;
};

export const getCRSiteQRCodeURL = async (context: any, itemID: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://qhreportform.tretainfotech.com/Hazard/Index?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://hazardreport.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    }

    const qrCodeURL = await qrcode.toDataURL(siteUrl);
    return qrCodeURL;
};

export const getCRSiteLinkURL = async (context: any, itemID: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://qhreportform.tretainfotech.com/Hazard/Index?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://hazardreport.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://qhreportformdemo.quaycleanresources.com.au/Hazard/Index?siteId=${encryptedID}`;
    }

    return siteUrl;
};

export const getCRSiteAreaQRCodeURL = async (context: any, itemID: any, subSiteID?: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    // const subSite = encryptValue(subSiteID ? subSiteID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://clientresponsedemo.quaycleanresources.com.au?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://clientresponsedev.quaycleanresources.com.au?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://clientresponse.quaycleanresources.com.au?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://clientresponsedemo.quaycleanresources.com.au?siteId=${encryptedID}`;
    }

    const qrCodeURL = await qrcode.toDataURL(siteUrl);
    return qrCodeURL;
};


export const getSiteAssetQRCode = async (context: any, itemID: any, subSiteID?: any) => {
    let filterqrcodeURL = qrcodeSiteURL;
    if (context && (Environment.type === EnvironmentType.SharePoint || Environment.type === EnvironmentType.ClassicSharePoint)) {
        const currentUrl: string = context.pageContext.web.absoluteUrl.toLowerCase();
        if (currentUrl.indexOf('https://quaycleanaustralia.sharepoint.com') > -1) {
            filterqrcodeURL = qrcodeSiteURL;
        } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleanqa') > -1) {
            filterqrcodeURL = qaSiteURL;
        } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleandev') > -1) {
            filterqrcodeURL = devSiteURL;
        } else if (currentUrl.indexOf('https://quaycleanqa.quaycleanresources.com.au') > -1) {
            filterqrcodeURL = stageSiteURLNew;
        }
        else {
            filterqrcodeURL = mainSiteURL;
        }
    } else {
        filterqrcodeURL = qrcodeSiteURL;
    }
    let url = `${filterqrcodeURL}Assets/AssetsDetail?ItemId=${itemID}`;
    //const qrCodeURL = await qrcode.toDataURL(url);
    const qrCodeURL = await qrcode.toDataURL(url, {
        width: 75,
        margin: 2
    });

    return qrCodeURL;
};

export const getClientResponseCopyLinkURL = async (context: any, itemID: any) => {
    const tenant = _getTenantName(context);
    const encryptedID = encryptValue(itemID ? itemID : 0);
    // const subSite = encryptValue(subSiteID ? subSiteID : 0);
    let siteUrl = '';
    if (tenant === "treta") {
        const site = _getSiteName(context);
        if (site === "Quayclean") {
            siteUrl = `https://clientresponsedemo.quaycleanresources.com.au?siteId=${encryptedID}`;
        } else if (site === "QuaycleanDev") {
            siteUrl = `https://clientresponsedev.quaycleanresources.com.au?siteId=${encryptedID}`;
        }
    } else if (tenant === "quaycleanaustralia") {
        siteUrl = `https://clientresponse.quaycleanresources.com.au?siteId=${encryptedID}`;
    } else if (tenant === "tretainfotech") {
        siteUrl = `https://clientresponsedemo.quaycleanresources.com.au?siteId=${encryptedID}`;
    }

    return siteUrl;
};

export const formatSPDateToLocal = (
    utcDateString: string,
    use12Hour: boolean = false
): string => {

    if (!utcDateString) return "-";

    const utcDate = new Date(utcDateString);
    if (isNaN(utcDate.getTime())) return "Invalid Date";

    const formatter = new Intl.DateTimeFormat("en-AU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: use12Hour,
    });

    const parts = formatter.formatToParts(utcDate);

    const day = parts.find(p => p.type === "day")?.value ?? "00";
    const month = parts.find(p => p.type === "month")?.value ?? "00";
    const year = parts.find(p => p.type === "year")?.value ?? "0000";
    const hour = parts.find(p => p.type === "hour")?.value ?? "00";
    const minute = parts.find(p => p.type === "minute")?.value ?? "00";
    const dayPeriod = (parts.find(p => p.type === "dayPeriod")?.value || "").toUpperCase();

    return use12Hour
        ? `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`
        : `${day}-${month}-${year} ${hour}:${minute}`;
};

export const formatSPDateToLocalDate = (utcDateString: string): string => {
    if (!utcDateString) return "-";

    const utcDate = new Date(utcDateString);
    if (isNaN(utcDate.getTime())) return "Invalid Date";

    const formatter = new Intl.DateTimeFormat("en-AU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    const parts = formatter.formatToParts(utcDate);

    const day = parts.find(p => p.type === "day")?.value ?? "00";
    const month = parts.find(p => p.type === "month")?.value ?? "00";
    const year = parts.find(p => p.type === "year")?.value ?? "0000";

    return `${day}-${month}-${year}`;
};


export const generatePdfFileName = (baseName: any) => {
    const now = new Date();

    const date = now.toLocaleDateString("en-AU", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).replace(/\//g, "-");

    const time = now.toLocaleTimeString("en-AU", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    }).replace(/:/g, "-");

    return `${baseName}_${date}_${time}`;
};

export const getState = (siteNameId: any, provider: any) => {
    try {
        let queryOptions: IPnPQueryOptions = {
            listName: ListNames.SitesMaster,
            select: ["Id", "QCStateId"],
            filter: `Id eq ${siteNameId}`
        };
        return provider.getItemsByQuery(queryOptions);
    } catch (error) {
        console.log(error);
    }
    return [];
};


export const getFileType = (fileName: string): string => {
    if (!fileName) return "unknown";

    const ext = fileName.split(".").pop()?.toLowerCase();

    const imageExt = ["png", "jpg", "jpeg", "gif", "bmp", "svg", "webp", "tiff", "tif", "heic", "heif", "jfif", "pjpeg", "pjp"];
    const videoExt = ["mp4", "mov", "avi", "webm", "mkv", "3gp", "3g2", "wmv", "flv", "mpeg", "mpg", "m4v"];

    if (imageExt.includes(ext!)) return "image";
    if (videoExt.includes(ext!)) return "video";
    if (ext === "pdf") return "pdf";

    return "other";
};


export const getHazardAttachments = async (provider: IDataProvider, context: any, selectedItem: any): Promise<string[]> => {
    try {
        const select = ["ID", "Attachments", "AttachmentFiles"];
        const expand = ["AttachmentFiles"];

        const queryOptions: IPnPQueryOptions = {
            select,
            listName: ListNames.HazardFormResponses,
            id: selectedItem?.Id,
            expand: expand
        };

        const data = await provider.getByItemByIDQuery(queryOptions);

        const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/${ListNames.HazardFormResponses}/Attachments/${data?.ID}/`;

        // const imageUrls: string[] = data?.AttachmentFiles?.map((file: any) =>
        //     file.ServerRelativeUrl || (file.FileName ? fixImgURL + file.FileName : notFoundImage)
        // ) || [];

        const attachments = data?.AttachmentFiles?.map((file: any) => {
            const fileName = file.FileName;
            if (fileName === `${selectedItem?.HazardFormId}.pdf`) return null;

            const fileUrl = file.ServerRelativeUrl || fixImgURL + fileName;

            const fileType = getFileType(fileName);
            return { fileName, fileUrl, fileType };
        })?.filter(Boolean) || [];

        return attachments;

    } catch (error: any) {
        console.error("Error fetching attachments:", error);
        return [];
    }
};
export const convertToAMPM = (dateStr: string) => {
    if (!dateStr) return dateStr;

    if (/am|pm/i.test(dateStr)) {
        return dateStr;
    }

    const [datePart, timePart] = dateStr.split(" ");
    let [hours, minutes] = timePart.split(":").map(Number);

    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    return `${datePart} ${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export const buildUniqueOptions = (items: any[], key: string, value?: any) => {
    if (value) {
        const map = new Map();
        items.forEach(item => {
            const name = item[key];
            const id = item[value];

            if (name && id && !map.has(id)) {
                map.set(id, {
                    key: id,
                    value: id,
                    label: name
                });
            }
        });

        const options = Array.from(map.values());
        return options;
    }

    const uniqueValues = Array.from(new Set(items.map(x => x[key]).filter(Boolean)));
    const options = uniqueValues.map(val => ({
        key: val.trim(),
        value: val.trim(),
        label: val.trim()
    }));

    return options;
};

export const getStateColor = (state: string) => {
    const found = HZStateColor.find(x => x.key === state);
    if (found) return found.colorCode;
    let hash = 0;
    for (let i = 0; i < state.length; i++) {
        hash = state.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color = '#' + ((hash >> 24) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 16) & 0xFF).toString(16).padStart(2, '0') +
        ((hash >> 8) & 0xFF).toString(16).padStart(2, '0');
    return color;
};

export const buildStateWiseHazardData = (data: any[], siteNameFilter?: string): any[] => {

    const rootMap: Record<string, any> = {};

    data.forEach(item => {
        const stateName = item.State || "Unknown State";
        const siteName = item.SiteName || "Unknown Site";
        const hazardType = item.HazardType || "Unknown Hazard Type";

        const parentRootKey = siteNameFilter ? hazardType : stateName;

        if (siteNameFilter && siteName !== siteNameFilter) return;

        if (!rootMap[parentRootKey]) {
            rootMap[parentRootKey] = {
                label: parentRootKey,
                count: 0,
                children: [],
                level: siteNameFilter ? "hazardType" : "state"
            };
        }

        const rootNode = rootMap[parentRootKey];

        if (!siteNameFilter) {
            let siteNode = rootNode.children!.find((s: { label: any; }) => s.label === siteName);
            if (!siteNode) {
                siteNode = {
                    label: siteName,
                    count: 0,
                    children: [],
                    level: "site"
                };
                rootNode.children!.push(siteNode);
            }

            let hazardNode = siteNode.children!.find((h: { label: any; }) => h.label === hazardType);
            if (!hazardNode) {
                hazardNode = {
                    label: hazardType,
                    count: 0,
                    items: [],
                    isLastLevel: true,
                    level: "hazardType"
                };
                siteNode.children!.push(hazardNode);
            }

            hazardNode.items!.push({
                SubHazard: item.HazardSubType || "Unknown Sub-Hazard",
                SubmissionDate: item.SubmissionDateDisplay || "Unknown Date",
                SubmittedBy: item.SubmittedBy || "Unknown Reporter",
                HazardType: item.HazardType || "Unknown Hazard Type",
                SiteName: item.SiteName || "Unknown Site"
            });

            hazardNode.count = (hazardNode.count || 0) + 1;
            siteNode.count = (siteNode.count || 0) + 1;
            rootNode.count = (rootNode.count || 0) + 1;

        } else {
            const hazardNode = rootNode;
            hazardNode.items = hazardNode.items || [];
            hazardNode.isLastLevel = true;
            hazardNode.level = "hazardType";

            hazardNode.items.push({
                SubHazard: item.HazardSubType || "Unknown Sub-Hazard",
                SubmissionDate: item.SubmissionDateDisplay || "Unknown Date",
                SubmittedBy: item.SubmittedBy || "Unknown Reporter",
                HazardType: item.HazardType || "Unknown Hazard Type",
                SiteName: item.SiteName || "Unknown Site"
            });

            hazardNode.count = (hazardNode.count || 0) + 1;
        }
    });

    return Object.values(rootMap);
};

export const buildDashboardGridData = (data: HazardData[], siteNameFilter?: string): ChartDataItem[] => {

    if (siteNameFilter) {

        const filtered = data.filter(d =>
            (d.SiteName ?? "").toLowerCase() === siteNameFilter.toLowerCase()
        );

        return filtered.map(item => ({
            label: "submission-row",
            count: 1,
            level: "submission",
            siteName: item.SiteName || "Unknown Site Name",
            hazardType: item.HazardType || "Unknown Hazard Type",
            subHazard: item.HazardSubType || "Unknown Sub-Hazard",
            submissionDate: item.SubmissionDate || "Unknown Date",
            reporterName: item.SubmittedBy || "Unknown Reporter",
            children: []
        }));
    }

    const rootMap: Record<string, ChartDataItem> = {};

    data.forEach(item => {
        const siteName = item.SiteName || "Unknown Site Name";
        const stateName = item.State || "Unknown State";
        const hazardType = item.HazardType || "Unknown Hazard Type";
        const subHazard = item.HazardSubType || "Unknown Sub-Hazard";
        const submissionDate = item.SubmissionDate || "Unknown Date";
        const reporterName = item.SubmittedBy || "Unknown Reporter";

        if (!rootMap[stateName]) {
            rootMap[stateName] = {
                label: stateName,
                count: 0,
                children: [],
                level: "state"
            };
        }

        rootMap[stateName].children!.push({
            label: "submission-row",
            count: 1,
            level: "submission",
            hazardType,
            subHazard,
            submissionDate,
            reporterName,
            siteName,
            children: []
        });

        rootMap[stateName].count! += 1;
    });

    return Object.values(rootMap);
};

const generateStateSiteHazardData = (
    rawData: any[],
    topNSites?: number,
    isAscending: boolean = false
): any[] => {
    const stateMap: Record<string, any> = {};

    rawData.forEach((d: any) => {
        const stateName = d.State || "Unknown State";
        const siteName = d.SiteName || "Unknown Site";
        const subHazard = d.HazardSubType || "Unknown Sub-Hazard";
        const submittedBy = d.SubmittedBy || "Unknown Reporter";

        // Initialize state
        if (!stateMap[stateName]) {
            stateMap[stateName] = {
                state: stateName,
                count: 0,
                sitesCount: 0,
                subHazardCount: {} as Record<string, number>,
                submittedByCount: {} as Record<string, number>,
                children: [],
            };
        }

        const stateEntry = stateMap[stateName];

        // Initialize site
        let siteEntry = stateEntry.children.find((s: any) => s.stateName === siteName);
        if (!siteEntry) {
            siteEntry = {
                state: stateName,
                stateName: siteName,
                count: 0,
                items: [],
                subHazardCount: {} as Record<string, number>,
                submittedByCount: {} as Record<string, number>,
            };
            stateEntry.children.push(siteEntry);
            stateEntry.sitesCount++;
        }

        // Increment counts
        siteEntry.count++;
        stateEntry.count++;
        siteEntry.items.push(d);

        // siteEntry.subHazardCount[subHazard] = (siteEntry.subHazardCount[subHazard] || 0) + 1;
        // stateEntry.subHazardCount[subHazard] = (stateEntry.subHazardCount[subHazard] || 0) + 1;

        // siteEntry.submittedByCount[submittedBy] = (siteEntry.submittedByCount[submittedBy] || 0) + 1;
        // stateEntry.submittedByCount[submittedBy] = (stateEntry.submittedByCount[submittedBy] || 0) + 1;
    });

    Object.values(stateMap).forEach((state: any) => {
        state.children = state.children.sort((a: any, b: any) =>
            isAscending ? a.count - b.count : b.count - a.count
        );

        if (topNSites != null) {
            state.children = state.children.slice(0, topNSites);
        }

        state.count = state.children.reduce((sum: any, s: any) => sum + s.count, 0);
        state.sitesCount = state.children.length;
    });

    return Object.values(stateMap).sort((a, b) =>
        isAscending ? a.count - b.count : b.count - a.count
    );
};

export const generateExcelHazardReport = (
    rawData: any[],
    topNSites?: number,
    fileName: string = "StateSiteHazardReport.xlsx"
) => {
    const nestedData = generateStateSiteHazardData(rawData, topNSites);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("State-Site-Hazard");

    const styleHeader = (row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") => {
        row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
            cell.font = { bold: true, color: { argb: fontColor } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
    };

    const applyFillToRow = (row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") => {
        row.eachCell((cell) => {
            if (cell.value !== "" && cell.value != null) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                cell.font = { ...(cell.font || {}), color: { argb: fontColor }, bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            }
        });
    };

    // Sheet header
    const headers = [
        "State",
        "Total Sites",
        "Total Hazards",
        "-",
        "-",
        "-",
        "-"
    ];
    styleHeader(sheet.addRow(headers), "1300a6");
    nestedData.forEach((st) => {
        const stateRow = sheet.addRow([
            st.state,
            st.sitesCount,
            st.count,
            "-",
            "-",
            "-",
            "-"
        ]);
        applyFillToRow(stateRow, "0d0553");

        st.children.forEach((site: any) => {
            const siteRow = sheet.addRow([
                "",
                site.stateName,
                site.count,
                "-",
                "-",
                "-",
                "-"
            ]);
            applyFillToRow(siteRow, "D9E1F2", "000");
            const detailHeaders = [
                "",
                "",
                "Hazard Type",
                "Sub Hazard Type",
                "Form ID",
                "Submission Date",
                "Submitted By",
            ];
            const activityHeaderRow = sheet.addRow(detailHeaders);
            applyFillToRow(activityHeaderRow, "00d5c9");

            // Activity rows
            site.items.forEach((item: any) => {
                sheet.addRow([
                    "",
                    "",
                    item.HazardType ?? "-",
                    item.HazardSubType ?? "-",
                    item.HazardFormId ?? "-",
                    item.SubmissionDateDisplay ?? "-",
                    item.SubmittedBy ?? "-",
                ]);
            });

            sheet.addRow([]); // gap after each site
        });

        // sheet.addRow([]); // gap after each state
    });

    // Auto-fit columns
    sheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
            if (cell.value != null) maxLength = Math.max(maxLength, String(cell.value).length);
        });
        col.width = Math.min(maxLength + 5, 60);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, fileName);
    });
};

export const buildDashboardOneLevelGridData = (
    data: HazardData[],
    groupBy: keyof HazardData
): any[] => {

    const defaultLabels: Record<string, string> = {
        State: "Unknown State",
        SiteName: "Unknown Site",
        HazardType: "Unknown Hazard Type",
        HazardSubType: "Unknown Sub Hazard",
        SubmissionDate: "Unknown Submission Date",
        SubmittedBy: "Unknown Submitted By",
    };

    const rootMap: Record<string, any> = {};

    data.forEach(item => {
        const groupValue = (item[groupBy] as string) || defaultLabels[groupBy];

        if (!rootMap[groupValue]) {
            rootMap[groupValue] = {
                label: groupValue,
                count: 0,
                children: [],
                level: "group",
            };
        }

        rootMap[groupValue].children!.push({
            label: "submission-row",
            count: 1,
            level: "submission",
            State: item.State,
            SiteName: item.SiteName,
            HazardType: item.HazardType,
            HazardSubType: item.HazardSubType,
            SubmissionDate: item.SubmissionDate,
            SubmittedBy: item.SubmittedBy,
            children: []
        });

        rootMap[groupValue].count! += 1;
    });

    return Object.values(rootMap);
};

export const generateGenericHazardExcel = (
    groupedData: any[],
    groupByField: string,
    fileName: string = "HazardReport.xlsx"
) => {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Hazard Report");

    const styleRow = (row: ExcelJS.Row, bg: string, font: string = "FFFFFFFF", bold = true) => {
        row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
            cell.font = { ...cell.font, color: { argb: font }, bold };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
    };

    // Mapping headers to data keys
    const fieldMapping: any = {
        "State": "State",
        "Site Name": "SiteName",
        "Hazard Type": "HazardType",
        "Sub Hazard Type": "HazardSubType",
        "Form ID": "HazardFormId",
        "Submission Date": "SubmissionDate",
        "Submitted By": "SubmittedBy"
    };

    let submissionHeaders = Object.keys(fieldMapping);

    // Remove the grouped column
    const skipLabel =
        groupByField === "SiteName" ? "Site Name" :
            groupByField === "HazardSubType" ? "Sub Hazard Type" :
                groupByField === "HazardType" ? "Hazard Type" :
                    groupByField === "SubmissionDate" ? "Submission Date" :
                        groupByField === "SubmittedBy" ? "Submitted By" :
                            groupByField;

    submissionHeaders = submissionHeaders.filter(h => h !== skipLabel);

    // Dynamic sheet header
    const header = [`Group By: ${groupByField}`, "Total Count", ...Array(submissionHeaders.length - 1).fill("-")];
    styleRow(sheet.addRow(header), "1300A6");

    groupedData.forEach((group) => {

        const groupRow = sheet.addRow([
            group.label,
            group.count,
            ...Array(submissionHeaders.length - 1).fill("-")
        ]);
        styleRow(groupRow, "0D0553");

        const detailHeader = sheet.addRow(["", ...submissionHeaders]);
        styleRow(detailHeader, "00D5C9", "000000");

        group.children.forEach((submission: any) => {
            // const rowValues = submissionHeaders.map(h => {
            //     const field = fieldMapping[h];
            //     return submission[field] ?? "-";
            // });

            const rowValues = submissionHeaders.map(h => {
                const field = fieldMapping[h];
                if (field === "SubmissionDate") {
                    return submission["SubmissionDateDisplay"] ?? submission[field] ?? "-";
                }
                return submission[field] ?? "-";
            });

            sheet.addRow(["", ...rowValues]);
        });

        sheet.addRow([]);
    });

    // Autofit
    sheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
            if (cell.value) maxLength = Math.max(maxLength, cell.value.toString().length);
        });
        col.width = Math.min(maxLength + 5, 50);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, fileName);
    });
};

export const buildExcelGroupings = (data: any[]) => {
    const byState: any = {};
    const bySite: any = {};
    const byHazard: any = {};
    const bySubHazard: any = {};
    const bySubmission: any = {};
    const byUser: any = {};

    data.forEach(item => {
        const {
            State,
            SiteName,
            HazardType,
            HazardSubType,
            SubmissionDate,
            SubmittedBy
        } = item;

        const addToGroup = (group: any, key: string) => {
            if (!group[key]) {
                group[key] = {
                    label: key,
                    count: 0,
                    children: []
                };
            }
            group[key].count++;
            group[key].children.push({
                label: "submission-row",
                level: "submission",
                ...item
            });
        };

        addToGroup(byState, State || "Unknown State");
        addToGroup(bySite, SiteName || "Unknown Site");
        addToGroup(byHazard, HazardType || "Unknown Hazard");
        addToGroup(bySubHazard, HazardSubType || "Unknown Sub-Hazard");
        addToGroup(bySubmission, SubmissionDate || "Unknown Date");
        addToGroup(byUser, SubmittedBy || "Unknown Reporter");
    });

    // const sortGroups = (group: any) =>
    //     Object.values(group).sort((a: any, b: any) => b.count - a.count);

    // return {
    //     byState: sortGroups(byState),
    //     bySite: sortGroups(bySite),
    //     byHazard: sortGroups(byHazard),
    //     bySubHazard: sortGroups(bySubHazard),
    //     bySubmission: sortGroups(bySubmission),
    // };

    const sortGroups = (group: any) => {
        const sorted = Object.values(group).sort((a: any, b: any) => b.count - a.count);

        sorted.forEach((g: any) => {
            g.children.sort((a: any, b: any) => b.SubmissionTimestamp - a.SubmissionTimestamp);
        });

        return sorted;
    };

    return {
        byState: sortGroups(byState),
        bySite: sortGroups(bySite),
        byHazard: sortGroups(byHazard),
        bySubHazard: sortGroups(bySubHazard),
        bySubmission: sortGroups(bySubmission),
        bySubmittedBy: sortGroups(byUser),
    };
};

// export const buildChartGroupings = (data: any[]) => {
//     const groupBy = (key: string) => {
//         const map: any = {};
//         data.forEach(item => {
//             const k = item[key] || `Unknown ${key}`;
//             map[k] = (map[k] || 0) + 1;
//         });

//         return Object.entries(map).map(([label, count]) => ({
//             label,
//             count
//         }));
//     };

//     return {
//         byState: groupBy(HazardFields.State),
//         bySite: groupBy(HazardFields.SiteName),
//         byHazard: groupBy(HazardFields.HazardType),
//         bySubHazard: groupBy(HazardFields.HazardSubType),
//         bySubmission: groupBy(HazardFields.SubmissionDate),
//     };
// };


export const generateExcelFileName = (reportTitle: string) => {
    const timestamp = moment().format("YYYYMMDD_HHmm");
    return `HZ_${reportTitle}_${timestamp}.xlsx`;
};

export const generateCommonExcelFileName = (reportTitle: string, prefix?: string) => {
    const timestamp = moment().format("YYYYMMDD_HHmm");
    const filePrefix = prefix && prefix.trim() !== "" ? `${prefix}_` : "";
    return `${filePrefix}${reportTitle}_${timestamp}.xlsx`;
};


export const getHazardIconUrl = (fileUrl: string, context: any) => {
    if (!fileUrl) return "";
    const fileName = fileUrl.split('/').pop();
    return `${context.pageContext.web.serverRelativeUrl}/HazardReportLibrary/HazardReportForm/${fileName}`;
};

export const getClientResponseIconUrl = (fileUrl: string, context: any) => {
    if (!fileUrl) return "";
    const fileName = fileUrl.split('/').pop();
    return `${context.pageContext.web.serverRelativeUrl}/ClientResponseImages/ClientResponseImages/${fileName}`;
};

export const buildSiteMap = (siteItems: any[]) => {
    return Object.fromEntries(
        siteItems.map((s) => [Number(s.ID), s])
    );
};

export const getIconUrl = (fileUrl: string, context: any) => {
    if (!fileUrl) return "";

    if (fileUrl.startsWith("/")) {
        return fileUrl;
    }

    if (fileUrl.startsWith("..")) {
        const baseUrl = context.pageContext.web.serverRelativeUrl;
        const cleanedPath = fileUrl.replace(/^(\.\.\/)+/, "");
        return `${baseUrl}/${cleanedPath}`;
    }

    return `${context.pageContext.web.serverRelativeUrl}/${fileUrl}`;
};


export const getClientResponseAttachments = async (provider: IDataProvider, context: any, selectedItem: any): Promise<string[]> => {
    try {
        const select = ["ID", "Attachments", "AttachmentFiles"];
        const expand = ["AttachmentFiles"];

        const queryOptions: IPnPQueryOptions = {
            select,
            listName: ListNames.ClientResponsesSubmission,
            id: selectedItem?.Id,
            expand: expand
        };

        const data = await provider.getByItemByIDQuery(queryOptions);

        const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/${ListNames.ClientResponsesSubmission}/Attachments/${data?.ID}/`;

        // const imageUrls: string[] = data?.AttachmentFiles?.map((file: any) =>
        //     file.ServerRelativeUrl || (file.FileName ? fixImgURL + file.FileName : notFoundImage)
        // ) || [];

        const attachments = data?.AttachmentFiles?.map((file: any) => {
            const fileName = file.FileName;
            if (fileName === `${selectedItem?.HazardFormId}.pdf`) return null;

            const fileUrl = file.ServerRelativeUrl || fixImgURL + fileName;

            const fileType = getFileType(fileName);
            return { fileName, fileUrl, fileType };
        })?.filter(Boolean) || [];

        return attachments;

    } catch (error: any) {
        console.error("Error fetching attachments:", error);
        return [];
    }
};

export const buildSiteCategoryTabs = (items: any[]): any[] => {
    const map = new Map<number, any>();
    let noCategoryCount = 0;

    items.forEach(item => {
        if (item.SiteCategoryId !== NO_SITE_CATEGORY_ID) {
            if (!map.has(item.SiteCategoryId)) {
                map.set(item.SiteCategoryId, {
                    Id: item.SiteCategoryId,
                    Title: item.SiteCategory,
                    Count: 1
                });
            } else {
                map.get(item.SiteCategoryId)!.Count += 1;
            }
        } else {
            noCategoryCount++;
        }
    });

    const categories = Array.from(map.values()).sort((a, b) =>
        a.Title.localeCompare(b.Title, undefined, { sensitivity: "base" })
    );

    categories.push({
        Id: NO_SITE_CATEGORY_ID,
        Title: CRGridTitles.NoCategory,
        Count: noCategoryCount
    });

    return categories;
};

export const groupResponseByQCState = (category: any[], sites: { ID: any; QCStateId: any }[]) => {
    const siteIdToQCStateMap = new Map(
        sites.map(item => [item.ID, item.QCStateId])
    );

    const grouped = category.reduce((acc: any, item: any) => {
        const qcStateId = siteIdToQCStateMap.get(item.SiteNameId);
        if (qcStateId) {
            acc[qcStateId] = (acc[qcStateId] || 0) + 1;
        }
        return acc;
    }, {});

    return Object.entries(grouped).map(([qcStateId, count]) => ({
        Id: qcStateId,
        Count: count
    }));
};


export const buildExcelGroupingsClientResponse = (data: any[]) => {
    const byState: any = {};
    const bySite: any = {};
    const byCategory: any = {};
    const bySubCategory: any = {};
    const bySubmission: any = {};
    const byUser: any = {};

    data.forEach(item => {
        const {
            State,
            SiteName,
            Category,
            SubCategory,
            SubmissionDate,
            ReportedBy
        } = item;

        const addToGroup = (group: any, key: string) => {
            if (!group[key]) {
                group[key] = {
                    label: key,
                    count: 0,
                    children: []
                };
            }
            group[key].count++;
            group[key].children.push({
                label: "submission-row",
                level: "submission",
                ...item
            });
        };

        addToGroup(byState, State || "Unknown State");
        addToGroup(bySite, SiteName || "Unknown Site");
        addToGroup(byCategory, Category || "Unknown Category");
        addToGroup(bySubCategory, SubCategory || "Unknown Sub-Category");
        addToGroup(bySubmission, SubmissionDate || "Unknown Date");
        addToGroup(byUser, ReportedBy || "Unknown Reporter");
    });

    const sortGroups = (group: any) => {
        const sorted = Object.values(group).sort((a: any, b: any) => b.count - a.count);

        sorted.forEach((g: any) => {
            g.children.sort((a: any, b: any) => b.SubmissionTimestamp - a.SubmissionTimestamp);
        });

        return sorted;
    };

    return {
        byState: sortGroups(byState),
        bySite: sortGroups(bySite),
        byCategory: sortGroups(byCategory),
        bySubCategory: sortGroups(bySubCategory),
        bySubmission: sortGroups(bySubmission),
        byReportedBy: sortGroups(byUser),
    };
};

export const generateExcelClientReport = (
    rawData: any[],
    topNSites?: number,
    fileName: string = "StateSiteClientFeedbackReport.xlsx"
) => {
    const nestedData = generateStateSiteHazardData(rawData, topNSites);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("State-Site-Category");

    const styleHeader = (row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") => {
        row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
            cell.font = { bold: true, color: { argb: fontColor } };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
    };

    const applyFillToRow = (row: ExcelJS.Row, bgColor: string, fontColor: string = "FFFFFFFF") => {
        row.eachCell((cell) => {
            if (cell.value !== "" && cell.value != null) {
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } };
                cell.font = { ...(cell.font || {}), color: { argb: fontColor }, bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle" };
            }
        });
    };

    // Sheet header
    const headers = [
        "State",
        "Total Sites",
        "Total Response",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-",
        "-"
    ];
    styleHeader(sheet.addRow(headers), "1300a6");
    nestedData.forEach((st) => {
        const stateRow = sheet.addRow([
            st.state,
            st.sitesCount,
            st.count,
            "-",
            "-",
            "-",
            "-",
            "-",
            "-",
            "-"
        ]);
        applyFillToRow(stateRow, "0d0553");

        st.children.forEach((site: any) => {
            const siteRow = sheet.addRow([
                "",
                site.stateName,
                site.count,
                "-",
                "-",
                "-",
                "-",
                "-",
                "-",
                "-"
            ]);
            applyFillToRow(siteRow, "D9E1F2", "000");
            const detailHeaders = [
                "",
                "",
                ClientResponseViewFields.Category,
                ClientResponseViewFields.SubCategory,
                ClientResponseViewFields.ResponseFormId,
                ClientResponseViewFields.ReportedBy,
                ClientResponseViewFields.SubmissionDate,
                ClientResponseViewFields.ResolvedDate,
                ClientResponseViewFields.ResolvedBy,
                ClientResponseViewFields.ClientResponseStatus,

            ];
            const activityHeaderRow = sheet.addRow(detailHeaders);
            applyFillToRow(activityHeaderRow, "00d5c9");

            // Activity rows
            site.items.forEach((item: any) => {
                sheet.addRow([
                    "",
                    "",
                    item.Category ?? "-",
                    item.SubCategory ?? "-",
                    item.ResponseFormId ?? "-",
                    item.ReportedBy ?? "-",
                    item.SubmissionDateDisplay ?? "-",
                    item.ResolvedDate ?? "-",
                    item.ResolvedBy ?? "-",
                    item.Status ?? "-"
                ]);
            });

            sheet.addRow([]); // gap after each site
        });
    });

    // Auto-fit columns
    sheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
            if (cell.value != null) maxLength = Math.max(maxLength, String(cell.value).length);
        });
        col.width = Math.min(maxLength + 5, 60);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        saveAs(blob, fileName);
    });
};

export const buildStateWiseClientResponseData = (data: any[], siteNameFilter?: string): any[] => {

    const rootMap: Record<string, any> = {};

    data.forEach(item => {
        const stateName = item.State || "Unknown State";
        const siteName = item.SiteName || "Unknown Site";
        const category = item.Category || "Unknown Category";

        const parentRootKey = siteNameFilter ? category : stateName;

        if (siteNameFilter && siteName !== siteNameFilter) return;

        if (!rootMap[parentRootKey]) {
            rootMap[parentRootKey] = {
                label: parentRootKey,
                count: 0,
                children: [],
                level: siteNameFilter ? "category" : "state"
            };
        }

        const rootNode = rootMap[parentRootKey];

        if (!siteNameFilter) {
            let siteNode = rootNode.children!.find((s: { label: any; }) => s.label === siteName);
            if (!siteNode) {
                siteNode = {
                    label: siteName,
                    count: 0,
                    children: [],
                    level: "site"
                };
                rootNode.children!.push(siteNode);
            }

            let categoryNode = siteNode.children!.find((h: { label: any; }) => h.label === category);
            if (!categoryNode) {
                categoryNode = {
                    label: category,
                    count: 0,
                    items: [],
                    isLastLevel: true,
                    level: "category"
                };
                siteNode.children!.push(categoryNode);
            }

            categoryNode.items!.push({
                SubCategory: item.SubCategory || "Unknown Sub-Category",
                SubmissionDate: item.SubmissionDateDisplay || "Unknown Date",
                ReportedBy: item.ReportedBy || "Unknown Reporter",
                Category: item.Category || "Unknown Category",
                SiteName: item.SiteName || "Unknown Site"
            });

            categoryNode.count = (categoryNode.count || 0) + 1;
            siteNode.count = (siteNode.count || 0) + 1;
            rootNode.count = (rootNode.count || 0) + 1;

        } else {
            const categoryNode = rootNode;
            categoryNode.items = categoryNode.items || [];
            categoryNode.isLastLevel = true;
            categoryNode.level = "category";

            categoryNode.items.push({
                SubCategory: item.SubCategory || "Unknown Sub-Category",
                SubmissionDate: item.SubmissionDateDisplay || "Unknown Date",
                ReportedBy: item.ReportedBy || "Unknown Reporter",
                Category: item.Category || "Unknown Category",
                SiteName: item.SiteName || "Unknown Site"
            });

            categoryNode.count = (categoryNode.count || 0) + 1;
        }
    });

    return Object.values(rootMap);
};

export const generateGenericCRExcel = (
    groupedData: any[],
    groupByField: string,
    fileName: string = "ClientFeedbackData.xlsx"
) => {

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(CRGridTitles.ClientFeedbackReport);

    const styleRow = (row: ExcelJS.Row, bg: string, font: string = "FFFFFFFF", bold = true) => {
        row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } };
            cell.font = { ...cell.font, color: { argb: font }, bold };
            cell.alignment = { horizontal: "center", vertical: "middle" };
        });
    };

    // Mapping headers to data keys
    const fieldMapping: any = {
        "State": "State",
        "Site Name": "SiteName",
        "Category": "Category",
        "Sub Category": "SubCategory",
        "Form ID": "ResponseFormId",
        "Submission Date": "SubmissionDate",
        "Reported By": "ReportedBy"
    };

    let submissionHeaders = Object.keys(fieldMapping);

    // Remove the grouped column
    const skipLabel =
        groupByField === "SiteName" ? "Site Name" :
            groupByField === "SubCategory" ? "Sub Category" :
                groupByField === "Category" ? "Category" :
                    groupByField === "SubmissionDate" ? "Submission Date" :
                        groupByField === "ReportedBy" ? "Reported By" :
                            groupByField;

    submissionHeaders = submissionHeaders.filter(h => h !== skipLabel);

    // Dynamic sheet header
    const header = [`Group By: ${groupByField}`, "Total Count", ...Array(submissionHeaders.length - 1).fill("-")];
    styleRow(sheet.addRow(header), "1300A6");

    groupedData.forEach((group) => {

        const groupRow = sheet.addRow([
            group.label,
            group.count,
            ...Array(submissionHeaders.length - 1).fill("-")
        ]);
        styleRow(groupRow, "0D0553");

        const detailHeader = sheet.addRow(["", ...submissionHeaders]);
        styleRow(detailHeader, "00D5C9", "000000");

        group.children.forEach((submission: any) => {

            const rowValues = submissionHeaders.map(h => {
                const field = fieldMapping[h];
                if (field === "SubmissionDate") {
                    return submission["SubmissionDateDisplay"] ?? submission[field] ?? "-";
                }
                return submission[field] ?? "-";
            });

            sheet.addRow(["", ...rowValues]);
        });

        sheet.addRow([]);
    });

    // Autofit
    sheet.columns.forEach((col: any) => {
        let maxLength = 10;
        col.eachCell({ includeEmpty: true }, (cell: any) => {
            if (cell.value) maxLength = Math.max(maxLength, cell.value.toString().length);
        });
        col.width = Math.min(maxLength + 5, 50);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, fileName);
    });
};

export const getJSONFileContent = async (provider: IDataProvider) => {
    try {
        const queryStringOptions: IPnPQueryOptions = {
            select: ["ID", "FileRef", "SiteCategoryId"],
            listName: ListNames.ClientResponseForm
        };

        const results = await provider.getItemsByQuery(queryStringOptions);
        if (!results?.length) return [];

        const filesWithContent = await Promise.all(
            results.map(async (item: any) => {
                if (!item.FileRef) return null;
                try {
                    const jsonContent = await provider.readFileContent(item.FileRef, "json");
                    return {
                        Id: item.ID,
                        siteCategoryId: item.SiteCategoryId ?? NO_SITE_CATEGORY_ID,
                        content: jsonContent
                    };
                } catch (err) {
                    console.log("Failed to read JSON file", item.FileRef, err);
                    return null;
                }
            })
        );
        return filesWithContent;
    } catch (err) {
        console.log("Could not load file content", err);
        return [];
    }
};