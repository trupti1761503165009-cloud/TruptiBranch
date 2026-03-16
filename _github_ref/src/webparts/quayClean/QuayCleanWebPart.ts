import * as React from "react";
import * as ReactDom from "react-dom";
import {
  UrlQueryParameterCollection,
  Version,
} from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as strings from "QuayCleanWebPartStrings";
import { IQuayCleanProps } from "./components/IQuayCleanProps";
import { QuayClean } from "./components/QuayClean";
import SPService from "../../DataProvider/Service";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";
import {
  faEye,
  faFilePdf,
  faSave,
  faMinus,
  faXmark,
  faRotateLeft,
  faCopy,
  faUndo,
  faLeftRight,
  faTableCells,
  faChartSimple,
  faEllipsisVertical,
  faArrowsRotate,
  faSort,
  faSortUp,
  faSortDown,
  faAngleUp,
  faArrowRight,
  faAnglesUp,
  faAngleDown,
  faCalendarDays,
  faUser,
  faBuilding,
  faCube,
  faTag,
  faPlus,
  faFileInvoice,
  faCircle,
  faInfoCircle,
  faDownload,
  faFileExcel,
  faCaretRight,
  faCaretUp,
  faEyeSlash,
  faFileDownload,
  faBars,
  faFolder,
  faGear,
  faTimeline,
  faSpinner,
  faFilterCircleXmark,
  faUpload,
  faPrint,
  faCaretDown,
  faLink,
  faPeopleCarryBox,
  faPencilAlt,
  faTrash,
  faTrashAlt,
  faImage,
  faEdit,
  faMarker,
  faClockRotateLeft,
  faCircleExclamation,
  faUserPlus,
  faFileLines,
  faHandHolding,
  faPlusSquare,
  faUserCheck,
  faTimesCircle,
  faCheck,
  faPaperPlane,
  faListCheck,
  faArrowRotateLeft,
  faQrcode,
  faStar,
  faPaperclip,
  faTh,
  faList,
  faGripVertical,
  faGripLines,
  faHourglassHalf,
  faBoxOpen,
  faArrowRotateRight,
  faArrowRightArrowLeft,
  faArchive,
  faFilter,
  faClipboard,
  faGrip,
  faTable,
  faCircleCheck,
  faCircleXmark,
  faAngleRight,
  faAngleDoubleRight,
  faAngleDoubleLeft
} from "@fortawesome/free-solid-svg-icons";
import { decrypt, decryptValue } from "../../Common/Util";
import { library } from "@fortawesome/fontawesome-svg-core";
import { ICurrentUser } from "../../Interfaces/ICurrentUser";
import { SPComponentLoader } from "@microsoft/sp-loader";
library.add(
  faPlusSquare,
  faSave,
  faXmark,
  faMinus,
  faRotateLeft,
  faCopy,
  faUndo,
  faLeftRight,
  faChartSimple,
  faTableCells,
  faEllipsisVertical,
  faArrowsRotate,
  faPlus,
  faAngleUp,
  faSort,
  faSortUp,
  faSortDown,
  faArrowRight,
  faAnglesUp,
  faAngleDown,
  faCalendarDays,
  faUser,
  faBuilding,
  faCube,
  faTag,
  faFileInvoice,
  faCircle,
  faCaretRight,
  faInfoCircle,
  faFileDownload,
  faFilePdf,
  faFileExcel,
  faEyeSlash,
  faDownload,
  faCaretUp,
  faBars,
  faFolder,
  faGear,
  faTimeline,
  faSpinner,
  faUpload,
  faFilterCircleXmark,
  faPrint,
  faCaretDown,
  faLink,
  faPeopleCarryBox,
  faPencilAlt,
  faTrash,
  faTrashAlt,
  faEdit,
  faImage,
  faMarker,
  faClockRotateLeft,
  faCircleExclamation,
  faUserPlus,
  faHandHolding,
  faFileLines,
  faUserCheck,
  faTimesCircle,
  faCheck,
  faEye,
  faPaperPlane,
  faListCheck,
  faArrowRotateLeft,
  faQrcode,
  faStar,
  faStarRegular,
  faPaperclip,
  faTh,
  faList,
  faGripVertical,
  faGripLines,
  faHourglassHalf,
  faBoxOpen,
  faArrowRotateRight,
  faArrowRightArrowLeft,
  faArchive,
  faFilter,
  faClipboard,
  faGrip,
  faTable,
  faCircleCheck,
  faCircleXmark,
  faAngleRight,
  faAngleDoubleRight,
  faAngleDoubleLeft,
  faAngleRight
);
export interface IQuayCleanWebPartProps {
  description: string;
}

