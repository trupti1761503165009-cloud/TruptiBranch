// // PnPJS Service Layer - Replace mock data with real SharePoint integration
// // This file provides a template for connecting to real SharePoint lists

// import { sp, IItemAddResult } from "@pnp/sp";
// import {
//   Document,
//   Template,
//   Category,
//   Drug,
//   WorkflowTask,
//   AuditLog,
//   UserRole,
// } from "./mockData";

// /**
//  * Initialize PnPJS with SPFx context
//  * Call this in your webpart's onInit method
//  */
// export async function initializePnP(context: any): Promise<void> {
//   try {
//     sp.setup({
//       spfxContext: context,
//     });
//     console.log("PnPJS initialized successfully");
//   } catch (error) {
//     console.error("Error initializing PnPJS:", error);
//   }
// }

// // ==================== DOCUMENT OPERATIONS ====================

// /**
//  * Get all documents from DocumentLibrary
//  */
// export async function getDocuments(): Promise<Document[]> {
//   try {
//     const items = await sp.web.lists.getByTitle("DocumentLibrary").items();
//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       title: item.Title,
//       category: item.Category,
//       module: item.Module,
//       subModule: item.Submodule || "",
//       drug: item.Drug,
//       status: item.Status,
//       author: item.Author?.Title || item.Author,
//       createdDate: new Date(item.Created),
//       lastModified: new Date(item.Modified),
//       version: item.Version || "1.0",
//       reviewers: item.Reviewers ? item.Reviewers.map((r: any) => r.Title) : [],
//       approvers: item.Approvers ? item.Approvers.map((a: any) => a.Title) : [],
//     }));
//   } catch (error) {
//     console.error("Error fetching documents:", error);
//     throw error;
//   }
// }

// /**
//  * Get document by ID
//  */
// export async function getDocumentById(id: string): Promise<Document | null> {
//   try {
//     const item = await sp.web.lists
//       .getByTitle("DocumentLibrary")
//       .items.getById(Number(id))
//       .get();
//     return {
//       id: item.ID.toString(),
//       title: item.Title,
//       category: item.Category,
//       module: item.Module,
//       subModule: item.Submodule || "",
//       drug: item.Drug,
//       status: item.Status,
//       author: item.Author?.Title || item.Author,
//       createdDate: new Date(item.Created),
//       lastModified: new Date(item.Modified),
//       version: item.Version || "1.0",
//       reviewers: item.Reviewers ? item.Reviewers.map((r: any) => r.Title) : [],
//       approvers: item.Approvers ? item.Approvers.map((a: any) => a.Title) : [],
//     };
//   } catch (error) {
//     console.error("Error fetching document:", error);
//     return null;
//   }
// }

// /**
//  * Create new document
//  */
// export async function createDocument(doc: Omit<Document, "id" | "createdDate" | "lastModified">): Promise<Document> {
//   try {
//     const result: IItemAddResult = await sp.web
//       .lists.getByTitle("DocumentLibrary")
//       .items.add({
//         Title: doc.title,
//         Category: doc.category,
//         Module: doc.module,
//         Submodule: doc.subModule,
//         Drug: doc.drug,
//         Status: doc.status,
//         Version: doc.version,
//       });

//     // Add reviewers and approvers
//     if (doc.reviewers && doc.reviewers.length > 0) {
//       const reviewerIds = await getUserIds(doc.reviewers);
//       await result.item.update({
//         ReviewersId: reviewerIds,
//       });
//     }

//     if (doc.approvers && doc.approvers.length > 0) {
//       const approverIds = await getUserIds(doc.approvers);
//       await result.item.update({
//         ApproversId: approverIds,
//       });
//     }

//     return {
//       ...doc,
//       id: result.data.ID.toString(),
//       createdDate: new Date(),
//       lastModified: new Date(),
//     };
//   } catch (error) {
//     console.error("Error creating document:", error);
//     throw error;
//   }
// }

