// import React, { useState } from 'react';
// import { generateAndSaveKendoPDF } from '../../../../../../Common/Util';

// const PdfGenerator: React.FC = () => {
//     const [files, setFiles] = useState<File[]>([]);

//     // Handle file selection
//     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//         const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
//         setFiles(selectedFiles);
//     };

//     // Generate PDF directly from images
//     const handleSavePdf = async () => {
//         const imageUrls = files.map(file => URL.createObjectURL(file));  // Create URLs for images
//         // Create a hidden container with images
//         const container = document.createElement('div');
//         container.id = 'DetailToolboxTalkPDFCode';
//         container.innerHTML = imageUrls
//             .map(url => `<img src="${url}" style="width:100%; max-height:500px; object-fit:contain; margin-bottom:10px;" />`)
//             .join('');
//         document.body.appendChild(container);  // Temporarily add to DOM

//         try {
//             await generateAndSaveKendoPDF('DetailToolboxTalkPDFCode', `Toolbox Talk`, false, true);
//         } catch (error) {
//             console.error('Failed to generate PDF:', error);
//         }

//         document.body.removeChild(container);  // Clean up after generating PDF
//     };

//     return (
//         <div style={{ padding: '20px' }}>
//             <h2>Upload Images to Generate PDF</h2>
//             <input type="file" accept="image/*" multiple onChange={handleFileChange} />

//             {files.length > 0 && (
//                 <div style={{ marginTop: '20px' }}>
//                     <button onClick={handleSavePdf}>Save as PDF</button>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default PdfGenerator;
