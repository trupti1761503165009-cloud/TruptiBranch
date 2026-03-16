/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from 'react';
import { Checkbox, DefaultButton, DialogFooter, FocusTrapZone, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react';
import { IDataProvider } from '../../../../../DataProvider/Interface/IDataProvider';
import { ListNames } from '../../../../../Common/Enum/ComponentNameEnum';
import { Loader } from '../Loader';
import NoRecordFound from '../NoRecordFound';
import { useBoolean } from '@fluentui/react-hooks';



interface DraggableListProps {
    data: any[];
    provider: IDataProvider;
    onSelectedRecordsChange: (selectedRecords: any[]) => void;
    flag: boolean;
    setFlag: (flag: boolean) => void;
    selectedAssetTypeMaster: any; // Add this prop to pass the selected asset type master
    onAssetTypeMasterChange: (AssetTypeMasterId: any) => void; // Add this prop
}

const DraggableQuestionList: React.FC<DraggableListProps> = ({ data, provider, onSelectedRecordsChange, flag, setFlag, selectedAssetTypeMaster }) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [items, setItems] = useState<any[]>([]);
    const [updateItems, setUpdateItems] = useState<any[]>([]);
    const [orderChanged, setOrderChanged] = useState<boolean>(false);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const prevSelectedRecordsRef = React.useRef<any[]>(selectedRecords);
    const [lastId, setlastId] = useState<number>(0);
    const [lastitems, setlastItems] = useState<any[]>([]);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);

    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }
    });

    useEffect(() => {
        if (orderChanged == false) {
            if (Array.isArray(data)) {
                setItems(data);
                setIsLoading(false);
            }
        } else {
            setlastItems(data);
        }
    }, [data]);

    const handleOnDragEnd = (result: any) => {
        if (!result.destination) return;
        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);
        setItems(newItems);
        setOrderChanged(true);
    };

    const onClickCancel = () => {
        if (lastitems?.length > 0) {
            setItems(lastitems);
            setTimeout(() => {
                setlastItems([]);
            }, 1000);
        }
        setOrderChanged(false);
        hidePopup();
    };

    const chunkArray = (array: any[], size: number) => {
        const chunked = [];
        for (let i = 0; i < array.length; i += size) {
            chunked.push(array.slice(i, i + size));
        }
        return chunked;
    };

    const updateList = async () => {
        setIsLoading(true);
        const newobj = items.map((item, index) => ({
            id: item.ID,
            index: index
        }));
        const filteredData = newobj.filter((newItem: { id: string; index: number; }) => {
            const originalItem = items.find((dataItem: any) => dataItem.ID === newItem.id);
            return originalItem ? originalItem.Index !== newItem.index : true;
        });
        const chunkedData = chunkArray(filteredData, 50);

        try {
            await Promise.all(chunkedData.map((chunk: any) => {
                const itemsToUpdate = chunk.map((item: any) => ({
                    Id: Number(item.id),
                    Index: item.index
                }));
                return provider.updateListItemsInBatchPnP(ListNames.QuestionMaster, itemsToUpdate);
            }));
            console.log("All items updated successfully");
        } catch (error) {
            console.error("Error updating items:", error);
        } finally {
            setIsLoading(false);
            setOrderChanged(false);
            hidePopup();
            if (lastitems?.length > 0) {
                setItems(lastitems);
                setTimeout(() => {
                    setlastItems([]);
                }, 1000);

            }
        }
    };

    useEffect(() => {
        if (prevSelectedRecordsRef.current !== selectedRecords) {
            onSelectedRecordsChange(selectedRecords);
            prevSelectedRecordsRef.current = selectedRecords;
        }
    }, [selectedRecords, onSelectedRecordsChange]);

    const handleCheckboxChange = (record: any) => {
        setSelectedRecords((prevSelectedRecords) => {
            const updatedRecords = prevSelectedRecords.find((selectedRecord) => selectedRecord.id === record.id)
                ? prevSelectedRecords.filter((selectedRecord) => selectedRecord.id !== record.id)
                : [...prevSelectedRecords, record];
            return updatedRecords;
        });
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedRecords = e.target.checked ? items : [];
        setSelectedRecords(updatedRecords);
    };

    useEffect(() => {
        if (flag) {
            setSelectedRecords([]);
            setFlag(false);
        }
    }, [flag, setFlag]);

    useEffect(() => {
        if (lastId > 0 && selectedAssetTypeMaster !== "") {
            if (lastId != selectedAssetTypeMaster && orderChanged) {
                showPopup();
            }
        }
        setlastId(selectedAssetTypeMaster);
    }, [selectedAssetTypeMaster]);

    const handleRowClick = (record: any) => {
        setSelectedRecords([record]);
    };

    return (
        <>
            {isLoading && <Loader />}
            <div className='update-btn-wrap'>

                {orderChanged && selectedAssetTypeMaster && (
                    <PrimaryButton
                        text="Save"
                        className="btn btn-primary btn-changeOrder-drag-que"
                        onClick={updateList}
                    />
                )}
            </div>
            <div style={{ position: "relative", height: 'calc(100vh - 275px)', width: "100%" }}>
                <ScrollablePane className="ofxhide" initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto}>
                    {selectedAssetTypeMaster ? (
                        <DragDropContext onDragEnd={handleOnDragEnd}>
                            <Droppable droppableId="assignedTeamData">
                                {(provided) => (
                                    <table
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="table-theme"
                                    >
                                        <thead className="sticky-tbl-header">
                                            <tr style={{ backgroundColor: '#1300a6', color: "white", }}>
                                                <th>
                                                    <div className=''>
                                                        <Checkbox
                                                            onChange={handleSelectAll}
                                                            checked={selectedRecords.length === items.length}
                                                        />
                                                    </div>
                                                </th>
                                                <th>Question</th>
                                                <th>Manufacturer</th>
                                                <th>Options</th>
                                                <th>Is Required</th>
                                                <th>Question Type</th>
                                                <th>Checklist Type</th>
                                                <th>Asset Type</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.length === 0 && <tr>
                                                <td colSpan={8}>
                                                    <NoRecordFound></NoRecordFound>
                                                </td>
                                            </tr>}

                                            {items.map((item: any, index) => (
                                                <Draggable key={item.ID} draggableId={item.ID.toString()} index={index}>
                                                    {(provided) => (
                                                        <tr className='card-drag-question'
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => handleRowClick(item)}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                backgroundColor: selectedRecords.some((record) => record.ID === item.ID) ? '#e0e0e0' : '#fff',
                                                                color: '#333',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            <td onClick={(e) => e.stopPropagation()}>
                                                                <Checkbox
                                                                    onChange={() => handleCheckboxChange(item)}
                                                                    checked={selectedRecords.some((record) => record.ID === item.ID)}
                                                                />
                                                            </td>
                                                            <td {...provided.dragHandleProps}>{item?.Title}</td>
                                                            <td>{item?.Manufacturer}</td>
                                                            <td>{item?.SpaceOption}</td>
                                                            <td>{item?.IsRequired}</td>
                                                            <td>{item?.QuestionType}</td>
                                                            <td>{item?.ChecklistType}</td>
                                                            <td>{item?.AssetType}</td>
                                                        </tr>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </tbody>
                                    </table>
                                )}
                            </Droppable>
                        </DragDropContext>
                    ) : (
                        <table className="table-theme">
                            <thead className="sticky-tbl-header">
                                <tr style={{ backgroundColor: '#1300a6', color: "white", }}>
                                    <th>
                                        <div className=''>
                                            <Checkbox
                                                onChange={handleSelectAll}
                                                checked={selectedRecords.length === items.length}
                                            />
                                        </div>
                                    </th>
                                    <th>Question</th>
                                    <th>Manufacturer</th>
                                    <th>Options</th>
                                    <th>Is Required</th>
                                    <th>Question Type</th>
                                    <th>Checklist Type</th>
                                    <th>Asset Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 && <tr>
                                    <td colSpan={8}>
                                        <NoRecordFound></NoRecordFound>
                                    </td>
                                </tr>}

                                {items.map((item: any) => (
                                    <tr
                                        className='card-drag-question'
                                        onClick={() => handleRowClick(item)}
                                        style={{
                                            backgroundColor: selectedRecords.some((record) => record.ID === item.ID) ? '#e0e0e0' : '#fff',
                                            color: '#333',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <td onClick={(e) => e.stopPropagation()}>
                                            <Checkbox
                                                onChange={() => handleCheckboxChange(item)}
                                                checked={selectedRecords.some((record) => record.ID === item.ID)}
                                            />
                                        </td>
                                        <td>{item?.Title}</td>
                                        <td>{item?.Manufacturer}</td>
                                        <td>{item?.SpaceOption}</td>
                                        <td>{item?.IsRequired}</td>
                                        <td>{item?.QuestionType}</td>
                                        <td>{item?.ChecklistType}</td>
                                        <td>{item?.AssetType}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </ScrollablePane>
            </div>
            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Confirmation</h2>
                                <div className='mt-3'>You have an unsaved order, Do you want to save this order?</div>
                                <DialogFooter>
                                    <PrimaryButton text="Yes" onClick={updateList} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="No" onClick={onClickCancel} className='secondMain btn btn-danger' />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}
        </>
    );
};

export default DraggableQuestionList;
