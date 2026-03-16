/* eslint-disable */
import * as React from "react";
import { IconButton, IContextualMenuItem } from "@fluentui/react";

interface ICommonActionMenuProps {
    data: any;
    onView: (item: any) => void;
    onAttachment: (item: any) => void;
    onUnarchive?: (item: any) => void;
    onResolve: (item: any) => void;
    onReassign: (item: any) => void;
}

const ClientResponseActionMenu: React.FC<ICommonActionMenuProps> = ({ data, onView, onAttachment, onUnarchive, onResolve, onReassign }) => {

    const menuItems: IContextualMenuItem[] = [
        {
            key: "detailview",
            name: "Detail View",
            iconProps: { iconName: "View", style: { color: "#1300a6" } },
            onClick: () => onView(data),
        },
        {
            key: "viewAttachments",
            name: "View Attachments",
            iconProps: { iconName: "Attach", style: { color: "#ffa200" } },
            onClick: () => onAttachment(data),
        },
        ...(data.IsArchive ? [{
            key: "unarchive",
            name: "Unarchive",
            iconProps: { iconName: "Sync", style: { color: "orange" } },
            onClick: () => onUnarchive?.(data),
        }] : []),
        ...(!data.IsArchive && !["Resolved", "Not an Issue"].includes(data.Status) ? [{
            key: "resolve",
            name: "Mark as Resolved",
            iconProps: { iconName: "SkypeCircleCheck", style: { color: "#0aa82c" } },
            onClick: () => onResolve(data),
        }] : []),
        ...(!data.IsArchive && !["Resolved", "Not an Issue"].includes(data.Status) ? [{
            key: "reAssign",
            name: "Reassign",
            iconProps: { iconName: "UserSync", style: { color: "#dc3545" } },
            onClick: () => onReassign(data),
        }] : []),
    ];

    return (
        <IconButton
            id="ContextualMenuButton1"
            text=""
            width="5"
            split={false}
            iconProps={{ iconName: 'MoreVertical' }}
            menuIconProps={{ iconName: '' }}
            menuProps={{
                shouldFocusOnMount: true,
                items: menuItems
            }}
        />
    );
};

export default ClientResponseActionMenu;
