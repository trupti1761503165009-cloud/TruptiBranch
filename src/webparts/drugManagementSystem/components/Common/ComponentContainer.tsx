import * as React from "react";
import { useAtom, useAtomValue } from "jotai";
import { Header, INavItem } from "./Header/Header1";
import { appGlobalStateAtom } from "../../../jotai/appGlobalStateAtom";
import { ICurrentUser } from "../../../models/ICurrentUser";
import { ComponentName } from "../../../Shared/Enum/ComponentName";
import IPnPQueryOptions from "../../../Service/models/IPnPQueryOptions";
import { ListNames } from "../../../Shared/Enum/ListNames";

import { GroupEnum, IEmployeeItem, IGroupItem, IUserInfo } from "../../../Shared/constants/defaultValues";
import { IDataProvider } from "../../../Service/models/IDataProvider";
import { IPAFormCancelAtom } from "../../../jotai/PAFormCancelAtom";
import { IDrugManagementSystemProps } from "../IDrugManagementSystemProps";



interface ILoadComponentProps {
  appProps: IDrugManagementSystemProps;
  componentName: any;
  prevComponentName: string;
  loadComponent: (_componentName: string, _prevComponentName?: string, itemId?: number, PermitType?: string, CurrentComponentName?: string) => void;
  itemId: number;
  ViewPAtrue: boolean
  SPUserInfo: any;
  UserDetail: IEmployeeItem | any;
  UserGroups: IGroupItem[] | any;
  IsAdmin: boolean | any;
  IsHumanResource: boolean | any;
  IsProjectManager: boolean | any;
}


