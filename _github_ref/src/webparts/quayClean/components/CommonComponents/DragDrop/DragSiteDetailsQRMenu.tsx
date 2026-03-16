/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from 'react-beautiful-dnd';

import {
    Checkbox,
    TextField,
    PrimaryButton
} from 'office-ui-fabric-react';

import {
    useState,
    useImperativeHandle,
    forwardRef,
    useEffect
} from 'react';

/* ---------- Types ---------- */

export interface ISectionItem {
    key: string;
    show: boolean;
    label: string;
    order: number;
}

export interface ISectionOrderManagerProps {
    context: any;
    provider: any;
    SiteId: any;
    resetFlag?: boolean;
    SiteDetailsQRMenu?: {
        sections: ISectionItem[];
    } | null;

}

export interface ISectionOrderManagerRef {
    getJson: () => { sections: ISectionItem[] };
}

/* ---------- Default Data ---------- */

const DEFAULT_SECTIONS: ISectionItem[] = [
    { key: 'clientFeedback', show: true, label: 'Client Feedback', order: 1 },
    { key: 'chemicalSDS', show: true, label: 'Chemical SDS', order: 2 },
    { key: 'equipmentAssets', show: true, label: 'Equipment Assets', order: 3 },
    { key: 'siteManualSwms', show: true, label: 'Site Manual & SWMS', order: 4 }
];


/* ---------- Component ---------- */

const getDefaultSections = (
    SiteDetailsQRMenu?: { sections: ISectionItem[] } | null
): ISectionItem[] => {

    if (
        SiteDetailsQRMenu &&
        Array.isArray(SiteDetailsQRMenu.sections) &&
        SiteDetailsQRMenu.sections.length > 0
    ) {
        return [...SiteDetailsQRMenu.sections]
            .sort((a, b) => a.order - b.order)
            .map(item => ({ ...item }));
    }

    return DEFAULT_SECTIONS.map(item => ({ ...item }));
};


const SectionOrderManager = forwardRef<
    ISectionOrderManagerRef,
    ISectionOrderManagerProps
