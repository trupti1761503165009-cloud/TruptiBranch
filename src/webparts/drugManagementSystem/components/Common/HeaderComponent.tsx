import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../jotai/appGlobalStateAtom';
import { ComponentNameEnum } from '../../models/ComponentNameEnum';

export interface IHeaderComponentProps {
  manageComponentView: (props: any) => void;
  currentComponent: string;
  onClickNav?: (currentNav: string, id: string) => void;
}

export const HeaderComponent: React.FC<IHeaderComponentProps> = (props) => {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { currentUserRoleDetail, context } = appGlobalState;

  const getNavigationItems = () => {
    if (!currentUserRoleDetail) return [];

    if (currentUserRoleDetail.isAdmin) {
      return [
        { id: ComponentNameEnum.AdminDashboard, label: 'Dashboard', icon: '📊' },
        { id: ComponentNameEnum.ManageDocuments, label: 'Documents', icon: '📄' },
        { id: ComponentNameEnum.ManageTemplates, label: 'Manage Templates', icon: '📋' },
        { id: ComponentNameEnum.ManageCategories, label: 'Manage Categories', icon: '📁' },
        { id: ComponentNameEnum.UserPermissions, label: 'Users & Permissions', icon: '👥' },
        { id: ComponentNameEnum.Reports, label: 'Reports', icon: '📈' },
        { id: ComponentNameEnum.DrugsDatabase, label: 'Drugs Database', icon: '💊' },
        { id: ComponentNameEnum.CreateCTDFolder, label: 'Create CTD Folder', icon: '📂' }
      ];
    }

    if (currentUserRoleDetail.isHR) {
      return [
        { id: ComponentNameEnum.UserPermissions, label: 'Users & Permissions', icon: '👥' }
      ];
    }

    if (currentUserRoleDetail.isAuthor || currentUserRoleDetail.isReviewer) {
      return [
        { id: ComponentNameEnum.AuthorDashboard, label: 'My Documents', icon: '📄' }
      ];
    }

    if (currentUserRoleDetail.isApprover) {
      return [
        { id: ComponentNameEnum.ApproverDashboard, label: 'Approval Queue', icon: '✅' }
      ];
    }

    return [];
  };

  const handleNavClick = (item: any) => {
    props.manageComponentView({ componentName: item.id });
    if (props.onClickNav) {
      props.onClickNav(item.label, item.id);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>IT Infotech - Drug Management System</h1>
        </div>

        <nav className="navigation">
          {getNavigationItems().map((item) => (
            <button
              key={item.id}
              className={`nav-item ${props.currentComponent === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="user-section">
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{currentUserRoleDetail?.title || 'Loading...'}</div>
              <div className="user-role">
                {currentUserRoleDetail?.isAdmin && 'Admin'}
                {currentUserRoleDetail?.isHR && 'HR'}
                {currentUserRoleDetail?.isAuthor && 'Author'}
                {currentUserRoleDetail?.isApprover && 'Approver'}
                {currentUserRoleDetail?.isReviewer && 'Reviewer'}
              </div>
            </div>
            <div className="user-avatar">
              {currentUserRoleDetail?.title?.charAt(0)?.toUpperCase() || '?'}
            </div>
          </div>

          {context && (
            <a
              href={`https://login.windows.net/common/oauth2/logout?post_logout_redirect_uri=${context.pageContext.web.absoluteUrl}`}
              className="logout-btn"
              title="Sign out"
            >
              🚪
            </a>
          )}
        </div>
      </div>
    </header>
  );
};