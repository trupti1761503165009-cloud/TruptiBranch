import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react'
import { PeoplePicker } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { PrincipalType } from '@pnp/sp';
type Props = {
    context: WebPartContext;
    selectedItems: any[];
    label: string;
    _getPeoplePickerItems: (items: any[]) => void;
    isDisabled?: boolean;
}

export const CustomPeoplePicker: React.FC<Props> = React.memo(({ isDisabled, selectedItems, context, label, _getPeoplePickerItems }) => {
    return (
        <PeoplePicker
            context={context as any}
            placeholder='Enter name'
            titleText={label}
            personSelectionLimit={1}
            groupName={""} // Leave this blank in case you want to filter from all users
            //showtooltip={true}
            // required={true}
            disabled={isDisabled}
            defaultSelectedUsers={!!selectedItems ? selectedItems.map((item) => item) : []}
            searchTextLimit={2}
            onChange={_getPeoplePickerItems}
            principalTypes={[PrincipalType.User]}
            // resolveDelay={1000}
            ensureUser={true}


        />
    )
})

