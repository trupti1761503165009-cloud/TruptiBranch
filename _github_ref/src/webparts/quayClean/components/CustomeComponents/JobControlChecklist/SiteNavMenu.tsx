import * as React from 'react';
import { Nav } from '@fluentui/react/lib/Nav';
import IPnPQueryOptions from '../../../../../DataProvider/Interface/IPnPQueryOptions';
import { ListNames } from '../../../../../Common/Enum/ComponentNameEnum';
import { IDropdownOption } from 'office-ui-fabric-react';

interface NavMenuProps {
    provider: any;
    defaultKey: any;
    refreshNav: boolean;
    filterSite?: string;
    currentUserRoleDetail?: any;
    onNavItemClick: (key: string, name: string) => void;
}

const SiteNavMenu: React.FC<NavMenuProps> = ({ provider, onNavItemClick, defaultKey, refreshNav, filterSite, currentUserRoleDetail }) => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    const [Items, setItems] = React.useState<any[]>([]);
    const [DefaultKey, setDefaultKey] = React.useState<any>("");

    const handleNavItemClick = (key: string, name: string): void => {
        onNavItemClick(key, name); // Call the callback passed as a prop
        setDefaultKey(key);
    };

    const getListItems = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.SitesMaster,
        };

        let dropvalue: any = [];
        provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            let filteredData: any[];
            if (currentUserRoleDetail.isAdmin) {

                filteredData = response;
            } else {
                let AllSiteIds: any[] = currentUserRoleDetail.currentUserAllCombineSites || [];
                filteredData = !!response && response?.filter((item: any) =>
                    AllSiteIds.includes(item?.Id)
                );
            }
            filteredData.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            setOptionsList(dropvalue);
            const transformedItems = dropvalue.map((item: any) => ({
                name: item.text,
                key: item.value.toString(),
                url: '#',
                onClick: () => handleNavItemClick(item.value.toString(), item.text)
            }));
            setItems(transformedItems);
        }).catch((error: any) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        let key = defaultKey.toString();
        setDefaultKey(key);
    }, [defaultKey]);

    React.useEffect(() => {
        getListItems();
    }, [refreshNav]);

    return (
        <div style={{ borderRight: '0px solid #e5e5e5' }} className='mt--20'>
            <Nav
                styles={{ root: { marginTop: 20, height: 'calc(100vh - 113px)', overflowY: 'auto' } }}
                selectedKey={DefaultKey}
                groups={[
                    {
                        name: '',
                        links: Items,
                        isExpanded: true, // Ensure the group is expanded by default
                        collapseByDefault: false,
                    },
                ]}
            />
        </div>
    );
};

export default SiteNavMenu;


