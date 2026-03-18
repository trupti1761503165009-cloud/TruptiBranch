import * as React from 'react';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';
import { Loader } from '../../../../Common/Loader/Loader';
import { CTDViewData } from './CTDViewData';
import { faFolder, faFolderOpen, faFile, faChevronRight, faList, faSitemap, faArrowsRotate, faDownload, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { DefaultButton, Link, TooltipHost } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const CTDView: React.FC = () => {
  const {
    modules,
    selectedModule,
    selectedSection,
    isLoading,
    viewMode,
    searchTerm,
    currentModule,
    currentSection,
    flatDocuments,
    setSelectedModule,
    setSelectedSection,
    setViewMode,
    setSearchTerm,
  } = CTDViewData();

  const documentColumns: any[] = [
    {
      key: 'name',
      name: 'DOCUMENT NAME',
      fieldName: 'name',
      minWidth: 200,
      isSortingRequired: true,
      onRender: (item: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FontAwesomeIcon icon={faFile} style={{ color: '#1E88E5' }} />
          <span style={{ fontWeight: 500 }}>{item.name}</span>
        </div>
      )
    },
    {
      key: 'drugName',
      name: 'DRUG',
      fieldName: 'drugName',
      minWidth: 120,
      isSortingRequired: true,
    },
    {
      key: 'template',
      name: 'TEMPLATE',
      fieldName: 'template',
      minWidth: 150,
      isSortingRequired: true,
    },
    {
      key: 'status',
      name: 'STATUS',
      fieldName: 'status',
      minWidth: 120,
      onRender: (item: any) => (
        <span className={`status-badge status-${(item.status || 'draft').toLowerCase().replace(/\s+/g, '-')}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'version',
      name: 'VERSION',
      fieldName: 'version',
      minWidth: 80,
      onRender: (item: any) => <span>v{item.version || 1}</span>
    },
    {
      key: 'lastModified',
      name: 'DATE',
      fieldName: 'lastModified',
      minWidth: 120,
      isSortingRequired: true,
      onRender: (item: any) => {
        if (!item.lastModified) return <span>-</span>;
        try {
          return <span>{new Date(item.lastModified).toLocaleDateString()}</span>;
        } catch {
          return <span>{item.lastModified}</span>;
        }
      }
    }
  ];

  const getBreadcrumbItems = () => {
    const items = [
      {
        label: 'CTD View',
        onClick: () => {
          setSelectedModule(null);
          setSelectedSection(null);
        },
        isActive: !selectedModule
      }
    ];

    if (currentModule) {
      items[items.length - 1].isActive = false;
      items.push({
        label: `Module ${currentModule.code} - ${currentModule.name}`,
        onClick: () => {
          setSelectedSection(null);
        },
        isActive: !selectedSection
      });
    }

    if (currentSection) {
      items[items.length - 1].isActive = false;
      items.push({
        label: currentSection.name,
        onClick: () => { },
        isActive: true
      });
    }

    return items;
  };

  // Get documents for current view
  const getDocumentsForView = (): any[] => {
    if (currentSection) {
      return currentSection.subsections.flatMap(ss => ss.documents);
    }
    if (currentModule) {
      return currentModule.sections.flatMap(s => s.subsections.flatMap(ss => ss.documents));
    }
    return flatDocuments;
  };

  return (
    <div className="ctd-view-page pageContainer" data-testid="ctd-view-page" style={{ paddingTop: 0 }}>
      {isLoading && <Loader />}

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>CTD View</h1>

      {/* ===== Breadcrumb ===== */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb items={getBreadcrumbItems()} />
      </div>

      {/* View Mode Buttons */}
      <div className="dflex mb-3">
        <Link
          className={`actionBtn iconSize ${viewMode === 'hierarchy' ? 'btnActive' : 'btnEdit'} ml-10`}
          onClick={() => setViewMode('hierarchy')}
        >
          <TooltipHost content="Hierarchy View">
            <FontAwesomeIcon icon={faSitemap} />
          </TooltipHost>
        </Link>
        <Link
          className={`actionBtn iconSize ${viewMode === 'flat' ? 'btnActive' : 'btnEdit'} ml-10`}
          onClick={() => setViewMode('flat')}
        >
          <TooltipHost content="Flat List View">
            <FontAwesomeIcon icon={faList} />
          </TooltipHost>
        </Link>
      </div>

      {/* <div className="ms-Grid mb-3">
        <div className="ms-Grid-row">
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4">
            <PreDateRangeFilterQuaySafe
              siteMasterId={undefined}
              handleApply={(startDate: any, endDate: any, _dateRangeValue: any) => {
                console.log("Applying Date Filter", startDate, endDate);
              }}
            />
          </div>
        </div>
      </div> */}

      {/* Module Summary Cards */}
      {!selectedModule && (
        <div className="summary-cards-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {modules.map(mod => (
            <SummaryCard
              key={mod.id}
              title={`Module ${mod.code}`}
              value={mod.documentCount}
              subtitle={mod.name}
              icon={mod.icon}
              color={mod.color}
              onClick={() => setSelectedModule(mod.id)}
            />
          ))}
        </div>
      )}

      {/* Hierarchy View */}
      {viewMode === 'hierarchy' && !selectedModule && (
        <div className="boxCard">
          <MemoizedDataGridComponent
            items={modules.map(m => ({
              id: m.id,
              name: `Module ${m.code} - ${m.name}`,
              code: m.code,
              documentCount: m.documentCount,
              sectionCount: m.sections.length,
              icon: m.icon
            }))}
            columns={[
              {
                key: 'name',
                name: 'CTD MODULE',
                fieldName: 'name',
                minWidth: 350,
                isSortingRequired: true,
                onRender: (item: any) => (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => setSelectedModule(item.id)}
                  >
                    <FontAwesomeIcon icon={faFolder} style={{ fontSize: 20, color: '#FFA000' }} />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</span>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', color: '#999' }} />
                  </div>
                )
              },
              {
                key: 'sectionCount',
                name: 'SECTIONS',
                fieldName: 'sectionCount',
                minWidth: 100,
                onRender: (item: any) => <span>{item.sectionCount} Sections</span>
              },
              {
                key: 'documentCount',
                name: 'DOCUMENTS',
                fieldName: 'documentCount',
                minWidth: 100,
                onRender: (item: any) => <span>{item.documentCount} Documents</span>
              }
            ]}
            reRenderComponent={true}
            searchable={true}
            isPagination={true}
            CustomselectionMode={0}
            onSelectedItem={() => {}}
            isAddNew={true}
            addNewContent={
              <div className="dflex">
                <Link
                  className="actionBtn iconSize btnRefresh ml-10"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedModule(null);
                    setSelectedSection(null);
                  }}
                >
                  <TooltipHost content="Reset & Refresh">
                    <FontAwesomeIcon icon={faArrowsRotate} />
                  </TooltipHost>
                </Link>
              </div>
            }
            onItemInvoked={(item?: any) => item?.id && setSelectedModule(item.id)}
          />
        </div>
      )}

      {/* Section View - inside a module */}
      {viewMode === 'hierarchy' && selectedModule && !selectedSection && currentModule && (
        <div className="boxCard">
          <MemoizedDataGridComponent
            items={currentModule.sections.map(s => ({
              id: s.id,
              name: s.name,
              code: s.code,
              documentCount: s.documentCount,
              subsectionCount: s.subsections.length
            }))}
            columns={[
              {
                key: 'name',
                name: 'SECTION',
                fieldName: 'name',
                minWidth: 350,
                isSortingRequired: true,
                onRender: (item: any) => (
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '8px 0' }}
                    onClick={() => setSelectedSection(item.id)}
                  >
                    <FontAwesomeIcon icon={faFolderOpen} style={{ fontSize: 18, color: '#FFA000' }} />
                    <div>
                      <span style={{ fontWeight: 600 }}>{item.code} - {item.name}</span>
                    </div>
                    <FontAwesomeIcon icon={faChevronRight} style={{ marginLeft: 'auto', color: '#999' }} />
                  </div>
                )
              },
              {
                key: 'subsectionCount',
                name: 'SUBSECTIONS',
                fieldName: 'subsectionCount',
                minWidth: 120,
                onRender: (item: any) => <span>{item.subsectionCount} Subsections</span>
              },
              {
                key: 'documentCount',
                name: 'DOCUMENTS',
                fieldName: 'documentCount',
                minWidth: 100,
                onRender: (item: any) => <span>{item.documentCount} Documents</span>
              }
            ]}
            reRenderComponent={true}
            searchable={false}
            isPagination={true}
            CustomselectionMode={0}
            onSelectedItem={() => {}}
            onItemInvoked={(item?: any) => item?.id && setSelectedSection(item.id)}
          />
        </div>
      )}

      {/* Document View - inside a section */}
      {viewMode === 'hierarchy' && selectedSection && currentSection && (
        <div className="boxCard">
          <MemoizedDataGridComponent
            items={getDocumentsForView()}
            columns={documentColumns}
            reRenderComponent={true}
            searchable={true}
            isPagination={true}
            CustomselectionMode={0}
            onSelectedItem={() => {}}
          />
        </div>
      )}

      {/* Flat List View */}
      {viewMode === 'flat' && (
        <div className="boxCard">
          <MemoizedDataGridComponent
            items={flatDocuments}
            columns={[
              {
                key: 'ctdModule',
                name: 'CTD MODULE',
                fieldName: 'ctdModule',
                minWidth: 120,
                isSortingRequired: true,
              },
              {
                key: 'submodule',
                name: 'SECTION',
                fieldName: 'submodule',
                minWidth: 120,
                isSortingRequired: true,
              },
              ...documentColumns
            ]}
            reRenderComponent={true}
            searchable={true}
            isPagination={true}
            CustomselectionMode={0}
            onSelectedItem={() => {}}
          />
        </div>
      )}
    </div>
  );
};
