import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import type { Document, CTDFolder } from '../../../types';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faClipboardList, faChartPie, faFlask, faVial, faHospital } from '@fortawesome/free-solid-svg-icons';

export interface CTDModule {
  id: string;
  name: string;
  code: string;
  icon: IconDefinition;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  documentCount: number;
  sections: CTDSection[];
}

export interface CTDSection {
  id: string;
  name: string;
  code: string;
  parentId: string;
  documentCount: number;
  subsections: CTDSubsection[];
}

export interface CTDSubsection {
  id: string;
  name: string;
  code: string;
  parentId: string;
  documents: Document[];
}

const DEFAULT_MODULES: CTDModule[] = [
  { id: 'm1', name: 'Administrative Information', code: '1', icon: faClipboardList, color: 'green', documentCount: 0, sections: [] },
  { id: 'm2', name: 'Common Technical Document Summaries', code: '2', icon: faChartPie, color: 'blue', documentCount: 0, sections: [] },
  { id: 'm3', name: 'Quality', code: '3', icon: faFlask, color: 'purple', documentCount: 0, sections: [] },
  { id: 'm4', name: 'Nonclinical Study Reports', code: '4', icon: faVial, color: 'orange', documentCount: 0, sections: [] },
  { id: 'm5', name: 'Clinical Study Reports', code: '5', icon: faHospital, color: 'red', documentCount: 0, sections: [] },
];

export function CTDViewData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [ctdFolders, setCtdFolders] = React.useState<CTDFolder[]>([]);
  const [modules, setModules] = React.useState<CTDModule[]>(DEFAULT_MODULES);
  const [selectedModule, setSelectedModule] = React.useState<string | null>(null);
  const [selectedSection, setSelectedSection] = React.useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<string>('hierarchy');
  const [searchTerm, setSearchTerm] = React.useState('');

  const loadData = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      // Load documents via DMS provider
      const docsResult = await provider.getDocuments();

      const docs: Document[] = (docsResult || []).map((item: any) => ({
        id: item.id ?? item.ID ?? item.Id,
        name: item.name ?? item.Title ?? '',
        category: item.category ?? item.Category ?? '',
        drugName: item.drugName ?? (typeof item.Drug === 'string' ? item.Drug : item.Drug?.Title) ?? '',
        drugId: item.drugId ?? (typeof item.Drug === 'object' ? item.Drug?.Id : undefined),
        status: item.status ?? item.Status ?? 'Draft',
        ctdModule: item.ctdModule ?? item.CTDModule ?? '',
        submodule: item.submodule ?? item.Submodule ?? '',
        ctdFolder: item.ctdFolder ?? item.CTDFolder ?? '',
        template: item.template ?? (typeof item.Template === 'string' ? item.Template : item.Template?.Title) ?? '',
        version: item.version ?? item.Version ?? 1,
        lastModified: item.lastModified ?? item.Modified ?? '',
        author: item.author ?? item.Author?.Title ?? ''
      }));
      setDocuments(docs);

      // Load CTD folders via DMS provider
      const foldersResult = await provider.getCTDFolders();

      const folders: CTDFolder[] = (foldersResult || []).map((item: any) => ({
        id: item.id ?? item.ID ?? item.Id,
        folderId: item.folderId ?? item.FolderId ?? '',
        name: item.name ?? item.Title ?? '',
        parentFolderId: item.parentFolderId ?? item.ParentFolderId ?? undefined,
        sortOrder: item.sortOrder ?? item.SortOrder ?? 0,
        isFolder: true
      }));
      setCtdFolders(folders);

      // Group documents by module
      const updatedModules = DEFAULT_MODULES.map(mod => {
        const moduleDocs = docs.filter(d => {
          const docModule = (d.ctdModule || '').replace(/^Module\s*/i, '');
          return docModule === mod.code || docModule.startsWith(mod.code + '.');
        });

        // Build sections from folders matching this module
        const moduleFolders = folders.filter(f => {
          const code = f.code || f.folderId || '';
          return code.startsWith(mod.code + '.') && code.split('.').length === 2;
        });

        const sections: CTDSection[] = moduleFolders.map(sf => {
          const sectionCode = sf.code || sf.folderId || '';
          const sectionDocs = moduleDocs.filter(d => {
            const sub = d.submodule || d.ctdFolder || '';
            return sub === sf.name || sub === sectionCode;
          });

          // Build subsections
          const subFolders = folders.filter(f => {
            const code = f.code || f.folderId || '';
            return code.startsWith(sectionCode + '.') && code.split('.').length === 3;
          });

          const subsections: CTDSubsection[] = subFolders.map(ssf => {
            const ssCode = ssf.code || ssf.folderId || '';
            const ssDocs = moduleDocs.filter(d => {
              const sub = d.submodule || d.ctdFolder || '';
              return sub === ssf.name || sub === ssCode;
            });
            return {
              id: String(ssf.id),
              name: ssf.name,
              code: ssCode,
              parentId: String(sf.id),
              documents: ssDocs
            };
          });

          // Docs not in subsections go directly under section
          const assignedDocIds = new Set(subsections.flatMap(ss => ss.documents.map(d => d.id)));
          const unassignedDocs = sectionDocs.filter(d => !assignedDocIds.has(d.id));
          if (unassignedDocs.length > 0) {
            subsections.push({
              id: `${sf.id}-unassigned`,
              name: 'General',
              code: sectionCode + '.0',
              parentId: String(sf.id),
              documents: unassignedDocs
            });
          }

          return {
            id: String(sf.id),
            name: sf.name,
            code: sectionCode,
            parentId: mod.id,
            documentCount: sectionDocs.length,
            subsections
          };
        });

        return {
          ...mod,
          documentCount: moduleDocs.length,
          sections
        };
      });

      setModules(updatedModules);
    } catch (err) {
      console.error('CTDViewData: Error loading data', err);
      // Use default modules with empty documents
      setModules(DEFAULT_MODULES);
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentModule = React.useMemo(() => {
    if (!selectedModule) return null;
    return modules.find(m => m.id === selectedModule) || null;
  }, [modules, selectedModule]);

  const currentSection = React.useMemo(() => {
    if (!currentModule || !selectedSection) return null;
    return currentModule.sections.find(s => s.id === selectedSection) || null;
  }, [currentModule, selectedSection]);

  const flatDocuments = React.useMemo(() => {
    return documents.filter(d => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        d.name.toLowerCase().includes(term) ||
        (d.ctdModule || '').toLowerCase().includes(term) ||
        (d.submodule || '').toLowerCase().includes(term) ||
        (d.drugName || '').toLowerCase().includes(term) ||
        (d.template || '').toLowerCase().includes(term)
      );
    });
  }, [documents, searchTerm]);

  return {
    documents,
    ctdFolders,
    modules,
    selectedModule,
    selectedSection,
    selectedSubsection,
    isLoading,
    viewMode,
    searchTerm,
    currentModule,
    currentSection,
    flatDocuments,
    setSelectedModule,
    setSelectedSection,
    setSelectedSubsection,
    setViewMode,
    setSearchTerm,
    loadData
  };
}
