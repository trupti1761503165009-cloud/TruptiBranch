import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { DrugsDatabaseData } from './DrugsDatabaseData';
import { DrugForm } from './DrugForm';
import { MessageDialog } from '../../../../Common/Dialogs/MessageDialog';
import { Loader } from '../../../../Common/Loader/Loader';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useSetAtom } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';

export const AddDrug: React.FC<any> = (props) => {
    const {
        formData,
        setFormData,
        fieldErrors,
        handleAddDrug,
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

    const handleCancel = () => {
        props.manageComponentView?.({ currentComponentName: '' });
    };

    const handleSave = async () => {
        const success = await handleAddDrug();
        if (success) {
            setMessageDialog({ hidden: false, type: 'success', title: 'Success', message: 'Drug has been added successfully!', fields: [] });
            setTimeout(() => handleCancel(), 1500);
        } else {
            setMessageDialog({ hidden: false, type: 'error', title: 'Error', message: 'Failed to add drug.', fields: [] });
        }
    };

    const statusOptions = (rawStatusOptions.length > 0 ? rawStatusOptions : ['Active', 'Inactive', 'In Development']).map(option => ({
        label: option,
        value: option
    }));

    return (
        <div className="add-drug-wrapper" data-testid="add-drug-page">
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
                                    <h1 className="mainTitle">Add New Drug</h1>
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
                                            { label: 'Drugs Database', onClick: handleCancel },
                                            { label: 'Add New Drug', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <DrugForm
                                    mode="add"
                                    formData={formData}
                                    setFormData={setFormData}
                                    onSave={handleSave}
                                    onCancel={handleCancel}
                                    statusOptions={statusOptions}
                                    fieldErrors={fieldErrors}
                                    isReadOnly={false}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