// /**
//  * Update document
//  */
// export async function updateDocument(
//   id: string,
//   updates: Partial<Document>
// ): Promise<void> {
//   try {
//     await sp.web.lists
//       .getByTitle("DocumentLibrary")
//       .items.getById(Number(id))
//       .update({
//         Title: updates.title,
//         Category: updates.category,
//         Module: updates.module,
//         Submodule: updates.subModule,
//         Drug: updates.drug,
//         Status: updates.status,
//         Version: updates.version,
//       });
//   } catch (error) {
//     console.error("Error updating document:", error);
//     throw error;
//   }
// }

// /**
//  * Delete document
//  */
// export async function deleteDocument(id: string): Promise<void> {
//   try {
//     await sp.web.lists
//       .getByTitle("DocumentLibrary")
//       .items.getById(Number(id))
//       .delete();
//   } catch (error) {
//     console.error("Error deleting document:", error);
//     throw error;
//   }
// }

// // ==================== TEMPLATE OPERATIONS ====================

// /**
//  * Get all templates
//  */
// export async function getTemplates(): Promise<Template[]> {
//   try {
//     const items = await sp.web.lists.getByTitle("Templates").items();
//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       name: item.Title,
//       category: item.Category,
//       module: item.Module,
//       version: item.Version || "1.0",
//       status: item.Status,
//       createdDate: new Date(item.Created),
//       lastModified: new Date(item.Modified),
//     }));
//   } catch (error) {
//     console.error("Error fetching templates:", error);
//     throw error;
//   }
// }

// /**
//  * Create template
//  */
// export async function createTemplate(
//   template: Omit<Template, "id" | "createdDate" | "lastModified">
// ): Promise<Template> {
//   try {
//     const result: IItemAddResult = await sp.web
//       .lists.getByTitle("Templates")
//       .items.add({
//         Title: template.name,
//         Category: template.category,
//         Module: template.module,
//         Version: template.version,
//         Status: template.status,
//       });

//     return {
//       ...template,
//       id: result.data.ID.toString(),
//       createdDate: new Date(),
//       lastModified: new Date(),
//     };
//   } catch (error) {
//     console.error("Error creating template:", error);
//     throw error;
//   }
// }

// /**
//  * Delete template
//  */
// export async function deleteTemplate(id: string): Promise<void> {
//   try {
//     await sp.web.lists
//       .getByTitle("Templates")
//       .items.getById(Number(id))
//       .delete();
//   } catch (error) {
//     console.error("Error deleting template:", error);
//     throw error;
//   }
// }

// // ==================== CATEGORY OPERATIONS ====================

// /**
//  * Get all categories
//  */
// export async function getCategories(): Promise<Category[]> {
//   try {
//     const items = await sp.web.lists.getByTitle("CategoryMaster").items();
//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       name: item.Title,
//       description: item.Description || "",
//       templateCount: item.TemplateCount || 0,
//       createdDate: new Date(item.Created),
//     }));
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     throw error;
//   }
// }

// /**
//  * Create category
//  */
// export async function createCategory(
//   category: Omit<Category, "id" | "createdDate">
// ): Promise<Category> {
//   try {
//     const result: IItemAddResult = await sp.web
//       .lists.getByTitle("CategoryMaster")
//       .items.add({
//         Title: category.name,
//         Description: category.description,
//         TemplateCount: category.templateCount,
//       });

//     return {
//       ...category,
//       id: result.data.ID.toString(),
//       createdDate: new Date(),
//     };
//   } catch (error) {
//     console.error("Error creating category:", error);
//     throw error;
//   }
// }

// // ==================== DRUG OPERATIONS ====================

// /**
//  * Get all drugs
//  */
// export async function getDrugs(): Promise<Drug[]> {
//   try {
//     const items = await sp.web.lists.getByTitle("DrugMaster").items();
//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       name: item.Title,
//       genericName: item.GenericName || "",
//       dosageForm: item.DosageForm || "",
//       strength: item.Strength || "",
//       status: item.Status || "Active",
//     }));
//   } catch (error) {
//     console.error("Error fetching drugs:", error);
//     throw error;
//   }
// }

