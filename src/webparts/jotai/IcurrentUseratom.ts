import { atom } from "jotai";

export interface ICurrentUser {
    displayName: string;
    userId: number;
    email: string;
    loginName: string;
    isAdmin: boolean;
}
export const CurrentUserDetails = atom({} as ICurrentUser)
