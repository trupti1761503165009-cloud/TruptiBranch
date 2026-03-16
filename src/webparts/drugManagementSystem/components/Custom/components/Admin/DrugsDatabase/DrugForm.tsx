import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import ReactDropdown, { IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface DrugFormProps {
    mode: 'add' | 'edit' | 'view';
    formData: any;
    setFormData: (data: any) => void;
    onSave: () => void;
    onCancel: () => void;
    statusOptions: IReactDropOptionProps[];
    fieldErrors: any;
    isReadOnly: boolean;
    isLoading: boolean;
}

export const DrugForm: React.FC<DrugFormProps> = ({
    mode,
    formData,
    setFormData,
    onSave,
    onCancel,
    statusOptions,
    fieldErrors,
    isReadOnly,
    isLoading
}) => {
    return (
        <div className="ms-Grid">
            {/* Section Header */}
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12">
                    <div className="form-section-header">Drug Information</div>
                </div>
            </div>

            {/* Row 1: Drug Name and Category */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <TextField
                        label="Drug Name"
                        required={!isReadOnly}
                        value={formData.name}
                        onChange={(_e, v) => setFormData({ ...formData, name: v ?? '' })}
                        disabled={isReadOnly}
                        errorMessage={fieldErrors?.name}
                        placeholder="Enter drug name"
                        data-testid="drug-name-input"
                    />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <TextField
                        label="Category"
                        value={formData.category}
                        onChange={(_e, v) => setFormData({ ...formData, category: v ?? '' })}
                        disabled={isReadOnly}
                        placeholder="Enter category"
                        data-testid="drug-category-input"
                    />
                </div>
            </div>

            {/* Row 2: Status */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <label className="form-label">Status</label>
                    <ReactDropdown
                        name="drugStatus"
                        options={statusOptions}
                        defaultOption={statusOptions.find(o => o.value === formData.status) || statusOptions[0]}
                        onChange={(opt) => setFormData({ ...formData, status: (opt?.value as any) ?? 'In Development' })}
                        isCloseMenuOnSelect={true}
                        isSorted={false}
                        isClearable={false}
                        isDisabled={isReadOnly}
                    />
                </div>
            </div>

            {/* Row 3: Description */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12">
                    <TextField
                        label="Description"
                        multiline
                        rows={4}
                        value={formData.description}
                        onChange={(_e, v) => setFormData({ ...formData, description: v ?? '' })}
                        disabled={isReadOnly}
                        placeholder="Enter drug description"
                        data-testid="drug-description-input"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            {!isReadOnly && (
                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12">
                        <FormActions
                            onSave={onSave}
                            onCancel={onCancel}
                            saveText={mode === 'add' ? 'Add Drug' : 'Update Drug'}
                            cancelText="Cancel"
                            isSaving={isLoading}
                        />
                    </div>
                </div>
            )}
            {isReadOnly && (
                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <DefaultButton
                            onClick={onCancel}
                            data-testid="back-drug-btn"
                            styles={{
                                root: { background: '#757575', borderColor: '#757575', color: '#fff' },
                                rootHovered: { background: '#616161', borderColor: '#616161', color: '#fff' },
                                rootPressed: { background: '#424242', borderColor: '#424242', color: '#fff' }
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
                            Back
                        </DefaultButton>
                    </div>
                </div>
            )}
        </div>
    );
};