// // ==================== WORKFLOW TASK OPERATIONS ====================

// /**
//  * Get workflow tasks for current user
//  */
// export async function getMyTasks(): Promise<WorkflowTask[]> {
//   try {
//     const items = await sp.web.lists
//       .getByTitle("WorkflowTasks")
//       .items.filter(`AssignedToId eq ${sp.web.currentUser}`)();

//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       documentId: item.DocumentId,
//       documentTitle: item.DocumentTitle,
//       taskType: item.TaskType,
//       assignedTo: item.AssignedTo?.Title || item.AssignedTo,
//       assignedDate: new Date(item.Created),
//       dueDate: new Date(item.DueDate),
//       status: item.Status,
//       comments: [],
//       priority: item.Priority || "Medium",
//     }));
//   } catch (error) {
//     console.error("Error fetching tasks:", error);
//     throw error;
//   }
// }

// /**
//  * Update task status
//  */
// export async function updateTaskStatus(
//   taskId: string,
//   status: string
// ): Promise<void> {
//   try {
//     await sp.web.lists
//       .getByTitle("WorkflowTasks")
//       .items.getById(Number(taskId))
//       .update({
//         Status: status,
//       });
//   } catch (error) {
//     console.error("Error updating task:", error);
//     throw error;
//   }
// }

// // ==================== AUDIT LOG OPERATIONS ====================

// /**
//  * Get audit logs for a document
//  */
// export async function getAuditLogs(documentId: string): Promise<AuditLog[]> {
//   try {
//     const items = await sp.web.lists
//       .getByTitle("AuditLog")
//       .items.filter(`DocumentId eq '${documentId}'`)();

//     return items.map((item: any) => ({
//       id: item.ID.toString(),
//       documentId: item.DocumentId,
//       actor: item.Actor?.Title || item.Actor,
//       action: item.Action,
//       timestamp: new Date(item.Created),
//       details: item.Details || "",
//       oldValue: item.OldValue,
//       newValue: item.NewValue,
//     }));
//   } catch (error) {
//     console.error("Error fetching audit logs:", error);
//     throw error;
//   }
// }

// /**
//  * Log an action
//  */
// export async function logAction(
//   documentId: string,
//   action: string,
//   details: string,
//   oldValue?: string,
//   newValue?: string
// ): Promise<void> {
//   try {
//     await sp.web.lists.getByTitle("AuditLog").items.add({
//       DocumentId: documentId,
//       Action: action,
//       Details: details,
//       OldValue: oldValue,
//       NewValue: newValue,
//     });
//   } catch (error) {
//     console.error("Error logging action:", error);
//   }
// }

// // ==================== HELPER FUNCTIONS ====================

// /**
//  * Get user IDs from display names
//  */
// async function getUserIds(displayNames: string[]): Promise<number[]> {
//   try {
//     const userIds: number[] = [];
//     for (const name of displayNames) {
//       const user = await sp.web.ensureUser(name);
//       userIds.push(user.data.Id);
//     }
//     return userIds;
//   } catch (error) {
//     console.error("Error getting user IDs:", error);
//     return [];
//   }
// }

// /**
//  * Get current user
//  */
// export async function getCurrentUser(): Promise<string> {
//   try {
//     const user = await sp.web.currentUser.get();
//     return user.Title;
//   } catch (error) {
//     console.error("Error getting current user:", error);
//     return "Unknown User";
//   }
// }

// /**
//  * Search items across all lists
//  */
// export async function searchItems(query: string): Promise<any[]> {
//   try {
//     const results: any[] = [];

//     const docs = await sp.web.lists
//       .getByTitle("DocumentLibrary")
//       .items.filter(`substringof('${query}', Title)`)();

//     results.push(...docs);
//     return results;
//   } catch (error) {
//     console.error("Error searching items:", error);
//     return [];
//   }
// }
