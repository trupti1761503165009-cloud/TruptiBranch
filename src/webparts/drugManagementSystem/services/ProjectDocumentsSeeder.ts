import type { IDataProvider } from "../../Service/models/IDataProvider";
import { ListNames } from "../../Shared/Enum/ListNames";
import type { ICategory, ICTDFolder, ITemplate } from "../../Service/Service";
import * as XLSX from "xlsx";

interface IProjectDocumentsSeedOptions {
  libraryTitle?: string;
  templatesFolderName?: string;
  ctdMappingFolderName?: string;
  categoriesFolderName?: string;
}

const DEFAULT_OPTIONS: IProjectDocumentsSeedOptions = {
  libraryTitle: ListNames.ProjectDocuments,
  templatesFolderName: "Templates",
  ctdMappingFolderName: "CTD Mapping",
  categoriesFolderName: "Category Files"
};

const excelExtensions = [".xlsx", ".xls", ".xlsm"];

const isExcelFile = (name: string): boolean => {
  const lower = name.toLowerCase();
  return excelExtensions.some(ext => lower.endsWith(ext));
};

const bufferToWorkbook = (buffer: ArrayBuffer): XLSX.WorkBook => {
  const data = new Uint8Array(buffer);
  return XLSX.read(data, { type: "array" });
};

const sheetToJson = (wb: XLSX.WorkBook): any[] => {
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    return [];
  }
  const ws = wb.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(ws, { defval: "" });
};

const normalize = (value: unknown): string =>
  String(value ?? "").trim();

const buildCategoryKey = (row: any): string =>
  [
    normalize(row.DocumentCategory),
    normalize(row.Group),
    normalize(row.SubGroup),
    normalize(row.Artifact),
    normalize(row.TemplateName)
  ].join("|");

export async function runProjectDocumentsSeeding(
  provider: IDataProvider,
  options: IProjectDocumentsSeedOptions = DEFAULT_OPTIONS
): Promise<void> {
  if (!provider || !options.libraryTitle) {
    return;
  }

  try {
    // If master lists already contain data, assume seeding has been completed.
    const [existingCategories, existingCTDFolders, existingTemplates] =
      await Promise.all([
        provider.getCategories().catch(() => [] as ICategory[]),
        provider.getCTDFolders().catch(() => [] as ICTDFolder[]),
        provider.getTemplates().catch(() => [] as ITemplate[])
      ]);

    const shouldSeedCategories = existingCategories.length === 0;
    const shouldSeedCTDFolders = existingCTDFolders.length === 0;
    const shouldSeedTemplates = existingTemplates.length === 0;

    if (!shouldSeedCategories && !shouldSeedCTDFolders && !shouldSeedTemplates) {
      return;
    }

    const rootItems = await provider.getDocumentLibraryrootFolderItems(options.libraryTitle);
    if (!rootItems || rootItems.length === 0) {
      return;
    }

    const rootFolders = rootItems.filter((f: any) => !!f.Name && !!f.ServerRelativeUrl);

    const findFolder = (name: string | undefined): any | undefined => {
      if (!name) return undefined;
      const lower = name.toLowerCase();
      return rootFolders.find(
        (f: any) => String(f.Name || "").toLowerCase() === lower
      );
    };

    const templatesFolder = findFolder(options.templatesFolderName);
    const ctdMappingFolder = findFolder(options.ctdMappingFolderName);
    const categoriesFolder = findFolder(options.categoriesFolderName);

    if (shouldSeedCategories && categoriesFolder) {
      await seedCategoriesFromFolder(provider, categoriesFolder.ServerRelativeUrl, existingCategories);
    }

    if (shouldSeedCTDFolders && ctdMappingFolder) {
      await seedCTDFoldersFromFolder(provider, ctdMappingFolder.ServerRelativeUrl, existingCTDFolders);
    }

    if (shouldSeedTemplates && templatesFolder) {
      await seedTemplatesFromFolder(provider, templatesFolder.ServerRelativeUrl);
    }
  } catch (error) {
    // Seeding is best-effort; log and continue without breaking the web part.
    // eslint-disable-next-line no-console
    console.error("ProjectDocumentsSeeder: seeding failed", error);
  }
}

