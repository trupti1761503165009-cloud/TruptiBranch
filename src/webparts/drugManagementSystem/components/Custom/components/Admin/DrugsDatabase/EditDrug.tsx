import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { DrugsDatabaseData } from './DrugsDatabaseData';
import { DrugForm } from './DrugForm';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { Loader } from '../../../../Common/Loader/Loader';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const EditDrug: React.FC<any> = (props) => {
    const { item, mode = 'edit' } = props;
    const {
        formData,
        setFormData,
        fieldErrors,
        handleEditDrug,
        isLoading,
        statusOptions: rawStatusOptions
    } = DrugsDatabaseData();

    const [messageDialog, setMessageDialog] = React.useState({ hidden: true, type: 'info', title: '', message: '', fields: [] as string[] });
    const setAppGlobalState = useSetAtom(appGlobalStateAtom);

    React.useEffect(() => {
        setAppGlobalState(prev => ({ ...prev, isSidebarHidden: true }));
        return () => {
            setAppGlobalState(prev => ({ ...prev, isSidebarHidden: false }));
        };
    }, [setAppGlobalState]);

    React.useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                category: item.category || '',
                status: item.status || 'Active',
                description: item.description || ''
            });
        }
    }, [item, setFormData]);

    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    const handleSave = async () => {
        const success = await handleEditDrug();
        if (success) {
            setMessageDialog({ hidden: false, type: 'success', title: 'Updated', message: 'Drug has been updated successfully!', fields: [] });
            setTimeout(() => handleCancel(), 1500);
        } else {
            setMessageDialog({ hidden: false, type: 'error', title: 'Error', message: 'Failed to update drug.', fields: [] });
        }
    };

    const statusOptions = (rawStatusOptions.length > 0 ? rawStatusOptions : ['Active', 'Inactive', 'In Development']).map(option => ({
        label: option,
        value: option
    }));

    return (
        <div className="form-page" data-testid="edit-drug-page">
            {isLoading && <Loader />}
            <MessageDialog
                hidden={messageDialog.hidden}
                onDismiss={() => setMessageDialog(prev => ({ ...prev, hidden: true }))}
                type={messageDialog.type as any}
                title={messageDialog.title}
                message={messageDialog.message}
                fields={messageDialog.fields}
            />

            <Breadcrumb
                items={[
                    { label: 'Home', onClick: () => { } },
                    { label: 'Drugs Database', onClick: handleCancel },
                    { label: mode === 'edit' ? 'Edit Drug' : 'View Drug', isActive: true }
                ]}
            />

            <div className="form-card">
                <div className="form-card__header">
                    <h2 className="form-card__title">
                        {mode === 'edit' ? `Edit Drug - ${item?.name || ''}` : `View Drug - ${item?.name || ''}`}
                    </h2>
                    <p className="form-card__subtitle">
                        {mode === 'edit' ? 'Update the drug information' : 'Drug details (read-only)'}
                    </p>
                </div>
                <div className="form-card__body">
                    <DrugForm
                        mode={mode as any}
                        formData={formData}
                        setFormData={setFormData}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        statusOptions={statusOptions}
                        fieldErrors={fieldErrors}
                        isReadOnly={mode === 'view'}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </div>
    );
};
