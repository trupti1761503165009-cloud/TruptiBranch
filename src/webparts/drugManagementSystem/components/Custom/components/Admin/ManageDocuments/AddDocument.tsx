import * as React from 'react';
import { CreateDocumentPage } from '../CreateDocumentPage/CreateDocumentPage';
import { PrimaryButton } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { Loader } from '../../../../Common/Loader/Loader';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const AddDocument: React.FC<any> = (props) => {
    const setAppGlobalState = useSetAtom(appGlobalStateAtom);

    React.useEffect(() => {
        setAppGlobalState(prev => ({ ...prev, isSidebarHidden: true }));
        return () => {
            setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
        };
    }, [setAppGlobalState]);
    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    const handleSuccess = () => {
        handleCancel();
    };

    return (
        <div className="add-document-wrapper" data-testid="add-document-page">
            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid">
                        {/* Header Row */}
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween alignItemsCenter">
                                <div>
                                    <h1 className="mainTitle">Create New Document</h1>
                                </div>
                                <div>
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={handleCancel}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Breadcrumb Row */}
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={[
                                            { label: 'Home', onClick: () => { } },
                                            { label: 'Manage Documents', onClick: handleCancel },
                                            { label: 'Create New', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <CreateDocumentPage
                                    onCancel={handleCancel}
                                    onSuccess={handleSuccess}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
