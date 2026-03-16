import * as React from 'react';
import { PrimaryButton, TextField } from '@fluentui/react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ReactDropdown, { IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { CustomModal } from '../../../../Common/CustomModal';
import { CreateCTDFolderData } from './CreateCTDFolderData';
import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { Loader } from '../../../../Common/Loader/Loader';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { RequiredFieldsDialog } from '../../../../Common/Dialogs/RequiredFieldsDialog';

export const AddCTDFolder: React.FC<any> = (props) => {
    const {
        folders,
        selectedParent,
        newFolderCode,
        newFolderName,
        newFolderDescription,
        newFolderSortOrder,
        fieldErrors,
        isLoading,
        parentOptions,
        setSelectedParent,
        setNewFolderCode,
        setNewFolderName,
        setNewFolderDescription,
        setNewFolderSortOrder,
        handleCreateFolder,
        requiredDialogHidden,
        requiredFields,
        setRequiredDialogHidden,
    } = CreateCTDFolderData();

    const [isValidationModalOpen, setIsValidationModalOpen] = React.useState(false);
    const [validationMessage, setValidationMessage] = React.useState<string | JSX.Element>('');

    React.useEffect(() => {
        if (props.componentProps && props.componentProps.parentId) {
            setSelectedParent(props.componentProps.parentId);
            const parent = folders.find(f => f.id === props.componentProps.parentId || f.folderId === props.componentProps.parentId);
            if (parent) {
                setNewFolderCode(parent.code + '.');
            }
        }
    }, [props.componentProps, folders]);

    const handleCancel = () => {
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.CreateCTDFolder
        });
    };

    const handleFormSave = async () => {
        const errors: string[] = [];
        if (!newFolderCode) errors.push('Folder Code');
        if (!newFolderName) errors.push('Folder Name');

        if (errors.length > 0) {
            setValidationMessage(
                <ul>
                    {errors.map((err, i) => <li key={i}>{err} is required</li>)}
                </ul>
            );
            setIsValidationModalOpen(true);
            return;
        }

        const success = await handleCreateFolder();
        if (success) {
            handleCancel();
        }
    };

    return (
        <>
            {isLoading && <Loader />}
            {isValidationModalOpen && (
                <CustomModal
                    isModalOpenProps={isValidationModalOpen}
                    setModalpopUpFalse={() => setIsValidationModalOpen(false)}
                    subject={"Missing data"}
                    message={validationMessage}
                    closeButtonText={"Close"}
                />
            )}
            <RequiredFieldsDialog
                hidden={requiredDialogHidden}
                onDismiss={() => setRequiredDialogHidden(true)}
                fields={requiredFields}
            />

            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid">
                        {/* Header Row */}
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween alignItemsCenter">
                                <div>
                                    <h1 className="mainTitle">Add CTD Folder</h1>
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
                                            { label: 'CTD Structure', onClick: handleCancel },
                                            { label: 'Add Folder', isActive: true }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-row mt-20">
                            <div className="ms-Grid-col ms-sm12">
                                <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                        <label className="form-label">Parent Folder (Optional)</label>
                                        <ReactDropdown
                                            name="parentFolder"
                                            options={parentOptions}
                                            defaultOption={parentOptions.find(o => o.value === selectedParent) ?? parentOptions[0]}
                                            onChange={(opt) => {
                                                const nextParentId = opt?.value ?? '';
                                                setSelectedParent(nextParentId);
                                                const parent = folders.find(f => String(f.id) === nextParentId || f.folderId === nextParentId);
                                                setNewFolderCode(parent ? parent.code + '.' : '');
                                            }}
                                            isCloseMenuOnSelect={true}
                                            isSorted={true}
                                            isClearable={false}
                                        />
                                    </div>
                                </div>

                                <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                        <TextField
                                            label="Folder Code"
                                            required
                                            placeholder="e.g., Module 1.2"
                                            value={newFolderCode}
                                            onChange={(_e, v) => setNewFolderCode(v ?? '')}
                                            errorMessage={fieldErrors.code}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                        <TextField
                                            label="Folder Name"
                                            required
                                            placeholder="e.g., Administrative Information"
                                            value={newFolderName}
                                            onChange={(_e, v) => setNewFolderName(v ?? '')}
                                            errorMessage={fieldErrors.name}
                                        />
                                    </div>
                                </div>

                                <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                        <TextField
                                            label="Sort Order"
                                            type="number"
                                            value={newFolderSortOrder}
                                            onChange={(_e, v) => setNewFolderSortOrder(v || '')}
                                        />
                                    </div>
                                </div>

                                <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                                    <div className="ms-Grid-col ms-sm12">
                                        <TextField
                                            label="Description"
                                            multiline
                                            rows={4}
                                            value={newFolderDescription}
                                            onChange={(_e, v) => setNewFolderDescription(v ?? '')}
                                            placeholder="Enter folder description"
                                        />
                                    </div>
                                </div>

                                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                                    <div className="ms-Grid-col ms-sm12">
                                        <FormActions
                                            onSave={handleFormSave}
                                            onCancel={handleCancel}
                                            saveText="Create Folder"
                                            cancelText="Cancel"
                                            isSaving={isLoading}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
