import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface ICertificateFilterProps {
    selectedCertificate: number;
    onCertificateChange: (certificateId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const CertificateFilter: React.FunctionComponent<ICertificateFilterProps> = (props: ICertificateFilterProps): React.ReactElement => {

    const _onCertificateChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onCertificateChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Certificates--" });
        }
        props.provider.choiceOption(ListNames.SitesAssociatedTeam, "Certificates").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            setOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getOptionList();
    }, []);

    return <>
        <ReactDropdown
            options={Options}
            isMultiSelect={false}
            placeholder="Certificate"
            defaultOption={props.defaultOption}
            onChange={_onCertificateChange}
        />
    </>;
};