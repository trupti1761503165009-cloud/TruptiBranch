/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { Provider, useAtomValue, useSetAtom } from 'jotai';
import 'office-ui-fabric-react/dist/css/fabric.css';
import { PermissionService } from '../services/PermissionService';
import { runProjectDocumentsSeeding } from '../services/ProjectDocumentsSeeder';
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
import { CTDView } from './Custom/components/Admin/CTDView/CTDView';
import { ReviewerDashboard } from './Custom/components/Reviewer/ReviewerDashboard';
import { IDrugManagementSystemProps } from './IDrugManagementSystemProps';
import { appGlobalStateAtom } from '../jotai/appGlobalStateAtom';
import { appDescriptionAtom, currentUserAtom, roleMappingAtom, sharePointGroupsAtom, siteAdminAtom } from '../jotai/adminAtoms';
import ReactDropdown, { type IReactDropOptionProps } from './Common/ReactSelectDropdown';
import { ComponentNameEnum } from '../models/ComponentNameEnum';
import { CategoriesViewRouter, TemplatesViewRouter, DrugsViewRouter, UsersViewRouter, DocumentsViewRouter, GMPViewRouter, TMFViewRouter } from './AdminRouters';
import { ToastHost } from './Common/Toast/ToastHost';
require('../assets/css/styles.css')
require('./Custom/styles/app.css')
require('./../assets/Workbench.module.scss')
type UserRole = 'Admin' | 'Author' | 'Reviewer' | 'Approver' | 'HR';
type NavItem = { id: string; label: string; icon: string; isSection?: false } | { id: string; label: string; isSection: true };
type View =
  | 'dashboard'
  | 'documents'
  | 'categories'
  | 'templates'
  | 'users'
  | 'reports'
  | 'drugsDatabase'
  | 'createCTDFolder'
  | 'gmpMaster'
  | 'tmfMaster'
  | 'approvals'
  | 'authorDocs'
  | 'myDocuments'
  | 'pendingApproval'
  | 'ctdView'
  | 'workflowReports'
  | 'usageReport'
  | 'rolesPermissions';


const AppStateInitializer: React.FC<IDrugManagementSystemProps> = (props) => {
  const setAppGlobalState = useSetAtom(appGlobalStateAtom);
  const setCurrentUser = useSetAtom(currentUserAtom);
  const setSharePointGroups = useSetAtom(sharePointGroupsAtom);
  const setRoleMapping = useSetAtom(roleMappingAtom);
  const setSiteAdmin = useSetAtom(siteAdminAtom);
  const setDescription = useSetAtom(appDescriptionAtom);

  React.useEffect(() => {
    setAppGlobalState({
      provider: props.provider,
      context: props.context,
      currentUser: props.currentUser,
      currentUserRoleDetail: {} as any,
      description: props.description
    });
    setCurrentUser(props.currentUser);
    setDescription(props.description);
    setSiteAdmin(!!props.currentUser?.isAdmin);

    const checkPermissions = async () => {
      try {
        const details = await PermissionService.checkUserPermissions(props.provider, props.currentUser);

        // Seed master data from 'Project Documents' library on first run (best-effort, idempotent).
        await runProjectDocumentsSeeding(props.provider);
        const roleLabel: UserRole = details.isAdmin
          ? 'Admin'
          : details.isHR
            ? 'HR'
            : details.isApprover
              ? 'Approver'
              : details.isReviewer
                ? 'Reviewer'
                : 'Author';

        setAppGlobalState({
          provider: props.provider,
          context: props.context,
          currentUser: props.currentUser,
          currentUserRoleDetail: details,
          description: props.description
        });
        setSharePointGroups(details.sharePointGroups);
        setRoleMapping({ ...details, roleLabel });
      } catch (error) {
        console.error('Error checking permissions:', error);
        if (error instanceof Error && error.name === 'AggregateError') {
          console.error('AggregateError details:', (error as any).errors);
        }
        setRoleMapping({
          isAdmin: false,
          isHR: false,
          isAuthor: true,
          isApprover: true,
          isReviewer: true,
          title: props.currentUser.displayName,
          email: props.currentUser.email,
          Id: props.currentUser.userId,
          sharePointGroups: [],
          permissions: ['CreateDocuments', 'ViewDocumentCreatedTab', 'ViewApproverTab', 'ApproveDocuments'],
          roleLabel: 'Author'
        });
      }
    };

    void checkPermissions();
  }, [
    props.provider,
    props.context,
    props.currentUser,
    props.description,
    setAppGlobalState,
    setCurrentUser,
    setDescription,
    setRoleMapping,
    setSharePointGroups,
    setSiteAdmin
  ]);

  return <DmsShell />;
};

