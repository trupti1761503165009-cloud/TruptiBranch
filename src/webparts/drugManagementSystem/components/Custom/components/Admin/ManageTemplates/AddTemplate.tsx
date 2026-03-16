import * as React from 'react';
import { PrimaryButton } from '@fluentui/react';
import { UploadTemplatePage } from './UploadTemplatePage';
import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const AddTemplate: React.FC<any> = (props) => {
    const setAppGlobalState = useSetAtom(appGlobalStateAtom);

    React.useEffect(() => {
        setAppGlobalState(prev => ({ ...prev, isSidebarHidden: true }));
        return () => {
            setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
        };
    }, [setAppGlobalState]);
    const handleCancel = () => {
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ManageTemplates
        });
    };

    const handleSuccess = () => {
        handleCancel();
    };

    return (
        <UploadTemplatePage
            onCancel={handleCancel}
            onSuccess={handleSuccess}
        />
    );
};
