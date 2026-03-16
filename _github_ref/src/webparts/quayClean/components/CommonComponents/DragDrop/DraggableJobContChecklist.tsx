/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect } from 'react';
import { Checkbox, PrimaryButton, ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react';
import { useId } from '@fluentui/react-hooks';
import { IDataProvider } from '../../../../../DataProvider/Interface/IDataProvider';
import { ListNames } from '../../../../../Common/Enum/ComponentNameEnum';
import { Loader } from '../Loader';
import NoRecordFound from '../NoRecordFound';


interface DraggableListProps {
    data: any[];
    provider: IDataProvider;
    onSelectedRecordsChange: (selectedRecords: any[]) => void;
    flag: boolean;
    setFlag: (flag: boolean) => void;
    isEdit: boolean;
}

const DraggableJobContChecklist: React.FC<DraggableListProps> = ({ data, provider, onSelectedRecordsChange, flag, setFlag, isEdit }) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [items, setItems] = useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [orderChanged, setOrderChanged] = useState<boolean>(false);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const prevSelectedRecordsRef = React.useRef<any[]>(selectedRecords);

    useEffect(() => {
        if (Array.isArray(data)) {
            setItems(data);
            setIsLoading(false);
            setSelectedRecords([]);
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

    const updateList = async () => {
        setIsLoading(true);
        const newobj = items.map((item, index) => ({
            id: item.id,
            index: index
        }));
        await Promise.all(newobj.map((item: any) => handleUpdate(item)));
        setIsLoading(false);
        setOrderChanged(false);
    };

    const handleUpdate = async (item: any) => {
        const newFromObj = {
            Id: item.id,
            Index: item.index
        };
        await provider.updateItemWithPnP(newFromObj, ListNames.JobControlChecklist, newFromObj.Id);
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
            setFlag(false); // Reset flag after updating selectedRecords
        }
    }, [flag, setFlag]);

    const handleRowClick = (record: any) => {
        setSelectedRecords([record]); // Only allow single selection
    };

    return (
        <>
            {isLoading && <Loader />}
            {orderChanged && isEdit && <div className={window.innerWidth > 768 ? 'update-btn-wrap jcc-sideview' : 'update-btn-wrap jcc-sideview'}>
                {orderChanged && isEdit && (
                    <PrimaryButton
                        text="Save"
                        className="btn btn-primary btn-changeOrder-drag-que"
                        onClick={updateList}
                    />
                )}
            </div>}

            <div style={{ position: "relative", height: `calc(100vh - 240px)`, width: "100%" }}>

                <ScrollablePane className="ofxhide-jcc-height" initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto}>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <Droppable droppableId="assignedTeamData">
                            {(provided) => (

                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="container-drag"
                                >
                                    <div className="header-drag">
                                        {isEdit && <div className="header-cell-drag">
                                            <Checkbox
                                                onChange={handleSelectAll}
                                                checked={selectedRecords.length === items.length} />
                                        </div>}
                                        <div className="header-cell-drag jcc-question-mw">Question</div>
                                        <div className="header-cell-drag">Frequency</div>
                                    </div>
                                    <div>
                                        {items.length === 0 &&
                                            <NoRecordFound></NoRecordFound>
                                        }

                                        {items.map((item: any, index) => (
                                            <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                                                {(provided) => (

                                                    <div className="row-drag draggable-drag" draggable="true" ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => handleRowClick(item)}>
                                                        {isEdit && <div className="cell-drag checkbox-drag" onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox
                                                                onChange={() => handleCheckboxChange(item)}
                                                                checked={selectedRecords.some((record) => record.id === item.id)}
                                                            />
                                                        </div>}
                                                        <div className="cell-drag jcc-question-mw" {...provided.dragHandleProps} >{item.Title}
                                                        </div>
                                                        <div className="cell-drag">{item.Frequency}</div>
                                                    </div>

                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                </ScrollablePane>
            </div>
        </>
    );
};

export default DraggableJobContChecklist;
