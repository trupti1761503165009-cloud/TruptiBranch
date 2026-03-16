import * as React from "react";
import { _getPagedonclick } from "./Util";
import { Pagination } from "@pnp/spfx-controls-react/lib/Pagination";
// import { Dropdown } from "@fluentui/react";
interface IPaginationCommonProps {
    items: any[];
    pagetItems: any;
    pageLength?: number;
    defaulPage?: number;
    isPagination?: boolean;
    isNoPagination?: boolean;
}
interface IPaginationState {
    fromNo: number,
    toNo: number,
    totalPages: number,
    pagedItem: any[],
    currentPage: number,
}
export const CustomPagination = (props: IPaginationCommonProps) => {
    const [paginationstate, setpaginationstate] = React.useState<IPaginationState>({
        fromNo: 1,
        toNo: !!props.pageLength ? props.pageLength : 50,
        totalPages: 0,
        pagedItem: [],
        currentPage: 0,

    });
    const _getPaged = (page: number) => {
        // let { pagedItems, fromNo, toNo, totalPage } = _getPagedonclick(page, !!props.pageLength ? props.pageLength : 10, props.items);
        let { pagedItems, fromNo, toNo, totalPage } = _getPagedonclick(page, !!props.pageLength ? props.pageLength : 50, props.items);
        let data = { fromNo: fromNo, toNo: toNo, totalPage: totalPage, page: page };
        setpaginationstate(prevState => ({ ...prevState, fromNo: fromNo, toNo: toNo, totalPages: Number(totalPage), pagedItem: pagedItems, currentPage: page }));
        props.pagetItems(pagedItems, data);
    };

    // const onClickDropDown = (event: React.FormEvent<HTMLDivElement>, option: any, index?: number) => {
    //     setpaginationstate(prevState => ({ ...prevState, pageLength: Number(option.key) }))
    // }


    const _getPagedNoPagination = (page: number) => {
        // let { pagedItems, fromNo, toNo, totalPage } = _getPagedonclick(page, !!props.pageLength ? props.pageLength : 10, props.items);
        let { pagedItems, fromNo, toNo, totalPage } = _getPagedonclick(page, props.items.length, props.items);
        let data = { fromNo: fromNo, toNo: toNo, totalPage: totalPage, page: page };
        setpaginationstate(prevState => ({ ...prevState, fromNo: fromNo, toNo: toNo, totalPages: Number(totalPage), pagedItem: pagedItems, currentPage: page }));
        props.pagetItems(pagedItems, data);
    };

    React.useEffect(() => {
        if (props.isNoPagination === true) {
            _getPagedNoPagination(1);
        } else {
            _getPaged(1);
        }

    }, [props.items]);
    // React.useEffect(() => {
    //     if (props.isNoPagination === true)
    //         _getPagedNoPagination(1);
    // }, [props.isNoPagination]);
    React.useMemo(() => {
        if (props.isNoPagination === true) {
            _getPagedNoPagination(1);
        } else {
            _getPaged(1);
        }
        // _getPaged(1);
    }, [props.pageLength]);

    React.useMemo(() => {
        if (props.isNoPagination === true) {
            _getPagedNoPagination(1);
        } else {
            if (props.defaulPage)
                _getPaged(props.defaulPage);
        }

    }, [props.defaulPage]);

    return (
        <>
            <div>  {props.isPagination !== false &&
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-lg3  showingresults"  >
                        Showing {paginationstate.fromNo} to {paginationstate.toNo} of {props.items.length} entries
                    </div>
                    {/* <div className="ms-Grid-col ms-lg1   mt-10"  >
                        <Dropdown selectedKey={paginationstate.pageLength.toString()} onChange={onClickDropDown} options={[{ key: "20", text: "20" }, { key: "40", text: "40" }, { key: "60", text: "60" }, { key: "80", text: "80" }, { key: "100", text: "100" }]} />
                    </div> */}

                    <div className="ms-Grid-col ms-lg9  ">
                        <Pagination
                            currentPage={paginationstate.currentPage}
                            totalPages={paginationstate.totalPages}
                            onChange={(page: number) => _getPaged(page)}
                            limiter={2} />
                    </div>
                </div>}
                {props.isNoPagination === true &&
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-lg3  showingresults"  >
                            Showing {props.items.length} entries
                        </div>
                        {/* <div className="ms-Grid-col ms-lg9  ">
                            <Pagination
                                currentPage={paginationstate.currentPage}
                                totalPages={paginationstate.totalPages}
                                onChange={(page: number) => _getPaged(page)}
                                limiter={2} />
                        </div> */}
                    </div>
                }
            </div>
        </>
    );

};