>((props, ref) => {
    const { context, provider, SiteId, resetFlag, SiteDetailsQRMenu } = props;
    // const [sections, setSections] = useState<ISectionItem[]>(DEFAULT_SECTIONS);
    const [sections, setSections] = React.useState<ISectionItem[]>(
        () => getDefaultSections(SiteDetailsQRMenu)
    );
    const [editKey, setEditKey] = useState<string | null>(null);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;

        const items = Array.from(sections);
        const [moved] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, moved);

        const updated = items.map((item, index) => ({
            ...item,
            order: index + 1
        }));

        setSections(updated);
    };

    React.useEffect(() => {
        setSections(getDefaultSections(SiteDetailsQRMenu));
    }, [resetFlag, SiteDetailsQRMenu]);

    useEffect(() => {
        if (resetFlag) {
            setSections(
                DEFAULT_SECTIONS.map(item => ({ ...item }))
            );
        }
    }, [resetFlag]);


    /* ---------- Checkbox ---------- */

    const onToggleShow = (index: number, checked?: boolean) => {
        const updated = [...sections];
        updated[index].show = !!checked;
        setSections(updated);
    };

    /* ---------- Label Change ---------- */

    const onLabelChange = (index: number, value?: string) => {
        const updated = [...sections];
        updated[index].label = value || '';
        setSections(updated);
    };

    /* ---------- Expose JSON ---------- */

    useImperativeHandle(ref, () => ({
        getJson: () => ({
            sections: sections.map(s => ({
                key: s.key,
                show: s.show,
                label: s.label,
                order: s.order
            }))
        })
    }));

    /* ---------- Render ---------- */

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                    droppableId="sections"
                    renderClone={(provided, snapshot, rubric) => {
                        const item = sections[rubric.source.index];

                        return (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: 12,
                                    marginBottom: 8,
                                    background: '#f3f2f1',
                                    border: '1px solid #ddd',
                                    borderRadius: 4,
                                    minWidth: 354,
                                    boxShadow: '0 6px 14px rgba(0,0,0,0.25)',
                                    userSelect: 'none',
                                    cursor: 'grab',
                                    // zIndex: 999999999,
                                    ...provided.draggableProps.style
                                }}
                            >
                                <Checkbox checked={item.show} disabled styles={{ root: { marginRight: 12 } }} />
                                <span>{item.label}</span>
                                <span style={{ marginLeft: 'auto', opacity: 0.4, fontSize: 18 }}>☰</span>
                            </div>
                        );
                    }}
                >
                    {(provided) => (
                        <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                        >
                            {sections.map((item, index) => (
                                <Draggable
                                    key={item.key}
                                    draggableId={item.key}
                                    index={index}
                                >
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}   // ✅ FULL ROW DRAG
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: 12,
                                                marginBottom: 8,
                                                background: '#ffffff',
                                                border: '1px solid #ddd',
                                                borderRadius: 4,
                                                minWidth: 354,
                                                userSelect: 'none',
                                                // zIndex: 999999999, // ✅
                                                cursor: 'grab',
                                                ...provided.draggableProps.style
                                            }}
                                        >
                                            <Checkbox
                                                checked={item.show}
                                                onChange={(_, checked) =>
                                                    onToggleShow(index, checked)
                                                }
                                                styles={{ root: { marginRight: 12 } }}
                                            />

                                            {/* LABEL / EDIT MODE */}
                                            <div style={{ flex: 1 }}>
                                                {editKey === item.key ? (
                                                    <TextField
                                                        value={item.label}
                                                        autoFocus
                                                        onChange={(_, val) => onLabelChange(index, val)}
                                                        onBlur={() => setEditKey(null)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') setEditKey(null);
                                                        }}
                                                        styles={{ root: { width: 260 } }}
                                                    />
                                                ) : (
                                                    <span
                                                        style={{
                                                            cursor: item.show ? 'pointer' : 'not-allowed'
                                                        }}
                                                        onClick={() => item.show && setEditKey(item.key)}
                                                    >
                                                        {item.label}
                                                    </span>
                                                )}
                                            </div>

                                            {/* DRAG ICON */}
                                            <span style={{ opacity: 0.4, fontSize: 18 }}>☰</span>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </div>

        // <div>
        //     <DragDropContext onDragEnd={onDragEnd}>
        //         <Droppable droppableId="sections">
        //             {(provided) => (
        //                 <div
        //                     ref={provided.innerRef}
        //                     {...provided.droppableProps}
        //                 >
        //                     {sections.map((item, index) => (
        //                         <Draggable
        //                             key={item.key}
        //                             draggableId={item.key}
        //                             index={index}
        //                         >
        //                             {(provided, snapshot) => (
        //                                 <div
        //                                     ref={provided.innerRef}
        //                                     {...provided.draggableProps}
        //                                     {...provided.dragHandleProps}   // ✅ FULL ROW DRAG
        //                                     style={{
        //                                         display: 'flex',
        //                                         alignItems: 'center',
        //                                         padding: 12,
        //                                         marginBottom: 8,
        //                                         background: snapshot.isDragging ? '#f3f2f1' : '#ffffff',
        //                                         border: '1px solid #ddd',
        //                                         borderRadius: 4,
        //                                         minWidth: 354,
        //                                         boxShadow: snapshot.isDragging
        //                                             ? '0 4px 12px rgba(0,0,0,0.2)'
        //                                             : 'none',
        //                                         userSelect: 'none',
        //                                         cursor: 'grab',
        //                                         backgroundColor: 'red',
        //                                         ...provided.draggableProps.style   // 🔥 VERY IMPORTANT
        //                                     }}
        //                                 >
        //                                     <Checkbox
        //                                         checked={item.show}
        //                                         onChange={(_, checked) =>
        //                                             onToggleShow(index, checked)
        //                                         }
        //                                         styles={{ root: { marginRight: 12 } }}
        //                                     />

        //                                     {/* LABEL / EDIT MODE */}
        //                                     <div style={{ flex: 1 }}>
        //                                         {editKey === item.key ? (
        //                                             <TextField
        //                                                 value={item.label}
        //                                                 autoFocus
        //                                                 onChange={(_, val) => onLabelChange(index, val)}
        //                                                 onBlur={() => setEditKey(null)}
        //                                                 onKeyDown={(e) => {
        //                                                     if (e.key === 'Enter') setEditKey(null);
        //                                                 }}
        //                                                 styles={{ root: { width: 260 } }}
        //                                             />
        //                                         ) : (
        //                                             <span
        //                                                 style={{
        //                                                     cursor: item.show ? 'pointer' : 'not-allowed',
        //                                                     opacity: item.show ? 1 : 1
        //                                                 }}
        //                                                 onClick={() => item.show && setEditKey(item.key)}
        //                                             >
        //                                                 {item.label}
        //                                             </span>
        //                                         )}
        //                                     </div>

        //                                     {/* VISUAL DRAG INDICATOR (OPTIONAL) */}
        //                                     <span style={{ opacity: 0.4, fontSize: 18 }}>☰</span>
        //                                 </div>
        //                             )}
        //                         </Draggable>


        //                     ))}
        //                     {provided.placeholder}
        //                 </div>
        //             )}
        //         </Droppable>
        //     </DragDropContext>
        // </div>
    );
});

export default SectionOrderManager;
