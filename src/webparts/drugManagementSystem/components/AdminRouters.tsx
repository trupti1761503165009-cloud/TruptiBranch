import * as React from 'react';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../jotai/appGlobalStateAtom';
import { ComponentNameEnum } from '../models/ComponentNameEnum';
import { ManageCategories } from './Custom/components/Admin/ManageCategories';
import { AddCategory } from './Custom/components/Admin/ManageCategories/AddCategory';
import { EditCategory } from './Custom/components/Admin/ManageCategories/EditCategory';
import { ManageTemplates } from './Custom/components/Admin/ManageTemplates';
import { AddTemplate } from './Custom/components/Admin/ManageTemplates/AddTemplate';
import { EditTemplate } from './Custom/components/Admin/ManageTemplates/EditTemplate';
import { ManageTemplates as TemplatesList } from './Custom/components/Admin/ManageTemplates';
import { DrugsDatabase } from './Custom/components/Admin/DrugsDatabase';
import { AddDrug } from './Custom/components/Admin/DrugsDatabase/AddDrug';
import { EditDrug } from './Custom/components/Admin/DrugsDatabase/EditDrug';
import { UserPermissions } from './Custom/components/Admin/UserPermissions/UserPermissions';
import { AddUser } from './Custom/components/Admin/UserPermissions/AddUser';
import { EditUser } from './Custom/components/Admin/UserPermissions/EditUser';
import { CreateDocumentPage } from './Custom/components/Admin/CreateDocumentPage/CreateDocumentPage';
import { ManageDocuments } from './Custom/components/Admin/ManageDocuments';
import { ManageGMP } from './Custom/components/Admin/ManageGMP/ManageGMP';
import { ManageTMF } from './Custom/components/Admin/ManageTMF/ManageTMF';

type ManageArgs = { currentComponentName: ComponentNameEnum | ''; componentProps?: any };

const useSidebarFormEffect = (isForm: boolean) => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  React.useEffect(() => {
    setAppGlobalState((prev: any) => ({ ...prev, isSidebarHidden: isForm }));
  }, [isForm, setAppGlobalState]);
};

export const CategoriesViewRouter: React.FC = () => {
  const [state, setState] = React.useState<{ name: ComponentNameEnum; componentProps?: any }>({
    name: ComponentNameEnum.ManageCategories,
    componentProps: {}
  });

  const manageComponentView = (args: ManageArgs) => {
    const next =
      args.currentComponentName === '' ? ComponentNameEnum.ManageCategories : (args.currentComponentName as ComponentNameEnum);
    setState({ name: next, componentProps: args.componentProps });
  };

  const isForm =
    state.name === ComponentNameEnum.AddCategory ||
    state.name === ComponentNameEnum.EditCategory;
  useSidebarFormEffect(isForm);

  const commonProps = { manageComponentView, componentProps: state.componentProps };

  switch (state.name) {
    case ComponentNameEnum.AddCategory:
      return <AddCategory {...commonProps} />;
    case ComponentNameEnum.EditCategory:
      return <EditCategory {...commonProps} />;
    default:
      return <ManageCategories {...commonProps} />;
  }
};

export const TemplatesViewRouter: React.FC = () => {
  const [state, setState] = React.useState<{ name: ComponentNameEnum; componentProps?: any }>({
    name: ComponentNameEnum.ManageTemplates,
    componentProps: {}
  });

  const manageComponentView = (args: ManageArgs) => {
    const next =
      args.currentComponentName === '' ? ComponentNameEnum.ManageTemplates : (args.currentComponentName as ComponentNameEnum);
    setState({ name: next, componentProps: args.componentProps });
  };

  const isForm =
    state.name === ComponentNameEnum.AddTemplate ||
    state.name === ComponentNameEnum.EditTemplate;
  useSidebarFormEffect(isForm);

  const commonProps = { manageComponentView, componentProps: state.componentProps };

  switch (state.name) {
    case ComponentNameEnum.AddTemplate:
      return <AddTemplate {...commonProps} />;
    case ComponentNameEnum.EditTemplate:
      return <EditTemplate {...commonProps} />;
    default:
      return <TemplatesList {...commonProps} />;
  }
};

export const DrugsViewRouter: React.FC = () => {
  const [state, setState] = React.useState<{ name: ComponentNameEnum; componentProps?: any }>({
    name: ComponentNameEnum.DrugsDatabase,
    componentProps: {}
  });

  const manageComponentView = (args: ManageArgs) => {
    const next =
      args.currentComponentName === '' ? ComponentNameEnum.DrugsDatabase : (args.currentComponentName as ComponentNameEnum);
    setState({ name: next, componentProps: args.componentProps });
  };

  const isForm =
    state.name === ComponentNameEnum.AddDrug ||
    state.name === ComponentNameEnum.EditDrug;
  useSidebarFormEffect(isForm);

  const commonProps = { manageComponentView, componentProps: state.componentProps };

  switch (state.name) {
    case ComponentNameEnum.AddDrug:
      return <AddDrug {...commonProps} />;
    case ComponentNameEnum.EditDrug:
      return <EditDrug {...commonProps} />;
    default:
      return <DrugsDatabase {...commonProps} />;
  }
};

export const UsersViewRouter: React.FC = () => {
  const [state, setState] = React.useState<{ name: ComponentNameEnum; componentProps?: any }>({
    name: ComponentNameEnum.UserPermissions,
    componentProps: {}
  });

  const manageComponentView = (args: ManageArgs) => {
    const next =
      args.currentComponentName === '' ? ComponentNameEnum.UserPermissions : (args.currentComponentName as ComponentNameEnum);
    setState({ name: next, componentProps: args.componentProps });
  };

  const isForm =
    state.name === ComponentNameEnum.AddUser ||
    state.name === ComponentNameEnum.EditUser;
  useSidebarFormEffect(isForm);

  const commonProps = { manageComponentView, componentProps: state.componentProps };

  switch (state.name) {
    case ComponentNameEnum.AddUser:
      return <AddUser {...commonProps} />;
    case ComponentNameEnum.EditUser:
      return <EditUser {...commonProps} />;
    default:
      return <UserPermissions {...commonProps} />;
  }
};

export const GMPViewRouter: React.FC = () => {
  return <ManageGMP />;
};

export const TMFViewRouter: React.FC = () => {
  return <ManageTMF />;
};

export const DocumentsViewRouter: React.FC<{ filterByCurrentUser?: boolean; filterByPending?: boolean; hideAddButton?: boolean; hideFolderSidebar?: boolean }> = (props) => {
  const [state, setState] = React.useState<{ name: ComponentNameEnum; componentProps?: any }>({
    name: ComponentNameEnum.ManageDocuments,
    componentProps: {}
  });

  const manageComponentView = (args: ManageArgs) => {
    const next =
      args.currentComponentName === '' ? ComponentNameEnum.ManageDocuments : (args.currentComponentName as ComponentNameEnum);
    setState({ name: next, componentProps: args.componentProps });
  };

  const isForm = state.name === ComponentNameEnum.AddDocument || state.name === ComponentNameEnum.EditDocument;
  useSidebarFormEffect(isForm);

  const commonProps = { manageComponentView, componentProps: state.componentProps, ...props };

  switch (state.name) {
    case ComponentNameEnum.AddDocument:
      return (
        <CreateDocumentPage
          onCancel={() => manageComponentView({ currentComponentName: ComponentNameEnum.ManageDocuments })}
          onSuccess={() => manageComponentView({ currentComponentName: ComponentNameEnum.ManageDocuments })}
        />
      );
    default:
      return <ManageDocuments {...commonProps} />;
  }
};

