/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import type { Template } from '../../../types';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Link, Panel, PanelType, TooltipHost } from '@fluentui/react';
import { CustomModal } from '../../../../Common/CustomModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEye, faFileExcel, faPenToSquare, faTrashCan, faUpload, faFileAlt, faCheckCircle, faClock, faBan, faPlus, faArrowsRotate, faFileUpload } from '@fortawesome/free-solid-svg-icons';
import { Loader } from '../../../../Common/Loader/Loader';
import { UploadTemplatePage } from './UploadTemplatePage';
import { ExcelUploadModal } from './ExcelUploadModal';
import { MemoizedDataGridComponent } from '../../../../Common/DetailList/DataGridComponent';
import { ManageTemplatesData } from './ManageTemplatesData';
import ReactDropdown from '../../../../Common/ReactSelectDropdown';
import { MessageDialog, type MessageType } from '../../../../Common/Dialogs/MessageDialog';
import { TextField } from '@fluentui/react/lib/TextField';
import { FileIconHelper } from '../../../utils/fileIconHelper';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';


// Or define it locally if not exported from Util
const OFFICE_DOC_TYPES = ["doc", "docx", "rtf", "xls", "xlsx", "ppt", "pptx", "ods"];

import { ComponentNameEnum } from '../../../../../models/ComponentNameEnum';
import { StatusBadge, SummaryCard } from '../../../../Common';

