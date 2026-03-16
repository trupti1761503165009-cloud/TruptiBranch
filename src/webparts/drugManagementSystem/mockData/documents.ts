import { IDocument } from '../models/Document';

const documentsData: IDocument[] = [
  {
    id: 'doc1',
    templateId: 'tmpl1',
    authorId: 'user2',
    metadata: {
      'Patient Name': 'John Doe',
      'Dosage (mg)': '500',
      'Start Date': '2023-05-01',
      'End Date': '2023-05-10'
    },
    status: 'Submitted',
    comments: [
      {
        userId: 'user3',
        text: 'Dosage looks appropriate.',
        timestamp: new Date('2023-05-02T10:00:00Z')
      }
    ],
    approvalSignature: null,
    createdDate: new Date('2023-05-01T09:30:00Z'),
    modifiedDate: new Date('2023-05-02T10:00:00Z')
  },
  {
    id: 'doc2',
    templateId: 'tmpl2',
    authorId: 'user2',
    metadata: {
      'Patient Name': 'Jane Smith',
      'Pain Level': '7',
      'Medication Used': 'Ibuprofen'
    },
    status: 'Reviewed',
    comments: [],
    approvalSignature: null,
    createdDate: new Date('2023-04-28T14:15:00Z'),
    modifiedDate: new Date('2023-04-30T12:00:00Z')
  }
];

export default documentsData;
