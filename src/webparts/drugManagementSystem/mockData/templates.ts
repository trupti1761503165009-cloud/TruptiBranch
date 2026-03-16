import { ITemplate } from '../models/Template';

const templatesData: ITemplate[] = [
  {
    id: 'tmpl1',
    name: 'Antibiotic Prescription',
    categoryId: 'cat1',
    metadataFields: [
      { fieldName: 'Patient Name', fieldType: 'text', required: true },
      { fieldName: 'Dosage (mg)', fieldType: 'number', required: true },
      { fieldName: 'Start Date', fieldType: 'date', required: true },
      { fieldName: 'End Date', fieldType: 'date', required: false }
    ]
  },
  {
    id: 'tmpl2',
    name: 'Pain Relief Report',
    categoryId: 'cat2',
    metadataFields: [
      { fieldName: 'Patient Name', fieldType: 'text', required: true },
      { fieldName: 'Pain Level', fieldType: 'number', required: true },
      { fieldName: 'Medication Used', fieldType: 'text', required: false }
    ]
  }
];

export default templatesData;
