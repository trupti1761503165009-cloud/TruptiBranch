export interface ITemplateMetadataField {
  fieldName: string;
  fieldType: string; // e.g. 'text', 'number', 'date', 'boolean'
  required: boolean;
}

export interface ITemplate {
  id: string;
  name: string;
  categoryId: string | any;
  metadataFields: ITemplateMetadataField[];
}
