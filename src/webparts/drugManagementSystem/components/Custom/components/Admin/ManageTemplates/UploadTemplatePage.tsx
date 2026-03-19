/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { Label } from '@fluentui/react/lib/Label';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { Loader } from '../../../../Common/Loader/Loader';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { CustomModal } from '../../../../Common/CustomModal';
import { UploadTemplateModalData } from '../UploadTemplateModal/UploadTemplateModalData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

interface UploadTemplatePageProps {
  onCancel: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  editData?: any;
}

const ECTD_MODULES = [
  { label: 'Module 1 \u2013 Administrative & Prescribing Information', value: '1' },
  { label: 'Module 2 \u2013 CTD Summaries', value: '2' },
  { label: 'Module 3 \u2013 Quality', value: '3' },
  { label: 'Module 4 \u2013 Nonclinical Study Reports', value: '4' },
  { label: 'Module 5 \u2013 Clinical Study Reports', value: '5' },
];

export const UploadTemplatePage: React.FC<UploadTemplatePageProps> = ({ onCancel, onSuccess, editMode = false, editData }) => {
  const editItemId = editMode && editData ? Number(editData.id) || undefined : undefined;
  const editFileRef = editMode && editData ? (editData.fileRef || editData.serverRelativeUrl || '') : '';

  const {
    formData,
    setFormData,
    categories,
    countries,
    ctdFolders,
    ectdSections,
    errorMessage,
    isUploading,
    handleUpload,
    closeAndReset,
    gmpModels,
    tmfFolders,
    templateOptions
  } = UploadTemplateModalData({ onClose: onCancel, onSuccess, editMode, editItemId, editFileRef });

  const [selectedModule, setSelectedModule] = React.useState<string>('');

  const [validationModal, setValidationModal] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [errorModal, setErrorModal] = React.useState<{ open: boolean; message: string }>({ open: false, message: '' });

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
        mappedTMFFolderId: editData.mappedTMFFolderId || 0,
        selectedTemplateId: editData.id || 0
      });
      if (editData.mappingType === 'eCTD' && editData.mappedCTDFolder) {
        const match = String(editData.mappedCTDFolder).match(/^(\d)/);
        if (match) setSelectedModule(match[1]);
      }
    }
  }, [editMode, editData]);

  React.useEffect(() => {
    if (errorMessage) {
      setErrorModal({ open: true, message: errorMessage });
    }
  }, [errorMessage]);

  const templateDropdownOptions = React.useMemo(() =>
    (templateOptions || []).map(t => ({ label: `${t.name} (v${t.version})`, value: t.id })),
    [templateOptions]
  );

  const templateDefault = React.useMemo(() =>
    templateDropdownOptions.find(o => o.value === formData.selectedTemplateId) ?? null,
    [templateDropdownOptions, formData.selectedTemplateId]
  );

  const categoryOptions = React.useMemo(() => categories.map(c => ({ label: c.name, value: c.id })), [categories]);
  const countryOptions = React.useMemo(() => countries.map(c => ({ label: c.name, value: c.id })), [countries]);
  const gmpModelOptions = React.useMemo(() => (gmpModels || []).map(m => ({ label: m.name, value: m.id })), [gmpModels]);
  const tmfFolderOptions = React.useMemo(() => (tmfFolders || []).map(f => ({ label: f.name, value: f.id })), [tmfFolders]);

  const ctdFolderOptions = React.useMemo(() => {
    const all = (ctdFolders || []).map(f => ({ label: f.name, value: f.id }));
    if (!selectedModule) return all;
    return all.filter(o => {
      const stripped = o.label.replace(/^\d+ - /, '');
      return o.label.startsWith(selectedModule + '.') || stripped.startsWith(selectedModule + '.');
    });
  }, [ctdFolders, selectedModule]);

  const ectdSectionOptions = React.useMemo(() => {
    const all = (ectdSections || []).map(s => ({ label: s.name, value: s.id }));
    if (!selectedModule) return all;
    return all.filter(o => {
      const label = o.label || '';
      return label.startsWith(selectedModule + '.') || label.startsWith(selectedModule + ' ');
    });
  }, [ectdSections, selectedModule]);

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

  const categoryDefault = React.useMemo(() => categoryOptions.find(o => o.value === formData.categoryId) ?? null, [categoryOptions, formData.categoryId]);
  const countryDefault = React.useMemo(() => countryOptions.find(o => o.value === formData.countryId) ?? null, [countryOptions, formData.countryId]);
  const ctdFolderDefault = React.useMemo(() => ctdFolderOptions.find(o => o.value === formData.mappedCTDFolderId) ?? null, [ctdFolderOptions, formData.mappedCTDFolderId]);
  const ectdSectionDefault = React.useMemo(() => ectdSectionOptions.find(o => o.value === formData.ectdSectionId) ?? null, [ectdSectionOptions, formData.ectdSectionId]);
  const gmpModelDefault = React.useMemo(() => gmpModelOptions.find(o => o.value === (formData as any).mappedGMPModelId) ?? null, [gmpModelOptions, (formData as any).mappedGMPModelId]);
  const tmfFolderDefault = React.useMemo(() => tmfFolderOptions.find(o => o.value === (formData as any).mappedTMFFolderId) ?? null, [tmfFolderOptions, (formData as any).mappedTMFFolderId]);
  const moduleDefault = React.useMemo(() => ECTD_MODULES.find(m => m.value === selectedModule) ?? null, [selectedModule]);

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!editMode && !formData.selectedTemplateId) errors.push('Please select a template.');

    if (formData.mappingType === 'eCTD') {
      if (!selectedModule) errors.push('eCTD Module (1\u20135) is required.');
      if (!formData.mappedCTDFolderId) errors.push('CTD Folder is required for eCTD mapping.');
      if (!formData.ectdSectionId) errors.push('eCTD Section is required for eCTD mapping.');
    } else if (formData.mappingType === 'GMP') {
      if (!(formData as any).mappedGMPModelId) errors.push('GMP Model is required.');
    } else if (formData.mappingType === 'TMF') {
      if (!(formData as any).mappedTMFFolderId) errors.push('TMF Folder is required.');
    }

    if (errors.length > 0) {
      setValidationModal({ open: true, message: errors.join('\n') });
      return false;
    }
    return true;
  };

  const handleSave = () => {
    if (validateForm()) {
      handleUpload();
    }
  };

  return (
    <div className="boxCard" style={{ margin: 0, minHeight: 'auto' }}>
      <div className="formGroup">
        <div className="ms-Grid">
          {isUploading && <Loader />}

          <CustomModal
            isModalOpenProps={validationModal.open}
            setModalpopUpFalse={() => setValidationModal({ open: false, message: '' })}
            subject="Validation Error"
            message={validationModal.message}
            closeButtonText="OK"
          />

          <CustomModal
            isModalOpenProps={errorModal.open}
            setModalpopUpFalse={() => setErrorModal({ open: false, message: '' })}
            subject="Error"
            message={errorModal.message}
            closeButtonText="Close"
          />

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 dFlex justifyContentBetween alignItemsCenter">
              <h1 className="mainTitle" style={{ margin: 0 }}>{editMode ? 'Edit Template Mapping' : 'Add Template Mapping'}</h1>
              <PrimaryButton className="btn btn-danger" text="Close" onClick={closeAndReset} />
            </div>
          </div>

          <div className="ms-Grid-row" style={{ marginBottom: 12 }}>
            <div className="ms-Grid-col ms-sm12">
              <Breadcrumb items={[
                { label: 'Manage Templates', onClick: onCancel },
                { label: editMode ? 'Edit Template Mapping' : 'Add Template Mapping', isActive: true }
              ]} />
            </div>
          </div>

          <div className="ms-Grid-row mt-20">
            {!editMode && (
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">Select Template<span className="required">*</span></Label>
                <ReactDropdown
                  name="selectTemplate"
                  options={templateDropdownOptions}
                  defaultOption={templateDefault}
                  placeholder="-- Select Template --"
                  onChange={(opt) => {
                    const selectedId = Number(opt?.value) || 0;
                    const selectedTpl = templateOptions.find(t => t.id === selectedId);
                    setFormData((prev) => ({
                      ...prev,
                      selectedTemplateId: selectedId,
                      name: selectedTpl?.name || '',
                      version: selectedTpl?.version || '1.0'
                    }));
                  }}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
              </div>
            )}
            {editMode && (
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">Template Name</Label>
                <TextField
                  className="formControl"
                  value={formData.name}
                  disabled={true}
                />
              </div>
            )}
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

          <div className="ms-Grid-row mt-20">
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <Label className="formLabel">Mapping Type</Label>
              <ReactDropdown
                name="mappingType"
                options={mappingTypeOptions}
                defaultOption={mappingTypeOptions.find(o => o.value === formData.mappingType) ?? mappingTypeOptions[0]}
                onChange={(opt) => {
                  const nextValue = ((opt?.value as any) ?? 'None') as any;
                  setSelectedModule('');
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

            {formData.mappingType === 'eCTD' && (
              <>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                  <Label className="formLabel">eCTD Module<span className="required">*</span></Label>
                  <ReactDropdown
                    name="ectdModule"
                    options={ECTD_MODULES}
                    defaultOption={moduleDefault}
                    placeholder="-- Select Module --"
                    onChange={(opt) => {
                      setSelectedModule(opt?.value ? String(opt.value) : '');
                      setFormData((prev) => ({ ...prev, mappedCTDFolderId: 0, ectdSectionId: 0 }));
                    }}
                    isCloseMenuOnSelect={true}
                    isSorted={false}
                    isClearable={false}
                  />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                  <Label className="formLabel">CTD Folder<span className="required">*</span></Label>
                  <ReactDropdown
                    name="mappedCTDFolder"
                    options={ctdFolderOptions}
                    defaultOption={ctdFolderDefault}
                    placeholder={selectedModule ? '-- Select CTD Folder --' : '-- Select Module First --'}
                    onChange={(opt) => setFormData((prev) => ({ ...prev, mappedCTDFolderId: Number(opt?.value) || 0 }))}
                    isCloseMenuOnSelect={true}
                    isSorted={true}
                    isClearable={false}
                  />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                  <Label className="formLabel">eCTD Section<span className="required">*</span></Label>
                  <ReactDropdown
                    name="ectdSection"
                    options={ectdSectionOptions}
                    defaultOption={ectdSectionDefault}
                    placeholder={selectedModule ? '-- Select Section --' : '-- Select Module First --'}
                    onChange={(opt) => setFormData((prev) => ({ ...prev, ectdSectionId: Number(opt?.value) || 0 }))}
                    isCloseMenuOnSelect={true}
                    isSorted={true}
                    isClearable={false}
                  />
                </div>
              </>
            )}

            {formData.mappingType === 'GMP' && (
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">Mapped GMP Model<span className="required">*</span></Label>
                <ReactDropdown
                  name="mappedGMPModel"
                  options={gmpModelOptions}
                  defaultOption={gmpModelDefault}
                  placeholder="-- Select GMP Model --"
                  onChange={(opt) => setFormData((prev) => ({ ...prev, mappedGMPModelId: Number(opt?.value) || 0 }))}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
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
                  onChange={(opt) => setFormData((prev) => ({ ...prev, mappedTMFFolderId: Number(opt?.value) || 0 }))}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
              </div>
            )}
          </div>

          {formData.mappingType === 'eCTD' && (
            <div className="ms-Grid-row mt-20">
              <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                <Label className="formLabel">eCTD Subsection (Optional)</Label>
                <TextField
                  className="formControl"
                  value={formData.ectdSubsection}
                  onChange={(_e, v) => setFormData((prev) => ({ ...prev, ectdSubsection: v ?? '' }))}
                />
              </div>
            </div>
          )}

          <div className="ms-Grid-row mt-20">
            <div className="ms-Grid-col ms-sm12">
              <PrimaryButton
                onClick={handleSave}
                disabled={isUploading}
                className="btn btn-primary"
              >
                <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
                {isUploading ? 'Saving...' : editMode ? 'Update Mapping' : 'Save Mapping'}
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
