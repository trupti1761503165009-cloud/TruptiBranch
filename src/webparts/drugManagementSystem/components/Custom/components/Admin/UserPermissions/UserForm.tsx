import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import ReactDropdown, { IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FormActions } from '../../../../Common/FormActions/FormActions';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

interface UserFormProps {
    mode: 'add' | 'edit' | 'view';
    formData: any;
    setFormData: (data: any) => void;
    onSave: () => void;
    onCancel: () => void;
    roleOptions: IReactDropOptionProps[];
    statusOptions: IReactDropOptionProps[];
    fieldErrors: any;
    isReadOnly: boolean;
    selectedUser?: any;
}

export const UserForm: React.FC<UserFormProps> = ({
    mode,
    formData,
    setFormData,
    onSave,
    onCancel,
    roleOptions,
    statusOptions,
    fieldErrors,
    isReadOnly,
    selectedUser
}) => {
    return (
        <div className="ms-Grid">
            {/* Section Header */}
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12">
                    <div className="form-section-header">User Information</div>
                </div>
            </div>

            {/* Row 1: Name and Email */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <TextField
                        label="Full Name"
                        required={!isReadOnly}
                        value={formData.name}
                        onChange={(_e, v) => setFormData({ ...formData, name: v ?? '' })}
                        disabled={isReadOnly}
                        errorMessage={fieldErrors?.name}
                        placeholder="Enter full name"
                        data-testid="user-name-input"
                    />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <TextField
                        label="Email Address"
                        required={!isReadOnly}
                        type="email"
                        value={formData.email}
                        onChange={(_e, v) => setFormData({ ...formData, email: v ?? '' })}
                        disabled={isReadOnly}
                        errorMessage={fieldErrors?.email}
                        placeholder="Enter email address"
                        data-testid="user-email-input"
                    />
                </div>
            </div>

            {/* Row 2: Role and Status */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <label className="form-label required">SharePoint Group (Role)</label>
                    <ReactDropdown
                        name="role"
                        options={roleOptions}
                        defaultOption={roleOptions.find(o => o.value === formData.role) || roleOptions[2]}
                        onChange={(opt) => setFormData({ ...formData, role: (opt?.value as any) ?? 'Author' })}
                        isCloseMenuOnSelect={true}
                        isSorted={false}
                        isClearable={false}
                        isDisabled={isReadOnly}
                    />
                    <small style={{ color: '#666', fontSize: 12, marginTop: 4, display: 'block' }}>
                        User will be added to this SharePoint Group
                    </small>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <label className="form-label">Status</label>
                    <ReactDropdown
                        name="status"
                        options={statusOptions}
                        defaultOption={statusOptions.find(o => o.value === formData.status) || statusOptions[0]}
                        onChange={(opt) => setFormData({ ...formData, status: (opt?.value as any) ?? 'Active' })}
                        isCloseMenuOnSelect={true}
                        isSorted={false}
                        isClearable={false}
                        isDisabled={isReadOnly}
                    />
                </div>
            </div>

            {/* Row 3: Project Name */}
            <div className="ms-Grid-row" style={{ marginTop: 16 }}>
                <div className="ms-Grid-col ms-sm12">
                    <TextField
                        label="Project/Drug Assignment"
                        value={formData.ProjectName}
                        onChange={(_e, v) => setFormData({ ...formData, ProjectName: v ?? '' })}
                        disabled={isReadOnly}
                        placeholder="Enter project or drug name"
                        data-testid="user-project-input"
                    />
                </div>
            </div>

            {/* Permissions Info (View Mode) */}
            {isReadOnly && selectedUser && (
                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12">
                        <div className="form-section-header">Permissions Summary</div>
                        <div style={{ background: '#F5F5F5', padding: 16, borderRadius: 8, marginTop: 12 }}>
                            <div style={{ marginBottom: 12 }}>
                                <strong>Role:</strong> {selectedUser.role || selectedUser.roles?.join(', ')}
                            </div>
                            <div>
                                <strong>Permissions:</strong>
                                <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
                                    {(selectedUser.role === 'Admin' || selectedUser.roles?.includes('Admin')) && (
                                        <>
                                            <li>Full control on all lists/libraries</li>
                                            <li>Manage configuration and users</li>
                                            <li>Access to all documents</li>
                                        </>
                                    )}
                                    {(selectedUser.role === 'HR' || selectedUser.roles?.includes('HR')) && (
                                        <>
                                            <li>Contribute on Employees, User Roles</li>
                                            <li>Read access to documents</li>
                                        </>
                                    )}
                                    {(selectedUser.role === 'Author' || selectedUser.roles?.includes('Author')) && (
                                        <>
                                            <li>Create and edit own documents</li>
                                            <li>Submit documents for approval</li>
                                            <li>Read templates and folders</li>
                                        </>
                                    )}
                                    {(selectedUser.role === 'Approver' || selectedUser.roles?.includes('Approver')) && (
                                        <>
                                            <li>Review submitted documents</li>
                                            <li>Approve or reject documents</li>
                                            <li>Add reviewer comments</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isReadOnly && (
                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12">
                        <FormActions
                            onSave={onSave}
                            onCancel={onCancel}
                            saveText={mode === 'add' ? 'Add to Group' : 'Save Changes'}
                            cancelText="Cancel"
                        />
                    </div>
                </div>
            )}
            {isReadOnly && (
                <div className="ms-Grid-row" style={{ marginTop: 24 }}>
                    <div className="ms-Grid-col ms-sm12" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <DefaultButton onClick={onCancel} data-testid="back-user-btn">
                            <FontAwesomeIcon icon={faArrowLeft} style={{ marginRight: 8 }} />
                            Back
                        </DefaultButton>
                    </div>
                </div>
            )}
        </div>
    );
};
