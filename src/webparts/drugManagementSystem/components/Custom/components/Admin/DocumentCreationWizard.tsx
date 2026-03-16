// /* eslint-disable @typescript-eslint/no-use-before-define */
// /* eslint-disable no-case-declarations */

// import * as React from 'react';
// import { useEffect, useState } from 'react';
// import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
// import { TextField } from '@fluentui/react/lib/TextField';
// import ReactDropdown, { type IReactDropOptionProps } from '../../../Common/ReactSelectDropdown';
// import { mockService } from '../../services/MockService';
// import { Category, Template, User } from '../../types';
// import { ctdModules } from '../../data/ctdModules';
// import { drugsDatabase, Drug } from '../../data/drugsDatabase';
// import { documentNames } from '../../data/documentNames';
// import { countries } from '../../data/mockData';
// import { RequiredLabel } from '../../../Common/RequiredLabel';
// import { RequiredFieldsDialog } from '../../../Common/Dialogs/RequiredFieldsDialog';
// import './DocumentCreationWizard.css';

// interface DocumentCreationWizardProps {
//   onClose: () => void;
//   onComplete: () => void;
// }

// export const DocumentCreationWizard: React.FC<DocumentCreationWizardProps> = ({ onClose, onComplete }) => {
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [templates, setTemplates] = useState<Template[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [formData, setFormData] = useState<{
//     ctdStructure: 'ectd' | 'dossier';
//     drug: string;
//     category: string;
//     template: string;
//     ctdModule: string;
//     submodule: string;
//     documentName: string;
//     approver: string;
//     notes: string;
//     country: string;
//   }>({
//     ctdStructure: 'ectd',
//     drug: '',
//     category: '',
//     template: '',
//     ctdModule: '',
//     submodule: '',
//     documentName: '',
//     approver: '',
//     notes: '',
//     country: ''
//   });

//   const [drugs] = useState<Drug[]>(drugsDatabase);
//   const [requiredDialogHidden, setRequiredDialogHidden] = useState(true);
//   const [requiredFields, setRequiredFields] = useState<string[]>([]);

//   useEffect(() => {
//     void (async function (): Promise<void> {
//       await loadData();
//     })();
//   }, []);

//   useEffect(() => {
//     const docs = getFilteredDocumentNames(
//       formData.template
//     ).filter(doc =>
//       doc.name.toLowerCase().includes(formData.documentName.toLowerCase())
//     );

//     if (docs.length === 1) {
//       setFormData(prev => ({
//         ...prev,
//         documentName: docs[0].name
//       }));
//     }
//   }, [
//     formData.documentName,
//     formData.template
//   ]);

//   // NOTE:
//   // Users should not be forced to manually select CTD Module/Submodule during document creation.
//   // CTD placement (if applicable) should be derived from the selected Template/mapping, otherwise left blank.

//   const loadData = async () => {
//     const [cats, temps, usrs] = await Promise.all([
//       mockService.getCategories(),
//       mockService.getTemplates(),
//       mockService.getUsers()
//     ]);
//     setCategories(cats);
//     setTemplates(temps);
//     setUsers(usrs);
//   };

//   const getFilteredDocumentNames = (template: string) => {
//     return documentNames.filter(doc => {
//       const matchTemplate = template ? (doc.template === template || doc.template === undefined) : true;
//       return matchTemplate;
//     });
//   };

//   const handleDrugChange = (drugId: string) => {
//     const selectedDrugData = drugs.find(d => d.id === drugId);
//     if (selectedDrugData) {
//       setFormData({
//         ...formData,
//         drug: drugId,
//         ctdStructure: selectedDrugData.ctdStructure
//       });
//     } else {
//       setFormData({ ...formData, drug: drugId, ctdModule: '', submodule: '', ctdStructure: 'ectd' });
//     }
//   };

//   const handleTemplateSelect = (templateName: string) => {
//     const relatedDocs = documentNames.filter(d => d.template === templateName);
//     const selectedDoc = relatedDocs.find(d => d.name === formData.documentName);

//     setFormData(prev => ({
//       ...prev,
//       template: templateName,
//       // Auto-bind CTD placement from Template mapping when known (optional).
//       ctdModule: selectedDoc?.module || prev.ctdModule || '',
//       submodule: selectedDoc?.submodule || prev.submodule || ''
//     }));
//   };

//   const handleSubmit = async () => {
//     const missing: string[] = [];
//     if (!formData.drug) missing.push('Select Drug');
//     if (!formData.country) missing.push('Country');
//     if (!formData.category) missing.push('Category');
//     if (!formData.documentName) missing.push('Document Name');
//     if (!formData.approver) missing.push('Approver');
//     if (missing.length > 0) {
//       setRequiredFields(missing);
//       setRequiredDialogHidden(false);
//       return;
//     }
//     const newDocument = {
//       name: formData.documentName,
//       category: formData.category,
//       status: 'Draft' as const,
//       lastModified: new Date().toISOString().split('T')[0],
//       author: 'Sarah Johnson',
//       createdBy: 'Sarah Johnson',
//       approver: formData.approver,
//       ctdModule: formData.ctdModule,
//       submodule: formData.submodule,
//       ctdStructure: formData.ctdStructure,
//       drug: formData.drug,
//       template: formData.template || 'None',
//       content: '',
//       version: 1,
//       createdDate: new Date().toISOString().split('T')[0],
//       comments: []
//     };

//     await mockService.addDocument(newDocument);
//     onComplete();
//     onClose();
//   };

//   const filteredTemplates = templates;
//   const selectedDrugData = drugs.find(d => d.id === formData.drug);

//   const drugOptions: IReactDropOptionProps[] = drugs.map((drug) => ({
//     value: drug.id,
//     label: `${drug.name} - ${drug.category}`
//   }));
//   const countryOptions: IReactDropOptionProps[] = countries.map((country) => ({
//     value: country.name,
//     label: country.name
//   }));
//   const templateOptions: IReactDropOptionProps[] = filteredTemplates.map((template) => ({
//     value: template.name,
//     label: template.name
//   }));
//   const categoryOptions: IReactDropOptionProps[] = categories.map((c) => ({
//     value: c.name,
//     label: c.name
//   }));
//   const approverOptions: IReactDropOptionProps[] = users
//     .filter((u) => u.role === 'Approver')
//     .map((user) => ({
//       value: user.name,
//       label: user.name
//     }));
//   const documentNameOptions: IReactDropOptionProps[] = documentNames
//     .filter((d) => (formData.template ? d.template === formData.template || !d.template : true))
//     .filter((d) => {
//       if (formData.ctdStructure === 'ectd') return d.source === 'eCTD' || d.source === 'DIA' || d.source === 'GMP' || d.source === 'TMF';
//       return d.source === 'Dossier' || d.source === 'DIA' || d.source === 'GMP' || d.source === 'TMF';
//     })
//     .map((d) => ({ value: d.name, label: d.name }));

//   return (
//     <div className="wizard-fullpage">
//       <RequiredFieldsDialog
//         hidden={requiredDialogHidden}
//         onDismiss={() => setRequiredDialogHidden(true)}
//         fields={requiredFields}
//       />
//       <div className="wizard-container-fullpage">
//         <div className="wizard-header">
//           <h2 className="wizard-title">Create New Document</h2>
//           <DefaultButton className="wizard-close" onClick={onClose} text="✕ Close" />
//         </div>

//         <div className="wizard-body">
//           <div className="ms-Grid">
//             <div className="ms-Grid-row">
//               <div className="ms-Grid-col ms-sm12 ms-lg3" style={{ borderRight: '1px solid #edebe9', padding: 0 }}>
//                 <div style={{ position: 'sticky', top: 0 }}>
//                   {/* CTD Folder Tree */}
//                   {/* <CTDFolderSidebar
//                     onFolderSelect={undefined as any}
//                     selectedModuleId={formData.ctdModule}
//                     selectedSubmoduleId={formData.submodule}
//                     ctdStructure={formData.ctdStructure}
//                     onStructureChange={undefined as any}
//                     isStructureDisabled={formData.drug !== ''}
//                   /> */}
//                 </div>
//               </div>

//               <div className="ms-Grid-col ms-sm12 ms-lg12" style={{ padding: '24px' }}>
//                 <div className="direct-selection-form">
//                   <div className="form-section">
//                     <h3 className="section-title">Basic Information</h3>
//                     <div className="ms-Grid-row">
//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Select Drug" />
//                           <ReactDropdown
//                             name="drug"
//                             options={drugOptions}
//                             defaultOption={drugOptions.find(o => o.value === formData.drug) || null}
//                             onChange={(opt) => handleDrugChange(String(opt?.value ?? ''))}
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                           />
//                           {selectedDrugData && (
//                             <div className="selected-info">
//                               <strong>Selected Drug:</strong> {selectedDrugData.name}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Country" />
//                           <ReactDropdown
//                             name="country"
//                             options={countryOptions}
//                             defaultOption={countryOptions.find(o => o.value === formData.country) || null}
//                             onChange={(opt) =>
//                               setFormData({ ...formData, country: String(opt?.value ?? '') })
//                             }
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="ms-Grid-row">
//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Category" />
//                           <ReactDropdown
//                             name="category"
//                             options={categoryOptions}
//                             defaultOption={categoryOptions.find(o => o.value === formData.category) || null}
//                             onChange={(opt) =>
//                               setFormData({ ...formData, category: String(opt?.value ?? '') })
//                             }
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                           />
//                         </div>
//                       </div>
//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Document Name" />
//                           <ReactDropdown
//                             name="documentName"
//                             options={documentNameOptions}
//                             defaultOption={documentNameOptions.find(o => o.value === formData.documentName) || null}
//                             onChange={(opt) =>
//                               setFormData({ ...formData, documentName: String(opt?.value ?? '') })
//                             }
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="form-section">
//                     <div className="ms-Grid-row">
//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Document Template" required={false} />
//                           <ReactDropdown
//                             name="template"
//                             options={templateOptions}
//                             defaultOption={templateOptions.find(o => o.value === formData.template) || null}
//                             onChange={(opt) => handleTemplateSelect(String(opt?.value ?? ''))}
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                             isDisabled={!selectedDrugData}
//                           />
//                         </div>
//                       </div>

//                       <div className="ms-Grid-col ms-sm12 ms-lg6">
//                         <div className="form-group">
//                           <RequiredLabel text="Approver" />
//                           <ReactDropdown
//                             name="approver"
//                             options={approverOptions}
//                             defaultOption={approverOptions.find(o => o.value === formData.approver) || null}
//                             onChange={(opt) =>
//                               setFormData({ ...formData, approver: String(opt?.value ?? '') })
//                             }
//                             isCloseMenuOnSelect={true}
//                             isSorted={true}
//                             isClearable={false}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="form-section">
//                     <div className="form-group" style={{ marginTop: '20px' }}>
//                       <RequiredLabel text="Notes" required={false} />
//                       <TextField
//                         className="form-textarea"
//                         multiline
//                         rows={3}
//                         placeholder="Add any special instructions or notes..."
//                         value={formData.notes}
//                         onChange={(_e, v) => setFormData({ ...formData, notes: v ?? '' })}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="wizard-footer">
//           <div className="wizard-info">
//             {formData.template && formData.ctdModule && (
//               <span style={{ color: '#4caf50', fontWeight: 600 }}>
//                 ✅ Auto-bound from Template: Module {ctdModules.find(m => m.id === formData.ctdModule)?.number}
//               </span>
//             )}
//           </div>
//           <div style={{ display: 'flex', gap: '12px' }}>
//             <DefaultButton className="btn btn-secondary" onClick={onClose}>
//               Cancel
//             </DefaultButton>
//             <PrimaryButton
//               className="btn btn-primary"
//               onClick={handleSubmit}
//               styles={{
//                 root: { background: '#1E88E5', borderColor: '#1E88E5' },
//                 rootHovered: { background: '#1565C0', borderColor: '#1565C0' },
//                 rootPressed: { background: '#0D47A1', borderColor: '#0D47A1' }
//               }}
//               disabled={
//                 !formData.drug ||
//                 !formData.country ||
//                 !formData.category ||
//                 !formData.documentName ||
//                 !formData.approver
//               }
//             >
//               Create Document
//             </PrimaryButton>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
