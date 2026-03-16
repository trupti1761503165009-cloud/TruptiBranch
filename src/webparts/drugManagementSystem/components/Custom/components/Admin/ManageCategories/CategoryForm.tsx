import * as React from 'react';
import { DefaultButton, TextField } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import type { Category } from '../../../types';
import '../../../styles/form-validation.css';
import { FormActions } from '../../../../Common/FormActions/FormActions';

interface CategoryFormProps {
  mode: 'add' | 'edit' | 'view';
  initialData?: Partial<Category & any>;
  onSave: (data: any) => void;
  onCancel: () => void;
  documentCategoryOptions: any[];
  groupOptions: any[];
  subGroupOptions: any[];
  artifactNameOptions: any[];
  templateNameOptions: any[];
  ctdModuleOptions: any[];
  ectdSectionOptions: any[];
  ectdSubsectionOptions: any[];
  ectdCodeOptions: any[];
  formData: any;
  setFormData: (data: any) => void;
  fieldErrors: any;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  mode,
  onSave,
  onCancel,
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
  fieldErrors
}) => {
  const isReadOnly = mode === 'view';
  const title = mode === 'add' ? 'Add New Category' : mode === 'edit' ? 'Edit Category' : 'View Category';

  const handleSubmit = (): void => {
    if (!isReadOnly) {
      onSave(formData);
    }
  };

  return (
    <div className="ms-Grid">
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-sm12">
          <div className="form-section-header">Basic Information</div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Category Name</label>
            <TextField
              value={formData.name || ''}
              onChange={(_e, val) => setFormData({ ...formData, name: val || '' })}
              disabled={isReadOnly}
              placeholder="Enter category name"
            />
            {fieldErrors.name && <div className="field-error">{fieldErrors.name}</div>}
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Document Category</label>
            <ReactDropdown
              name="documentCategory"
              options={documentCategoryOptions}
              defaultOption={documentCategoryOptions.find((o: any) => o.value === formData.documentCategory)}
              onChange={(opt) => setFormData({ ...formData, documentCategory: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={false}
            />
            {fieldErrors.documentCategory && <div className="field-error">{fieldErrors.documentCategory}</div>}
          </div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">Group</label>
            <ReactDropdown
              name="group"
              options={groupOptions}
              defaultOption={groupOptions.find((o: any) => o.value === formData.group)}
              onChange={(opt) => {
                setFormData({ ...formData, group: opt?.value || '', subGroup: '' });
              }}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">SubGroup</label>
            <ReactDropdown
              name="subGroup"
              options={subGroupOptions}
              defaultOption={subGroupOptions.find((o: any) => o.value === formData.subGroup)}
              onChange={(opt) => setFormData({ ...formData, subGroup: opt?.value || '' })}
              isDisabled={isReadOnly || !formData.group}
              isClearable={true}
            />
            {!formData.group && !isReadOnly && (
              <div className="cascading-dropdown-hint">Select Group first</div>
            )}
          </div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">Artifact Name</label>
            <ReactDropdown
              name="artifactName"
              options={artifactNameOptions}
              defaultOption={artifactNameOptions.find((o: any) => o.value === formData.artifactName)}
              onChange={(opt) => setFormData({ ...formData, artifactName: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">Template Name</label>
            <ReactDropdown
              name="templateName"
              options={templateNameOptions}
              defaultOption={templateNameOptions.find((o: any) => o.value === formData.templateName)}
              onChange={(opt) => setFormData({ ...formData, templateName: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Status</label>
            <ReactDropdown
              name="status"
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' }
              ]}
              defaultOption={{ label: formData.status || 'Active', value: formData.status || 'Active' }}
              onChange={(opt) => setFormData({ ...formData, status: opt?.value || 'Active' })}
              isDisabled={isReadOnly}
              isClearable={false}
            />
          </div>
        </div>

        {mode !== 'add' && (
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
            <div className="form-field">
              <label className="form-label">Documents</label>
              <TextField
                value={String(formData.documents || 0)}
                disabled={true}
                readOnly={true}
              />
            </div>
          </div>
        )}
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">CTD Module</label>
            <ReactDropdown
              name="ctdModule"
              options={ctdModuleOptions}
              defaultOption={ctdModuleOptions.find((o: any) => o.value === formData.ctdModule)}
              onChange={(opt) => setFormData({ ...formData, ctdModule: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">eCTD Section</label>
            <ReactDropdown
              name="ectdSection"
              options={ectdSectionOptions}
              defaultOption={ectdSectionOptions.find((o: any) => o.value === formData.ectdSection)}
              onChange={(opt) => setFormData({ ...formData, ectdSection: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">eCTD Subsection</label>
            <ReactDropdown
              name="ectdSubsection"
              options={ectdSubsectionOptions}
              defaultOption={ectdSubsectionOptions.find((o: any) => o.value === formData.ectdSubsection)}
              onChange={(opt) => setFormData({ ...formData, ectdSubsection: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">eCTD Code</label>
            <ReactDropdown
              name="ectdCode"
              options={ectdCodeOptions}
              defaultOption={ectdCodeOptions.find((o: any) => o.value === formData.ectdCode)}
              onChange={(opt) => setFormData({ ...formData, ectdCode: opt?.value || '' })}
              isDisabled={isReadOnly}
              isClearable={true}
            />
          </div>
        </div>
      </div>

      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">Description</label>
            <TextField
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={(_e, val) => setFormData({ ...formData, description: val || '' })}
              disabled={isReadOnly}
              placeholder="Enter category description"
            />
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label">Artifact Description</label>
            <TextField
              multiline
              rows={3}
              value={formData.artifactDescription || ''}
              onChange={(_e, val) => setFormData({ ...formData, artifactDescription: val || '' })}
              disabled={isReadOnly}
              placeholder="Enter artifact description"
            />
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div className="ms-Grid-row mt-20">
          <div className="ms-Grid-col ms-sm12">
            <FormActions
              onSave={handleSubmit}
              onCancel={onCancel}
              saveText={mode === 'add' ? 'Add Category' : 'Save Changes'}
              cancelText="Cancel"
            />
          </div>
        </div>
      )}
      {isReadOnly && (
        <div className="ms-Grid-row mt-20">
          <div className="ms-Grid-col ms-sm12 dFlex justifyContentEnd">
            <DefaultButton
              onClick={onCancel}
              className="btn btn-secondary"
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
