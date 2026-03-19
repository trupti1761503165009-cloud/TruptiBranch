import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSave, faTrashCan, faFileMedical, faUserCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { AddDocumentModalData } from '../AddDocumentModal/AddDocumentModalData';
import { Loader } from '../../../../Common/Loader/Loader';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import '../../../styles/form-validation.css';

interface CreateDocumentPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const toOptions = (
  items: { id: any; name: string }[],
  emptyLabel: string
): IReactDropOptionProps[] =>
  [{ label: emptyLabel, value: '' }].concat(
    items.map((i) => ({ label: i.name, value: i.id, data: i }))
  );

const toTemplateOptions = (
  items: { id: any; name: string; status?: string }[],
  emptyLabel: string
): IReactDropOptionProps[] =>
  [{ label: emptyLabel, value: '' }].concat(
    items.map((i) => {
      const badge = i.status === 'Active' || !i.status ? ' (Active)' : ' (Inactive)';
      return { label: `${i.name}${badge}`, value: i.id, data: i };
    })
  );

export const CreateDocumentPage: React.FC<CreateDocumentPageProps> = ({ onCancel, onSuccess }) => {
  const {
    formData,
    setFormData,
    drugs,
    countries,
    filteredTemplates,
    selectedTemplate,
    approvers,
    errors,
    isSubmitting,
    handleSubmit,
    handleCommentChange,
    addCommentField,
    removeCommentField,
    closeAndReset
  } = AddDocumentModalData({ onClose: onCancel, onSuccess });

  const drugOptions     = React.useMemo(() => toOptions(drugs, '-- Select Drug --'), [drugs]);
  const countryOptions  = React.useMemo(() => toOptions(countries, '-- Select Country --'), [countries]);
  const templateOptions = React.useMemo(
    () => toTemplateOptions(filteredTemplates as any, '-- Select Template --'),
    [filteredTemplates]
  );
  const approverOptions = React.useMemo(() => toOptions(approvers, '-- Select Approver --'), [approvers]);

  const isFormComplete  = Boolean(formData.drugId && formData.countryId && formData.templateId && formData.approverId);

  const derivedDocName = selectedTemplate?.artifactName || selectedTemplate?.name || '';
  const derivedCtdPlacement =
    formData.submoduleId || formData.moduleId
      ? `CTD: ${formData.submoduleId || formData.moduleId}`
      : selectedTemplate?.mappedFolderId
        ? `CTD: ${selectedTemplate.mappedFolderId}`
        : 'Not mapped to eCTD (metadata only)';

  return (
    <div className="pageContainer" data-testid="create-document-page">
      {isSubmitting && <Loader />}

      <div className="boxCard">
        <div className="ms-Grid">
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12 dFlex justifyContentBetween alignItemsCenter">
              <h1 className="mainTitle">Create New Document</h1>
              <DefaultButton onClick={closeAndReset} styles={{ root: { borderColor: '#d13438', color: '#d13438' } }}>
                Cancel
              </DefaultButton>
            </div>
          </div>

          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12">
              <div className="customebreadcrumb">
                <Breadcrumb
                  items={[
                    { label: 'Home', onClick: () => {} },
                    { label: 'Manage Documents', onClick: onCancel },
                    { label: 'Create New Document', isActive: true }
                  ]}
                />
              </div>
            </div>
          </div>
        </div>

      <div className="ms-Grid" style={{ padding: 0, marginTop: 16 }}>
      {/* ── SECTION 1: Document Details ─────────────────────── */}
      <div className="white-card-section" style={{ marginBottom: 16 }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <FontAwesomeIcon icon={faFileMedical} style={{ color: 'var(--primry)', fontSize: 16 }} />
          <span className="section-title" style={{ fontSize: 15, fontWeight: 600, color: 'var(--primry)' }}>
            Document Details
          </span>
        </div>

        <div className="ms-Grid-row">
          {/* Drug */}
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
            <div className="formControl" style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Drug <span style={{ color: '#d13438' }}>*</span>
              </label>
              <ReactDropdown
                name="drug"
                options={drugOptions}
                defaultOption={drugOptions.find(o => String(o.value) === String(formData.drugId) && o.value !== '') ?? null}
                onChange={(opt) => {
                  setFormData(prev => ({
                    ...prev,
                    drugId: Number(opt?.value) || 0,
                    countryId: 0,
                    templateId: 0,
                    approverId: 0
                  }));
                }}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={true}
              />
              {errors.drugId && <div className="field-error">{errors.drugId}</div>}
            </div>
          </div>

          {/* Country */}
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
            <div className="formControl" style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Country <span style={{ color: '#d13438' }}>*</span>
              </label>
              <ReactDropdown
                name="country"
                options={countryOptions}
                defaultOption={countryOptions.find(o => String(o.value) === String(formData.countryId) && o.value !== '') ?? null}
                onChange={(opt) => {
                  setFormData(prev => ({
                    ...prev,
                    countryId: Number(opt?.value) || 0,
                    templateId: 0,
                    approverId: 0
                  }));
                }}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={true}
                isDisabled={!formData.drugId}
              />
              {!formData.drugId && (
                <div className="cascading-dropdown-hint">
                  Select Drug first
                </div>
              )}
              {errors.countryId && <div className="field-error">{errors.countryId}</div>}
            </div>
          </div>
        </div>

        <div className="ms-Grid-row">
          {/* Template */}
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
            <div className="formControl" style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Template <span style={{ color: '#d13438' }}>*</span>
              </label>
              <ReactDropdown
                name="template"
                options={templateOptions}
                defaultOption={templateOptions.find(o => String(o.value) === String(formData.templateId) && o.value !== '') ?? null}
                onChange={(opt) => {
                  setFormData(prev => ({ ...prev, templateId: Number(opt?.value) || 0 }));
                }}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={true}
                isDisabled={!formData.countryId}
              />
              {!formData.countryId && (
                <div className="cascading-dropdown-hint">
                  Select Country first
                </div>
              )}
              {errors.templateId && <div className="field-error">{errors.templateId}</div>}
              {filteredTemplates.length === 0 && formData.countryId ? (
                <div style={{ fontSize: 12, color: '#e67e22', marginTop: 4 }}>
                  No active templates found for selected country
                </div>
              ) : null}
            </div>
          </div>

          {/* Approver (HR group only) */}
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
            <div className="formControl" style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 6 }}>
                Approver <span style={{ color: '#d13438' }}>*</span>
              </label>
              <ReactDropdown
                name="approver"
                options={approverOptions}
                defaultOption={approverOptions.find(o => String(o.value) === String(formData.approverId) && o.value !== '') ?? null}
                onChange={(opt) => {
                  setFormData(prev => ({ ...prev, approverId: Number(opt?.value) || 0 }));
                }}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={true}
              />
              {errors.approverId && <div className="field-error">{errors.approverId}</div>}
            </div>
          </div>
        </div>

        {/* Template Summary Card (shown when template is selected) */}
        {selectedTemplate && (
          <div className="ms-Grid-row">
            <div className="ms-Grid-col ms-sm12">
              <div style={{
                background: '#F0F9F0',
                border: '1px solid #C8E6C9',
                borderRadius: 6,
                padding: '12px 16px',
                marginTop: 4
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                  {derivedDocName && (
                    <div>
                      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Document Name
                      </div>
                      <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600, marginTop: 2 }}>
                        {derivedDocName}
                      </div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      CTD / eCTD Placement
                    </div>
                    <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600, marginTop: 2 }}>
                      {derivedCtdPlacement}
                    </div>
                  </div>
                  {selectedTemplate.categoryName && (
                    <div>
                      <div style={{ fontSize: 11, color: '#555', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Category
                      </div>
                      <div style={{ fontSize: 13, color: '#2E7D32', fontWeight: 600, marginTop: 2 }}>
                        {selectedTemplate.categoryName}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Workflow Info ─────────────────────────── */}
      <div className="white-card-section" style={{ marginBottom: 16 }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FontAwesomeIcon icon={faCircleInfo} style={{ color: 'var(--primry)', fontSize: 16 }} />
          <span className="section-title" style={{ fontSize: 15, fontWeight: 600, color: 'var(--primry)' }}>
            Workflow Status Flow
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, alignItems: 'center' }}>
          {[
            { label: 'Draft', color: '#757575', bg: '#F5F5F5', desc: 'You (Author)' },
            { label: 'Pending Approval', color: '#1565C0', bg: '#E3F2FD', desc: 'Approver reviews' },
            { label: 'Approved', color: '#2E7D32', bg: '#E8F5E9', desc: 'You initiate sign' },
            { label: 'Pending for Signature', color: '#6A1B9A', bg: '#F3E5F5', desc: 'Adobe Sign sent' },
            { label: 'Signed / Final', color: '#E65100', bg: '#FFF3E0', desc: 'Complete' }
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <div style={{ textAlign: 'center', padding: '6px 10px' }}>
                <div style={{
                  display: 'inline-block',
                  background: s.bg,
                  color: s.color,
                  border: `1px solid ${s.color}`,
                  borderRadius: 12,
                  padding: '2px 10px',
                  fontSize: 11,
                  fontWeight: 600
                }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 10, color: '#888', marginTop: 3 }}>{s.desc}</div>
              </div>
              {i < 4 && (
                <div style={{ color: '#BDBDBD', fontSize: 16, padding: '0 2px', marginBottom: 12 }}>→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{ fontSize: 12, color: '#757575', marginTop: 8, borderTop: '1px solid #EEE', paddingTop: 8 }}>
          <strong>Note:</strong> Once submitted, the assigned Approver will see this document in their "Assigned to Me" tab.
          If rejected, the document returns to you for edits and resubmission.
        </div>
      </div>

      {/* ── SECTION 3: Comments ─────────────────────────────── */}
      <div className="white-card-section" style={{ marginBottom: 16 }}>
        <div className="section-title-row" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <FontAwesomeIcon icon={faUserCheck} style={{ color: 'var(--primry)', fontSize: 16 }} />
          <span className="section-title" style={{ fontSize: 15, fontWeight: 600, color: 'var(--primry)' }}>
            Initial Comments <span style={{ fontWeight: 400, fontSize: 13, color: '#999' }}>(Optional)</span>
          </span>
        </div>
        {formData.comments.map((comment: string, index: number) => (
          <div key={`comment-${index}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <TextField
              value={comment}
              onChange={(_e, v) => handleCommentChange(index, v ?? '')}
              placeholder={`Comment ${index + 1}...`}
              styles={{ root: { flexGrow: 1 } }}
            />
            {formData.comments.length > 1 && (
              <DefaultButton onClick={() => removeCommentField(index)} title="Remove comment"
                styles={{ root: { minWidth: 36, padding: 0 } }}>
                <FontAwesomeIcon icon={faTrashCan} style={{ color: '#d32f2f' }} />
              </DefaultButton>
            )}
          </div>
        ))}
        <DefaultButton onClick={addCommentField} style={{ marginTop: 4 }}>
          <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8, color: 'var(--primry)' }} />
          Add Comment
        </DefaultButton>
      </div>

      {/* ── ACTION BUTTONS ───────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: 12,
        justifyContent: 'flex-end',
        paddingTop: 16,
        borderTop: '1px solid #E0E0E0',
        marginTop: 4
      }}>
        <DefaultButton onClick={closeAndReset} disabled={isSubmitting} text="Cancel" />
        <PrimaryButton
          onClick={handleSubmit}
          disabled={!isFormComplete || isSubmitting}
          styles={{ root: { minWidth: 140, background: 'var(--primry)', border: 'none' } }}
        >
          <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
          {isSubmitting ? 'Creating...' : 'Create Document'}
        </PrimaryButton>
      </div>
      </div>
      </div>
    </div>
  );
};
