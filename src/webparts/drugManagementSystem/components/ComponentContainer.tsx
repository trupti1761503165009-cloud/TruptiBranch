import * as React from 'react';
import { useAtom } from 'jotai';
import { appGlobalStateAtom } from '../jotai/appGlobalStateAtom';
import { ComponentNameEnum } from '../models/ComponentNameEnum';
import { HeaderComponent } from './Common/HeaderComponent';
import { AdminDashboard } from './Custom/components/Admin/AdminDashboard';
import { CreateCTDFolder } from './Custom/components/Admin/CreateCTDFolder';
import { DrugsDatabase } from './Custom/components/Admin/DrugsDatabase';
import { ManageCategories } from './Custom/components/Admin/ManageCategories';
import { ManageDocuments } from './Custom/components/Admin/ManageDocuments';
import { ManageTemplates } from './Custom/components/Admin/ManageTemplates';
import { Reports } from './Custom/components/Admin/Reports';
import { UserPermissions } from './Custom/components/Admin/UserPermissions';
import { ApproverDashboard } from './Custom/components/Approver/ApproverDashboard';
import { AuthorDashboard } from './Custom/components/Author/AuthorDashboard';
import { ReviewerDashboard } from './Custom/components/Reviewer/ReviewerDashboard';
import { AddDocument } from './Custom/components/Admin/ManageDocuments/AddDocument';
import { AddCategory } from './Custom/components/Admin/ManageCategories/AddCategory';
import { EditCategory } from './Custom/components/Admin/ManageCategories/EditCategory';
import { EditDocument } from './Custom/components/Admin/ManageDocuments/EditDocument';
import { AddTemplate } from './Custom/components/Admin/ManageTemplates/AddTemplate';
import { EditTemplate } from './Custom/components/Admin/ManageTemplates/EditTemplate';
import { AddUser } from './Custom/components/Admin/UserPermissions/AddUser';
import { EditUser } from './Custom/components/Admin/UserPermissions/EditUser';
import { AddDrug } from './Custom/components/Admin/DrugsDatabase/AddDrug';
import { EditDrug } from './Custom/components/Admin/DrugsDatabase/EditDrug';
import { AddCTDFolder } from './Custom/components/Admin/CreateCTDFolder/AddCTDFolder';
import { EditCTDFolder } from './Custom/components/Admin/CreateCTDFolder/EditCTDFolder';

// Import components


export interface IComponentContainerProps {
  componentName: string;
  componentProps: any;
  manageComponentView: (props: any) => void;
  onClickNav?: (currentNav: string, id: string) => void;
}

export const ComponentContainer: React.FC<IComponentContainerProps> = (props) => {
  const renderComponent = () => {
    const commonProps = {
      manageComponentView: props.manageComponentView,
      onClickNav: props.onClickNav,
      ...props.componentProps
    };

    switch (props.componentName) {
      case ComponentNameEnum.AdminDashboard:
        return <AdminDashboard {...commonProps} />;

      case ComponentNameEnum.ManageDocuments:
        return <ManageDocuments {...commonProps} />;

      case ComponentNameEnum.ManageCategories:
        return <ManageCategories {...commonProps} />;

      case ComponentNameEnum.ManageTemplates:
        return <ManageTemplates {...commonProps} />;

      case ComponentNameEnum.UserPermissions:
        return <UserPermissions {...commonProps} />;

      case ComponentNameEnum.Reports:
        return <Reports {...commonProps} />;

      case ComponentNameEnum.DrugsDatabase:
        return <DrugsDatabase {...commonProps} />;

      case ComponentNameEnum.CreateCTDFolder:
        return <CreateCTDFolder {...commonProps} />;

      case ComponentNameEnum.AuthorDashboard:
        return <AuthorDashboard {...commonProps} />;

      case ComponentNameEnum.ApproverDashboard:
        return <ApproverDashboard {...commonProps} />;

      case ComponentNameEnum.ReviewerDashboard:
        return <ReviewerDashboard {...commonProps} />;

      // Document Pages
      case ComponentNameEnum.AddDocument:
        return <AddDocument {...commonProps} />;
      case ComponentNameEnum.EditDocument:
        return <EditDocument {...commonProps} />;

      // Category Pages
      case ComponentNameEnum.AddCategory:
        return <AddCategory {...commonProps} />;
      case ComponentNameEnum.EditCategory:
        return <EditCategory {...commonProps} />;

      // Template Pages
      case ComponentNameEnum.AddTemplate:
        return <AddTemplate {...commonProps} />;
      case ComponentNameEnum.EditTemplate:
        return <EditTemplate {...commonProps} />;

      // User Pages
      case ComponentNameEnum.AddUser:
        return <AddUser {...commonProps} />;
      case ComponentNameEnum.EditUser:
        return <EditUser {...commonProps} />;

      // Drug Pages
      case ComponentNameEnum.AddDrug:
        return <AddDrug {...commonProps} />;
      case ComponentNameEnum.EditDrug:
        return <EditDrug {...commonProps} />;

      // CTD Folder Pages
      case ComponentNameEnum.AddCTDFolder:
        return <AddCTDFolder {...commonProps} />;
      case ComponentNameEnum.EditCTDFolder:
        return <EditCTDFolder {...commonProps} />;

      default:
        return <AdminDashboard />;
      // <AddClient
      //             loginUserRoleDetails={componentProps.loginUserRoleDetails}
      //             provider={provider}
      //             context={context}
      //             isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
      //             siteMasterId={componentProps.siteMasterId}
      //             breadCrumItems={componentProps.breadCrumItems || []}
      //             componentProps={props.componentProps}
      //             originalSiteMasterId={componentProps.originalSiteMasterId}
      //         />;
      //         break;
    }
  };

  return (
    <>
      <HeaderComponent
        manageComponentView={props.manageComponentView}
        currentComponent={props.componentName}
        onClickNav={props.onClickNav}
      />
      <main className="main-content">
        {renderComponent()}
      </main>
    </>
  );
};