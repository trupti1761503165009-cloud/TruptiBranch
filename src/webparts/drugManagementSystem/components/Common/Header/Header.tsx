// import * as React from 'react';
// import { CommandBar, ICommandBarItemProps } from '@fluentui/react';
// import { UserRole } from '../../shared/RoleContext/RoleContext';
// import styles from './Header.module.scss';

// interface HeaderProps {
//   currentUserRole: UserRole;
//   onLogout: () => void;
// }

// const Header: React.FC<HeaderProps> = ({ currentUserRole, onLogout }) => {
//   const getItems = (): ICommandBarItemProps[] => {
//     const items: ICommandBarItemProps[] = [];

//     switch (currentUserRole) {
//       case UserRole.Admin:
//         items.push(
//           { key: 'dashboard', text: 'Dashboard', iconProps: { iconName: 'ViewDashboard' }, href: '/' },
//           { key: 'userManagement', text: 'User Management', iconProps: { iconName: 'People' }, href: '/user-management' }
//         );
//         break;
//       case UserRole.Author:
//         items.push({ key: 'contentEditor', text: 'Content Editor', iconProps: { iconName: 'Edit' }, href: '/' });
//         break;
//       case UserRole.Reviewer:
//         items.push({ key: 'reviewQueue', text: 'Review Queue', iconProps: { iconName: 'TaskList' }, href: '/' });
//         break;
//       case UserRole.Approver:
//         items.push({ key: 'approvalDashboard', text: 'Approval Dashboard', iconProps: { iconName: 'CheckMark' }, href: '/' });
//         break;
//     }

//     return items;
//   };

//   const farItems: ICommandBarItemProps[] = [
//     {
//       key: 'logout',
//       text: 'Logout',
//       iconProps: { iconName: 'SignOut' },
//       onClick: onLogout
//     }
//   ];

//   return (
//     <header className={styles.header}>
//       <div className={styles.logo}>Drug Management System</div>
//       <CommandBar items={getItems()} farItems={farItems} ariaLabel="Navigation bar" />
//     </header>
//   );
// };

// export default Header;
