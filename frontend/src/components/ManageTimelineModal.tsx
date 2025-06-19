import { SetStateAction, Dispatch, useState } from "react";
import modifyEvents from "../functions/modifyEvents";
import { useAuth } from "../context/AuthContext";
import modifyConnections from "../functions/modifyConnections";

interface Event {
    id: number;
    name: string;
    step_id: number;
    position: number;
}

interface Connection {
    from_event_id: number,       // Event ID from
    to_event_id: number          // Event ID to
}

interface Props {
    show: boolean;
    onClose: () => void;
    events: Event[];
    setEvents: Dispatch<SetStateAction<Event[]>>;
    connections: Connection[];
    setConnections: Dispatch<SetStateAction<Connection[]>>;
}

export default function ManageTimelineModal({ show, onClose, events, setEvents, connections, setConnections }: Props) {
    const [activeTab, setActiveTab] = useState<"events" | "connections">("events");
    const [selectedStep, setSelectedStep] = useState<number>(-1);
    const [selectedEvent, setSelectedEvent] = useState<Event>();
    const [tempEvents, setTempEvents] = useState(events);
    const [tempConnections, setTempConnections] = useState<Connection[]>(connections);
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);
    const { accessToken } = useAuth();

    if (!show) return null;

    interface EventChanges {
        added: Event[];
        modified: Event[];
        removed: Event[];
    }

    function checkForEventMods(original: Event[], updated: Event[]): EventChanges {
        const originalMap = new Map(original.map(e => [e.id, e]));
        const updatedMap = new Map(updated.map(e => [e.id, e]));

        const added: Event[] = [];
        const modified: Event[] = [];
        const removed: Event[] = [];

        // Check added & modified
        for (const updatedEvent of updated) {
            const originalEvent = originalMap.get(updatedEvent.id);
            if (!originalEvent) {
                added.push(updatedEvent); // new event
            } else if (
                updatedEvent.name !== originalEvent.name ||
                updatedEvent.step_id !== originalEvent.step_id ||
                updatedEvent.position !== originalEvent.position
            ) {
                modified.push(updatedEvent); // changed event
            }
        }

        // Check removed
        for (const originalEvent of original) {
            if (!updatedMap.has(originalEvent.id)) {
                removed.push(originalEvent);
            }
        }

        return { added, modified, removed };
    }

    function checkForConnectionMods(original: Connection[], updated: Connection[]) {
        const originalSet = new Set(original.map(conn => `${conn.from_event_id}->${conn.to_event_id}`));
        const updatedSet = new Set(updated.map(conn => `${conn.from_event_id}->${conn.to_event_id}`));

        const connected = Array.from(updatedSet)
            .filter(key => !originalSet.has(key))
            .map(key => {
                const [from, to] = key.split("->").map(Number);
                return { from_event_id: from, to_event_id: to };
            });

        const disconnected = Array.from(originalSet)
            .filter(key => !updatedSet.has(key))
            .map(key => {
                const [from, to] = key.split("->").map(Number);
                return { from_event_id: from, to_event_id: to };
            });


        return { connected, disconnected };
    }

    return (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Manage your timeline</h5>
                        <button className="btn-close" onClick={() => onClose()}></button>
                    </div>
                    <div className="modal-body">
                        <ul className="nav nav-tabs mb-3">
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "events" ? "active" : ""}`}
                                    onClick={() => setActiveTab("events")}
                                >
                                    Modify Events
                                </button>
                            </li>
                            <li className="nav-item">
                                <button
                                    className={`nav-link ${activeTab === "connections" ? "active" : ""}`}
                                    onClick={() => setActiveTab("connections")}
                                >
                                    Modify Connections
                                </button>
                            </li>
                        </ul>

                        {activeTab === "events" && (
                            <>
                                <div className="form-floating mb-3">
                                    <select className="form-select" value={selectedStep ?? -1} onChange={(e) => setSelectedStep(Number(e.target.value))}>
                                        <option value="-1">Step</option>
                                        {[0, 1, 2, 3].map(i => (
                                            <option key={i} value={i}>{i + 1}</option>
                                        ))}
                                    </select>
                                    <label>Select the step to modify</label>
                                </div>
                                {selectedStep !== -1 && (
                                    <div className="mb-3 d-flex flex-column">
                                        {selectedStep !== -1 && tempEvents
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
                                                    {/* {event.name} */}
                                                    <input
                                                        className="form-control no-outline"
                                                        value={event.name}
                                                        onChange={(e) => {
                                                            const updated = tempEvents.map(ev => ev.id === event.id ? { ...ev, name: e.target.value } : ev);
                                                            setTempEvents(updated)
                                                        }}
                                                    />
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => {
                                                            const updated = tempEvents.filter(e => e.id !== event.id);
                                                            const stepEvents = updated.filter(e => e.step_id === selectedStep);
                                                            const otherEvents = updated.filter(e => e.step_id !== selectedStep);
                                                            const reordered = stepEvents.map((e, i) => ({ ...e, position: i }));
                                                            setTempEvents([...otherEvents, ...reordered]);
                                                        }}>
                                                        Remove
                                                    </button>
                                                </div>
                                            ))}
                                    </div>
                                )}
                                <div className="mb-1">
                                    {selectedStep !== -1 && (
                                        <button className="btn btn-success" onClick={() => {
                                            if (selectedStep == null) return;

                                            const stepEvents = tempEvents.filter(e => e.step_id === selectedStep);
                                            const newEvent = {
                                                id: -Date.now(),
                                                name: "New Event",
                                                step_id: selectedStep,
                                                position: stepEvents.length
                                            };
                                            setTempEvents([...tempEvents, newEvent]);
                                        }}>
                                            Add Event
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                        {activeTab === "connections" && (
                            <>
                                <div className="form-floating mb-3">
                                    <select className="form-select"
                                        value={selectedEvent?.id ?? -1}
                                        onChange={e => {
                                            const id = Number(e.target.value);
                                            const selected = tempEvents.find(eve => eve.id === id)
                                            setSelectedEvent(selected);
                                        }}>
                                        <option value="-1">Select event</option>
                                        {tempEvents.map(event => (
                                            <option key={event.id} value={event.id}>{event.name}</option>
                                        ))}
                                    </select>
                                    <label>Select an event in your timeline</label>
                                </div>
                                {selectedEvent && (
                                    <div className="mb-3 d-flex flex-column">
                                        {tempEvents
                                            .filter(e => e.step_id > selectedEvent.step_id)
                                            .map(event => {
                                                const isConnected = tempConnections.some(conn =>
                                                    conn.from_event_id === selectedEvent.id &&
                                                    conn.to_event_id === event.id
                                                );

                                                return (
                                                    <div
                                                        key={event.id}
                                                        className="border rounded p-1 my-1 d-flex justify-content-between align-items-center"
                                                    >
                                                        {event.name}
                                                        <button
                                                            className={`btn ${isConnected ? "btn-outline-danger" : "btn-outline-primary"}`}
                                                            onClick={() => {
                                                                if (isConnected) {
                                                                    setTempConnections(prev =>
                                                                        prev.filter(conn => !(
                                                                            conn.from_event_id === selectedEvent.id &&
                                                                            conn.to_event_id === event.id
                                                                        ))
                                                                    );
                                                                } else {
                                                                    setTempConnections(prev => [...prev, {
                                                                        from_event_id: selectedEvent.id,
                                                                        to_event_id: event.id,
                                                                    }]);
                                                                }
                                                            }}>
                                                            {isConnected ? "Disconnect" : "Connect"}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button
                            className="btn btn-primary"
                            onClick={async () => {
                                try {
                                    const { added, modified, removed } = checkForEventMods(events, tempEvents);
                                    const { connected, disconnected } = checkForConnectionMods(connections, tempConnections);

                                    console.log("Sending EVENTS...");
                                    const resEvents = await modifyEvents(accessToken, added, modified, removed);
                                    console.log("EVENTS response:", resEvents);

                                    console.log("Sending CONNECTIONS...");
                                    const resConnections = await modifyConnections(accessToken, connected, disconnected);
                                    console.log("CONNECTIONS response:", resConnections);

                                    setEvents(tempEvents);
                                    setConnections(tempConnections);
                                    onClose();
                                } catch (err) {
                                    console.error("Save failed:", err);
                                }
                            }}
                        >
                            Save
                        </button>
                        <button className="btn btn-danger" onClick={() => onClose()}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}