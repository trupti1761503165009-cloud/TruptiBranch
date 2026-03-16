import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { UserPermissionsData } from './UserPermissionsData';
import { UserForm } from './UserForm';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { Loader } from '../../../../Common/Loader/Loader';
import { PrimaryButton } from '@fluentui/react/lib/Button';

export const EditUser: React.FC<any> = (props) => {
    const { item, mode = 'edit' } = props;
    const {
        formData,
        setFormData,
        fieldErrors,
        saveEdit,
        isLoading,
        errorMessage,
        successMessage,
        openEditPanel // This actually sets editingUser in Data hook
    } = UserPermissionsData();

    const [messageDialog, setMessageDialog] = React.useState({ hidden: true, type: 'info', title: '', message: '', fields: [] as string[] });

    React.useEffect(() => {
        if (item) {
            // In UserPermissionsData, edit happens via openEditPanel(item)
            // But since we are in a new page, we should set formData directly if we can
            setFormData({
                name: item.name || '',
                email: item.email || '',
                role: item.roles?.[0] || item.role || 'Author',
                status: item.status || 'Active',
                ProjectName: item.ProjectName || ''
            });
        }
    }, [item, setFormData]);

    React.useEffect(() => {
        if (successMessage) setMessageDialog({ hidden: false, type: 'success', title: mode === 'edit' ? 'Updated' : 'Success', message: successMessage, fields: [] });
        if (errorMessage) setMessageDialog({ hidden: false, type: 'error', title: 'Error', message: errorMessage, fields: [] });
    }, [successMessage, errorMessage, mode]);

    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    const handleSave = async () => {
        const success = await saveEdit();
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
        <div className="edit-user-wrapper" data-testid="edit-user-page">
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
                                    <h1 className="mainTitle">
                                        {mode === 'edit' ? `Edit User - ${item?.name || ''}` : `View User - ${item?.name || ''}`}
                                    </h1>
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
                                            { label: mode === 'edit' ? 'Edit User' : 'View User', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <UserForm
                                    mode={mode as any}
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    roleOptions={roleOptions}
                                    statusOptions={statusOptions}
                                    fieldErrors={fieldErrors}
                                    isReadOnly={mode === 'view'}
                                    selectedUser={item}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
