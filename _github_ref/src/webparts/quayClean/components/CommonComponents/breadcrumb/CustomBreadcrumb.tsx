/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { Breadcrumb, IBreadcrumbItem, IDividerAsProps, TooltipHost } from '@fluentui/react';

interface IBreadcrumbState {
    breadcrumbItems: IBreadcrumbItem[];
}
export interface ICustomBreadcrumbItem {
    text: string;
    key: string;
}

interface ICustomBreadcrumbProps {
    siteServerRelativeURL: string;
    parentBreadCrumbItem: ICustomBreadcrumbItem;
    setSourcePath: any;
    newBreadcrumbItem?: ICustomBreadcrumbItem;
}

const CustomBreadcrumb = React.memo((props: ICustomBreadcrumbProps) => {
    /*
    TODO: this method will be called when someone clicked on breadcrumb item. 
    TODO: Once clicked breadcrumb item it will set the source path in the parent component.
    */
    const _onBreadcrumbItemClicked = (ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem): void => {
        const index = breadcrumbItems.current.breadcrumbItems.map((item) => item.key).indexOf(item.key);
        breadcrumbItems.current.breadcrumbItems = breadcrumbItems.current.breadcrumbItems.slice(0, index + 1);
        setBreadcrumbItems(breadcrumbItems.current.breadcrumbItems.slice(0, index + 1));
        props.setSourcePath(`${item.key}`);
    };

    /*
    TODO: this method will be generate the breadcrumb item based on given path.
    */
    const _setBreadcrumbItem = (): void => {
        if (!!props.newBreadcrumbItem) {
            breadcrumbItems.current.breadcrumbItems = [];
            const newBreadcrumbItem: IBreadcrumbItem[] = [{ ...props.parentBreadCrumbItem, onClick: _onBreadcrumbItemClicked }];
            const newPaths = props.newBreadcrumbItem?.key.split(props.parentBreadCrumbItem?.key)[1]?.split("/");
            let lastPath = "";
            const breadcrumbKeys = breadcrumbItems.current.breadcrumbItems.map(item => item.key);
            newPaths.forEach((element: string, index: number) => {
                if (element) {
                    lastPath += `/${element}`;
                    const newKey = `${props.parentBreadCrumbItem?.key}${lastPath}`;
                    if (breadcrumbKeys.indexOf(newKey) < 0) {
                        newBreadcrumbItem.push({
                            text: `${element}`,
                            key: newKey,
                            onClick: _onBreadcrumbItemClicked,
                            isCurrentItem: (index + 1) === newPaths.length
                        });
                    }
                }
            });
            breadcrumbItems.current.breadcrumbItems = [...breadcrumbItems.current.breadcrumbItems, ...newBreadcrumbItem];
            setBreadcrumbItems(breadcrumbItems.current.breadcrumbItems);
        }
    };

    const items: IBreadcrumbItem[] = [{ ...props.parentBreadCrumbItem, onClick: _onBreadcrumbItemClicked }];
    const defaultStates: IBreadcrumbState = {
        breadcrumbItems: items
    };

    React.useEffect(() => {
        if (props.newBreadcrumbItem)
            _setBreadcrumbItem();
    }, [props.newBreadcrumbItem]);

    const breadcrumbItems = React.useRef(defaultStates);
    const [breadcrumbItems2, setBreadcrumbItems] = React.useState<any>(defaultStates);

    /*
    TODO: This method generate the tooltip for breadcrumb items.
    */
    const _getCustomDivider = (dividerProps: IDividerAsProps): JSX.Element => {
        const tooltipText = dividerProps.item ? dividerProps.item.text : '';
        return (
            <TooltipHost content={`Show ${tooltipText} contents`} calloutProps={{ gapSpace: 0 }}>

                <span aria-hidden="true" style={{ cursor: 'pointer', padding: 3 }} >{">"}</span>
            </TooltipHost>
        );
    };

    return (
        <div className="ms-grid mb-1">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-lg12">
                    <Breadcrumb
                        items={breadcrumbItems2}
                        maxDisplayedItems={5}
                        dividerAs={_getCustomDivider}
                        ariaLabel="Breadcrumb items rendered as buttons"
                        overflowAriaLabel="More links"
                    />
                </div>
            </div>
        </div>
    );
});

export default CustomBreadcrumb;
