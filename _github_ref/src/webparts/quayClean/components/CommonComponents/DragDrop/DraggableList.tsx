/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Checkbox, Link, Panel, PanelType, PrimaryButton, ScrollablePane, ScrollbarVisibility, styled, TooltipHost } from 'office-ui-fabric-react';
import { useId } from '@fluentui/react-hooks';
import { IDataProvider } from '../../../../../DataProvider/Interface/IDataProvider';
import { ListNames } from '../../../../../Common/Enum/ComponentNameEnum';
import { Loader } from '../Loader';
import NoRecordFound from '../NoRecordFound';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import moment from 'moment';
import { DateFormat } from '../../../../../Common/Constants/CommonConstants';
import { CardViewAssignTeamList } from './CardViewAssignTeamList';
//import { ViewSiteImage } from '../ViewSiteImage';
const blankProfile = require('../../../assets/images/User-Paceholder.png');

interface DraggableListProps {
    onDoubleClick?: (item: any) => void;
    data: any[];
    SkillSetData: any[];
    FileData: any[];
    provider: IDataProvider;
    onSelectedRecordsChange: (selectedRecords: any[]) => void;
    flag: boolean;
    setFlag: (flag: boolean) => void;
    isSiteName: boolean;
    IsSubLocation: boolean;
    viewType: any;
}