const DmsShell: React.FC = () => {
  const roleMapping = useAtomValue(roleMappingAtom);
  const siteAdmin = useAtomValue(siteAdminAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const description = useAtomValue(appDescriptionAtom);
  const sharePointGroups = useAtomValue(sharePointGroupsAtom);
  const appGlobalState = useAtomValue(appGlobalStateAtom);

  const [currentRole, setCurrentRole] = React.useState<UserRole>('Author');
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [forcedRole, setForcedRole] = React.useState<UserRole | null>(null);
  const roleOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'Admin', value: 'Admin' },
      { label: 'Author', value: 'Author' },
      { label: 'Reviewer', value: 'Reviewer' },
      { label: 'Approver', value: 'Approver' },
      { label: 'HR', value: 'HR' }
    ],
    []
  );

  React.useEffect(() => {
    if (!roleMapping) return;
    const baseRole = siteAdmin ? 'Admin' : roleMapping.roleLabel;
    setCurrentRole(forcedRole ?? baseRole);
  }, [roleMapping, forcedRole, siteAdmin]);

  const handleRoleChange = (role: UserRole) => {
    setForcedRole(role);
    setCurrentView('dashboard');
  };

  const hasDmsSecurityGroups = React.useMemo(() => {
    const dmsGroups = ['Admin', 'HR', 'Author', 'Approver'];
    return (sharePointGroups || []).some((g) => dmsGroups.includes(g));
  }, [sharePointGroups]);

  const getNavItems = (): NavItem[] => {
    const effectiveRole = siteAdmin ? 'Admin' : currentRole;
    switch (effectiveRole) {
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: '_master', label: 'MASTER', isSection: true },
          { id: 'categories', label: 'Categories', icon: '📁' },
          { id: 'templates', label: 'Templates', icon: '📋' },
          { id: 'createCTDFolder', label: 'CTD Folder Structure', icon: '📂' },
          { id: 'gmpMaster', label: 'GMP Models', icon: '🧪' },
          { id: 'tmfMaster', label: 'TMF Folder Structure', icon: '🗂' },
          { id: 'drugsDatabase', label: 'Drugs', icon: '💊' },
          { id: '_documents', label: 'DOCUMENTS', isSection: true },
          { id: 'documents', label: 'All Documents', icon: '📄' },
          { id: 'myDocuments', label: 'My Documents', icon: '📝' },
          { id: 'pendingApproval', label: 'Assigned to Me', icon: '⏳' },
          { id: 'ctdView', label: 'CTD View', icon: '🗂' },
          { id: 'reports', label: 'Document Reports', icon: '📈' },
          { id: 'workflowReports', label: 'Workflow Reports', icon: '📊' },
          { id: '_users', label: 'USERS', isSection: true },
          { id: 'users', label: 'Manage Users', icon: '👥' },
        ];
      case 'HR':
        return [
          { id: '_documents', label: 'DOCUMENTS', isSection: true },
          { id: 'myDocuments', label: 'My Documents', icon: '📝' },
          { id: 'pendingApproval', label: 'Assigned to Me', icon: '⏳' },
        ];
      case 'Author':
        return [
          { id: '_documents', label: 'DOCUMENTS', isSection: true },
          { id: 'myDocuments', label: 'My Documents', icon: '📝' },
          { id: 'pendingApproval', label: 'Assigned to Me', icon: '⏳' },
        ];
      case 'Reviewer':
        return [
          { id: 'dashboard', label: 'Review Queue', icon: '📋' }
        ];
      case 'Approver':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: '_documents', label: 'DOCUMENTS', isSection: true },
          { id: 'pendingApproval', label: 'Assigned to Me', icon: '✅' },
          { id: 'myDocuments', label: 'My Documents', icon: '📝' },
          { id: 'reports', label: 'Reports', icon: '📈' },
        ];
      default:
        return [{ id: 'dashboard', label: 'Dashboard', icon: '📊' }];
    }
  };

  const renderContent = () => {
    const effectiveRole = siteAdmin ? 'Admin' : currentRole;
    // Common view handling for shared views across roles
    switch (currentView) {
      case 'myDocuments':
        return <DocumentsViewRouter filterByCurrentUser={true} />;
      case 'pendingApproval':
        return <DocumentsViewRouter filterByPending={true} />;
      case 'ctdView':
        return <CTDView />;
      case 'workflowReports':
        return <Reports />;
      case 'usageReport':
        return <Reports />;
      case 'rolesPermissions':
        return <UsersViewRouter />;
      default:
        break;
    }
    if (effectiveRole === 'Admin') {
      switch (currentView) {
        case 'documents':
          return <DocumentsViewRouter />;
        case 'templates':
          return <TemplatesViewRouter />;
        case 'categories':
          return <CategoriesViewRouter />;
        case 'users':
          return <UsersViewRouter />;
        case 'reports':
          return <Reports />;
        case 'drugsDatabase':
          return <DrugsViewRouter />;
        case 'createCTDFolder':
          return <CreateCTDFolder />;
        case 'gmpMaster':
          return <GMPViewRouter />;
        case 'tmfMaster':
          return <TMFViewRouter />;
        default:
          return <AdminDashboard />;
      }
    } else if (effectiveRole === 'Author') {
      return <DocumentsViewRouter filterByCurrentUser={currentView === 'myDocuments' || currentView === 'dashboard'} filterByPending={currentView === 'pendingApproval'} hideAddButton={false} hideFolderSidebar={true} />;
    } else if (effectiveRole === 'Reviewer') {
      return <ReviewerDashboard />;
    } else if (effectiveRole === 'Approver') {
      return currentView === 'authorDocs' ? <DocumentsViewRouter filterByCurrentUser={true} hideFolderSidebar={true} /> : <DocumentsViewRouter filterByPending={true} hideFolderSidebar={true} />;
    } else if (effectiveRole === 'HR') {
      switch (currentView) {
        case 'pendingApproval':
          return <DocumentsViewRouter filterByPending={true} hideFolderSidebar={true} />;
        default:
          return <DocumentsViewRouter filterByCurrentUser={true} hideFolderSidebar={true} />;
      }
    }
    return <AdminDashboard />;
  };

  if (!roleMapping || !currentUser) {
    return <div>Loading...</div>;
  }

  // Determine if we should hide the sidebar entirely (Full Page Mode)
  const hideSidebar = !!appGlobalState.isSidebarHidden;

  return (
    <div className={`app ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${hideSidebar ? 'full-page' : ''}`}>
      <ToastHost />
      <header className="header">
        <div className="header-title">{description}</div>
        <div className="header-right">
          {!hasDmsSecurityGroups && (
            <div style={{ marginRight: '20px', minWidth: 220 }}>
              <label style={{ fontSize: '13px', color: '#666', marginRight: '8px' }}>Switch Role:</label>
              <ReactDropdown
                name="roleSwitch"
                options={roleOptions}
                defaultOption={roleOptions.find(o => o.value === (forcedRole ?? currentRole)) ?? roleOptions[0]}
                onChange={(opt) => handleRoleChange((opt?.value as UserRole) ?? 'Admin')}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>
          )}
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{currentUser?.displayName}</div>
              <div className="user-role">{siteAdmin ? 'Admin (Site)' : currentRole}</div>
            </div>
            <div className="user-avatar">{(currentUser?.displayName || "").split(' ').map((n: string) => n[0]).join('')}</div>
          </div>
        </div>
      </header>

      <nav className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${hideSidebar ? 'hidden' : ''}`}>
        <div className="nav-section">
          {/* <div className="nav-header">
            {!isSidebarCollapsed && !hideSidebar && <div className="nav-title">Navigation</div>}
            <button
              className="sidebar-toggle-btn-nav"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? '▶' : '◀'}
            </button>
          </div> */}

          {getNavItems().map((item) => (
            item.isSection ? (
              <div key={item.id} className="nav-section-title">
                {!isSidebarCollapsed && item.label}
              </div>
            ) : (
              <div
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                onClick={() => setCurrentView(item.id as View)}
                title={isSidebarCollapsed ? item.label : ''}
                data-testid={`nav-item-${item.id}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {!isSidebarCollapsed && <span className="nav-label">{item.label}</span>}
              </div>
            )
          ))}
        </div>
      </nav>

      <main className={`main-content ${isSidebarCollapsed ? 'expanded' : ''} ${hideSidebar ? 'full-width' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export const DrugManagementSystem: React.FC<IDrugManagementSystemProps> = (props) => (
  <Provider>
    <AppStateInitializer {...props} />
  </Provider>
);
