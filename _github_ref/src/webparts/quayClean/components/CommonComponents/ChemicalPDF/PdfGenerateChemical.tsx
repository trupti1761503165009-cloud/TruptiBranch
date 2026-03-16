import * as React from 'react';
import ChemicalPrintPDF from './ChemicalPrintPDF';

interface PdfGenerateChemicalProps {
    siteName: string;
    qCState: string;
    ListChemical: Array<any>;
    imgLogo: string;
}

const PdfGenerateChemical: React.FC<PdfGenerateChemicalProps> = (props) => {
    return (
        <div id="pdfGenerateChemical" className="dnone">
            <div>
                <div id="pdf-content" className="apdf-container">
                    <>
                        <table width="100%" className="wts EquipmentTable">
                            <tbody>
                                <tr>
                                    <td className="pt-16 pl-16 pr-16 wts  text-start">
                                        <div className="asset-Details-Title">
                                            <img src={props.imgLogo} height="90px" width="90px" className="course-img-first" />
                                            <div>Chemical List</div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="pb-16 pl-16 pr-16 wts  text-start total-td">
                                        <span className="mb-0 headerPDF">{props?.siteName || "All Sites"}&nbsp;({props.qCState || "All States"})</span>
                                        <span className="Total">Total: {props.ListChemical.length}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </>
                    {props.ListChemical.map((chemical, index) => (
                        <ChemicalPrintPDF key={index} chemical={chemical} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PdfGenerateChemical;
