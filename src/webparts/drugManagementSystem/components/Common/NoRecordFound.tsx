import * as React from "react";
import { EmptyState, EmptyStateProps } from "./EmptyState/EmptyState";

export const NoRecordFound: React.FC<Partial<EmptyStateProps>> = (props) => {
    return (
        <EmptyState
            title="No records found"
            description="Get started by adding your first item"
            {...props}
        />
    );
};

export default NoRecordFound;
