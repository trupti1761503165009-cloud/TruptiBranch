import * as React from 'react';
import { PrimaryButton, DefaultButton, ProgressIndicator, MessageBar, MessageBarType } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExcel, faUpload, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { CustomModal } from '../../../../Common/CustomModal';
import DragandDropFilePicker from '../../../../Common/dragandDrop/DragandDropFilePicker';
import { ExcelHelper } from '../../../utils/excelHelper';
import { showToast } from '../../../../Common/Toast/toastBus';

interface ExcelUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  provider: any;
  categories: Array<{ id: number; name: string }>;
  countries: Array<{ id: number; name: string }>;
  ctdFolders: Array<{ id: number; name: string }>;
  ectdSections: Array<{ id: number; name: string }>;
}

export const ExcelUploadModal: React.FC<ExcelUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  provider,
  categories,
  countries,
  ctdFolders,
  ectdSections
}) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [parseResult, setParseResult] = React.useState<any>(null);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadResults, setUploadResults] = React.useState<{
    success: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const handleFileSelection = (files: any[]) => {
    const file = files[0]?.file || files[0];
    setSelectedFile(file);
    setParseResult(null);
    setUploadResults(null);
  };

  const handleParseExcel = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    try {
      const parsed = await ExcelHelper.parseExcelFile(selectedFile);
      if (parsed.success) {
        const validated = ExcelHelper.validateTemplateData(parsed.data);
        setParseResult(validated);
        if (!validated.success) {
          showToast({ type: 'error', message: `Found ${validated.errors.length} validation errors` });
        } else {
          showToast({ type: 'success', message: `Validated ${validated.data.length} rows successfully` });
        }
      } else {
        showToast({ type: 'error', message: parsed.errors[0] || 'Failed to parse Excel' });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Failed to process Excel file' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    if (!parseResult || !parseResult.success || !provider) return;

    setIsProcessing(true);
    setUploadProgress(0);
    const results = { success: 0, failed: 0, errors: [] as string[] };

    for (let i = 0; i < parseResult.data.length; i++) {
      const row = parseResult.data[i];
      setUploadProgress(((i + 1) / parseResult.data.length) * 100);

      try {
        // Find matching IDs from lookups
        const categoryId = categories.find(c => c.name.toLowerCase() === row.category.toLowerCase())?.id || 0;
        const countryId = countries.find(c => c.name.toLowerCase() === row.country.toLowerCase())?.id || 0;
        const mappedCTDFolderId = row.mappedCTDFolder
          ? ctdFolders.find(f => f.name.toLowerCase().includes(row.mappedCTDFolder.toLowerCase()))?.id || 0
          : 0;
        const ectdSectionId = row.ectdSection
          ? ectdSections.find(s => s.name.toLowerCase().includes(row.ectdSection.toLowerCase()))?.id || 0
          : 0;

        const metadata = {
          Title: row.name,
          CategoryId: categoryId || null,
          CountryId: countryId || null,
          Status: row.status || 'Active',
          MappingType: row.mappingType || 'None',
          MappedCTDFolderId: mappedCTDFolderId || null,
          eCTDSectionId: ectdSectionId || null,
          eCTDSubsection: row.ectdSubsection || '',
          IsEctdMapped: row.mappingType === 'eCTD' ? '1' : '0',
          UploadDate: new Date().toISOString()
        };

        await provider.createItem(metadata, 'Templates');
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1} (${row.name}): ${error.message || 'Upload failed'}`);
      }
    }

    setUploadResults(results);
    setIsProcessing(false);
    
    if (results.success > 0) {
      showToast({ 
        type: results.failed > 0 ? 'warning' : 'success',
        message: `Uploaded ${results.success} templates. ${results.failed} failed.`
      });
      onSuccess();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParseResult(null);
    setUploadResults(null);
    setUploadProgress(0);
    onClose();
  };

  return (
    <CustomModal
      isModalOpenProps={isOpen}
      setModalpopUpFalse={handleClose}
      subject="Excel Bulk Upload - Templates"
      isLoading={isProcessing}
      closeButtonText="Close"
      dialogWidth="700px"
      message={
        <div>
          <MessageBar messageBarType={MessageBarType.info} style={{ marginBottom: 16 }}>
            <strong>Excel Format:</strong> Template Name, Category, Country, Status, Mapping Type, Mapped CTD Folder, eCTD Section, eCTD Subsection
          </MessageBar>

          {!uploadResults && (
            <>
              <div style={{ marginBottom: 20 }}>
                <label className="form-label">Upload Excel File</label>
                <DragandDropFilePicker setFilesToState={handleFileSelection} isMultiple={false} />
                {selectedFile && (
                  <div style={{ marginTop: 10, fontSize: 13, color: '#333' }}>
                    <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: 8, color: '#217346' }} />
                    <strong>{selectedFile.name}</strong> ({(selectedFile.size / 1024).toFixed(2)} KB)
                  </div>
                )}
              </div>

              {parseResult && (
                <div style={{ marginTop: 20 }}>
                  {parseResult.success ? (
                    <MessageBar messageBarType={MessageBarType.success}>
                      <FontAwesomeIcon icon={faCheckCircle} style={{ marginRight: 8 }} />
                      <strong>Validation Passed:</strong> {parseResult.data.length} rows ready to upload
                    </MessageBar>
                  ) : (
                    <MessageBar messageBarType={MessageBarType.error}>
                      <FontAwesomeIcon icon={faExclamationCircle} style={{ marginRight: 8 }} />
                      <strong>Validation Failed:</strong> {parseResult.errors.length} errors found
                      <ul style={{ marginTop: 8, marginLeft: 20 }}>
                        {parseResult.errors.slice(0, 5).map((err: string, idx: number) => (
                          <li key={idx}>{err}</li>
                        ))}
                        {parseResult.errors.length > 5 && <li>... and {parseResult.errors.length - 5} more</li>}
                      </ul>
                    </MessageBar>
                  )}
                  {parseResult.warnings.length > 0 && (
                    <MessageBar messageBarType={MessageBarType.warning} style={{ marginTop: 10 }}>
                      <strong>Warnings:</strong>
                      <ul style={{ marginTop: 8, marginLeft: 20 }}>
                        {parseResult.warnings.slice(0, 3).map((warn: string, idx: number) => (
                          <li key={idx}>{warn}</li>
                        ))}
                      </ul>
                    </MessageBar>
                  )}
                </div>
              )}

              {isProcessing && uploadProgress > 0 && (
                <div style={{ marginTop: 20 }}>
                  <ProgressIndicator label="Uploading templates..." percentComplete={uploadProgress / 100} />
                </div>
              )}
            </>
          )}

          {uploadResults && (
            <div>
              <MessageBar 
                messageBarType={uploadResults.failed === 0 ? MessageBarType.success : MessageBarType.warning}
                style={{ marginBottom: 16 }}
              >
                <strong>Upload Complete:</strong> {uploadResults.success} successful, {uploadResults.failed} failed
              </MessageBar>
              {uploadResults.errors.length > 0 && (
                <div style={{ maxHeight: 200, overflow: 'auto', background: '#fff3e0', padding: 10, borderRadius: 4 }}>
                  <strong>Errors:</strong>
                  <ul style={{ marginTop: 8, marginLeft: 20, fontSize: 13 }}>
                    {uploadResults.errors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      }
      yesButtonText={
        uploadResults ? undefined : parseResult?.success ? 'Upload to SharePoint' : 'Validate Excel'
      }
      onClickOfYes={uploadResults ? undefined : parseResult?.success ? handleUpload : handleParseExcel}
      isYesButtonDisbale={!selectedFile || isProcessing}
    />
  );
};
