/* eslint-disable @typescript-eslint/no-use-before-define */

import * as React from 'react'
import { Breadcrumb, IBreadcrumbItem, IDividerAsProps, TooltipHost } from '@fluentui/react'

interface IBreadcrumbState {
    breadcrumbItems: IBreadcrumbItem[]
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

export const CustomBreadcrumb = React.memo((props: ICustomBreadcrumbProps) => {
    const _onBreadcrumbItemClicked = (ev: React.MouseEvent<HTMLElement>, item: IBreadcrumbItem): void => {
        const index = breadcrumbItems.current.breadcrumbItems.map(item => item.key).indexOf(item.key);
        breadcrumbItems.current.breadcrumbItems = breadcrumbItems.current.breadcrumbItems.slice(0, index + 1);
        props.setSourcePath(`${item.key}`);
    }

    const _setBreadcrumbItem = (): void => {
        if (!!props.newBreadcrumbItem) {
            const newBreadcrumbItem: IBreadcrumbItem[] = [];
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
            props.setSourcePath(`${props.newBreadcrumbItem?.key}`);
        }
    }

    const items: IBreadcrumbItem[] = [{ ...props.parentBreadCrumbItem, onClick: _onBreadcrumbItemClicked }];
    const defaultStates: IBreadcrumbState = {
        breadcrumbItems: items
    }

    React.useEffect(() => {
        if (props.newBreadcrumbItem)
            _setBreadcrumbItem();
    }, [props.newBreadcrumbItem]);

    const breadcrumbItems = React.useRef(defaultStates);

    const _getCustomDivider = (dividerProps: IDividerAsProps): JSX.Element => {
        const tooltipText = dividerProps.item ? dividerProps.item.text : '';
        return (
            <TooltipHost content={`Show ${tooltipText} contents`} calloutProps={{ gapSpace: 0 }}>
                <span aria-hidden="true" style={{ cursor: 'pointer', padding: 3 }} />
            </TooltipHost>
        );
    }

    return (
        <div className="ms-grid mb-2">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-lg12">
                    <Breadcrumb
                        items={breadcrumbItems.current.breadcrumbItems}
                        maxDisplayedItems={5}
                        dividerAs={_getCustomDivider}
                        ariaLabel="Breadcrumb with items rendered as buttons"
                        overflowAriaLabel="More links"
                    />
                </div>
            </div>
        </div>
    )
});