export default class QuayCleanWebPart extends BaseClientSideWebPart<IQuayCleanWebPartProps> {
  private _provider: IDataProvider;
  private _currentUser: ICurrentUser;

  public render(): void {
    let adQuery: any;
    let cdQuery: any;
    let isShowQrQuery: any;
    let compNameQuery: any;

    let queryParams = new UrlQueryParameterCollection(window.location.href);
    let adCode = queryParams.getValue("adCode");
    let cdCode = queryParams.getValue("cdCode");
    let isShowQrCode = queryParams.getValue("QRCode");
    let compName = queryParams.getValue("formId");
    let isClientView: any = queryParams.getValue("isClientView");
    let siteId = queryParams.getValue("SiteId");

    if (!!compName && compName !== "") {
      compNameQuery = compName;
    } else {
      compNameQuery = "";
    }
    let decryptedSiteId: any = ""
    if (!!siteId) {
      siteId = decodeURIComponent(siteId);
      decryptedSiteId = decryptValue(siteId)


    }
    if (!!isClientView) {
      isClientView = decodeURIComponent(isClientView);
      isClientView = isClientView == "true" ? true : false;
    }

    if (!!cdCode) {
      cdCode = decodeURIComponent(cdCode);
      cdCode = cdCode.replace(" ", "+");
      let decryptedCode: string = decrypt(cdCode);
      let Id = decryptedCode;
      cdQuery = {
        siteMasterId: Id,
      };
    }

    if (!!isShowQrCode) {
      isShowQrQuery = decodeURIComponent(isShowQrCode);
      isShowQrQuery = isShowQrQuery.replace(" ", "+");
    }

    if (!!adCode) {
      adCode = decodeURIComponent(adCode);
      adCode = adCode.replace(" ", "+");
      let decryptedCode: string = decrypt(adCode);
      let Id = decryptedCode;
      adQuery = {
        siteMasterId: Id,
      };
    }

    const element: React.ReactElement<IQuayCleanProps> = React.createElement(
      QuayClean,
      {
        provider: this._provider,
        context: this.context,
        adQuery: adQuery,
        cdQuery: cdQuery,
        compNameQuery: compNameQuery,
        currentUser: this._currentUser,
        isShowQRCode: !!isShowQrQuery ? isShowQrQuery.toLocaleLowerCase() : "",
        siteId: !!decryptedSiteId ? Number(decryptedSiteId) : "",
        isClientView: isClientView || false

      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();
    SPComponentLoader.loadCss(
      `https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/CSS/styles.css?v=${Math.random()}`
    );
    this._provider = new SPService(this.context);
    this._currentUser = {
      displayName: this.context.pageContext.user.displayName,
      userId: this.context.pageContext.legacyPageContext.userId,
      email: this.context.pageContext.user.email,
      loginName: this.context.pageContext.user.loginName,
      isAdmin: this.context.pageContext.legacyPageContext?.isSiteAdmin,
    };
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }
  private hidePage() {
    const css = `
      body {
        visibility: hidden !important;
        opacity: 0 !important;
        transition: opacity .3s ease;
      }
    `;
    const style = document.createElement("style");
    style.innerHTML = css;
    document.head.appendChild(style);
  }

  private async loadApp() {
    // show the page (your custom UI is already ready)
    document.body.style.visibility = "visible";
    document.body.style.opacity = "1";
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
