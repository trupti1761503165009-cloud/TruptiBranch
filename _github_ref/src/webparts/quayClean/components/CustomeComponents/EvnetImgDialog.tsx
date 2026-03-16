import * as React from "react"
import CustomModal from "../CommonComponents/CustomModal";
export interface IEvnetImgDialogProps {
    onClickModelClose(): any;
    imgUrl: string;

}
export const EvnetImgDialog = (props: IEvnetImgDialogProps) => {
    return <>
        <CustomModal
            isModalOpenProps={true}
            dialogWidth="800px"
            setModalpopUpFalse={() => {
                props.onClickModelClose()
            }}
            subject={""}
            message={<img src={props.imgUrl} style={{ objectFit: 'cover', width: "100%" }} />}
        />
    </>

}