const LoadComponent = React.memo(({ appProps, componentName, prevComponentName, loadComponent, itemId, ViewPAtrue, SPUserInfo, UserDetail, UserGroups,
  IsAdmin, IsHumanResource, IsProjectManager, }: ILoadComponentProps) => {
  const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
  const { IsPAForm } = useAtomValue(IPAFormCancelAtom)
  const { provider } = appGlobalState;
  const currentUserRef = React.useRef<ICurrentUser & { DesignationName?: string } | any>();
  const currentUserInfo = React.useRef<IUserInfo | null>(null);
  const [IsCancelViewPAForm, setIsCancelViewPAForm] = useAtom(IPAFormCancelAtom);




  const getEmployeeDetail = async (provider: any, employeeId: number = 0, spUserId: number = 0): Promise<IEmployeeItem | null> => {
    try {
      let filter = "";
      const select = ["ID", "HRMSLocationId", "EmployeeRole", "FirstName1", "MiddleName1", "LastName", "EmployeeStatus", "EmployeeUser/ID", "Designation/DesignationName"];
      const expand = ["EmployeeUser,Designation"];
      if (employeeId) {
        filter = `ID eq '${employeeId}' and IsActive_x003F_ eq 1 `;
      } else if (spUserId) {

        filter = `EmployeeUser/ID eq '${spUserId}' and IsActive_x003F_ eq 1`;
      } else {
        console.error("Both employeeId and spUserId are invalid");
        return null;
      }

      const queryStringOptions: IPnPQueryOptions = {
        select,
        filter,
        expand,
        top: 5000,
        listName: ListNames.Employee,
      };

      const results = await appProps.provider.getItemsByQuery(queryStringOptions);

      if (results && results.length > 0) {
        const data = results[0];

        const empData: IEmployeeItem = {
          ID: data.ID,
          LocationId: data.HRMSLocationId || 0,
          FirstName: data.FirstName1 || "",
          MiddleName: data.MiddleName1 || "",
          LastName: data.LastName || "",
          EmployeeStatus: data.EmployeeStatus || "",
          FinancialYearId: 0,
          EmployeeRole: data.EmployeeRole,
          FinancialStartDate: 0,
          FinancialEndDate: 0,
          Designation: data.Designation.DesignationName
        };
        // const fDetail = await getCurrentFinancialYearDetail(provider, empData.LocationId);
        // empData.FinancialYearId = fDetail ? (fDetail.ID || 0) : 0;
        // empData.FinancialStartDate = fDetail ? (fDetail.FinancialStartDate || 0) : 0;
        // empData.FinancialEndDate = fDetail ? (fDetail.FinancialEndDate || 0) : 0;
        return empData;
      }

      return null; // No data found
    } catch (error) {
      console.error("Failed to fetch employee detail:", error);
      return null; // Error case
    }
  };
  const getCurrentLoginUserDetail = async (provider: IDataProvider): Promise<IUserInfo> => {
    try {
      // Fetch current user
      const currentUserResponse = await provider.getCurrentUser();

      // Fetch current user groups
      const currentUserGroups = await provider.getCurrentUserGroups();


      // Transform groups to values
      const listValues = currentUserGroups.map((grp: any) => ({
        value: grp.Id,
        label: grp.Title
      }));

      const adminGroupName = GroupEnum.Admin.toLowerCase();
      const isAdmin = listValues.some((x: IGroupItem) => x.label.toLowerCase() === adminGroupName);

      const hrGroupName = GroupEnum.HR.toLowerCase();
      const isHumanResource = listValues.some((x: IGroupItem) => x.label.toLowerCase() === hrGroupName);

      const ProjectManagerName = GroupEnum.ProjectManager.toLowerCase();
      const isProjectManager = listValues.some((x: IGroupItem) => x.label.toLowerCase() === ProjectManagerName);

      // Fetch employee detail
      const employeeDetail = await getEmployeeDetail(provider, 0, currentUserResponse.Id);

      // Return the populated IUserInfo object
      return {
        UserDetail: employeeDetail,
        SPUserInfo: currentUserResponse,
        UserGroups: listValues,
        IsAdmin: isAdmin,
        IsHumanResource: isHumanResource,
        // IsProjectManager: (employeeDetail && employeeDetail.Designation === EmployeeRole.PM) ? true : false
        IsProjectManager: isProjectManager
      };
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch and process user data.");
    }
  };
 

  const currentComponent = (): React.ReactNode => {
    switch (componentName) {
      // case ComponentName.PAFormDashboard:
      //   return <PAFormDashboard itemId={itemId} />;
      // case ComponentName.AccessDenied:
      //   return <AccessDenied />;
      // case ComponentName.AddPAForm:
      //   return <AddPAForm Itemdata={itemId} IsReviewed={ViewPAtrue} />;
      // case ComponentName.TeamReviews:
      //   return <TeamReviews />;
      // case ComponentName.AddAnnualPAForm:
      //   return <AddAnnualPAForm itemId={itemId} />;
      // case ComponentName.ViewPAForm:
      //   return <ViewPAForm itemId={itemId} CurrentComponentName={IsCancelViewPAForm?.IsPAForm ? ComponentName.TeamReviews : ComponentName.PAFormDashboard} />;
      // case ComponentName.ViewAnnualPAForm:
      //   return <ViewAnnualPAForm item={itemId} />;
      // case ComponentName.PAProcessNotStarted:
      //   return <PAProcessNotStarted />;
      // case ComponentName.ViewPAFormForProjectManager:
      //   return <ViewPAFormForProjectManager item={itemId} />;
      default:
        return null;
    }
  };
  React.useEffect(() => {
    if (componentName === ComponentName.ViewPAFormForProjectManager) {
      setIsCancelViewPAForm({ IsPAForm: true });
    } else if (componentName === ComponentName.PAFormDashboard) {
      setIsCancelViewPAForm({ IsPAForm: false });
    }
  }, [componentName]);

  const navItems: INavItem[] = [
    {
      name: ComponentName.PAFormDashboard,
      childItems: [
        (IsPAForm == false ? ComponentName.AddPAForm : ""),
        ComponentName.AddAnnualPAForm,
        (IsPAForm == false ? ComponentName.ViewPAForm : ""),
        (IsPAForm == false ? ComponentName.ViewAnnualPAForm : ""),
        // ComponentName.ViewAnnualPAForm
      ]
    },
    (appGlobalState?.IsAdmin || appGlobalState?.IsHumanResource || appGlobalState?.IsProjectManager) ? {
      name: ComponentName.TeamReviews,
      childItems: [
        (IsPAForm == true ? ComponentName.ViewPAForm : ""),
        (IsPAForm == true ? ComponentName.ViewAnnualPAForm : ""),
        (IsPAForm == true ? ComponentName.AddPAForm : ""),
        ComponentName.ViewPAFormForProjectManager
      ]
    } : null

  ].filter(Boolean) as INavItem[];

  return (
    <React.Fragment>
      {
        componentName !== ComponentName.AccessDenied && componentName !== ComponentName.PAProcessNotStarted ? (
          <>
            <Header
              loadComponent={loadComponent}
              currentView={componentName}
              linkItems={navItems}
            />
            {provider !== undefined && (
              <>
                {currentComponent()}
              </>
            )}
          </>
        ) : (
          currentComponent()
        )
      }
    </React.Fragment>
  );
});


export default LoadComponent;