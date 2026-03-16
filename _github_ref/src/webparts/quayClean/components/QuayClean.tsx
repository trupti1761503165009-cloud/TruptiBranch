/* eslint-disable @typescript-eslint/no-var-requires */
import * as React from 'react';
import type { IQuayCleanProps } from './IQuayCleanProps';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { CompomentContainer } from './CustomeComponents/CompomentContainer';
import { ComponentNameEnum } from '../../../Common/Enum/ComponentNameEnum';
import { FooterComponent } from './CommonComponents/FooterComponent';
import { ToastContainer } from '../../../Common/ToastService';
import { checkThePermission, logGenerator, showPremissionDeniedPage as showPermissionDeniedPage } from '../../../Common/Util';
import { ILoginUserRoleDetails } from '../../../Interfaces/ILoginUserRoleDetails';
import { Loader } from './CommonComponents/Loader';
import { tenantNames } from '../../../Common/Constants/CommonConstants';
import { ICheckListDetail } from '../../../Interfaces/ICheckListDetail';
import { Provider } from 'jotai';
import { SPComponentLoader } from '@microsoft/sp-loader';
import { ISelectedZoneDetails } from '../../../Interfaces/ISelectedZoneDetails';
require('../assets/css/equipmentChecklist.css');
require('../assets/css/hazardStyle.css');
require('../assets/css/webfonts.css');
require('../assets/css/styles.css');
require('../assets/css/zonedesign.css');
require('../assets/css/responsive.css');
require('../assets/css/quayCleanIms.css')
require('../assets/css/table.css')

let _data = require("../../../../config/package-solution.json");

export interface IQuayCleanState {
  currentComponentName: string;
  isAddNewSite?: boolean;
  siteMasterId?: number;
  isShowDetailOnly?: boolean;
  siteName?: string;
  qCState?: string;
  qCStateId?: number;
  dataObj?: any;
  dataObj2?: any;
  siteNameId?: any;
  preViousComponentName?: any;
  breadCrumItems?: any[];
  pivotName?: string;
  subpivotName?: string;
  periodicData?: any[];
  MasterId?: any;
  originalState?: string;
  loginUserRoleDetails?: any;
  originalSiteMasterId?: any;
  IsSupervisor?: boolean;
  checkListObj?: ICheckListDetail;
  Month?: string;
  Year?: string;
  IsUpdate?: boolean;
  isReload?: boolean;
  isAllEdit?: boolean;
  UpdateItemID?: any;
  isNotGeneral?: boolean;
  IsMasterChemical?: boolean;
  view?: any;
  isMaster?: any;
  isTabView?: any;
  viewType?: any;
  existingData?: any;
  UpdateItem?: any;
  whsMasterId?: number;
  propsdata?: any;
  helpDeskEditItemId?: number[];
  isDirectView?: boolean
  manageSiteUserItem?: any;
  selectedKey?: string;
  editItemId?: any;
  isGroupViewPage?: boolean;
  viewSelectedSiteTitlesFilter?: any;
  viewSelectedStateFilter?: any;
  viewSelectedSiteManagersFilter?: any;
  viewSelectedADUsersFilter?: any;
  viewSelectedSCSitesFilter?: any;
  viewSelectedSiteIdsFilter?: any;
  empIds?: any;
  empEmails?: any;
  empPhones?: any;
  isWHSMeetingAgenda?: boolean;
  masterAssetId?: any;
  selectedZoneDetails?: ISelectedZoneDetails;
  viewBy?: string;
  isZoneEdit?: boolean;
  isZoneAddNewSite?: boolean;
  previousComponentName?: string;
}

