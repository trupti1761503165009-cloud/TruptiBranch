import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { UserPermissionsData } from './UserPermissionsData';
import { UserForm } from './UserForm';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { Loader } from '../../../../Common/Loader/Loader';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const AddUser: React.FC<any> = (props) => {
    const {
        formData,
        setFormData,
        fieldErrors,
        addUser,
        isLoading,
        errorMessage,
        successMessage
    } = UserPermissionsData();

    const [messageDialog, setMessageDialog] = React.useState({ hidden: true, type: 'info', title: '', message: '', fields: [] as string[] });
    const setAppGlobalState = useSetAtom(appGlobalStateAtom);

    React.useEffect(() => {
        setAppGlobalState(prev => ({ ...prev, isSidebarHidden: true }));
        return () => {
            setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
        };
    }, [setAppGlobalState]);

    React.useEffect(() => {
        if (successMessage) setMessageDialog({ hidden: false, type: 'success', title: 'Success', message: successMessage, fields: [] });
        if (errorMessage) setMessageDialog({ hidden: false, type: 'error', title: 'Error', message: errorMessage, fields: [] });
    }, [successMessage, errorMessage]);

    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    const handleSave = async () => {
        const success = await addUser();
        if (success) {
            setTimeout(() => handleCancel(), 1500);
        }
    };

    const roleOptions = [
        { label: 'Admin', value: 'Admin' },
        { label: 'HR', value: 'HR' },
        { label: 'Author (Member)', value: 'Author' },
        { label: 'Approver', value: 'Approver' }
    ];

    const statusOptions = [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ];

    return (
        <div className="add-user-wrapper" data-testid="add-user-page">
            {isLoading && <Loader />}
            <MessageDialog
                hidden={messageDialog.hidden}
                onDismiss={() => setMessageDialog(prev => ({ ...prev, hidden: true }))}
                type={messageDialog.type as any}
                title={messageDialog.title}
                message={messageDialog.message}
                fields={messageDialog.fields}
            />

            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid">
                        {/* Header Row */}
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween alignItemsCenter">
                                <div>
                                    <h1 className="mainTitle">Add New User</h1>
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
                                            { label: 'User Permissions', onClick: handleCancel },
                                            { label: 'Add New User', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <UserForm
                                    mode="add"
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    roleOptions={roleOptions}
                                    statusOptions={statusOptions}
                                    fieldErrors={fieldErrors}
                                    isReadOnly={false}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
