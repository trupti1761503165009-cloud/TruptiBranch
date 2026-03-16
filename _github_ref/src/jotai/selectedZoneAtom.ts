import { atom } from "jotai";
import { ISelectedZoneDetails } from "../Interfaces/ISelectedZoneDetails";

export const selectedZoneAtom = atom<ISelectedZoneDetails | undefined>(undefined);