const DraggableList = forwardRef(({
    data,
    SkillSetData,
    FileData,
    provider,
    viewType,
    onSelectedRecordsChange,
    flag,
    setFlag,
    isSiteName,
    IsSubLocation,
    onDoubleClick
}: DraggableListProps, ref) => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [items, setItems] = useState<any[]>([]);
    const [itemsSS, setItemsSS] = useState<any[]>([]);
    const [itemsFile, setItemsFile] = useState<any[]>([]);
    const [fileURL, setFileURL] = useState<string>('');
    const tooltipId = useId('tooltip');
    const [showModal, setShowModal] = useState(false);
    const [orderChanged, setOrderChanged] = useState<boolean>(false);
    const [orderCardChanged, setCardOrderChanged] = useState<boolean>(false);
    const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
    const prevSelectedRecordsRef = React.useRef<any[]>(selectedRecords);

    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);

    // Expose clearSelectedRecords to parent
    useImperativeHandle(ref, () => ({
        clearSelectedRecords: () => setSelectedRecords([])
    }));

    useEffect(() => {
        if (Array.isArray(data)) {
            setItems(data);
            setIsLoading(false);
        }
    }, [data]);

    useEffect(() => {
        if (Array.isArray(SkillSetData)) setItemsSS(SkillSetData);
    }, [SkillSetData]);

    useEffect(() => {
        if (Array.isArray(FileData)) setItemsFile(FileData);
    }, [FileData]);

    const handleOnDragEnd = (result: any) => {
        if (!result.destination) return;
        const newItems = Array.from(items);
        const [reorderedItem] = newItems.splice(result.source.index, 1);
        newItems.splice(result.destination.index, 0, reorderedItem);
        setItems(newItems);
        setOrderChanged(true);
    };
    const handleOnDragEndd = (result: any) => {
        if (!result.destination) return;

        const reorderedItems = Array.from(items);
        const [removed] = reorderedItems.splice(result.source.index, 1);
        reorderedItems.splice(result.destination.index, 0, removed);
        setItems(reorderedItems);
        setCardOrderChanged(true);
    };

    const updateList = async () => {
        setIsLoading(true);
        const newobj = items.map((item, index) => ({ id: item.id, index }));
        await Promise.all(newobj.map((item: any) => handleUpdate(item)));
        setIsLoading(false);
        setOrderChanged(false);
        setCardOrderChanged(false)
    };

    const handleUpdate = async (item: any) => {
        const newFromObj = { Id: item.id, Index: item.index };
        await provider.updateItemWithPnP(newFromObj, ListNames.SitesAssociatedTeam, newFromObj.Id);
    };

    // Sync selectedRecords with parent
    useEffect(() => {
        if (prevSelectedRecordsRef.current !== selectedRecords) {
            onSelectedRecordsChange(selectedRecords);
            prevSelectedRecordsRef.current = selectedRecords;
        }
    }, [selectedRecords, onSelectedRecordsChange]);

    // Clear selectedRecords if flag is set
    useEffect(() => {
        if (flag) {
            setSelectedRecords([]);
            setFlag(false);
        }
    }, [flag, setFlag]);

    const handleCheckboxChange = (record: any) => {
        setSelectedRecords(prevSelectedRecords =>
            prevSelectedRecords.find((r) => r.id === record.id)
                ? prevSelectedRecords.filter((r) => r.id !== record.id)  // Unselect
                : [...prevSelectedRecords, record]                       // Select
        );
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedRecords = e.target.checked ? items : [];
        setSelectedRecords(updatedRecords);
    };

    const handleRowClick = (record: any) => {
        setSelectedRecords([record]);
    };

    return (
        <>
            {isLoading && <Loader />}
            {viewType == "grid" ? (
                <>
                    {orderChanged && isSiteName !== false && <PrimaryButton text="Update Order" className="btn btn-primary btn-changeOrder" onClick={updateList} />}
                    <div style={{ position: "relative", height: `calc(100vh - 385px)`, width: "100%" }}>
                        <ScrollablePane className="ofxhideat" initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto}>
                            <DragDropContext onDragEnd={handleOnDragEnd}>
                                <Droppable droppableId="assignedTeamData">
                                    {(provided) => (
                                        <table {...provided.droppableProps} ref={provided.innerRef} className="table-theme" width="100%">
                                            {items?.length > 0 && <thead>
                                                <tr style={{ backgroundColor: '#1300a6', color: "white", }}>
                                                    <th>
                                                        <div className=''>
                                                            <Checkbox
                                                                onChange={handleSelectAll}
                                                                checked={selectedRecords.length === items.length}
                                                            />
                                                        </div>
                                                    </th>
                                                    <th className='p-w-10'>Profile Picture</th>
                                                    {isSiteName == false && <th style={{ width: '10%' }}>Site Name</th>}
                                                    <th style={{ width: '10%' }}>Employee Name</th>
                                                    <th style={{ width: '10%' }}>Role</th>
                                                    <th style={{ width: '10%' }}>Date Of Birth</th>
                                                    {IsSubLocation && <th style={{ width: '10%' }}>Location</th>}
                                                    <th style={{ width: '10%' }} colSpan={2}>Operator Type</th>
                                                    <th style={{ width: '35%' }} colSpan={2}>Skill Set</th>
                                                </tr>
                                            </thead>}
                                            <tbody>
                                                {/* {items.length === 0 && <tr><td colSpan={10}><NoRecordFound /></td></tr>} */}
                                                {items.length === 0 && <NoRecordFound />}
                                                {items.map((item: any, index) => (
                                                    <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={!isSiteName}>
                                                        {(provided) => (
                                                            <tr
                                                                onDoubleClick={() => onDoubleClick && onDoubleClick(item)}
                                                                className='card-assigned-team drag-drop-icon'
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                onClick={() => handleRowClick(item)}
                                                                style={{
                                                                    ...provided.draggableProps.style,
                                                                    backgroundColor: selectedRecords.some((r) => r.id === item.id) ? '#e0e0e0' : '#fff',
                                                                    color: '#333',
                                                                    cursor: isSiteName ? 'pointer' : '',
                                                                }}

                                                            >
                                                                {/* {isSiteName == true && <th >  <div className='dragand-Drop-icon ml-10'>
                                                                    <TooltipHost content={"Drag Employee Information"} id={tooltipId}>
                                                                        <FontAwesomeIcon icon="grip-vertical" className='drag-drop-icon' />
                                                                    </TooltipHost>
                                                                </div></th>} */}
                                                                <td style={{ width: '5%' }} onClick={(e) => e.stopPropagation()}>
                                                                    <div style={{ display: "flex", alignItems: "center" }}>
                                                                        <div className='dragand-Drop-icon mr-10'>
                                                                            <Checkbox onChange={() => handleCheckboxChange(item)} checked={selectedRecords.some((r) => r.id === item.id)} />
                                                                            {!isSiteName || isSiteName && <TooltipHost content={"Drag Employee Information"} id={tooltipId}>
                                                                                <FontAwesomeIcon icon="grip-vertical" className='drag-drop-icon' />
                                                                            </TooltipHost>}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className='p-w-10'>
                                                                    <div className="at-profile">
                                                                        {item.attachmentURl &&
                                                                            // <ViewSiteImage
                                                                            //     item={item}
                                                                            //     prefix={"EmployeePhotoImage" + item.ID}
                                                                            //     imageUrl={item.attachmentURl || blankProfile}
                                                                            //     width={75}
                                                                            //     height={75}
                                                                            //     alt="event photo"
                                                                            //     className="course-img-first"
                                                                            // />
                                                                            <LazyLoadImage src={item.attachmentURl || blankProfile}
                                                                                width={75} height={75}
                                                                                placeholderSrc={blankProfile}
                                                                                alt="user photo"
                                                                                className="course-img-first"
                                                                                effect="blur"
                                                                            />
                                                                        }
                                                                    </div>
                                                                </td>
                                                                {isSiteName == false &&
                                                                    <td style={{ width: '15%' }}><Link><TooltipHost content={item.SiteName} id={tooltipId}>{item.SiteName}</TooltipHost></Link></td>
                                                                }
                                                                <td style={{ width: '10%' }} {...provided.dragHandleProps}>
                                                                    <Link style={{ cursor: "pointer" }}>
                                                                        <TooltipHost content={item.aTUserName} id={tooltipId}>
                                                                            <div onClick={() => onDoubleClick && onDoubleClick(item)}>
                                                                                {item.aTUserName}
                                                                            </div>
                                                                        </TooltipHost>
                                                                    </Link>
                                                                </td>
                                                                <td style={{ width: '10%' }}>{item.aTRole}</td>
                                                                <td style={{ width: '10%' }}>{!!item?.DateOfBirth ? moment(item?.DateOfBirth).format(DateFormat) : undefined}</td>
                                                                {IsSubLocation && <td className='ulli' style={{ width: '10%' }}>{!!item.Location && item.Location.length > 0 && <ul>{item.Location.map((LocationName: any) => (<li key={LocationName}>{LocationName}</li>))}</ul>}</td>}
                                                                <td colSpan={2} style={{ width: '10%' }} dangerouslySetInnerHTML={{ __html: item.OperatorType?.split(', ').join('<br />') }} />
                                                                <td style={{ width: '35%' }} colSpan={2}>
                                                                    <ul className='skillsetBadgeUL'>
                                                                        {item?.Skills?.map((skillSetItem: any) => (
                                                                            <li key={skillSetItem.id} className="ss-mb5 skillsetBadge">
                                                                                <span style={{ fontWeight: "bold" }}>{skillSetItem.Title}<br /></span>
                                                                                <span className="EDLBL">{skillSetItem.CardNumber}</span><br />
                                                                                <span className="EDLBL">{skillSetItem.ExpiryDate}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
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
                        </ScrollablePane>
                    </div>
                </>
            ) : (
                <>

                    <div className="dflex" style={{ alignItems: "center", gap: "10px", float: "left", paddingLeft: "12px", marginLeft: "-10px" }}>
                        {orderCardChanged && isSiteName !== false && (
                            <PrimaryButton
                                text="Update Order"
                                className="btn btn-primary btn-Card-changeOrder"
                                onClick={updateList}
                            />
                        )}
                        {items.length > 0 && (
                            <Checkbox
                                label={
                                    selectedRecords?.length === items?.length
                                        ? "Deselect All"
                                        : "Select All"
                                }
                                className='circular-checkbox'
                                checked={selectedRecords.length === items.length}
                                onChange={handleSelectAll}
                                style={orderCardChanged ? { marginLeft: "10px" } : {}}
                            />
                        )}
                    </div>

                    <div style={{ position: "relative", height: `calc(100vh - 385px)`, width: "100%", marginTop: "20px", marginLeft: "-8px" }}>
                        <ScrollablePane className="ofxhideat" initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto}>
                            {items.length === 0 && <NoRecordFound />}
                            <DragDropContext onDragEnd={handleOnDragEndd}>
                                <Droppable droppableId="cardList" direction="horizontal">

                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className=" card-list-wrapper">

                                            {items.map((item, index) => (
                                                <Draggable key={item.id} draggableId={item.id.toString()} index={index} isDragDisabled={!isSiteName}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="drag-drop-icon"
                                                            style={{ ...provided.draggableProps.style }}
                                                        >
                                                            <CardViewAssignTeamList
                                                                data={[item]} // single item is fine
                                                                SkillSetData={SkillSetData.filter(ss => ss.AssociatedTeamId === item.id)}
                                                                selectedRecords={selectedRecords}
                                                                onCheckboxChange={handleCheckboxChange}
                                                                onDoubleClick={onDoubleClick}
                                                                isSiteName={isSiteName}
                                                            />
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </ScrollablePane>
                    </div>
                </>
            )
            }

            <Panel isOpen={showModal} onDismiss={() => closeModal()} type={PanelType.extraLarge} headerText="Document View">
                <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
            </Panel>
        </>
    );
});

export default DraggableList;