async function getExcelRowsFromFolder(
  provider: IDataProvider,
  folderServerRelativeUrl: string
): Promise<any[]> {
  const items = await provider.getChildFolders(folderServerRelativeUrl);
  if (!items || items.length === 0) {
    return [];
  }

  const files = items.filter((i: any) => !!i.Name && !!i.ServerRelativeUrl && isExcelFile(i.Name));
  const allRows: any[] = [];

  for (const file of files) {
    try {
      const buffer = await provider.getFileContents(file.ServerRelativeUrl);
      const wb = bufferToWorkbook(buffer);
      const rows = sheetToJson(wb);
      allRows.push(...rows);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("ProjectDocumentsSeeder: failed to read Excel file", file.ServerRelativeUrl, e);
    }
  }

  return allRows;
}

async function seedCategoriesFromFolder(
  provider: IDataProvider,
  folderServerRelativeUrl: string,
  existingCategories: ICategory[]
): Promise<void> {
  const rows = await getExcelRowsFromFolder(provider, folderServerRelativeUrl);
  if (!rows.length) return;

  const existingKeys = new Set(
    existingCategories.map(c =>
      [
        normalize(c.documentCategory),
        normalize(c.group),
        normalize(c.subGroup),
        normalize(c.artifactName),
        normalize(c.templateName)
      ].join("|")
    )
  );

  const toCreate: Array<Omit<ICategory, "id">> = [];

  for (const row of rows) {
    const key = buildCategoryKey(row);
    if (!key || existingKeys.has(key)) continue;

    const item: Omit<ICategory, "id"> = {
      name: row.Artifact || row.TemplateName || row.SubGroup || row.Group || row.DocumentCategory || "Category",
      description: row.Description || "",
      level: 4,
      status: (row.Status as "Active" | "Inactive") || "Active",
      documentCategory: row.DocumentCategory || "",
      group: row.Group || "",
      subGroup: row.SubGroup || "",
      artifactName: row.Artifact || "",
      templateName: row.TemplateName || "",
      ctdModule: row.CTDModule || row.Module || "",
      ectdSection: row.eCTDSection || "",
      ectdSubsection: row.eCTDSubsection || "",
      ectdCode: row.eCTDCode || "",
      documents: 0
    };

    toCreate.push(item);
    existingKeys.add(key);
  }

  for (const cat of toCreate) {
    await provider.createCategory(cat);
  }
}

async function seedCTDFoldersFromFolder(
  provider: IDataProvider,
  folderServerRelativeUrl: string,
  existingFolders: ICTDFolder[]
): Promise<void> {
  const rows = await getExcelRowsFromFolder(provider, folderServerRelativeUrl);
  if (!rows.length) return;

  const existingIds = new Set(existingFolders.map(f => f.folderId));

  for (const row of rows) {
    const id = normalize(row.FolderId || row.Code || row.ModuleId || row.ID);
    const name = row.Title || row.Name || row.Module || row.Section || "";
    if (!id || !name || existingIds.has(id)) continue;

    const folder: Omit<ICTDFolder, "id"> = {
      folderId: id,
      name,
      parentFolderId: normalize(row.ParentFolderId || row.ParentCode || ""),
      sortOrder: Number(row.SortOrder || 0),
      isFolder: true
    };

    await provider.createCTDFolder(folder);
    existingIds.add(id);
  }
}

async function seedTemplatesFromFolder(
  provider: IDataProvider,
  folderServerRelativeUrl: string
): Promise<void> {
  const items = await provider.getChildFolders(folderServerRelativeUrl);
  if (!items || items.length === 0) return;

  const files = items.filter((i: any) => !!i.Name && !!i.ServerRelativeUrl && !i.TimeLastModified); // basic heuristic: treat as files

  for (const file of files) {
    try {
      const buffer = await provider.getFileContents(file.ServerRelativeUrl);
      const fileName: string = file.Name;
      const libraryRelativeUrl = `${ListNames.Templates}/${fileName}`;
      await provider.uploadFiles(libraryRelativeUrl, buffer, "application/octet-stream");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("ProjectDocumentsSeeder: failed to copy template file", file.ServerRelativeUrl, e);
    }
  }
}

