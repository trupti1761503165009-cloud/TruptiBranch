import { atom } from 'jotai';
import { ICurrentUser } from '../../jotai/IcurrentUseratom';
import { IUserRoleDetails } from '../models/IUserRoleDetails';

export type UserRoleLabel = 'Admin' | 'HR' | 'Author' | 'Approver' | 'Reviewer';

export interface IRoleMapping extends IUserRoleDetails {
  roleLabel: UserRoleLabel;
}

export const currentUserAtom = atom<ICurrentUser | null>(null);
export const sharePointGroupsAtom = atom<string[]>([]);
export const roleMappingAtom = atom<IRoleMapping | null>(null);
export const siteAdminAtom = atom<boolean>(false);
export const appDescriptionAtom = atom<string>('');
