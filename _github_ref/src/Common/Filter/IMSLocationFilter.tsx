import React from "react"
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider"
import { IReactDropOptionProps } from "../../webparts/quayClean/components/CommonComponents/reactSelect/IReactDropOptionProps";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";

export interface IIMSLocationFilterProps {
    provider: IDataProvider;
    context: any;
    SiteNameId?: number;
    Title: string;
    placeholder?: string
    isMultiSelect: boolean;
    isClearable: boolean;
    onChange(value: any): void;
    selectedOptions?: any
}

interface IIMSLocationFilterState {
    options: IReactDropOptionProps[];
    selectedOptions: any[];
}

export const IMSLocationFilter = (props: IIMSLocationFilterProps) => {
    const [state, setState] = React.useState<IIMSLocationFilterState>({
        options: [],
        selectedOptions: props.selectedOptions || []
    })

    const onChange = (items: any[]) => {
        let value: any[] = []
        if (!!items && items.length > 0) {
            value = items.map((i: any) => i.value);
            setState((prevState) => ({ ...prevState, selectedOptions: value }));
            props.onChange(items)

        } else {
            setState((prevState) => ({ ...prevState, selectedOptions: [] }));
            props.onChange([])

        }
    }

    React.useMemo(() => {
        (async () => {
            try {
                let filter = ""
                if (!!props.SiteNameId && props.SiteNameId > 0) {
                    filter = `IsActive eq 1 and SiteNameId eq '${props.SiteNameId}'`
                } else {
                    filter = `IsActive eq 1`
                }
                const select = ["ID,Location,SiteNameId,SiteName/Title"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    expand: ["SiteName"],
                    filter: filter,
                    listName: props.Title,
                };
                let options: IReactDropOptionProps[] = [];
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        let ListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Location: !!data.Location ? data.Location : "",
                                    SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                    SiteName: !!data.SiteName ? data.SiteName?.Title : ''
                                }
                            );
                        });
                        if (!!ListData && ListData.length > 0) {
                            options = ListData
                                .filter(i => i.Location && i.Location.trim() !== "")   // remove empty or space-only
                                .map(i => ({
                                    value: i.Location,
                                    label: i.Location
                                }));
                        }
                        setState((prevState: any) => ({ ...prevState, options: options }));
                    }
                }).catch((error: any) => {
                    console.log(error);
                });


                // let options: IReactDropOptionProps[] = [];
                // const camlQuery = new CamlBuilder()
                //     .View(["ID", "Title", "ChoiceValue", "SiteNameId", "IsActive"])
                //     .Scope(CamlBuilder.ViewScope.RecursiveAll)
                //     .RowLimit(5000, true)
                //     .Query()
                // // .Where()
                // // .TextField("Title").EqualTo(props.Title)
                // // .And()
                // // .LookupField("SiteName").Id().EqualTo(props.SiteNameId || )
                // // .And()
                // // .BooleanField("IsActive").EqualTo(true)
                // // .ToString()
                // let filterFields: ICamlQueryFilter[] = [];
                // filterFields.push({
                //     fieldName: "IsActive",
                //     fieldValue: true,
                //     fieldType: FieldType.Boolean,
                //     LogicalType: LogicalType.EqualTo
                // });
                // filterFields.push({
                //     fieldName: "Title",
                //     fieldValue: props.Title,
                //     fieldType: FieldType.Text,
                //     LogicalType: LogicalType.EqualTo
                // });
                // if (!!props.SiteNameId && props.SiteNameId > 0) {
                //     filterFields.push({
                //         fieldName: "SiteName",
                //         fieldValue: props.SiteNameId,
                //         fieldType: FieldType.LookupById,
                //         LogicalType: LogicalType.EqualTo
                //     });
                // }

                // if (filterFields.length > 0) {
                //     const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                //     camlQuery.Where().All(categoriesExpressions);
                // }

                // let data = await props.provider.getItemsByCAMLQuery(ListNames.IMSChoices, camlQuery.ToString());
                // if (!!data && data.length > 0) {
                //     options = data.map((i) => {
                //         return {
                //             value: i.ChoiceValue,
                //             label: i.ChoiceValue
                //         }
                //     });
                // }
                // if (!!options && options.length > 0)
                //     options = getUniueRecordsByColumnName(options, "value")
                // setState((prevState: any) => ({ ...prevState, options: options }));
            } catch (error) {
                console.log(error);
            }
        })();

    }, [])

    return <div>
        <ReactDropdown
            placeholder={!!props.placeholder ? props.placeholder : "Select Location"}
            isMultiSelect={props.isMultiSelect}
            options={state.options || []}
            defaultOption={state.selectedOptions || []}
            onChange={onChange}
            isClearable={props.isClearable}
        />
    </div>

}