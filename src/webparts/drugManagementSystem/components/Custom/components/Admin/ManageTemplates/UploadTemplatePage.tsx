/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Label } from '@fluentui/react/lib/Label';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import DragandDropFilePicker from '../../../../Common/dragandDrop/DragandDropFilePicker';
import { Loader } from '../../../../Common/Loader/Loader';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { UploadTemplateModalData } from '../UploadTemplateModal/UploadTemplateModalData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

interface UploadTemplatePageProps {
  onCancel: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  editData?: any;
}

export const UploadTemplatePage: React.FC<UploadTemplatePageProps> = ({ onCancel, onSuccess, editMode = false, editData }) => {
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
    closeAndReset,
    gmpModels,
    tmfFolders
  } = UploadTemplateModalData({ onClose: onCancel, onSuccess });

  // Local validation state
  const [localErrors, setLocalErrors] = React.useState<Record<string, string>>({});
  const [messageDialog, setMessageDialog] = React.useState<{
    hidden: boolean;
    type: MessageType;
    title: string;
    message: string;
    fields: string[];
  }>({ hidden: true, type: 'info', title: '', message: '', fields: [] });

  // Initialize edit data
  React.useEffect(() => {
    if (editMode && editData) {
      setFormData({
        name: editData.name || '',
        version: editData.version || '1.0',
        categoryId: editData.categoryId || 0,
        countryId: editData.countryId || 0,
        status: editData.status || 'Active',
        mappingType: editData.mappingType || 'None',
        mappedCTDFolderId: editData.mappedCTDFolderId || 0,
        ectdSectionId: editData.ectdSectionId || 0,
        ectdSubsection: editData.ectdSubsection || editData.eCTDSubsection || '',
        mappedGMPModelId: editData.mappedGMPModelId || 0,
        mappedTMFFolderId: editData.mappedTMFFolderId || 0
      });
    }
  }, [editMode, editData]);

  const showMessage = (type: MessageType, title: string, message: string, fields: string[] = []) => {
    setMessageDialog({ hidden: false, type, title, message, fields });
  };

  const hideMessage = () => {
    setMessageDialog(prev => ({ ...prev, hidden: true }));
  };

  const categoryOptions = React.useMemo(() => categories.map(category => ({ label: category.name, value: category.id })), [categories]);
  const countryOptions = React.useMemo(() => countries.map(c => ({ label: c.name, value: c.id })), [countries]);
  const ctdFolderOptions = React.useMemo(() => ctdFolders.map(f => ({ label: f.name, value: f.id })), [ctdFolders]);
  const ectdSectionOptions = React.useMemo(() => ectdSections.map(s => ({ label: s.name, value: s.id })), [ectdSections]);
  const gmpModelOptions = React.useMemo(() => (gmpModels || []).map(m => ({ label: m.name, value: m.id })), [gmpModels]);
  const tmfFolderOptions = React.useMemo(() => (tmfFolders || []).map(f => ({ label: f.name, value: f.id })), [tmfFolders]);

  const editStatusOptions = React.useMemo(() => [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ], []);

  const mappingTypeOptions = React.useMemo(() => [
    { label: 'None', value: 'None' },
    { label: 'eCTD', value: 'eCTD' },
    { label: 'GMP', value: 'GMP' },
    { label: 'TMF', value: 'TMF' }
  ], []);

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
  const gmpModelDefault = React.useMemo(
    () => gmpModelOptions.find(o => o.value === (formData as any).mappedGMPModelId) ?? null,
    [gmpModelOptions, (formData as any).mappedGMPModelId]
  );
  const tmfFolderDefault = React.useMemo(
    () => tmfFolderOptions.find(o => o.value === (formData as any).mappedTMFFolderId) ?? null,
    [tmfFolderOptions, (formData as any).mappedTMFFolderId]
  );

  React.useEffect(() => {
    if (errorMessage) {
      showMessage('error', 'Error', errorMessage);
    }
  }, [errorMessage]);

  // Validate before submit
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = 'Template Name is required';
    }

    if (!editMode && selectedFiles.length === 0) {
      errors.file = 'Please upload a file';
    }

    if (formData.mappingType === 'eCTD') {
      if (!formData.mappedCTDFolderId) errors.mappedCTDFolderId = 'CTD Folder is required for eCTD mapping';
      if (!formData.ectdSectionId) errors.ectdSectionId = 'eCTD Section is required';
    } else if (formData.mappingType === 'GMP') {
      if (!(formData as any).mappedGMPModelId) errors.mappedGMPModelId = 'GMP Model is required';
    } else if (formData.mappingType === 'TMF') {
      if (!(formData as any).mappedTMFFolderId) errors.mappedTMFFolderId = 'TMF Folder is required';
    }

    setLocalErrors(errors);

    if (Object.keys(errors).length > 0) {
      return false;
    }

    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      handleUpload();
    }
  };

  const getFieldErrorStyle = (fieldName: string) => {
    const hasError = localErrors[fieldName] || (fieldErrors as Record<string, string> | undefined)?.[fieldName];
    return hasError ? { borderColor: '#d32f2f', borderWidth: 2 } : undefined;
  };

  return (
    <div className="boxCard">
      <div className="formGroup">
        <div className="ms-Grid">
          {isUploading && <Loader />}

          <MessageDialog
            hidden={messageDialog.hidden}
            onDismiss={hideMessage}
            type={messageDialog.type}
            title={messageDialog.title}
            message={messageDialog.message}
            fields={messageDialog.fields}
          />

          {/* Header Row */}
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween alignItemsCenter">
              <div><h1 className="mainTitle">{editMode ? 'Edit Template' : 'Upload Template'}</h1></div>
              <div>
                <PrimaryButton className="btn btn-danger" text="Close" onClick={closeAndReset} />
              </div>
            </div>
          </div>

          {/* Breadcrumb Row */}
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12">
              <div className="customebreadcrumb">
                <Breadcrumb items={[
                  { label: 'Home', onClick: () => { } },
                  { label: 'Manage Templates', onClick: onCancel },
                  { label: editMode ? 'Edit Template' : 'Upload Template', isActive: true }
                ]} />
              </div>
            </div>
          </div>

          {/* Template Name */}
          <div className="ms-Grid-row mt-20">
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Template Name<span className="required">*</span></Label>
              <TextField
                className="formControl"
                placeholder="e.g., Clinical Trial Protocol v3.0"
                value={formData.name}
                onChange={(_e, v) => {
                  setFormData((prev) => ({ ...prev, name: v ?? '' }));
                  if (localErrors.name) setLocalErrors((errs: any) => ({ ...errs, name: '' }));
                }}
                errorMessage={localErrors.name || fieldErrors?.name}
                styles={{ fieldGroup: getFieldErrorStyle('name') }}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Category</Label>
              <ReactDropdown
                name="templateCategory"
                options={categoryOptions}
                defaultOption={categoryDefault}
                placeholder="-- Select Category --"
                onChange={(opt) => setFormData((prev) => ({ ...prev, categoryId: Number(opt?.value) || 0 }))}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Country</Label>
              <ReactDropdown
                name="templateCountry"
                options={countryOptions}
                defaultOption={countryDefault}
                placeholder="-- Select Country --"
                onChange={(opt) => setFormData((prev) => ({ ...prev, countryId: Number(opt?.value) || 0 }))}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Status</Label>
              <ReactDropdown
                name="templateStatus"
                options={editStatusOptions}
                defaultOption={editStatusOptions.find(o => o.value === formData.status) ?? editStatusOptions[0]}
                onChange={(opt) => setFormData((prev) => ({ ...prev, status: (opt?.value as 'Active' | 'Inactive') ?? 'Active' }))}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>
          </div>

          {/* Mapping Type Row */}
          <div className="ms-Grid-row mt-20">
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Mapping Type</Label>
              <ReactDropdown
                name="mappingType"
                options={mappingTypeOptions}
                defaultOption={mappingTypeOptions.find(o => o.value === formData.mappingType) ?? mappingTypeOptions[0]}
                onChange={(opt) => {
                  const nextValue = ((opt?.value as any) ?? 'None') as any;
                  setFormData((prev) => ({
                    ...prev,
                    mappingType: nextValue,
                    mappedCTDFolderId: nextValue === 'eCTD' ? prev.mappedCTDFolderId : 0,
                    ectdSectionId: nextValue === 'eCTD' ? prev.ectdSectionId : 0,
                    ectdSubsection: nextValue === 'eCTD' ? prev.ectdSubsection : '',
                    mappedGMPModelId: nextValue === 'GMP' ? prev.mappedGMPModelId : 0,
                    mappedTMFFolderId: nextValue === 'TMF' ? prev.mappedTMFFolderId : 0
                  }));
                }}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>

            {formData.mappingType === 'GMP' && (
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">Mapped GMP Model<span className="required">*</span></Label>
                <ReactDropdown
                  name="mappedGMPModel"
                  options={gmpModelOptions}
                  defaultOption={gmpModelDefault}
                  placeholder="-- Select GMP Model --"
                  onChange={(opt) => {
                    setFormData((prev) => ({ ...prev, mappedGMPModelId: Number(opt?.value) || 0 }));
                    if (localErrors.mappedGMPModelId) setLocalErrors((errs: any) => ({ ...errs, mappedGMPModelId: '' }));
                  }}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
                {localErrors.mappedGMPModelId && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{localErrors.mappedGMPModelId}</div>}
              </div>
            )}

            {formData.mappingType === 'TMF' && (
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">Mapped TMF Folder<span className="required">*</span></Label>
                <ReactDropdown
                  name="mappedTMFFolder"
                  options={tmfFolderOptions}
                  defaultOption={tmfFolderDefault}
                  placeholder="-- Select TMF Folder --"
                  onChange={(opt) => {
                    setFormData((prev) => ({ ...prev, mappedTMFFolderId: Number(opt?.value) || 0 }));
                    if (localErrors.mappedTMFFolderId) setLocalErrors((errs: any) => ({ ...errs, mappedTMFFolderId: '' }));
                  }}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
                {localErrors.mappedTMFFolderId && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{localErrors.mappedTMFFolderId}</div>}
              </div>
            )}

            {formData.mappingType === 'eCTD' && (
              <>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                  <Label className="formLabel">Mapped CTD Folder<span className="required">*</span></Label>
                  <ReactDropdown
                    name="mappedCTDFolder"
                    options={ctdFolderOptions}
                    defaultOption={ctdFolderDefault}
                    placeholder="-- Select CTD Folder --"
                    onChange={(opt) => {
                      setFormData((prev) => ({ ...prev, mappedCTDFolderId: Number(opt?.value) || 0 }));
                      if (localErrors.mappedCTDFolderId) setLocalErrors((errs: any) => ({ ...errs, mappedCTDFolderId: '' }));
                    }}
                    isCloseMenuOnSelect={true}
                    isSorted={true}
                    isClearable={false}
                  />
                  {localErrors.mappedCTDFolderId && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{localErrors.mappedCTDFolderId}</div>}
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                  <Label className="formLabel">eCTD Section<span className="required">*</span></Label>
                  <ReactDropdown
                    name="ectdSection"
                    options={ectdSectionOptions}
                    defaultOption={ectdSectionDefault}
                    placeholder="-- Select eCTD Section --"
                    onChange={(opt) => {
                      setFormData((prev) => ({ ...prev, ectdSectionId: Number(opt?.value) || 0 }));
                      if (localErrors.ectdSectionId) setLocalErrors((errs: any) => ({ ...errs, ectdSectionId: '' }));
                    }}
                    isCloseMenuOnSelect={true}
                    isSorted={true}
                    isClearable={false}
                  />
                  {localErrors.ectdSectionId && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{localErrors.ectdSectionId}</div>}
                </div>
              </>
            )}
          </div>

          {formData.mappingType === 'eCTD' && (
            <div className="ms-Grid-row mt-20">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <Label className="formLabel">eCTD Subsection (Optional)</Label>
                <TextField
                  className="formControl"
                  value={formData.ectdSubsection}
                  onChange={(_e, v) => setFormData((prev) => ({ ...prev, ectdSubsection: v ?? '' }))}
                />
              </div>
            </div>
          )}

          {!editMode && (
            <div className="ms-Grid-row mt-20">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                <Label className="formLabel">Upload File<span className="required">*</span></Label>
                <div style={{ border: localErrors.file ? '2px solid #d32f2f' : '1px solid #e0e0e0', borderRadius: 4, padding: 8 }}>
                  <DragandDropFilePicker setFilesToState={handleFileSelection} isMultiple={false} />
                </div>
                {localErrors.file && <div style={{ color: '#d32f2f', fontSize: 12, marginTop: 4 }}>{localErrors.file}</div>}
                {selectedFiles.length > 0 && (
                  <div style={{ marginTop: 10, fontSize: 13 }}>
                    <strong>{selectedFiles[0].name}</strong> ({(selectedFiles[0].size / 1024).toFixed(2)} KB)
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Accepted formats: DOC, DOCX, PDF, XLS, XLSX
                </p>
              </div>
            </div>
          )}

          {/* Save/Close buttons */}
          <div className="ms-Grid-row mt-20">
            <div className="ms-Grid-col ms-sm12">
              <PrimaryButton
                onClick={handleSave}
                disabled={isUploading}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
                {isUploading ? 'Saving...' : editMode ? 'Update Template' : 'Save Template'}
              </PrimaryButton>
              <DefaultButton
                onClick={closeAndReset}
                className="btn btn-danger"
                style={{ marginLeft: 10 }}
              >
                <FontAwesomeIcon icon={faTimes} style={{ marginRight: 8 }} />
                Cancel
              </DefaultButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
