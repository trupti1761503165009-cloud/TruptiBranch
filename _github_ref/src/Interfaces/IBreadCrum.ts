import { IQuayCleanState } from "../webparts/quayClean/components/QuayClean";

export interface IBreadCrum {
    key: any,
    text: any,
    currentCompomnetName: string,
    onClick: any;
    manageComponent(componentProp: IQuayCleanState): any;
    manageCompomentItem: any;
}