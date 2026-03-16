import * as React from 'react';
import { TextField } from '@fluentui/react/lib/TextField';
import { CustomModal } from '../../../../Common/CustomModal';
import { UploadTemplateModalData } from './UploadTemplateModalData';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import DragandDropFilePicker from '../../../../Common/dragandDrop/DragandDropFilePicker';
import { RequiredLabel } from '../../../../Common/RequiredLabel';
import { RequiredFieldsDialog } from '../../../../Common/Dialogs/RequiredFieldsDialog';
import { showToast } from '../../../../Common/Toast/toastBus';

interface UploadTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UploadTemplateModal: React.FC<UploadTemplateModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    formData,
    setFormData,
    categories,
    countries,
    ctdFolders,
    ectdSections,
    selectedFiles,
    errorMessage,
    fieldErrors,
    isUploading,
    canUpload,
    handleFileSelection,
    handleUpload,
    closeAndReset
  } =
    UploadTemplateModalData({ onClose, onSuccess });

  const categoryOptions = React.useMemo(() => categories.map(category => ({ label: category.name, value: category.id })), [categories]);
  const countryOptions = React.useMemo(() => countries.map(c => ({ label: c.name, value: c.id })), [countries]);
  const ctdFolderOptions = React.useMemo(() => ctdFolders.map(f => ({ label: f.name, value: f.id })), [ctdFolders]);
  const ectdSectionOptions = React.useMemo(() => ectdSections.map(s => ({ label: s.name, value: s.id })), [ectdSections]);

  const categoryDefault = React.useMemo(
    () => categoryOptions.find(o => o.value === formData.categoryId) ?? null,
    [categoryOptions, formData.categoryId]
  );
  const countryDefault = React.useMemo(
    () => countryOptions.find(o => o.value === formData.countryId) ?? null,
    [countryOptions, formData.countryId]
  );
  const ctdFolderDefault = React.useMemo(
    () => ctdFolderOptions.find(o => o.value === formData.mappedCTDFolderId) ?? null,
    [ctdFolderOptions, formData.mappedCTDFolderId]
  );
  const ectdSectionDefault = React.useMemo(
    () => ectdSectionOptions.find(o => o.value === formData.ectdSectionId) ?? null,
    [ectdSectionOptions, formData.ectdSectionId]
  );

  const [requiredDialogHidden, setRequiredDialogHidden] = React.useState(true);

  React.useEffect(() => {
    if (!errorMessage) return;
    if (errorMessage === 'Please complete all required fields.') {
      setRequiredDialogHidden(false);
      return;
    }
    showToast({ type: 'error', message: errorMessage });
  }, [errorMessage]);

  return (
    <CustomModal
      isModalOpenProps={isOpen}
      setModalpopUpFalse={(open) => {
        if (!open) closeAndReset();
      }}
      subject="Upload New Template"
      isLoading={isUploading}
      message={
        <div>
          <RequiredFieldsDialog
            hidden={requiredDialogHidden}
            onDismiss={() => setRequiredDialogHidden(true)}
            fields={['Template Name', 'Upload File']}
          />
          <div className="form-group">
            <RequiredLabel text="Template Name" />
            <TextField
              label=""
              placeholder="e.g., Clinical Trial Protocol v3.0"
              value={formData.name}
              onChange={(_e, v) => setFormData({ ...formData, name: v ?? '' })}
              required
              errorMessage={fieldErrors?.name}
            />
          </div>

          <div className="form-group">
            <RequiredLabel text={`Category${categories.length > 0 ? ' *' : ' (Optional - add Categories first)'}`} />
            <ReactDropdown
              name="templateCategory"
              options={categoryOptions}
              defaultOption={categoryDefault}
              onChange={(opt) => setFormData({ ...formData, categoryId: Number(opt?.value) || 0 })}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {fieldErrors?.categoryId && <div className="field-error">{fieldErrors.categoryId}</div>}
          </div>

          <div className="form-group">
            <RequiredLabel text={`Country${countries.length > 0 ? ' *' : ' (Optional)'}`} />
            <ReactDropdown
              name="templateCountry"
              options={countryOptions}
              defaultOption={countryDefault}
              onChange={(opt) => setFormData({ ...formData, countryId: Number(opt?.value) || 0 })}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {fieldErrors?.countryId && <div className="field-error">{fieldErrors.countryId}</div>}
          </div>

      <div className="form-group">
        <RequiredLabel text="Status" />
        <ReactDropdown
          name="templateStatus"
          options={[
            { label: 'Active', value: 'Active' },
            { label: 'Inactive', value: 'Inactive' }
          ]}
          defaultOption={{ label: formData.status, value: formData.status }}
          onChange={(opt) => setFormData({ ...formData, status: (opt?.value as 'Active' | 'Inactive') ?? 'Active' })}
          isCloseMenuOnSelect={true}
          isSorted={false}
          isClearable={false}
        />
      </div>

      <div className="form-group">
        <RequiredLabel text="Mapping Type" />
        <ReactDropdown
          name="mappingType"
          options={[
            { label: 'None', value: 'None' },
            { label: 'eCTD', value: 'eCTD' },
            { label: 'GMP', value: 'GMP' }
          ]}
          defaultOption={{ label: formData.mappingType, value: formData.mappingType }}
          onChange={(opt) =>
            setFormData({
              ...formData,
              mappingType: ((opt?.value as any) ?? 'None') as any,
              mappedCTDFolderId: ((opt?.value as any) ?? 'None') === 'eCTD' ? formData.mappedCTDFolderId : 0,
              ectdSectionId: ((opt?.value as any) ?? 'None') === 'eCTD' ? formData.ectdSectionId : 0,
              ectdSubsection: ((opt?.value as any) ?? 'None') === 'eCTD' ? formData.ectdSubsection : ''
            })
          }
          isCloseMenuOnSelect={true}
          isSorted={false}
          isClearable={false}
        />
      </div>

      {formData.mappingType === 'eCTD' && (
        <>
          <div className="form-group">
            <RequiredLabel text="Mapped CTD Folder *" />
            <ReactDropdown
              name="mappedCTDFolder"
              options={ctdFolderOptions}
              defaultOption={ctdFolderDefault}
              onChange={(opt) => setFormData({ ...formData, mappedCTDFolderId: Number(opt?.value) || 0 })}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {fieldErrors?.mappedCTDFolderId && <div className="field-error">{fieldErrors.mappedCTDFolderId}</div>}
          </div>
          <div className="form-group">
            <RequiredLabel text="eCTD Section *" />
            <ReactDropdown
              name="ectdSection"
              options={ectdSectionOptions}
              defaultOption={ectdSectionDefault}
              onChange={(opt) => setFormData({ ...formData, ectdSectionId: Number(opt?.value) || 0 })}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {fieldErrors?.ectdSectionId && <div className="field-error">{fieldErrors.ectdSectionId}</div>}
          </div>
          <div className="form-group">
            <TextField
              label="eCTD Subsection (Optional)"
              value={formData.ectdSubsection}
              onChange={(_e, v) => setFormData({ ...formData, ectdSubsection: v ?? '' })}
            />
          </div>
        </>
      )}

          <div className="form-group">
            <RequiredLabel text="Upload File" />
            <DragandDropFilePicker setFilesToState={handleFileSelection} isMultiple={false} />
            {fieldErrors?.file && <div className="field-error">{fieldErrors.file}</div>}
            {selectedFiles.length > 0 && (
              <div style={{ marginTop: 10, fontSize: 13 }}>
                <strong>{selectedFiles[0].name}</strong> ({(selectedFiles[0].size / 1024).toFixed(2)} KB)
              </div>
            )}
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Accepted formats: DOC, DOCX, PDF, XLS, XLSX</p>
          </div>
        </div>
      }
      closeButtonText="Cancel"
      yesButtonText="Upload Template"
      onClickOfYes={handleUpload}
      isYesButtonDisbale={!canUpload || isUploading}
      onClose={closeAndReset}
    />
  );
};

