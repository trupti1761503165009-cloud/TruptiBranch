import * as React from "react";
import { TextField, IconButton } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import CustomModal from "../../CommonComponents/CustomModal";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { AsssetTypeManufacturerFilter } from "../../../../../Common/Filter/AssetTypeManufacturerFilter";
import { HMHFilterFilter } from "../../../../../Common/Filter/HowManyHoursFilter";
import { toastService } from "../../../../../Common/ToastService";

interface IManageAssetTypeCategoriesDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    provider: IDataProvider;
    siteNameId?: any;
    onAfterChange?: () => void;
    moduleImg: string;
}

export const ManageAssetTypeCategoriesDrawer: React.FC<IManageAssetTypeCategoriesDrawerProps> = ({
    isOpen,
    onClose,
    provider,
    siteNameId,
    onAfterChange,
    moduleImg
}) => {

    /* -------------------- STATE -------------------- */

    const [assetTypes, setAssetTypes] = React.useState<any[]>([]);
    const [groupedAssetTypes, setGroupedAssetTypes] = React.useState<any>({});
    const [searchText, setSearchText] = React.useState("");

    const [openManufacturers, setOpenManufacturers] = React.useState<string[]>([]);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = React.useState(false);
    const [isEditMode, setIsEditMode] = React.useState(false);

    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>("");
    const [selectedHMH, setSelectedHMH] = React.useState<any>("");

    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [deleteItem, setDeleteItem] = React.useState<any>(null);

    const [assetTypeForm, setAssetTypeForm] = React.useState<any>({
        Id: 0,
        Title: "",
        Manufacturer: "",
        HowManyHours: ""
    });

    const [showValidation, setShowValidation] = React.useState(false);

    /* -------------------- DATA LOAD -------------------- */

    const loadAssetTypes = async () => {
        const query: IPnPQueryOptions = {
            listName: ListNames.AssetTypeMaster,
            select: ["Id,Title,Manufacturer,HowManyHours"],
            filter: "IsDeleted ne 1"
        };

        const data = await provider.getItemsByQuery(query);
        setAssetTypes(data);
    };

    React.useEffect(() => {
        if (isOpen) {
            loadAssetTypes();
        }
    }, [isOpen]);

    /* -------------------- GROUP -------------------- */

    React.useEffect(() => {
        const grouped = assetTypes.reduce((acc: any, item: any) => {
            const manufacturerName =
                item.Manufacturer && item.Manufacturer.trim()
                    ? item.Manufacturer
                    : "Unknown";

            acc[manufacturerName] = acc[manufacturerName] || [];
            acc[manufacturerName].push(item);
            return acc;
        }, {});

        // Sort manufacturers alphabetically
        const sortedGrouped: any = {};
        Object.keys(grouped)
            .sort((a, b) => a.localeCompare(b))
            .forEach(key => {
                sortedGrouped[key] = grouped[key];
            });

        setGroupedAssetTypes(sortedGrouped);
    }, [assetTypes]);

    /* -------------------- SEARCH FILTER (useMemo) -------------------- */

    const filteredGroupedAssetTypes = React.useMemo(() => {
        if (!searchText) return groupedAssetTypes;

        const search = searchText.toLowerCase();
        const filtered: any = {};

        Object.keys(groupedAssetTypes).forEach((manufacturer) => {
            const matchedItems = groupedAssetTypes[manufacturer].filter((item: any) =>
                item.Title?.toLowerCase().includes(search)
            );

            if (matchedItems.length > 0) {
                filtered[manufacturer] = matchedItems.sort((a: any, b: any) =>
                    a.Title.localeCompare(b.Title)
                );
            }
        });

        return filtered;
    }, [searchText, groupedAssetTypes]);

    /* -------------------- AUTO EXPAND ON SEARCH -------------------- */

    React.useEffect(() => {
        if (searchText) {
            setOpenManufacturers(Object.keys(filteredGroupedAssetTypes));
        }
    }, [searchText, filteredGroupedAssetTypes]);

    /* -------------------- ACCORDION -------------------- */

    const toggleManufacturerAccordion = (manufacturer: string) => {
        setOpenManufacturers(prev =>
            prev.includes(manufacturer)
                ? prev.filter(x => x !== manufacturer)
                : [...prev, manufacturer]
        );
    };

    /* -------------------- FORM HELPERS -------------------- */

    const resetAssetTypeForm = () => {
        setAssetTypeForm({ Id: 0, Title: "", Manufacturer: "", HowManyHours: "" });
        setSelectedManufacturer("");
        setSelectedHMH("");
        setIsEditMode(false);
        setShowValidation(false);
    };

    const toggleAddAssetType = () => {
        if (!isAddDrawerOpen) {
            resetAssetTypeForm(); // reset only when opening
        }
        setIsAddDrawerOpen(prev => !prev);
    };

    /* -------------------- EDIT -------------------- */

    const handleEditAssetType = (item: any) => {
        setIsAddDrawerOpen(true);
        setIsEditMode(true);

        setAssetTypeForm({
            Id: item.Id,
            Title: item.Title,
            Manufacturer: item.Manufacturer,
            HowManyHours: item.HowManyHours
        });

        setSelectedManufacturer(item.Manufacturer);
        setSelectedHMH(item.HowManyHours);
    };

    /* -------------------- SAVE -------------------- */

    const handleSaveAssetType = async () => {
        if (!assetTypeForm.Title || !assetTypeForm.Manufacturer || !assetTypeForm.HowManyHours) {
            setShowValidation(true);
            return;
        }

        const toastId = toastService.loading('Loading...');

        try {
            if (isEditMode) {
                await provider.updateItemWithPnP(
                    assetTypeForm,
                    ListNames.AssetTypeMaster,
                    assetTypeForm.Id
                );

                toastService.updateLoadingWithSuccess(
                    toastId,
                    'Asset Type updated successfully!'
                );
            } else {
                await provider.createItem(
                    assetTypeForm,
                    ListNames.AssetTypeMaster
                );

                toastService.updateLoadingWithSuccess(
                    toastId,
                    'Asset Type added successfully!'
                );
            }

            resetAssetTypeForm();
            setIsAddDrawerOpen(false);
            await loadAssetTypes();
            onAfterChange?.();

        } catch (error) {
            toastService.showError(
                toastId,
                'Something went wrong!'
            );
        }
    };

    /* -------------------- DELETE -------------------- */

    const handleDeleteAssetType = (item: any) => {
        setDeleteItem(item);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeleteAssetType = async () => {
        if (!deleteItem) return;

        const toastId = toastService.loading('Loading...');

        try {
            await provider.updateItemWithPnP(
                { IsDeleted: true },
                ListNames.AssetTypeMaster,
                deleteItem.Id
            );

            toastService.updateLoadingWithSuccess(
                toastId,
                'Asset Type deleted successfully!'
            );

            setIsDeleteConfirmOpen(false);
            setDeleteItem(null);

            await loadAssetTypes();
            onAfterChange?.();

        } catch (error) {
            toastService.showError(
                toastId,
                'Failed to delete Asset Type'
            );
        }
    };

    /* -------------------- RENDER -------------------- */

    return (
        <>
            {isOpen && <div className="overlay show" onClick={onClose} />}

            <aside className={`drawer asset-type-drawer ${isOpen ? "open" : ""}`}>
                <div className="flex items-center mb-3 justify-between">
                    <h3>Manage Asset Type</h3>
                    <button className="btn" onClick={onClose}>✕</button>
                </div>

                <div className="position-relative">
                    <button
                        className="btn btn-primary AddCategory-btn mb-3"
                        style={{ width: "100%" }}
                        onClick={toggleAddAssetType}
                    >
                        {isAddDrawerOpen ? "Close" : "Add Asset Type"}
                    </button>

                    {isAddDrawerOpen && (
                        <div className={`addCategory-drawer ${isAddDrawerOpen ? "show" : ""}`}>
                            <div className="mb-3">
                                <AsssetTypeManufacturerFilter
                                    selectedManufacturer={selectedManufacturer}
                                    onManufacturerChange={(m: any) => {
                                        setSelectedManufacturer(m.value);
                                        setAssetTypeForm((prev: any) => ({ ...prev, Manufacturer: m.value }));
                                    }}
                                    provider={provider}
                                />
                            </div>
                            <div className="mb-3">
                                <TextField
                                    className="mt-2"
                                    placeholder="Enter Asset Type"
                                    value={assetTypeForm.Title}
                                    onChange={(_, value) =>
                                        setAssetTypeForm((prev: any) => ({ ...prev, Title: value }))
                                    }
                                />
                            </div>
                            <div className="mb-3">
                                <HMHFilterFilter
                                    selectedHMH={selectedHMH}
                                    defaultOption={selectedHMH}   // ✅ REQUIRED FOR EDIT MODE
                                    onHMHChange={(val: any) => {
                                        setSelectedHMH(val);
                                        setAssetTypeForm((prev: any) => ({ ...prev, HowManyHours: val }));
                                    }}
                                    provider={provider}
                                />
                            </div>
                            <div className="flex gap8 mt-2">
                                <button className="btn btn-primary" onClick={handleSaveAssetType}>
                                    {isEditMode ? "Update" : "Save"}
                                </button>
                                <button
                                    className="btn"
                                    onClick={() => {
                                        resetAssetTypeForm();
                                        setIsAddDrawerOpen(false); // ✅ CLOSE FORM
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <input
                    placeholder="Search Asset Type..."
                    className="qc-form-control mb-3"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />

                <h4 className="muted mb-2">Existing Asset Types</h4>

                {Object.keys(filteredGroupedAssetTypes).map((manufacturer) => (
                    <div key={manufacturer}>
                        <button
                            className="cat-btn"
                            onClick={() => toggleManufacturerAccordion(manufacturer)}
                        >
                            <span className="accordion-icon">
                                <img src={moduleImg} />
                            </span>
                            {manufacturer}
                            <span style={{ marginLeft: "auto" }}>
                                <span className="summary-right">
                                    {openManufacturers.includes(manufacturer)
                                        ? <FontAwesomeIcon icon={faAngleDown} />
                                        : <FontAwesomeIcon icon={faAngleRight} />}
                                </span>
                            </span>
                        </button>

                        {openManufacturers.includes(manufacturer) &&
                            filteredGroupedAssetTypes[manufacturer].map((item: any) => (
                                <div key={item.Id} className="categories-content hover-row">
                                    <div className="flex gap8 justify-between align-center w100">
                                        <div>
                                            {item.Title}
                                            <div className="flex">
                                                <span className="badge-text">{manufacturer}</span>
                                                <span className="hours-text">({item.HowManyHours})</span>
                                            </div>
                                        </div>

                                        <div className="row-actions">
                                            <IconButton
                                                iconProps={{ iconName: "Edit" }}
                                                title="Edit"
                                                ariaLabel="Edit Asset Type"
                                                onClick={() => handleEditAssetType(item)}
                                                styles={{
                                                    root: { color: "#f59e0b" },
                                                    rootHovered: { background: "#fff7ed" }
                                                }}
                                            />
                                            <IconButton
                                                iconProps={{ iconName: "Delete" }}
                                                title="Delete"
                                                ariaLabel="Delete Asset Type"
                                                onClick={() => handleDeleteAssetType(item)}
                                                styles={{
                                                    root: { color: "#dc3545" },
                                                    rootHovered: { background: "#fee2e2" }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                ))}

                {Object.keys(filteredGroupedAssetTypes).length === 0 && (
                    <div className="muted" style={{ padding: "12px 4px" }}>
                        No Asset Type found
                    </div>
                )}
            </aside>

            {showValidation && (
                <CustomModal
                    subject="Missing data"
                    message={
                        <ul>
                            {!assetTypeForm.Title && <li>Asset Type is required</li>}
                            {!assetTypeForm.Manufacturer && <li>Manufacturer is required</li>}
                            {!assetTypeForm.HowManyHours && <li>How Many Hours is required</li>}
                        </ul>
                    }
                    isModalOpenProps
                    setModalpopUpFalse={() => setShowValidation(false)}
                    closeButtonText="Close"
                />
            )}

            {isDeleteConfirmOpen && (
                <CustomModal
                    isModalOpenProps={isDeleteConfirmOpen}
                    setModalpopUpFalse={() => {
                        setIsDeleteConfirmOpen(false);
                        setDeleteItem(null);
                    }}
                    subject="Delete Asset Type"
                    message={`Are you sure you want to delete "${deleteItem?.Title}"?`}
                    yesButtonText="Yes"
                    closeButtonText="No"
                    onClickOfYes={confirmDeleteAssetType}
                />
            )}

        </>
    );
};