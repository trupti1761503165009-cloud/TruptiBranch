import React from "react"
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider"
import { IReactDropOptionProps } from "../../webparts/quayClean/components/CommonComponents/reactSelect/IReactDropOptionProps";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ListNames } from "../Enum/ComponentNameEnum";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import { getCAMLQueryFilterExpression, getUniueRecordsByColumnName } from "../Util";

export interface IIMSAttendeesFilterProps {
    placeholder?: string
    isMultiSelect: boolean;
    isClearable: boolean;
    onChange(value: any): void;
    selectedOptions?: any
    options: IReactDropOptionProps[];
}

interface IIMSLocationFilterState {
    options: IReactDropOptionProps[];
    selectedOptions: any[];
}

export const IMSAttendeesFilter = (props: IIMSAttendeesFilterProps) => {
    const [state, setState] = React.useState<IIMSLocationFilterState>({
        options: props?.options || [],
        selectedOptions: props.selectedOptions || []
    })

    const onChange = (items: any) => {
        let value: any[] = []
        if (!!items && (props.isMultiSelect ? items.length > 0 : true)) {
            value = props.isMultiSelect ? items.map((i: any) => i.value) : items?.value;
            setState((prevState) => ({ ...prevState, selectedOptions: value }));
            props.onChange(items)

        } else {
            setState((prevState) => ({ ...prevState, selectedOptions: [] }));
            props.onChange([])

        }
    }

    // React.useMemo(() => {
    //     (async () => {
    //         try {
    //             let options: IReactDropOptionProps[] = [];
    //             const camlQuery = new CamlBuilder()
    //                 .View(["ID", "Title", "ChoiceValue", "SiteNameId", "IsActive"])
    //                 .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //                 .RowLimit(5000, true)
    //                 .Query()
    //             // .Where()
    //             // .TextField("Title").EqualTo(props.Title)
    //             // .And()
    //             // .LookupField("SiteName").Id().EqualTo(props.SiteNameId || )
    //             // .And()
    //             // .BooleanField("IsActive").EqualTo(true)
    //             // .ToString()
    //             let filterFields: ICamlQueryFilter[] = [];
    //             filterFields.push({
    //                 fieldName: "IsActive",
    //                 fieldValue: true,
    //                 fieldType: FieldType.Boolean,
    //                 LogicalType: LogicalType.EqualTo
    //             });
    //             filterFields.push({
    //                 fieldName: "Title",
    //                 fieldValue: props.Title,
    //                 fieldType: FieldType.Text,
    //                 LogicalType: LogicalType.EqualTo
    //             });
    //             if (!!props.SiteNameId && props.SiteNameId > 0) {
    //                 filterFields.push({
    //                     fieldName: "SiteName",
    //                     fieldValue: props.SiteNameId,
    //                     fieldType: FieldType.LookupById,
    //                     LogicalType: LogicalType.EqualTo
    //                 });
    //             }

    //             if (filterFields.length > 0) {
    //                 const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
    //                 camlQuery.Where().All(categoriesExpressions);
    //             }

    //             let data = await props.provider.getItemsByCAMLQuery(ListNames.IMSChoices, camlQuery.ToString());
    //             if (!!data && data.length > 0) {
    //                 options = data.map((i) => {
    //                     return {
    //                         value: i.ChoiceValue,
    //                         label: i.ChoiceValue
    //                     }
    //                 });
    //             }
    //             if (!!options && options.length > 0)
    //                 options = getUniueRecordsByColumnName(options, "value")
    //             setState((prevState: any) => ({ ...prevState, options: options }));
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     })();

    // }, [])

    return <div>
        <ReactDropdown
            placeholder={!!props.placeholder ? props.placeholder : "Select Attendees"}
            isMultiSelect={props.isMultiSelect}
            options={props.options || state.options || []}
            defaultOption={state.selectedOptions || []}
            onChange={onChange}
            isClearable={props.isClearable}
        />
    </div>

}