export const QuayClean: React.FunctionComponent<IQuayCleanProps> = (props: IQuayCleanProps): React.ReactElement<IQuayCleanProps> => {
  const [state, setState] = React.useState<IQuayCleanState>({
    currentComponentName: ComponentNameEnum.DashBoard

  });
  const [componentToLoad, setComponentToLoad] = React.useState<string>(ComponentNameEnum.DashBoard);
  const [prevComponent, setPrevComponent] = React.useState<string>("");
  const userDetails = React.useRef<any>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const manageComponentView = (componentProp: IQuayCleanState) => {
    if (componentProp.currentComponentName == "AccessDenied") {
      let data = { AccessDenied: "" }
      setState({
        ...componentProp,
        loginUserRoleDetails: data
      });
    } else {
      setState({
        ...componentProp,
        loginUserRoleDetails: userDetails.current
      });
    }
  };

  const chekPermission = async () => {
    try {
      setIsLoading(true);
      const siteUrl: string = props.context.pageContext.web.absoluteUrl;
      if (!!siteUrl) {
        const urlParts = siteUrl.replace(/^https?:\/\//, '').split('.');
        const foundTenantName = urlParts[0];
        const isValidTenant = tenantNames.filter((item: string) => item.toLowerCase() === foundTenantName.toLowerCase()).length > 0;
        if (!isValidTenant) {
          manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
      }

      let data: ILoginUserRoleDetails = await checkThePermission(props.provider, props.currentUser, props.isClientView, props.siteId);
      setState({
        ...state,
        loginUserRoleDetails: data
      });
      let permissionArray = showPermissionDeniedPage(data);
      if (permissionArray.length == 0) {
        manageComponentView({
          currentComponentName: ComponentNameEnum.AccessDenied
        });
      }
      userDetails.current = data;

      setIsLoading(false);
    } catch (error) {
      console.log(error);
      const errorObj = { ErrorMethodName: "useEffect(chekPermission)", CustomErrormessage: "error in get permission", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
      void logGenerator(props.provider, errorObj);
    }
  };

  const onClickNav = (currentNav: string, id: string, parent?: string[], isChild?: boolean) => {
    try {
      const removeClassFromElements = (className: string, matchText: string) => {
        const elements = document.getElementsByClassName(className);
        Array.from(elements).forEach((element: Element) => {
          if (element.tagName === "LI" && element.textContent !== matchText) {
            // element.removeAttribute("class");
            element.classList.remove(className);
          }
        });
      };

      const addClassToElementById = (elementId: string, className: string) => {
        const element = document.getElementById(elementId);
        element?.classList.add(className);
      };

      if (isChild) {
        removeClassFromElements("active2", currentNav);
        removeClassFromElements("active", currentNav);
        if (!!parent && parent.length > 0) {
          for (let index = 0; index < parent.length; index++) {
            const items = parent[index]
            if (index == 0) {
              addClassToElementById(items.toLocaleLowerCase(), "active");
            } else {
              addClassToElementById(items.toLocaleLowerCase(), "active2");
            }


          }

        } else {
          addClassToElementById(id, "active2");
        }


      } else {
        removeClassFromElements("active", currentNav);
        removeClassFromElements("active2", currentNav);
        addClassToElementById(id, "active");
      }
    } catch (error) {
      const errorObj = {
        ErrorMethodName: "onClickNav",
        CustomErrormessage: "Error in onClickNav",
        ErrorMessage: error.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
      void logGenerator(props.provider, errorObj);
    }
  };

  React.useEffect(() => {
    try {
      chekPermission();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const loadComponent = (_componentName: string, _prevComponentName?: string) => {
    setComponentToLoad(_componentName);
    setPrevComponent(_prevComponentName || "");
  }

  return (
    <>
      {isLoading ? <Loader /> :
        <React.Fragment>
          {state.loginUserRoleDetails &&
            <Provider>
              <div className='mainWrapper'>
                <CompomentContainer
                  appProps={props}
                  onClickNav={onClickNav}
                  componentProps={state}
                  manageComponentView={manageComponentView}
                  loadComponent={loadComponent}
                  componentName={componentToLoad}
                  prevComponentName={prevComponent}
                />
                <ToastContainer position="top-center" toastOptions={{
                  duration: 4000,
                  success: {
                    style: {
                      background: '#28a745',
                      color: "White",
                      fontFamily: "NotoSans",
                      fontSize: "16px",
                    },
                  },
                }} />
                <FooterComponent />
              </div>
            </Provider>
          }
        </React.Fragment >
      }
    </>
  );
};