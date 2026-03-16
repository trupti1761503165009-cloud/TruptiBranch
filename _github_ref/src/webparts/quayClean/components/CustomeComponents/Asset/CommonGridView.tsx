import { useBoolean } from '@uifabric/react-hooks';
import { Icon } from 'office-ui-fabric-react';
import React, { useEffect } from 'react';
import { Loader } from '../../CommonComponents/Loader';
require('../../../assets/css/gridView.css');

interface IViewProps {
    onViewChange: (view: any) => void;
    viewType?: any;
    addNewContent?: any;
    defaultView?: any;
}
const CommonGridView: React.FunctionComponent<IViewProps> = (props: IViewProps): React.ReactElement => {
    
    const [active, setActive] = React.useState(props.defaultView || 'grid');
    const [isLoading, { toggle: toggleLoading }] = useBoolean(false);
    const handleViewChange = (view: any) => {
        toggleLoading();
        setActive(view);
        setTimeout(() => {
            props.onViewChange(view);
            toggleLoading();
        }, 500);
    };

    React.useEffect(() => {
        if (props.viewType) {
            setActive(props.viewType);
        }
    }, [props.viewType]);

    return (
        <>
            {isLoading && <Loader />}
            <div className='grid-card'>
                <div className='action-block'>
                    {props.addNewContent && props.addNewContent}
                    <div className="view-switch">
                        <div className={`view-option ${active === 'grid' ? 'active' : ''}`} onClick={() => { handleViewChange('grid') }}>
                            <Icon iconName="GridViewSmall" className="view-icon" />
                            {/* <span className="view-text">Grid View</span> */}
                        </div>
                        <div className={`view-option ${active === 'card' ? 'active' : ''}`} onClick={() => handleViewChange('card')}>
                            <Icon iconName="BulletedList" className="view-icon" />
                            {/* <span className="view-text">Card View</span> */}
                        </div>
                    </div>
                </div>
            </div>

        </>
    );
};

export default CommonGridView;