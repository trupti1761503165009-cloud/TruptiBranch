import usersData from '../mockData/users';
import categoriesData from '../mockData/categories';
import templatesData from '../mockData/templates';
import documentsData from '../mockData/documents';

import { IUser } from '../models/User';
import { ICategory } from '../models/Category';
import { ITemplate } from '../models/Template';
import { IDocument, IComment } from '../models/Document';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

class MockService {
  private users: IUser[];
  private categories: ICategory[];
  private templates: ITemplate[];
  private documents: IDocument[];

  constructor() {
    this.users = [...usersData];
    this.categories = [...categoriesData];
    this.templates = [...templatesData];
    this.documents = [...documentsData].map((d) => ({
      ...d,
      createdDate: new Date(d.createdDate),
      modifiedDate: new Date(d.modifiedDate),
      comments: d.comments.map((c: any) => ({
        ...c,
        timestamp: new Date(c.timestamp)
      }))
    }));
  }

  async getUsers(): Promise<IUser[]> {
    await delay(300);
    return [...this.users];
  }

  async getUserById(id: string): Promise<IUser | undefined> {
    await delay(200);
    return this.users.find((u) => u.id === id);
  }

  async createUser(user: IUser): Promise<IUser> {
    await delay(300);
    const newUser = { ...user, id: this.generateId() };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(user: IUser): Promise<IUser> {
    await delay(300);
    const index = this.users.findIndex((u) => u.id === user.id);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.users[index] = { ...user };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<void> {
    await delay(300);
    this.users = this.users.filter((u) => u.id !== id);
  }

  async getCategories(): Promise<ICategory[]> {
    await delay(300);
    return [...this.categories];
  }

  async getCategoryById(id: string): Promise<ICategory | undefined> {
    await delay(200);
    return this.categories.find((c) => c.id === id);
  }

  async createCategory(category: ICategory): Promise<ICategory> {
    await delay(300);
    const newCategory = { ...category, id: this.generateId() };
    this.categories.push(newCategory);
    return newCategory;
  }

  async updateCategory(category: ICategory): Promise<ICategory> {
    await delay(300);
    const index = this.categories.findIndex((c) => c.id === category.id);
    if (index === -1) {
      throw new Error('Category not found');
    }
    this.categories[index] = { ...category };
    return this.categories[index];
  }

  async deleteCategory(id: string): Promise<void> {
    await delay(300);
    this.categories = this.categories.filter((c) => c.id !== id);
  }

  async getTemplates(): Promise<ITemplate[]> {
    await delay(300);
    return [...this.templates];
  }

  async getTemplateById(id: string): Promise<ITemplate | undefined> {
    await delay(200);
    return this.templates.find((t) => t.id === id);
  }

  async createTemplate(template: ITemplate): Promise<ITemplate> {
    await delay(300);
    const newTemplate = { ...template, id: this.generateId() };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  async updateTemplate(template: ITemplate): Promise<ITemplate> {
    await delay(300);
    const index = this.templates.findIndex((t) => t.id === template.id);
    if (index === -1) {
      throw new Error('Template not found');
    }
    this.templates[index] = { ...template };
    return this.templates[index];
  }

  async deleteTemplate(id: string): Promise<void> {
    await delay(300);
    this.templates = this.templates.filter((t) => t.id !== id);
  }

  async getDocuments(): Promise<IDocument[]> {
    await delay(300);
    return [...this.documents];
  }

  async getDocumentById(id: string): Promise<IDocument | undefined> {
    await delay(200);
    return this.documents.find((d) => d.id === id);
  }

  async createDocument(document: IDocument): Promise<IDocument> {
    await delay(300);
    const newDoc = { ...document, id: this.generateId() };
    this.documents.push(newDoc);
    return newDoc;
  }

  async updateDocument(document: IDocument): Promise<IDocument> {
    await delay(300);
    const index = this.documents.findIndex((d) => d.id === document.id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    this.documents[index] = { ...document };
    return this.documents[index];
  }

  async deleteDocument(id: string): Promise<void> {
    await delay(300);
    this.documents = this.documents.filter((d) => d.id !== id);
  }

  async updateDocumentApproval(
    documentId: string,
    status: 'Approved' | 'Rejected',
    comments: string | null,
    approvalSignature: string | null
  ): Promise<IDocument> {
    await delay(300);
    const index = this.documents.findIndex((d) => d.id === documentId);
    if (index === -1) {
      throw new Error('Document not found');
    }
    const doc = this.documents[index];
    const newComments: IComment[] = [...doc.comments];
    if (comments && comments.trim()) {
      newComments.push({
        userId: 'approver', // For demo, fixed user id
        text: comments.trim(),
        timestamp: new Date()
      });
    }
    const updatedDoc: IDocument = {
      ...doc,
      status,
      approvalSignature,
      comments: newComments,
      modifiedDate: new Date()
    };
    this.documents[index] = updatedDoc;
    return updatedDoc;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}

export default new MockService();
