import { atom } from 'jotai';
import { IAppGlobalState, IAppSiteState } from '../Interfaces/IAppGlobalState';

export const appGlobalStateAtom = atom<IAppGlobalState>({} as IAppGlobalState);
export const appSiteStateAtom = atom<IAppSiteState>({} as IAppSiteState);

