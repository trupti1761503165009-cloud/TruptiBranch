import React, { memo } from 'react';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { TableData, SkillMatrixFields } from './SkillMatrixFields';
import { Dropdown } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];


export const SkillMatrixRow = memo(({ row, onCellChange, onRowSelection, selectedRows }: {
    row: TableData;
    onCellChange: (id: number, columnId: string, value: string | boolean) => void;
    onRowSelection: (id: number, checked: boolean) => void;
    selectedRows: Set<number>;
}) => (
    <>
        {window?.innerWidth <= 768 ?
            <div className="col-lg-6 col-md-12 mb-4 thumbCard" key={row[SkillMatrixFields.Id]}>
                <div className="thumbTitle position-relative">
                    <div className="card-imnage-info dflex">
                        <div className="mt-10">
                            <input
                                type="checkbox"
                                checked={selectedRows.has(row[SkillMatrixFields.Id])}
                                onChange={(e) => onRowSelection(row[SkillMatrixFields.Id], e.target.checked)}
                            />
                        </div>
                        <div>
                            <label className="card-label">Induction Training Units</label>
                            <div>{row[SkillMatrixFields.Title]}</div> {/* Read-only */}
                        </div>
                    </div>
                </div>

                <div className="row fnt-14 mx-0">
                    <div className="card-other-content">
                        <label className="card-label">IMS Nos.</label>
                        <div className="fw-medium">{row[SkillMatrixFields.IMSNos]}</div> {/* Read-only */}
                    </div>

                    <div className="card-other-content">
                        <label className="card-label">Completed</label>
                        <div className="fw-medium">
                            <Dropdown
                                selectedKey={row[SkillMatrixFields.Completed] || 'N/A'}
                                options={dropdownOptions}
                                placeholder="Select Status"
                                onChange={(e: any, option: any) => onCellChange(row[SkillMatrixFields?.Id], SkillMatrixFields?.Completed, option?.key || '')}
                            />
                        </div>
                    </div>

                    <div className="card-other-content">
                        <label className="card-label">Trainer Toggle</label>
                        <div className="fw-medium">
                            <Toggle
                                checked={row[SkillMatrixFields?.SignatureTrainer] ?? false} // Fallback to false if undefined
                                onChange={(e, checked) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields?.SignatureTrainer, checked ?? false)}
                            />
                        </div>
                    </div>

                    <div className="card-other-content">
                        <label className="card-label">Cleaner Toggle</label>
                        <div className="fw-medium">
                            <Toggle
                                checked={row[SkillMatrixFields?.SignatureCleaner] ?? false} // Fallback to false if undefined
                                onChange={(e, checked) => onCellChange(row[SkillMatrixFields?.Id], SkillMatrixFields?.SignatureCleaner, checked ?? false)}
                            />
                        </div>
                    </div>

                    <div className="card-other-content">
                        <label className="card-label">Actions</label>
                        <div className="fw-medium">
                            {row[SkillMatrixFields.IsTraining] ? (
                                <FontAwesomeIcon
                                    className="actionIcon"
                                    icon={"edit"}
                                    onClick={(e) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields.IsTraining, true)}
                                // onClick={() => onClickEdit(row[SkillMatrixFields.Id])}
                                />
                            ) : (
                                <span></span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            :
            <div className="table-row-sm" key={row[SkillMatrixFields.Id]}>
                <div className="mw-40">
                    <input
                        type="checkbox"
                        checked={selectedRows.has(row[SkillMatrixFields.Id])}
                        onChange={(e) => onRowSelection(row[SkillMatrixFields.Id], e.target.checked)}
                    />
                </div>
                <div className="text-left-sm">
                    <span>{row[SkillMatrixFields.Title]}</span> {/* Read-only */}
                </div>
                <div className="mw-160">
                    <span>{row[SkillMatrixFields.IMSNos]}</span> {/* Read-only */}
                </div>
                <div className="mw-160">
                    <Dropdown
                        selectedKey={row[SkillMatrixFields.Completed] || 'N/A'}
                        options={dropdownOptions}
                        placeholder="Select Status"
                        onChange={(e: any, option: any) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields.Completed, option?.key || '')}
                    />
                </div>
                <div className="mw-90">
                    <Toggle
                        checked={row[SkillMatrixFields.SignatureTrainer] ?? false} // Fallback to false if undefined
                        onChange={(e, checked) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields.SignatureTrainer, checked ?? false)}
                    />
                </div>
                <div className="mw-90">
                    <Toggle
                        checked={row[SkillMatrixFields.SignatureCleaner] ?? false} // Fallback to false if undefined
                        onChange={(e, checked) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields.SignatureCleaner, checked ?? false)}
                    />
                </div>
                <div className="mw-90">
                    {row[SkillMatrixFields.IsTraining] ? (
                        <FontAwesomeIcon
                            className="actionIcon"
                            icon={"edit"}
                            onClick={(e) => onCellChange(row[SkillMatrixFields.Id], SkillMatrixFields.IsTraining, true)}
                        />
                    ) : (
                        <span></span>
                    )}
                </div>
            </div>
        }
    </>
));






