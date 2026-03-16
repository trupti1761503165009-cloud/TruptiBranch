import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { ManageDocumentsData } from './ManageDocumentsData';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { PrimaryButton, TextField } from '@fluentui/react';
import { Loader } from '../../../../Common/Loader/Loader';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';

export const EditDocument: React.FC<any> = (props) => {
    const { item, mode = 'edit' } = props;
    const {
        categories,
        isLoading,
        errorMessage,
        successMessage,
        handleSaveEdit,
        setEditingDocument,
        setEditForm,
        editForm
    } = ManageDocumentsData();

    const [messageDialog, setMessageDialog] = React.useState({ hidden: true, type: 'info', title: '', message: '', fields: [] as string[] });

    React.useEffect(() => {
        if (successMessage) setMessageDialog({ hidden: false, type: 'success', title: 'Success', message: successMessage, fields: [] });
        if (errorMessage) setMessageDialog({ hidden: false, type: 'error', title: 'Error', message: errorMessage, fields: [] });
    }, [successMessage, errorMessage]);

    // Pre-fill form data for edit/view mode
    React.useEffect(() => {
        if (item) {
            setEditingDocument(item);
            setEditForm({
                name: item.name || '',
                categoryId: item.categoryId || 0,
                status: item.status || 'Draft',
                ctdModule: item.ctdModule || '',
                submodule: item.submodule || '',
                approverId: item.approverId || 0
            });
        }
    }, [item, setEditingDocument, setEditForm]);

    const handleCancel = () => {
        props.manageComponentView?.({
            currentComponentName: '' // Navigates back
        });
    };

    const handleSave = async (e: any) => {
        const success = await handleSaveEdit();
        if (success !== undefined && success !== null && success) {
            setTimeout(() => handleCancel(), 1500);
        }
    };

    const categoryOptions = React.useMemo(() => categories.map(cat => ({ label: cat.name, value: cat.id })), [categories]);

    return (
        <div className="edit-document-wrapper" data-testid="edit-document-page">
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
                                        {mode === 'edit' ? 'Edit Document' : 'View Document'}
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
                                            { label: 'Manage Documents', onClick: handleCancel },
                                            { label: mode === 'edit' ? 'Edit Document' : 'View Document', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <div style={{ background: '#fff', padding: '24px', borderRadius: '8px' }}>
                                    <div className="ms-Grid-row">
                                        <div className="ms-Grid-col ms-sm12 ms-md6">
                                            <TextField
                                                label="Document Name"
                                                value={editForm.name}
                                                onChange={(_e, v) => setEditForm(prev => ({ ...prev, name: v ?? '' }))}
                                                disabled={mode === 'view'}
                                            />
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6">
                                            <label className="form-label">Category</label>
                                            <ReactDropdown
                                                name="category"
                                                options={categoryOptions}
                                                defaultOption={categoryOptions.find(o => o.value === editForm.categoryId) || null}
                                                onChange={(opt) => setEditForm(prev => ({ ...prev, categoryId: Number(opt?.value) || 0 }))}
                                                isDisabled={mode === 'view'}
                                            />
                                        </div>
                                    </div>

                                    <div className="ms-Grid-row mt-20">
                                        <div className="ms-Grid-col ms-sm12 ms-md6">
                                            <TextField
                                                label="CTD Module"
                                                value={editForm.ctdModule}
                                                onChange={(_e, v) => setEditForm(prev => ({ ...prev, ctdModule: v ?? '' }))}
                                                disabled={mode === 'view'}
                                            />
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6">
                                            <TextField
                                                label="Submodule"
                                                value={editForm.submodule}
                                                onChange={(_e, v) => setEditForm(prev => ({ ...prev, submodule: v ?? '' }))}
                                                disabled={mode === 'view'}
                                            />
                                        </div>
                                    </div>

                                    {mode === 'edit' && (
                                        <div className="ms-Grid-row mt-20">
                                            <div className="ms-Grid-col ms-sm12 dFlex justifyContentEnd">
                                                <PrimaryButton
                                                    text="Save Changes"
                                                    onClick={handleSave}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditDocument;
