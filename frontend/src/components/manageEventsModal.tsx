import React from 'react';

import { useEffect, useState, SetStateAction, Dispatch } from 'react';

interface Event {
    id: number;
    name: string;
    step_id: number;
    position: number;
}

interface Props {
    show: boolean;
    onClose: () => void;
    events: Event[];
    setEvents: Dispatch<SetStateAction<Event[]>>;
    selectedStep: number | null;
    setSelectedStep: Dispatch<SetStateAction<number | null>>;
}

export default function ManageEventsModal({
    show,
    onClose,
    events,
    setEvents,
    selectedStep,
    setSelectedStep
}: Props) {
    const [tempEvents, setTempEvents] = useState(events);
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);

    useEffect(() => {
        if (show) setTempEvents(events);
    }, [show, events]);

    if (!show) return null;

    return (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Manage your timeline</h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <div className="mb-3 d-flex flex-column">
                            <div className="form-floating">
                                <select className="form-select" value={selectedStep ?? ''} onChange={(e) => setSelectedStep(Number(e.target.value))}>
                                    <option defaultValue="">Step</option>
                                    {[0, 1, 2, 3].map(i => (
                                        <option key={i} value={i}>{i + 1}</option>
                                    ))}
                                </select>
                                <label>Select the step to modify</label>
                            </div>
                        </div>
                        <div className="mb-3 d-flex flex-column">
                            {selectedStep !== null && tempEvents
                                .filter(e => e.step_id === selectedStep)
                                .sort((a, b) => a.position - b.position)
                                .map(event => (
                                    <div
                                        key={event.id}
                                        className="border rounded p-1 my-1 d-flex justify-content-between align-items-center"
                                        draggable
                                        style={{ cursor: "move" }}
                                        onDragStart={() => setDraggedEventId(event.id)}
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={() => {
                                            if (draggedEventId === null || draggedEventId === event.id) return;

                                            const draggedIndex = tempEvents.findIndex(e => e.id === draggedEventId);
                                            const dropIndex = tempEvents.findIndex(e => e.id === event.id);
                                            const updated = [...tempEvents];
                                            const [movedItem] = updated.splice(draggedIndex, 1);
                                            updated.splice(dropIndex, 0, movedItem);

                                            const stepEvents = updated.filter(e => e.step_id === selectedStep);
                                            const otherEvents = updated.filter(e => e.step_id !== selectedStep);
                                            const reordered = stepEvents.map((e, i) => ({ ...e, position: i }));

                                            setTempEvents([...otherEvents, ...reordered]);
                                        }}
                                    >
                                        <span>{event.name}</span>
                                        <button
                                            className="btn btn-danger"
                                            onClick={() => {
                                                const updated = tempEvents.filter(e => e.id !== event.id);
                                                const stepEvents = updated.filter(e => e.step_id === selectedStep);
                                                const otherEvents = updated.filter(e => e.step_id !== selectedStep);
                                                const reordered = stepEvents.map((e, i) => ({ ...e, position: i }));
                                                setTempEvents([...otherEvents, ...reordered]);
                                            }}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                        </div>
                        {selectedStep !== null && (
                            <div className="mb-1">
                                <button
                                    className="btn btn-success"
                                    onClick={() => {
                                        const stepEvents = tempEvents.filter(e => e.step_id === selectedStep);
                                        const newEvent = {
                                            id: -Date.now(),
                                            name: "New Event",
                                            step_id: selectedStep,
                                            position: stepEvents.length
                                        };
                                        setTempEvents([...tempEvents, newEvent]);
                                    }}
                                >
                                    Add event
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEvents(tempEvents);
                                onClose();
                            }}>
                            Save
                        </button>
                        <button className="btn btn-danger" onClick={onClose}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
