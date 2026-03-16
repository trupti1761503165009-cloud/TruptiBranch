import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { ManageCategoriesData } from './ManageCategoriesData';
import { CategoryForm } from './CategoryForm';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Loader } from '../../../../Common/Loader/Loader';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const EditCategory: React.FC<any> = (props) => {
    const { item, mode = 'edit' } = props;
    const {
        documentCategoryOptions,
        groupOptions,
        subGroupOptions,
        artifactNameOptions,
        templateNameOptions,
        ctdModuleOptions,
        ectdSectionOptions,
        ectdSubsectionOptions,
        ectdCodeOptions,
        formData,
        setFormData,
        fieldErrors,
        handleEditCategory,
        errorMessage,
        successMessage,
        isLoading,
        setEditingCategory
    } = ManageCategoriesData();

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

    // Pre-fill form data for edit/view mode
    React.useEffect(() => {
        if (item) {
            setEditingCategory(item);
            setFormData({
                name: item.name || '',
                documentCategory: item.documentCategory || '',
                group: item.group || '',
                subGroup: item.subGroup || '',
                artifactName: item.artifactName || '',
                templateName: item.templateName || '',
                status: item.status || 'Active',
                documents: item.documents || 0,
                description: item.description || '',
                artifactDescription: item.artifactDescription || '',
                ctdModule: item.ctdModule || '',
                ectdSection: item.ectdSection || '',
                ectdSubsection: item.ectdSubsection || '',
                ectdCode: item.ectdCode || ''
            });
        }
    }, [item, setFormData, setEditingCategory]);

    const handleCancel = () => {
        props.manageComponentView?.({
            currentComponentName: '' // Navigates back
        });
    };

    const handleSave = async (e: any) => {
        const success = await handleEditCategory(e);
        if (success) {
            setTimeout(() => handleCancel(), 1500);
        }
    };

    return (
        <div className="edit-category-wrapper" data-testid="edit-category-page">
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
                                        {mode === 'edit' ? 'Edit Category' : 'View Category'}
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
                                            { label: 'Manage Categories', onClick: handleCancel },
                                            { label: mode === 'edit' ? 'Edit Category' : 'View Category', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <CategoryForm
                                    mode={mode as 'edit' | 'view'}
                                    initialData={item || {}}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    documentCategoryOptions={documentCategoryOptions}
                                    groupOptions={groupOptions}
                                    subGroupOptions={subGroupOptions}
                                    artifactNameOptions={artifactNameOptions}
                                    templateNameOptions={templateNameOptions}
                                    ctdModuleOptions={ctdModuleOptions}
                                    ectdSectionOptions={ectdSectionOptions}
                                    ectdSubsectionOptions={ectdSubsectionOptions}
                                    ectdCodeOptions={ectdCodeOptions}
                                    formData={formData}
                                    setFormData={setFormData}
                                    fieldErrors={fieldErrors}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
