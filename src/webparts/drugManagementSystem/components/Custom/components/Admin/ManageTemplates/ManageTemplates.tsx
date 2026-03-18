/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import type { Template } from '../../../types';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Link, Panel, PanelType, TooltipHost } from '@fluentui/react';
import { CustomModal } from '../../../../Common/CustomModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEye, faPenToSquare, faTrashCan, faFileAlt,
  faArrowsRotate, faFileUpload, faDownload,
  faCheckCircle, faDna, faFlask, faFolderTree
} from '@fortawesome/free-solid-svg-icons';
import { Loader } from '../../../../Common/Loader/Loader';
import { UploadTemplatePage } from './UploadTemplatePage';
import { ExcelUploadModal } from './ExcelUploadModal';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { ManageTemplatesData } from './ManageTemplatesData';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { FileIconHelper } from '../../../utils/fileIconHelper';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';
import { StatusBadge, SummaryCard } from '../../../../Common';
import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';

const OFFICE_DOC_TYPES = ['doc', 'docx', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx', 'ods'];

export const ManageTemplates: React.FC<any> = (props) => {
  const {
    filteredTemplates,
    searchTerm,
    statusFilter,
    mappingTypeFilter,
    countryFilter,
    selectedIds,
    setSearchTerm,
    setStatusFilter,
    setMappingTypeFilter,
    setCountryFilter,
    setSelectedIds,
    loadTemplates,
    handleDeleteConfirm,
    categories,
    countries,
    ctdFolders,
    ectdSections,
    provider,
    context,
    setIsCreatePageOpen,
    isLoading,
    openDeleteDialog,
    updateTemplate,
    isCreatePageOpen,
    gmpModels,
    tmfFolders,
    buildAbsoluteFileUrl,
    successMessage,
    errorMessage,
    setSuccessMessage,
    setErrorMessage
  } = ManageTemplatesData();

  const isVisibleCrud = React.useRef(true);
  const [isDisplayEDbtn, setIsDisplayEDbtn] = React.useState(false);
  const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState(false);
  const [updateItem, setUpdateItem] = React.useState<any[]>([]);
  const [deleteId, setDeleteId] = React.useState<number>(0);

  const [hideDeleteDialog, setHideDeleteDialog] = React.useState(true);
  const [hideSuccessDialog, setHideSuccessDialog] = React.useState(true);
  const [hideErrorDialog, setHideErrorDialog] = React.useState(true);
  const [localErrorMsg, setLocalErrorMsg] = React.useState('');
  const [localSuccessMsg, setLocalSuccessMsg] = React.useState('');

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewingTemplate, setPreviewingTemplate] = React.useState<Template | null>(null);
  const [isEditMappingOpen, setIsEditMappingOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<Template | null>(null);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);
  const tooltipId = React.useRef('tmpl-tooltip').current;

  React.useEffect(() => {
    if (successMessage) {
      setLocalSuccessMsg(successMessage);
      setHideSuccessDialog(false);
      setSuccessMessage('');
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (errorMessage) {
      setLocalErrorMsg(errorMessage);
      setHideErrorDialog(false);
      setErrorMessage('');
    }
  }, [errorMessage]);

  const showError = (msg: string) => {
    setLocalErrorMsg(msg);
    setHideErrorDialog(false);
  };

  const showSuccess = (msg: string) => {
    setLocalSuccessMsg(msg);
    setHideSuccessDialog(false);
  };

  const countryOptions = React.useMemo(() =>
    (countries || []).map((c: any) => ({ label: c.name, value: c.id })), [countries]);

  const statusOptions = React.useMemo(() => [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ], []);

  const mappingTypeOptions = React.useMemo(() => [
    { value: 'eCTD', label: 'eCTD' },
    { value: 'GMP', label: 'GMP' },
    { value: 'TMF', label: 'TMF' },
    { value: 'None', label: 'None' }
  ], []);

  const totalTemplates = filteredTemplates.length;
  const ectdCount = filteredTemplates.filter((t: any) => t.mappingType === 'eCTD').length;
  const gmpCount = filteredTemplates.filter((t: any) => t.mappingType === 'GMP').length;
  const tmfCount = filteredTemplates.filter((t: any) => t.mappingType === 'TMF').length;

  const _onItemSelected = (item: any[]): void => {
    setSelectedIds(item.map((i: any) => i.id));
    if (item.length > 0) {
      setIsDisplayEditButtonview(item.length === 1);
      setUpdateItem(item);
      setDeleteId(item.length === 1 ? item[0].id : 0);
      setIsDisplayEDbtn(true);
    } else {
      setIsDisplayEditButtonview(false);
      setUpdateItem([]);
      setDeleteId(0);
      setIsDisplayEDbtn(false);
    }
  };

  const onclickEdit = () => {
    if (updateItem.length === 1) {
      setEditingTemplate(updateItem[0]);
      setIsEditMappingOpen(true);
    }
  };

  const onclickDelete = () => {
    if (updateItem.length > 0) {
      const ids = updateItem.map((i: any) => i.id);
      openDeleteDialog(ids);
      setHideDeleteDialog(false);
    }
  };

  const onConfirmDelete = async () => {
    setHideDeleteDialog(true);
    await handleDeleteConfirm();
    showSuccess('Template(s) deleted successfully.');
    setIsDisplayEDbtn(false);
    setUpdateItem([]);
  };

  const downloadTemplate = async (t: Template) => {
    const abs = buildAbsoluteFileUrl((t as any).fileRef || '');
    if (!abs || isDownloading) return;
    try {
      setIsDownloading(true);
      const response = await fetch(abs, { credentials: 'include' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = t.name || 'template.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      showError('Download failed. Unable to download the template file.');
    } finally {
      setIsDownloading(false);
    }
  };

  const columns: any[] = [
    {
      key: 'name',
      name: 'Template Name',
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 320,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => {
        const iconInfo = FileIconHelper.getFileIcon(item.name);
        return (
          <TooltipHost content={item.name}>
            <div className="dflex" style={{ alignItems: 'center', gap: 8 }}>
              <div style={{
                fontSize: 16, width: 30, height: 30, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: iconInfo.bgColor, borderRadius: 4, color: iconInfo.color, flexShrink: 0
              }}>
                <FontAwesomeIcon icon={iconInfo.icon} />
              </div>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.name}
              </span>
            </div>
          </TooltipHost>
        );
      }
    },
    {
      key: 'version',
      name: 'Version',
      fieldName: 'version',
      minWidth: 70,
      maxWidth: 90,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: any) => <span>{item.version || '1.0'}</span>
    },
    {
      key: 'country',
      name: 'Country',
      fieldName: 'country',
      minWidth: 100,
      maxWidth: 150,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => (
        <TooltipHost content={item.country || 'N/A'}>
          <span>{item.country || 'N/A'}</span>
        </TooltipHost>
      )
    },
    {
      key: 'mappingType',
      name: 'Mapping Type',
      fieldName: 'mappingType',
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: any) => {
        const type = item.mappingType || 'None';
        const bgColors: any = { eCTD: '#E8EAF6', GMP: '#FFF3E0', TMF: '#E0F2F1', None: '#F5F5F5' };
        const textColors: any = { eCTD: '#3949AB', GMP: '#E65100', TMF: '#00796B', None: '#666' };
        return (
          <span style={{
            background: bgColors[type] || '#F5F5F5',
            color: textColors[type] || '#666',
            padding: '3px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-block'
          }}>
            {type}
          </span>
        );
      }
    },
    {
      key: 'mappedFolderZone',
      name: 'Folder / Zone',
      fieldName: 'mappedFolderZone',
      minWidth: 130,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: any) => {
        let value = '-';
        if (item.mappingType === 'eCTD') value = item.mappedCTDFolder || '-';
        else if (item.mappingType === 'TMF') value = item.mappedTMFFolder || '-';
        else if (item.mappingType === 'GMP') value = item.category || '-';
        return <TooltipHost content={value}><span>{value}</span></TooltipHost>;
      }
    },
    {
      key: 'sectionModel',
      name: 'Section / Model',
      fieldName: 'sectionModel',
      minWidth: 120,
      maxWidth: 170,
      isResizable: true,
      onRender: (item: any) => {
        let value = '-';
        if (item.mappingType === 'eCTD') value = item.eCTDSection || '-';
        else if (item.mappingType === 'GMP') value = item.mappedGMPModel || '-';
        return <TooltipHost content={value}><span>{value}</span></TooltipHost>;
      }
    },
    {
      key: 'uploadDate',
      name: 'Upload Date',
      fieldName: 'uploadDate',
      minWidth: 110,
      maxWidth: 140,
      isResizable: true,
      isSortingRequired: true
    },
    {
      key: 'status',
      name: 'Status',
      fieldName: 'status',
      minWidth: 90,
      maxWidth: 110,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => {
        const status = item.status ?? 'Inactive';
        return <StatusBadge status={status.toLowerCase()} size="small" />;
      }
    },
    {
      key: 'actions',
      name: 'Action',
      minWidth: 50,
      maxWidth: 60,
      isResizable: false,
      onRender: (item: Template) => (
        <Link
          className="actionBtn iconSize btnView no-select"
          onClick={() => { setPreviewingTemplate(item); setIsPreviewOpen(true); }}
        >
          <TooltipHost content="View / Preview">
            <FontAwesomeIcon icon={faEye} />
          </TooltipHost>
        </Link>
      )
    }
  ];

  if (isCreatePageOpen) {
    return (
      <UploadTemplatePage
        onCancel={() => setIsCreatePageOpen(false)}
        onSuccess={() => {
          setIsCreatePageOpen(false);
          showSuccess('Template uploaded successfully.');
          loadTemplates();
        }}
      />
    );
  }

  if (isEditMappingOpen && editingTemplate) {
    return (
      <UploadTemplatePage
        editMode={true}
        editData={editingTemplate}
        onCancel={() => { setIsEditMappingOpen(false); setEditingTemplate(null); }}
        onSuccess={() => {
          setIsEditMappingOpen(false);
          setEditingTemplate(null);
          showSuccess('Template updated successfully.');
          loadTemplates();
        }}
      />
    );
  }

  return (
    <div className="pageContainer" style={{ paddingTop: 0 }}>
      {isLoading && <Loader />}

      {/* ===== Page Title ===== */}
      <h1 className="mainTitle" style={{ marginTop: 0, marginBottom: 16 }}>Manage Templates</h1>

      {/* ===== SECTION 1: Summary Cards ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '16px 20px',
        marginBottom: 16
      }}>
        <div className="summary-cards-container" style={{ marginBottom: 0 }}>
          <SummaryCard
            title="Total Templates"
            value={totalTemplates}
            icon={faFileAlt}
            color="blue"
            subtitle="All templates"
          />
          <SummaryCard
            title="eCTD Templates"
            value={ectdCount}
            icon={faDna}
            color="purple"
            subtitle="Mapped to eCTD"
          />
          <SummaryCard
            title="GMP Templates"
            value={gmpCount}
            icon={faFlask}
            color="orange"
            subtitle="Mapped to GMP"
          />
          <SummaryCard
            title="TMF Templates"
            value={tmfCount}
            icon={faFolderTree}
            color="green"
            subtitle="Mapped to TMF"
          />
        </div>
      </div>

      {/* ===== SECTION 2: Filters ===== */}
      <div style={{
        background: '#fff',
        borderRadius: 5,
        boxShadow: '0px 4px 10px rgb(166 166 166 / 55%)',
        padding: '12px 20px',
        marginBottom: 16
      }}>
        <div className="ms-Grid">
          <div className="ms-Grid-row" style={{ alignItems: 'flex-end' }}>
            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
              <div className="formControl">
                <ReactDropdown
                  name="mappingTypeFilter"
                  options={mappingTypeOptions}
                  defaultOption={mappingTypeOptions.find(o => o.value === mappingTypeFilter)}
                  onChange={(opt: any) => setMappingTypeFilter(opt?.value ?? 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={true}
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
              <div className="formControl">
                <ReactDropdown
                  name="statusFilter"
                  options={statusOptions}
                  defaultOption={statusOptions.find(o => o.value === statusFilter)}
                  onChange={(opt: any) => setStatusFilter(opt?.value ?? 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={true}
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
              <div className="formControl">
                <ReactDropdown
                  name="countryFilter"
                  options={countryOptions}
                  defaultOption={countryOptions.find((c: any) => c.value === countryFilter)}
                  onChange={(opt: any) => setCountryFilter(opt ? Number(opt.value) : 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={true}
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3" style={{ display: 'flex', alignItems: 'center', paddingTop: 1 }}>
              <DefaultButton
                text="Reset"
                onClick={() => {
                  setMappingTypeFilter('All');
                  setStatusFilter('All');
                  setCountryFilter('All');
                }}
                styles={{
                  root: { background: '#d32f2f', borderColor: '#d32f2f', color: '#fff', minWidth: 100, borderRadius: 4 },
                  rootHovered: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                  rootPressed: { background: '#b71c1c', borderColor: '#b71c1c', color: '#fff' },
                  label: { color: '#fff', fontWeight: 600 },
                  icon: { color: '#fff' }
                }}
                onRenderIcon={() => <FontAwesomeIcon icon={faArrowsRotate} style={{ marginRight: 6, color: '#fff' }} />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== SECTION 3: Breadcrumb ===== */}
      <div style={{ marginBottom: 16 }}>
        <Breadcrumb
          items={[
            { label: 'Manage Templates', isActive: true }
          ]}
        />
      </div>

      {/* ===== SECTION 4: Grid ===== */}
      <div className="boxCard">
        <MemoizedDataGridComponent
          items={filteredTemplates}
          columns={columns}
          reRenderComponent={true}
          isPagination={true}
          searchable={true}
          CustomselectionMode={isVisibleCrud.current ? 2 : 0}
          onSelectedItem={_onItemSelected}
          isAddNew={true}
          addEDButton={
            isDisplayEDbtn && isVisibleCrud.current
              ? (
                <div className="dflex">
                  {isDisplayEditButtonview && (
                    <Link className="actionBtn iconSize btnEdit" onClick={onclickEdit}>
                      <TooltipHost content="Edit Template" id={tooltipId}>
                        <FontAwesomeIcon icon={faPenToSquare} />
                      </TooltipHost>
                    </Link>
                  )}
                  <Link className="actionBtn iconSize btnDanger ml-10" onClick={onclickDelete}>
                    <TooltipHost content="Delete" id={tooltipId}>
                      <FontAwesomeIcon icon={faTrashCan} />
                    </TooltipHost>
                  </Link>
                </div>
              )
              : false
          }
          addNewContent={
            isVisibleCrud.current
              ? (
                <div className="dflex pb-1">
                  <TooltipHost content="Upload New Template" id={tooltipId}>
                    <PrimaryButton
                      className="btn btn-primary"
                      onClick={() => setIsCreatePageOpen(true)}
                      text="Upload Template"
                    />
                  </TooltipHost>
                  <Link
                    className="actionBtn iconSize btnEdit ml-10"
                    onClick={() => setIsExcelUploadOpen(true)}
                  >
                    <TooltipHost content="Excel Upload" id={`${tooltipId}-excel`}>
                      <FontAwesomeIcon icon={faFileUpload} />
                    </TooltipHost>
                  </Link>
                  <Link
                    className="actionBtn iconSize btnRefresh ml-10"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('All');
                      setMappingTypeFilter('All');
                      setCountryFilter('All');
                      loadTemplates();
                    }}
                  >
                    <TooltipHost content="Reset & Refresh" id={`${tooltipId}-refresh`}>
                      <FontAwesomeIcon icon={faArrowsRotate} />
                    </TooltipHost>
                  </Link>
                </div>
              )
              : null
          }
        />
      </div>

      {/* ===== MODAL: Delete Confirmation ===== */}
      <CustomModal
        isModalOpenProps={!hideDeleteDialog}
        setModalpopUpFalse={() => setHideDeleteDialog(true)}
        subject="Delete Template"
        message="This template will be deleted permanently. Are you sure you want to delete it?"
        yesButtonText="Yes, Delete"
        closeButtonText="No"
        onClickOfYes={onConfirmDelete}
      />

      {/* ===== MODAL: Success ===== */}
      <CustomModal
        isModalOpenProps={!hideSuccessDialog}
        setModalpopUpFalse={() => setHideSuccessDialog(true)}
        subject="Success"
        message={localSuccessMsg || 'Operation completed successfully.'}
        closeButtonText="OK"
      />

      {/* ===== MODAL: Error / Validation ===== */}
      <CustomModal
        isModalOpenProps={!hideErrorDialog}
        setModalpopUpFalse={() => setHideErrorDialog(true)}
        subject="Error"
        message={localErrorMsg || 'An error occurred.'}
        closeButtonText="Close"
      />

      {/* ===== PANEL: View Template ===== */}
      <Panel
        isOpen={isPreviewOpen}
        onDismiss={() => { setIsPreviewOpen(false); setPreviewingTemplate(null); }}
        type={PanelType.extraLarge}
        headerText={previewingTemplate ? `Template: ${previewingTemplate.name}` : 'Template Preview'}
        closeButtonAriaLabel="Close"
        isLightDismiss
      >
        {previewingTemplate && (
          <div>
            {/* Meta details */}
            <div className="document-details" style={{ marginBottom: 16 }}>
              <div className="detail-item">
                <div className="detail-label">Template Name</div>
                <div className="detail-value">{previewingTemplate.name}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Version</div>
                <div className="detail-value">{(previewingTemplate as any).version || '1.0'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Country</div>
                <div className="detail-value">{(previewingTemplate as any).country || '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mapping Type</div>
                <div className="detail-value">{(previewingTemplate as any).mappingType || '-'}</div>
              </div>
              {(previewingTemplate as any).mappingType === 'eCTD' && (
                <>
                  <div className="detail-item">
                    <div className="detail-label">CTD Folder</div>
                    <div className="detail-value">{(previewingTemplate as any).mappedCTDFolder || '-'}</div>
                  </div>
                  <div className="detail-item">
                    <div className="detail-label">eCTD Section</div>
                    <div className="detail-value">{(previewingTemplate as any).eCTDSection || '-'}</div>
                  </div>
                </>
              )}
              {(previewingTemplate as any).mappingType === 'GMP' && (
                <div className="detail-item">
                  <div className="detail-label">GMP Model</div>
                  <div className="detail-value">{(previewingTemplate as any).mappedGMPModel || '-'}</div>
                </div>
              )}
              {(previewingTemplate as any).mappingType === 'TMF' && (
                <div className="detail-item">
                  <div className="detail-label">TMF Folder</div>
                  <div className="detail-value">{(previewingTemplate as any).mappedTMFFolder || '-'}</div>
                </div>
              )}
              <div className="detail-item">
                <div className="detail-label">Status</div>
                <div className="detail-value">
                  <StatusBadge status={(previewingTemplate.status || 'active').toLowerCase()} size="small" />
                </div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Upload Date</div>
                <div className="detail-value">{(previewingTemplate as any).uploadDate || '-'}</div>
              </div>
            </div>

            {/* Panel Action Buttons */}
            <div className="dflex" style={{ gap: 8, marginBottom: 16 }}>
              <PrimaryButton
                className="btn btn-primary"
                onClick={() => downloadTemplate(previewingTemplate)}
                disabled={isDownloading}
              >
                <FontAwesomeIcon icon={faDownload} style={{ marginRight: 8 }} />
                {isDownloading ? 'Downloading...' : 'Download'}
              </PrimaryButton>
              <DefaultButton
                onClick={() => {
                  setIsPreviewOpen(false);
                  setEditingTemplate(previewingTemplate);
                  setIsEditMappingOpen(true);
                }}
              >
                <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: 8 }} />
                Edit
              </DefaultButton>
              <DefaultButton
                className="btn btn-danger"
                onClick={() => {
                  setIsPreviewOpen(false);
                  openDeleteDialog([previewingTemplate.id]);
                  setHideDeleteDialog(false);
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} style={{ marginRight: 8 }} />
                Delete
              </DefaultButton>
            </div>

            {/* File Preview iframe */}
            {(() => {
              const items = previewingTemplate as any;
              if (!context) return <div className="field-error">Preview not available.</div>;
              const webUrl = context.pageContext?.web?.absoluteUrl || '';
              const serverRelUrl: string = items.fileRef || items.serverRelativeUrl || '';

              if (!serverRelUrl) return (
                <div style={{ padding: 16, color: '#666', fontSize: 13 }}>
                  Template file preview not available. Use the Download button to access the file.
                </div>
              );

              const fileExt = serverRelUrl.split('.').pop()?.toLowerCase() || '';
              const isOfficeDoc = OFFICE_DOC_TYPES.indexOf(fileExt) >= 0;
              const embedUrl = isOfficeDoc
                ? `${webUrl}/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(serverRelUrl)}&action=embedview`
                : (items.serverRedirectedEmbedUrl || (window.location.origin + serverRelUrl));

              return (
                <iframe
                  title={previewingTemplate.name}
                  src={embedUrl}
                  style={{ width: '100%', height: '75vh', border: '1px solid #e5e5e5', borderRadius: 4 }}
                />
              );
            })()}
          </div>
        )}
      </Panel>

      {/* ===== Excel Upload Modal ===== */}
      <ExcelUploadModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        onSuccess={() => {
          loadTemplates();
          setIsExcelUploadOpen(false);
          showSuccess('Templates uploaded from Excel successfully.');
        }}
        provider={provider}
        categories={categories}
        countries={countries}
        ctdFolders={ctdFolders}
        ectdSections={ectdSections}
      />
    </div>
  );
};
