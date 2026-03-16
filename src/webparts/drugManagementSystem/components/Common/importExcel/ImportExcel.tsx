import * as React from 'react';
import { DefaultButton, PrimaryButton, ProgressIndicator } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
require("../../../assets/css/styles.css");


import { importExcelData } from './importExcelData';
import DragandDropFilePicker from '../dragandDrop/DragandDropFilePicker';

import { DialogComponent } from '../Dialogs/DialogComponent';
import { ModalDialog } from '../Dialogs/ModalDialog';
import { Loader } from '../Loader/Loader';
import { ListNames } from '../../../../Shared/Enum/ListNames';

type Props = {
   columnsToRead: any[];
   listName: ListNames;
   cancelOrSuccessClick: () => void;
}

export const ImportExcel = React.memo((props: Props) => {
   const { columnsToRead, listName, cancelOrSuccessClick } = props
   const {
      files,
      isLoading,
      isModalOpen,
      errorMessages,
      dialogHeader,
      dialogMessage,
      hideDialog,
      isSuccess,
      percentComplete,
      showModal,
      hideModal,
      toggleHideDialog,
      onSuccessClick,
      onClickCloseModel,
      onSaveFiles,
      onFileSelected
   } = importExcelData({ columnsToRead, listName, cancelOrSuccessClick });

   return (
      <>
         {isLoading && <Loader />}
         <ModalDialog header="Upload Excel" isModalOpen={isModalOpen} hideModal={hideModal} dialogWidth={"850px"}>
            <DragandDropFilePicker
               isMultiple={false}
               setFilesToState={onFileSelected}
            />
            <div className="ms-Grid">
               <div className="ms-Grid-row">
                  <div className="ms-Grid-col ms-lg12 mb16">
                     <PrimaryButton disabled={(!!files && files.length > 0) ? false : true} className={'btn btn-primary'}
                        onClick={onSaveFiles}>Upload</PrimaryButton>
                     <DefaultButton className='btn btn-danger marleft' onClick={onClickCloseModel}>Close</DefaultButton>
                  </div>
               </div>
            </div>
            {isLoading && <div className="progress-fileUpload">
               <div className="ms-Grid">
                  <div className="ms-Grid-row">
                     <div className="ms-Grid-col ms-lg12 mb16">
                        <div className="progress-Content">
                           <ProgressIndicator label="Creating Items"
                              description={`Please wait creating items...`}
                              ariaValueText="Please wait creating items..."
                              barHeight={10}
                              percentComplete={percentComplete || 0}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            }
         </ModalDialog>

         <PrimaryButton className="btn-primary import-Excel" onClick={showModal}>
            <FontAwesomeIcon icon={"file-upload"} /> <span className='m-l-5'>Upload Excel</span>
         </PrimaryButton>

         <DialogComponent
            dialogHeader={`${dialogHeader}`}
            message={`${dialogMessage}`}
            hideDialog={hideDialog}
            toggleHideDialog={toggleHideDialog}
            isSuccess={isSuccess}
            cancelOrSuccessClick={onSuccessClick}
         >
            {(errorMessages && errorMessages.length > 0) && (
               <ul>
                  {errorMessages?.map((error, ind) => <li key={ind}>{error}</li>)}
               </ul>
            )}
         </DialogComponent>
      </>
   );
});