export const ManageTemplates: React.FC<any> = (props) => {
  const {
    filteredTemplates,
    searchTerm,
    statusFilter,
    categoryFilter,
    countryFilter,
    selectedIds,
    setSearchTerm,
    setStatusFilter,
    setCategoryFilter,
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
    buildAbsoluteFileUrl
  } = ManageTemplatesData();

  // Specific snippet states and logic from the Reference Section
  const isVisibleCrud = React.useRef(true);
  const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState(false);
  const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState(false);
  const [isSelectedData, setisSelectedData] = React.useState(false);
  const [updateItem, setUpdateItem] = React.useState<any[]>([]);
  const [deleteId, setDeleteId] = React.useState<number>(0);
  
  // States from Snippet 3: Custom Modal Logic
  const [hideDialog, setHideDialog] = React.useState(true); // true means hidden
  const [hideDialogdelete, setHideDialogdelete] = React.useState(true); // true means hidden
  const [hideSuccessDialog, setHideSuccessDialog] = React.useState(true); // true means hidden
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");

  const [tooltipId] = React.useState("tooltip-id");
  const [currentView, setCurrentView] = React.useState("grid");
  const menuProps = { items: [] }; // Export menu dummy

  // Helpers from Snippets
  const toggleHideDialog = () => setHideDialog(!hideDialog);
  const _closeDeleteConfirmation = () => setHideDialogdelete(true);
  const closeSuccessModal = () => setHideSuccessDialog(true);
  const returnErrorMessage = () => errorMessage || "Data Is Missing";

  const onclickEdit = () => {
    if (updateItem.length > 0) {
      props.manageComponentView({
        currentComponentName: ComponentNameEnum.EditTemplate,
        componentProps: { item: updateItem[0] }
      });
    }
  };

  const onclickconfirmdelete = () => {
    setHideDialogdelete(false); // Show the modal
  };

  const onClickRealImageDelete = () => {
    handleDeleteConfirm(); // Calls hook method
    setHideDialogdelete(true);
  };

  const [isDownloading, setIsDownloading] = React.useState(false);

  const downloadTemplate = async (t: Template) => {
    const abs = buildAbsoluteFileUrl((t as any).fileRef || '');
    if (!abs || isDownloading) return;

    try {
      setIsDownloading(true);
      const response = await fetch(abs, { credentials: "include" });
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = t.name || "template.docx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed:", error);
      setErrorMessage("Download Failed: Unable to download the template file.");
      setHideDialog(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const onclickAdd = () => {
    setIsCreatePageOpen(true);
  };

  const handleViewChange = (view: string) => setCurrentView(view);

  // Snippet 2: Selection Logic Helper
  const _onItemSelected = (item: any): void => {
    // Keep consistency with hook's internal tracking
    setSelectedIds(item.map((i: any) => i.id));
    
    if (item.length > 0) {
        if (item.length == 1) {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(true); // Show Edit
            setDeleteId(item[0].id);
        } else {
            setisSelectedData(true);
            setUpdateItem(item);
            setIsDisplayEditButtonview(false); // Hide Edit for multiple
        }
        setisDisplayEDbtn(true); // Show Delete
    } else {
        setisSelectedData(false);
        setUpdateItem([]);
        setDeleteId(0);
        setisDisplayEDbtn(false); // Hide both
    }
  };

  const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
  const [previewingTemplate, setPreviewingTemplate] = React.useState<Template | null>(null);

  const openPreview = (item: Template) => {
    setPreviewingTemplate(item);
    setIsPreviewOpen(true);
  };

  const [isEditMappingOpen, setIsEditMappingOpen] = React.useState(false);
  const [editingTemplate, setEditingTemplate] = React.useState<Template | null>(null);
  const [isExcelUploadOpen, setIsExcelUploadOpen] = React.useState(false);

  // Memoized options for filters and grid
  const categoryOptions = React.useMemo(() => (categories || []).map((c: any) => ({ label: c.name, value: c.id })), [categories]);
  const countryOptions = React.useMemo(() => (countries || []).map((c: any) => ({ label: c.name, value: c.id })), [countries]);
  const ctdFolderOptions = React.useMemo(() => (ctdFolders || []).map((f: any) => ({ label: f.name, value: f.id })), [ctdFolders]);
  const ectdSectionOptionsList = React.useMemo(() => (ectdSections || []).map((s: any) => ({ label: s.name, value: s.id })), [ectdSections]);
  const gmpModelOptions = React.useMemo(() => (gmpModels || []).map((m: any) => ({ label: m.name, value: m.id })), [gmpModels]);
  const tmfFolderOptions = React.useMemo(() => (tmfFolders || []).map((t: any) => ({ label: t.name, value: t.id })), [tmfFolders]);

  const statusOptions = React.useMemo(() => [
    { value: 'All', label: 'All Status' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ], []);

  const editStatusOptions = React.useMemo(() => [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
  ], []);

  const mappingTypeOptions = React.useMemo(() => [
    { label: 'None', value: 'None' },
    { label: 'eCTD', value: 'eCTD' },
    { label: 'GMP', value: 'GMP' },
    { label: 'TMF', value: 'TMF' }
  ], []);

  // Message Dialog State (replaces toasts)
  const [messageDialog, setMessageDialog] = React.useState<{
    hidden: boolean;
    type: MessageType;
    title: string;
    message: string;
    fields: string[];
  }>({ hidden: true, type: 'info', title: '', message: '', fields: [] });

  const showMessage = (type: MessageType, title: string, message: string, fields: string[] = []) => {
    setMessageDialog({ hidden: false, type, title, message, fields });
  };

  const hideMessage = () => {
    setMessageDialog(prev => ({ ...prev, hidden: true }));
  };

  // Consolidating on CustomModal from snippets for Success/Error/Delete
  React.useEffect(() => {
    if (successMessage) {
      setHideSuccessDialog(false);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (errorMessage) {
      setHideDialog(false);
    }
  }, [errorMessage]);



  const columns: any[] = [
    {
      key: 'name',
      name: 'Template Name',
      fieldName: 'name',
      minWidth: 200,
      maxWidth: 350,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => {
        const iconInfo = FileIconHelper.getFileIcon(item.name);
        return (
          <TooltipHost content={item.name}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                fontSize: 16,
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: iconInfo.bgColor,
                borderRadius: 4,
                color: iconInfo.color,
                flexShrink: 0
              }}>
                <FontAwesomeIcon icon={iconInfo.icon} />
              </div>
              <span style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
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
      onRender: (item: Template) => (
        <span className="grid-cell-content">{(item as any).version || '-'}</span>
      )
    },
    {
      key: 'country',
      name: 'COUNTRY',
      fieldName: 'country',
      minWidth: 110,
      maxWidth: 160,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => (
        <TooltipHost content={item.country || 'N/A'}>
          <span className="grid-cell-content">{item.country || 'N/A'}</span>
        </TooltipHost>
      )
    },
    {
      key: 'mappingType',
      name: 'Mapping Type',
      fieldName: 'mappingType',
      minWidth: 110,
      maxWidth: 140,
      isResizable: true,
      isSortingRequired: true,
      onRender: (item: Template) => {
        const mappingType = (item as any).mappingType || 'None';
        const bgColors: any = { eCTD: '#E8EAF6', GMP: '#FFF3E0', TMF: '#E0F2F1', None: '#F5F5F5' };
        const textColors: any = { eCTD: '#3949AB', GMP: '#E65100', TMF: '#00796B', None: '#666' };
        return (
          <span style={{
            background: bgColors[mappingType] || '#F5F5F5',
            color: textColors[mappingType] || '#666',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: 12,
            fontWeight: 600,
            display: 'inline-block'
          }}>
            {mappingType}
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
      isSortingRequired: false,
      onRender: (item: Template) => {
        const type = (item as any).mappingType;
        let value = '-';
        if (type === 'eCTD') value = item.mappedCTDFolder || '-';
        if (type === 'TMF') value = (item as any).mappedTMFFolder || '-';
        if (type === 'GMP') value = item.category || '-'; // Assuming GMP category is the 'Category' property for Folder/Zone representation
        
        return (
          <TooltipHost content={value}>
            <span className="grid-cell-content">{value}</span>
          </TooltipHost>
        );
      }
    },
    {
      key: 'sectionModel',
      name: 'Section / Model',
      fieldName: 'sectionModel',
      minWidth: 110,
      maxWidth: 150,
      isResizable: true,
      isSortingRequired: false,
      onRender: (item: Template) => {
        const type = (item as any).mappingType;
        let value = '-';
        if (type === 'eCTD') value = item.eCTDSection || '-';
        // if (type === 'TMF') value = artifact name? For now, nothing explicit except the TMF folder above.
        if (type === 'GMP') value = (item as any).mappedGMPModel || '-';

        return (
          <TooltipHost content={value}>
            <span className="grid-cell-content">{value}</span>
          </TooltipHost>
        );
      }
    },
    {
      key: 'uploadDate',
      name: 'Upload Date',
      fieldName: 'uploadDate',
      minWidth: 120,
      maxWidth: 160,
      isResizable: true,
      isSortingRequired: true
    },
    {
      key: 'status',
      name: 'STATUS',
      fieldName: 'status',
      minWidth: 100,
      maxWidth: 130,
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
      minWidth: 60,
      maxWidth: 80,
      isResizable: false,
      onRender: (item: Template) => (
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link className="actionBtn iconSize btnView" onClick={() => openPreview(item)}>
            <TooltipHost content="Preview/View Detail">
              <FontAwesomeIcon icon={faEye} />
            </TooltipHost>
          </Link>
        </div>
      )
    }
  ];

  // Calculate summary stats
  const totalTemplates = filteredTemplates.length;
  const activeTemplates = filteredTemplates.filter(t => t.status === 'Active').length;
  const inactiveTemplates = filteredTemplates.filter(t => t.status === 'Inactive').length;
  const ectdMapped = filteredTemplates.filter(t => (t as any).mappingType === 'eCTD').length;

  if (isCreatePageOpen) {
    return (
      <UploadTemplatePage
        onCancel={() => setIsCreatePageOpen(false)}
        onSuccess={() => {
          setIsCreatePageOpen(false);
          setSuccessMessage("Template uploaded successfully.");
          setHideSuccessDialog(false);
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
        onCancel={() => setIsEditMappingOpen(false)}
        onSuccess={() => {
          setIsEditMappingOpen(false);
          setSuccessMessage("Template updated successfully.");
          setHideSuccessDialog(false);
          loadTemplates();
        }}
      />
    );
  }

  return (
    <div className="manageTemplatesContainer">
      {isLoading && <Loader />}


      {/* Breadcrumbs at the top */}
      <div style={{ marginBottom: 20 }}>
        <Breadcrumb
          items={[
            { label: 'Home', onClick: () => { } },
            { label: 'Manage Templates', isActive: true }
          ]}
        />
      </div>

      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="mainTitle">Manage Templates yyyyyyyy</h1>
        </div>
      </div>

      <>
        {/* Summary Cards */}
        <div className="summary-cards-container">
          <SummaryCard
            title="Total Templates"
            value={totalTemplates}
            icon={faFileAlt}
            color="blue"
          />
          <SummaryCard
            title="Active"
            value={activeTemplates}
            icon={faCheckCircle}
            color="green"
          />
          <SummaryCard
            title="Inactiveeee"
            value={inactiveTemplates}
            icon={faBan}
            color="red"
          />
          <SummaryCard
            title="eCTD Mapped"
            value={ectdMapped}
            icon={faClock}
            color="orange"
          />
        </div>

        {/* Filters row (below cards, above grid) */}
        <div className="ms-Grid mt-3 mb-3">
          <div className="ms-Grid-row ptop-5">
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl ims-site-pad">
                <ReactDropdown
                  name="categoryFilter"
                  options={[{ label: 'All Categories', value: 'All' }, ...categoryOptions]}
                  defaultOption={{ value: categoryFilter, label: categoryFilter === 'All' ? 'All Categories' : categoryOptions.find((c: any) => c.value === categoryFilter)?.label || 'All Categories' }}
                  onChange={(opt: any) => setCategoryFilter(opt.value)}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl ims-site-pad">
                <ReactDropdown
                  name="countryFilter"
                  options={[{ label: 'All Countries', value: 'All' }, ...countryOptions]}
                  defaultOption={{ value: countryFilter, label: countryFilter === 'All' ? 'All Countries' : countryOptions.find((c: any) => c.value === countryFilter)?.label || 'All Countries' }}
                  onChange={(opt: any) => setCountryFilter(opt.value)}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
            {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
              <div className="formControl ims-site-pad">
                <ReactDropdown
                  name="statusFilter"
                  options={[
                    { label: 'All Status', value: 'All' },
                    { label: 'Active', value: 'Active' },
                    { label: 'Inactive', value: 'Inactive' }
                  ]}
                  defaultOption={{ value: statusFilter, label: statusFilter === 'All' ? 'All Status' : statusFilter }}
                  onChange={(opt: any) => setStatusFilter(opt.value)}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Templates Content */}
        <div className="boxCard" style={{ padding: 0 }}>
          {currentView === "grid" ? (
            <MemoizedDataGridComponent
              items={filteredTemplates}
              columns={columns}
              reRenderComponent={true}
              isPagination={true}
              searchable={true}
              CustomselectionMode={isVisibleCrud.current ? 2 : 0} 
              onSelectedItem={_onItemSelected}
              isAddNew={true}
              addNewContent={
                isVisibleCrud.current ?
                <div className='dflex pb-1'>   
                    <TooltipHost content={"Add New"} id={tooltipId}>
                        <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                    </TooltipHost>

                    <Link className="actionBtn iconSize btnEdit ml-10" onClick={() => setIsExcelUploadOpen(true)}>
                      <TooltipHost content="Excel Upload" id={"tooltip-excel"}><FontAwesomeIcon icon={faFileUpload} /></TooltipHost>
                    </Link>

                    <Link className="actionBtn iconSize btnRefresh ml-10" onClick={() => { setSearchTerm(''); setStatusFilter('All'); setCategoryFilter('All'); setCountryFilter('All'); loadTemplates(); }}>
                      <TooltipHost content={"Reset & Refresh Grid"} id={"tooltip-refresh"}><FontAwesomeIcon icon={faArrowsRotate} /></TooltipHost>
                    </Link>
                    
                    <div className="grid-list-view ml-10">
                        <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`} onClick={() => handleViewChange("grid")}>
                            <TooltipHost content={"List View"} id={tooltipId}><FontAwesomeIcon icon="list" /></TooltipHost>
                        </Link>
                        <Link className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`} onClick={() => handleViewChange("card")}>
                            <TooltipHost content={"Card View"} id={tooltipId}><FontAwesomeIcon icon="th" /></TooltipHost>
                        </Link>
                    </div>
                </div> : null
              }
              addEDButton={isDisplayEDbtn && isVisibleCrud.current && <>
                <div className='dflex'>
                    {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit" onClick={onclickEdit}>
                        <TooltipHost content={"Edit Detail"} id={tooltipId}>
                            <FontAwesomeIcon icon={faPenToSquare} />
                        </TooltipHost>
                    </Link>}
                    <Link className="actionBtn iconSize btnDanger ml-10" onClick={onclickconfirmdelete}>
                        <TooltipHost content={"Delete"} id={tooltipId}>
                            <FontAwesomeIcon icon={faTrashCan} />
                        </TooltipHost>
                    </Link>
                </div>
              </>}
            />
          ) : (
            <></>
            // <div className="template-cards-container" style={{ padding: '20px' }}>
            //   <div className="card-header-actions mb-4 dflex jc-between ai-center">
            //      <div className="dflex ai-center">
            //         <TextField 
            //           placeholder="Search templates..." 
            //           value={searchTerm} 
            //           onChange={(_, val) => setSearchTerm(val || '')}
            //           styles={{ root: { width: 300 } }}
            //         />
            //      </div>
            //      <div className="dflex ai-center">
            //         <TooltipHost content={"Add New"}>
            //             <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
            //         </TooltipHost>
            //         <div className="grid-list-view ml-10">
            //             <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`} onClick={() => handleViewChange("grid")}>
            //                 <TooltipHost content={"List View"}><FontAwesomeIcon icon="list" /></TooltipHost>
            //             </Link>
            //             <Link className={`grid-list-btn ${currentView === "card" ? "active" : ""}`} onClick={() => handleViewChange("card")}>
            //                 <TooltipHost content={"Card View"}><FontAwesomeIcon icon="th" /></TooltipHost>
            //             </Link>
            //         </div>
            //      </div>
            //   </div>

            //   <div className="ms-Grid" dir="ltr">
            //     <div className="ms-Grid-row">
            //       {filteredTemplates.map((item) => {
            //         const iconInfo = FileIconHelper.getFileIcon(item.name);
            //         return (
            //           <div key={item.id} className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3 mb-3">
            //             <div className="template-card-box p-3 border-radius-8" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%' }}>
            //               <div className="dflex jc-between ai-start mb-2">
            //                 <div className="template-icon-circle" style={{ background: iconInfo.bgColor, color: iconInfo.color, width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            //                   <FontAwesomeIcon icon={iconInfo.icon} />
            //                 </div>
            //                 <StatusBadge status={item.status || 'Active'} />
            //               </div>
            //               <div className="template-card-content mb-3">
            //                 <h4 className="template-title text-ellipsis" title={item.name} style={{ margin: '0 0 8px 0', fontSize: 16 }}>{item.name}</h4>
            //                 <p className="mb-1" style={{ fontSize: 13, color: '#666' }}><strong>Version:</strong> {item.version || '1.0'}</p>
            //                 <p className="mb-1" style={{ fontSize: 13, color: '#666' }}><strong>Country:</strong> {item.country || 'N/A'}</p>
            //                 <p className="mb-0" style={{ fontSize: 13, color: '#666' }}><strong>Category:</strong> {item.category || 'N/A'}</p>
            //               </div>
            //               <div className="template-card-actions dflex jc-end gap-2 border-top pt-2">
            //                  <TooltipHost content="View">
            //                     <Link className="action-icon-btn" onClick={() => openPreview(item)}><FontAwesomeIcon icon={faEye} /></Link>
            //                  </TooltipHost>
            //                  <TooltipHost content="Edit">
            //                     <Link className="action-icon-btn text-primary" onClick={() => { setEditingTemplate(item); setIsEditMappingOpen(true); }}><FontAwesomeIcon icon={faPenToSquare} /></Link>
            //                  </TooltipHost>
            //                  <TooltipHost content="Download">
            //                     <Link className="action-icon-btn text-success" onClick={() => downloadTemplate(item)}><FontAwesomeIcon icon={faDownload} /></Link>
            //                  </TooltipHost>
            //                  <TooltipHost content="Delete">
            //                     <Link className="action-icon-btn text-danger" onClick={() => openDeleteDialog([item.id])}><FontAwesomeIcon icon={faTrashCan} /></Link>
            //                  </TooltipHost>
            //               </div>
            //             </div>
            //           </div>
            //         );
            //       })}
            //     </div>
            //   </div>
            // </div>
          )}
        </div>
      </>

      {/* Snippet 3: Custom Modal Logic */}
      {/* Validation Error Modal (Save/Edit issues) */}
      <CustomModal 
          isModalOpenProps={!hideDialog} 
          setModalpopUpFalse={() => { toggleHideDialog(); }} 
          subject={"Data Is Missing"} 
          message={returnErrorMessage() as any} 
          closeButtonText={"Close"} 
      />

      {/* Delete Confirmation Modal */}
      <CustomModal 
          isModalOpenProps={!hideDialogdelete}
          setModalpopUpFalse={_closeDeleteConfirmation}
          subject={"Delete Item"}
          message={"This item will be deleted permanently, Are you sure, you want to delete it?"}
          yesButtonText="Yes"
          closeButtonText={"No"}
          onClickOfYes={onClickRealImageDelete} 
      />

      {/* Success Message Modal (Saved / Updated Successfully) */}
      <CustomModal 
          isModalOpenProps={!hideSuccessDialog} 
          setModalpopUpFalse={() => { closeSuccessModal(); }} 
          subject={"Success"} 
          message={successMessage || "Data is saved/updated successfully."} 
          closeButtonText={"OK"} 
      />

      <Panel
        isOpen={isPreviewOpen}
        onDismiss={() => {
          setIsPreviewOpen(false);
          setPreviewingTemplate(null);
        }}
        type={PanelType.large}
        headerText={previewingTemplate ? `Template Preview - ${previewingTemplate.name}` : 'Template Preview'}
        closeButtonAriaLabel="Close"
        isLightDismiss
      >
        {previewingTemplate ? (
          <div>
            <div className="document-details" style={{ marginBottom: 12 }}>
              <div className="detail-item">
                <div className="detail-label">Category</div>
                <div className="detail-value">{previewingTemplate.category || '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Country</div>
                <div className="detail-value">{(previewingTemplate as any).country || '-'}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Mapping</div>
                <div className="detail-value">{(previewingTemplate as any).mappingType || '-'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <PrimaryButton
                className="btn btn-primary"
                onClick={() => downloadTemplate(previewingTemplate)}
                styles={{
                  root: { background: '#1E88E5', border: '1px solid rgb(30, 136, 229)' },
                  rootHovered: { background: '#1565C0', border: '1px solid rgb(30, 136, 229)' },
                  rootPressed: { background: '#0D47A1', border: '1px solid rgb(30, 136, 229)' }
                }}
              >
                <FontAwesomeIcon icon={faDownload} style={{ marginRight: 8 }} />
                Download
              </PrimaryButton>
              <DefaultButton onClick={() => { setIsPreviewOpen(false); setEditingTemplate(previewingTemplate); setIsEditMappingOpen(true); }}>
                <FontAwesomeIcon icon={faPenToSquare} style={{ marginRight: 8 }} />
                Edit
              </DefaultButton>
              <DefaultButton
                onClick={() => openDeleteDialog([previewingTemplate.id])}
                styles={{
                  root: { background: '#d32f2f', borderColor: '#d32f2f', color: '#fff' },
                  rootHovered: { background: '#c62828', borderColor: '#c62828', color: '#fff' }
                }}
              >
                <FontAwesomeIcon icon={faTrashCan} style={{ marginRight: 8 }} />
                Delete
              </DefaultButton>
            </div>

            {(() => {
              const items = previewingTemplate as any;
              const webUrl = context.pageContext.web.absoluteUrl;
              const filePath = items.serverRedirectedEmbedUrl ? items.serverRedirectedEmbedUrl : (items.fileRef ? window.location.origin + items.fileRef : "");

              if (!filePath) return <div className="field-error">Template preview URL not available.</div>;

              const embedFullFilePath = `${webUrl}/_layouts/15/Doc.aspx?sourcedoc=${items.serverRedirectedEmbedUrl || ""}&action=embedview`;
              const fileType = filePath.split('.').pop()?.toLowerCase();

              const isOfficeDoc = OFFICE_DOC_TYPES.indexOf(fileType || '') >= 0;
              const documentPath = isOfficeDoc ? embedFullFilePath : (fileType === "zip" ? `${filePath}?web=1&action=embedview` : filePath);

              return (
                <iframe
                  title={previewingTemplate.name}
                  src={documentPath}
                  style={{ width: '100%', height: '75vh', border: '1px solid #e5e5e5', borderRadius: '4px' }}
                />
              );
            })()}
          </div>
        ) : null}
      </Panel>

      <ExcelUploadModal
        isOpen={isExcelUploadOpen}
        onClose={() => setIsExcelUploadOpen(false)}
        onSuccess={() => {
          void loadTemplates();
          setIsExcelUploadOpen(false);
          setSuccessMessage('Templates uploaded from Excel successfully.');
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
