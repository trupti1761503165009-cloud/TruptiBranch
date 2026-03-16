import * as React from 'react';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPlus, faSave, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { AddDocumentModalData } from '../AddDocumentModal/AddDocumentModalData';
import { Loader } from '../../../../Common/Loader/Loader';
import '../../../styles/form-validation.css';

interface CreateDocumentPageProps {
  onCancel: () => void;
  onSuccess: () => void;
}

const toOptions = (
  items: { id: any; name: string }[],
  emptyLabel: string,
  emptyValue: string = ''
): IReactDropOptionProps[] => {
  const base: IReactDropOptionProps[] = [{ label: emptyLabel, value: emptyValue }];
  return base.concat(items.map((i) => ({ label: i.name, value: i.id, data: i })));
};

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

  const drugOptions = React.useMemo(() => toOptions(drugs, '-- Select Drug --'), [drugs]);
  const countryOptions = React.useMemo(() => toOptions(countries, '-- Select Country --'), [countries]);
  const templateOptions = React.useMemo(() => toOptions(filteredTemplates as any, '-- Select Template --'), [filteredTemplates]);
  const approverOptions = React.useMemo(() => toOptions(approvers, '-- Select Approver --'), [approvers]);

  const isFormComplete = Boolean(formData.drugId && formData.countryId && formData.templateId && formData.approverId);
  const derivedDocName = selectedTemplate?.artifactName || selectedTemplate?.name || '';
  const derivedCtdPlacement =
    formData.submoduleId || formData.moduleId
      ? `CTD Folder: ${formData.submoduleId || formData.moduleId}`
      : selectedTemplate?.mappedFolderId
        ? `CTD Folder: ${selectedTemplate.mappedFolderId}`
        : 'Not mapped to eCTD (metadata only)';

  return (
    <div className="ms-Grid">
      {isSubmitting && <Loader />}

      {/* Section Header */}
      <div className="ms-Grid-row">
        <div className="ms-Grid-col ms-sm12">
          <div className="form-section-header">Document Selection</div>
        </div>
      </div>

      {/* Drug and Country Row */}
      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Drug</label>
            <ReactDropdown
              name="drug"
              options={drugOptions}
              defaultOption={drugOptions.find((o: IReactDropOptionProps) => o.value === formData.drugId) || null}
              onChange={(opt) => {
                setFormData({
                  ...formData,
                  drugId: Number(opt?.value) || 0,
                  countryId: 0,
                  templateId: 0,
                  approverId: 0
                });
              }}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {errors.drugId && <div className="field-error">{errors.drugId}</div>}
            {!formData.drugId && (
              <div className="cascading-dropdown-hint">Select a drug to continue</div>
            )}
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Country</label>
            <ReactDropdown
              name="country"
              options={countryOptions}
              defaultOption={countryOptions.find((o: IReactDropOptionProps) => o.value === formData.countryId) || null}
              onChange={(opt) => {
                setFormData({
                  ...formData,
                  countryId: Number(opt?.value) || 0,
                  templateId: 0,
                  approverId: 0
                });
              }}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
              isDisabled={!formData.drugId}
            />
            {!formData.drugId && (
              <div className="cascading-dropdown-hint">Select Drug first</div>
            )}
            {errors.countryId && <div className="field-error">{errors.countryId}</div>}
          </div>
        </div>
      </div>

      {/* Template and Approver Row */}
      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Template</label>
            <ReactDropdown
              name="template"
              options={templateOptions}
              defaultOption={templateOptions.find((o: IReactDropOptionProps) => o.value === formData.templateId) || null}
              onChange={(opt) => {
                setFormData({
                  ...formData,
                  templateId: Number(opt?.value) || 0
                });
              }}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
              isDisabled={!formData.countryId}
            />
            {!formData.countryId && (
              <div className="cascading-dropdown-hint">Select Country first</div>
            )}
            {errors.templateId && <div className="field-error">{errors.templateId}</div>}
            {selectedTemplate && (
              <div style={{ marginTop: 6, fontSize: 12, color: '#43A047', fontWeight: 500 }}>
                ✓ Document Name: {derivedDocName}
              </div>
            )}
          </div>
        </div>

        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
          <div className="form-field">
            <label className="form-label required">Approver</label>
            <ReactDropdown
              name="approver"
              options={approverOptions}
              defaultOption={approverOptions.find((o: IReactDropOptionProps) => o.value === formData.approverId) || null}
              onChange={(opt) => {
                setFormData({
                  ...formData,
                  approverId: Number(opt?.value) || 0
                });
              }}
              isCloseMenuOnSelect={true}
              isSorted={true}
              isClearable={false}
            />
            {errors.approverId && <div className="field-error">{errors.approverId}</div>}
          </div>
        </div>
      </div>

      {/* CTD Placement Display - Full Width */}
      {selectedTemplate && (
        <div className="ms-Grid-row mt-10">
          <div className="ms-Grid-col ms-sm12">
            <div className="ctd-metadata">
              <div className="ctd-metadata-label">CTD/eCTD Placement</div>
              <div className="ctd-metadata-value">{derivedCtdPlacement}</div>
            </div>
          </div>
        </div>
      )}

      {/* Section Header */}
      <div className="ms-Grid-row mt-20">
        <div className="ms-Grid-col ms-sm12">
          <div className="form-section-header">Additional Information</div>
        </div>
      </div>

      {/* Comments Section - Full Width */}
      <div className="ms-Grid-row mt-10">
        <div className="ms-Grid-col ms-sm12">
          <div className="form-field">
            <label className="form-label">Comments (Optional)</label>
            {formData.comments.map((comment: string, index: number) => (
              <div key={`comment-${index}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <TextField
                  value={comment}
                  onChange={(_e, v) => handleCommentChange(index, v ?? '')}
                  placeholder="Add comment..."
                  styles={{ root: { flexGrow: 1 } }}
                />
                {formData.comments.length > 1 && (
                  <DefaultButton onClick={() => removeCommentField(index)} title="Remove comment">
                    <FontAwesomeIcon icon={faTrashCan} />
                  </DefaultButton>
                )}
              </div>
            ))}
            <DefaultButton onClick={addCommentField} style={{ marginTop: 8 }}>
              <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
              Add Comment
            </DefaultButton>
          </div>
        </div>
      </div>

      {/* Action Buttons - Full Width */}
      <div className="ms-Grid-row mt-20">
        <div className="ms-Grid-col ms-sm12" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 24, borderTop: '1px solid #E0E0E0' }}>
          <DefaultButton onClick={closeAndReset} disabled={isSubmitting}>
            Cancel
          </DefaultButton>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={!isFormComplete || isSubmitting}
            styles={{
              root: { minWidth: 120 }
            }}
          >
            <FontAwesomeIcon icon={faSave} style={{ marginRight: 8 }} />
            {isSubmitting ? 'Creating...' : 'Create Document'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
