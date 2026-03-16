import { atom } from "jotai";
import { IPAFormState } from "../models/IAppGlobalState";



export const IPAFormCancelAtom = atom<IPAFormState>({} as IPAFormState);