import * as React from 'react';
import { DefaultButton } from '@fluentui/react/lib/Button';
import { TextField } from '@fluentui/react/lib/TextField';
import { CustomModal } from '../../../../Common/CustomModal';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { AddDocumentModalData } from './AddDocumentModalData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const toOptions = (items: { id: any; name: string }[], emptyLabel: string, emptyValue: string = ''): IReactDropOptionProps[] => {
  const base: IReactDropOptionProps[] = [{ label: emptyLabel, value: emptyValue }];
  return base.concat(items.map(i => ({ label: i.name, value: i.id, data: i })));
};

export const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const {
    step,
    formData,
    setFormData,
    drugs,
    countries,
    filteredTemplates,
    approvers,
    errors,
    isSubmitting,
    canProceed,
    handleNext,
    handleBack,
    handleSubmit,
    handleCommentChange,
    addCommentField,
    removeCommentField,
    closeAndReset
  } = AddDocumentModalData({ onClose, onSuccess });

  const drugOptions = React.useMemo(() => toOptions(drugs, '-- Choose Drug --'), [drugs]);
  const countryOptions = React.useMemo(() => toOptions(countries, '-- Choose Country --'), [countries]);
  const templateOptions = React.useMemo(() => toOptions(filteredTemplates as any, '-- Choose Template --'), [filteredTemplates]);

  const approverOptions = React.useMemo(() => toOptions(approvers, '-- Choose Approver --'), [approvers]);

  const titleByStep: Record<number, string> = {
    1: 'Add New Document - Step 1 (Drug & Country)',
    2: 'Add New Document - Step 2 (Template)',
    3: 'Add New Document - Step 3 (Approver)'
  };

  const primaryText = step < 3 ? 'Next' : 'Create Document';

  return (
    <CustomModal
      isModalOpenProps={isOpen}
      setModalpopUpFalse={(open) => {
        if (!open) closeAndReset();
      }}
      subject={titleByStep[step] ?? 'Add New Document'}
      message={
        <div className="wizard-container">
          <div className="wizard-steps">
            <div className={`wizard-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <span className="step-number">1</span>
              <span className="step-label">Drug & Country</span>
            </div>
            <div className="wizard-line"></div>
            <div className={`wizard-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <span className="step-number">2</span>
              <span className="step-label">Template</span>
            </div>
            <div className="wizard-line"></div>
            <div className={`wizard-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <span className="step-number">3</span>
              <span className="step-label">Approver</span>
            </div>
          </div>

          <div className="wizard-content">
            {step === 1 && (
              <div className="ms-Grid">
                <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <div className="form-group">
                      <label className="form-label">Select Drug</label>
                      <ReactDropdown
                        name="drug"
                        options={drugOptions}
                        defaultOption={drugOptions.find(o => Number(o.value) === formData.drugId) ?? drugOptions[0]}
                        onChange={(opt) => {
                          console.log('Drug Selected:', opt);
                          setFormData(prev => ({ ...prev, drugId: Number(opt?.value) || 0 }));
                        }}
                        isCloseMenuOnSelect={true}
                        isSorted={true}
                        isClearable={false}
                      />
                      {(errors as any).drugId && <div className="field-error">{(errors as any).drugId}</div>}
                    </div>
                  </div>
                  <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                    <div className="form-group">
                      <label className="form-label">Select Country</label>
                      <ReactDropdown
                        name="country"
                        options={countryOptions}
                        defaultOption={countryOptions.find(o => Number(o.value) === formData.countryId) ?? countryOptions[0]}
                        onChange={(opt) => {
                          console.log('Country Selected:', opt);
                          setFormData(prev => ({ ...prev, countryId: Number(opt?.value) || 0, templateId: 0 }));
                        }}
                        isCloseMenuOnSelect={true}
                        isSorted={true}
                        isClearable={false}
                      />
                      {(errors as any).countryId && <div className="field-error">{(errors as any).countryId}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-group">
                <label className="form-label">Select Template</label>
                <ReactDropdown
                  name="template"
                  options={templateOptions}
                  defaultOption={templateOptions.find(o => Number(o.value) === formData.templateId) ?? templateOptions[0]}
                  onChange={(opt) => {
                    console.log('Template Selected:', opt);
                    setFormData(prev => ({ ...prev, templateId: Number(opt?.value) || 0 }));
                  }}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
                {errors.templateId && <div className="field-error">{errors.templateId}</div>}
                {filteredTemplates.length === 0 && (
                  <p style={{ color: '#999', fontSize: '13px', marginTop: '8px' }}>
                    No templates available for selected country
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="form-group">
                <label className="form-label">Select Approver</label>
                <ReactDropdown
                  name="approver"
                  options={approverOptions}
                  defaultOption={approverOptions.find(o => Number(o.value) === formData.approverId) ?? approverOptions[0]}
                  onChange={(opt) => {
                    console.log('Approver Selected:', opt);
                    setFormData(prev => ({ ...prev, approverId: Number(opt?.value) || 0 }));
                  }}
                  isCloseMenuOnSelect={true}
                  isSorted={true}
                  isClearable={false}
                />
                {errors.approverId && <div className="field-error">{errors.approverId}</div>}

                <div className="form-group" style={{ marginTop: 16 }}>
                  <label className="form-label">Comments</label>
                  {formData.comments.map((comment, index) => (
                    <div key={`comment-${index}`} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <TextField
                        value={comment}
                        onChange={(_e, v) => handleCommentChange(index, v ?? '')}
                        placeholder="Add comment..."
                        styles={{ root: { flexGrow: 1 } }}
                      />
                      {formData.comments.length > 1 && (
                        <DefaultButton onClick={() => removeCommentField(index)}>
                          <FontAwesomeIcon icon={faTrashCan} />
                        </DefaultButton>
                      )}
                    </div>
                  ))}
                  <DefaultButton onClick={addCommentField}>
                    <FontAwesomeIcon icon={faPlus} style={{ marginRight: 8 }} />
                    Add Comment
                  </DefaultButton>
                </div>
              </div>
            )}
          </div>
        </div>
      }
      closeButtonText="Cancel"
      thirdButtonText={step > 1 ? 'Back' : undefined}
      onClickThirdButton={step > 1 ? handleBack : undefined}
      yesButtonText={primaryText}
      onClickOfYes={step < 3 ? handleNext : handleSubmit}
      isYesButtonDisbale={!canProceed() || isSubmitting}
      onClose={closeAndReset}
    />
  );
};

