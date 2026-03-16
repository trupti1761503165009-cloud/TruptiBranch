import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AddUserModalData } from './AddUserModalData';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

const roleOptions: IReactDropOptionProps[] = [
  { label: 'Author', value: 'Author' },
  { label: 'Reviewer', value: 'Reviewer' },
  { label: 'Approver', value: 'Approver' },
  { label: 'Admin', value: 'Admin' }
];

export const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { formData, setFormData, canSubmit, handleSubmit, closeAndReset } = AddUserModalData({ onClose, onSuccess });

  const roleDefault = React.useMemo(
    () => roleOptions.find(o => o.value === formData.role) ?? roleOptions[0],
    [formData.role]
  );

  return (
    <CustomModal
      isModalOpenProps={isOpen}
      setModalpopUpFalse={(open) => {
        if (!open) closeAndReset();
      }}
      subject="Add New User - Complete Profile"
      message={
        <div>
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <TextField
                  label="Full Name *"
                  value={formData.name}
                  onChange={(_e, v) => setFormData({ ...formData, name: v ?? '' })}
                  required
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <TextField
                  label="Date of Birth *"
                  type="date"
                  value={formData.dob}
                  onChange={(_e, v) => setFormData({ ...formData, dob: v ?? '' })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <TextField
                  label="Email Address *"
                  type="email"
                  value={formData.email}
                  onChange={(_e, v) => setFormData({ ...formData, email: v ?? '' })}
                  required
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <TextField
                  label="Username *"
                  value={formData.username}
                  onChange={(_e, v) => setFormData({ ...formData, username: v ?? '' })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <TextField
                  label="Mobile Number *"
                  type="tel"
                  value={formData.mobile}
                  onChange={(_e, v) => setFormData({ ...formData, mobile: v ?? '' })}
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6">
              <div className="form-group">
                <label className="form-label">Role *</label>
                <ReactDropdown
                  name="role"
                  options={roleOptions}
                  defaultOption={roleDefault}
                  onChange={(opt) => setFormData({ ...formData, role: (opt?.value as any) ?? 'Author' })}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <TextField
              label="User Photo URL (Optional)"
              value={formData.photo}
              onChange={(_e, v) => setFormData({ ...formData, photo: v ?? '' })}
              placeholder="https://example.com/photo.jpg"
            />
          </div>

          {formData.photo && (
            <div className="form-group">
              <div style={{ textAlign: 'center' }}>
                <img
                  src={formData.photo}
                  alt="User preview"
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e0e0e0' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            </div>
          )}
        </div>
      }
      closeButtonText="Cancel"
      yesButtonText="Add User"
      onClickOfYes={handleSubmit}
      isYesButtonDisbale={!canSubmit}
      thirdButtonText={undefined}
      onClose={closeAndReset}
    />
  );
};

