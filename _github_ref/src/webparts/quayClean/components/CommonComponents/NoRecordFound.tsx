import * as React from "react";
import { Stack, Text } from "@fluentui/react";

interface INoRecordFoundProps {
    isNoImageFound?: boolean
    isSmall?: boolean;
    noRecordText?: string;
}

const NoRecordFound = (props: INoRecordFoundProps) => {
    return (
        <Stack horizontalAlign='center' className={props.isSmall ? 'noRecordFoundSmall' : 'noRecordFound'} >
            {!!props.isNoImageFound ? <Text style={{ height: "300px" }}>No Image found</Text> :
                <Text >{!!props.noRecordText ? props.noRecordText : "No record found"} </Text>
            }
        </Stack>
    );
};

export default NoRecordFound;