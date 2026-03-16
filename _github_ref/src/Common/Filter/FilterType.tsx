import * as React from "react";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IFilterTypeProps {
    onFilterTypeChange: (FilterType: any) => void;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const ReportFilterType: React.FunctionComponent<IFilterTypeProps> = (props: IFilterTypeProps): React.ReactElement => {
    const [defaultFilterType, setDefaultFilterType] = React.useState<any>();

    const _onFilterTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        if (option) {
            props.onFilterTypeChange(option as any);
            setDefaultFilterType(option.value);
        } else {
            props.onFilterTypeChange("");
            setDefaultFilterType("");
        }

    };

    const [Options, setOptions] = React.useState<any>();

    React.useEffect(() => {
        const optionFilterType = [
            { value: "Month Wise", key: "Month Wise", text: "Month Wise", label: "Month Wise" },
            { value: "Week Wise", key: "Week Wise", text: "Week Wise", label: "Week Wise" },
        ];
        if (props.defaultOption) { setDefaultFilterType(props.defaultOption) }
        else {
            setDefaultFilterType("Week Wise")

        }
        setOptions(optionFilterType);
    }, [props.defaultOption]);

    return <>
        <div className={props?.isReq && !defaultFilterType && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Filter Type"
                isClearable={false}
                defaultOption={props.defaultOption ? props.defaultOption : (!!defaultFilterType ? defaultFilterType : "")}
                onChange={_onFilterTypeChange}
            />
        </div>
    </>;
};