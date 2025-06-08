import { useEffect, useState } from 'react';
// import { Events, Connections } from './data';
import { useAuth } from "../context/AuthContext";
import './main.css';

import SettingsIcon from '@mui/icons-material/Settings';
import getTimelineData from '../functions/getTimelineData';

interface Event {
    id: number,         // Unique globally
    name: string,
    step_id: number      // Which step it belongs to
}

interface Connection {
    from: number,       // Event ID from
    to: number          // Event ID to
}

export default function Main() {
    const [showManageTimeLine, setShowManageTimeline] = useState(false);
    const { isLoggedIn, accessToken } = useAuth();

    const [selectedStep, setSelectedStep] = useState<number | null>(null);

    const [events, setEvents] = useState<Event[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [eventsPos, setEventsPos] = useState<Record<number, { leftMiddle: { x: number, y: number }, rightMiddle: { x: number, y: number } }>>([]);
    const [tempEvents, setTempEvents] = useState(events);
    const [draggedEventId, setDraggedEventId] = useState<number | null>(null);

    // function calculatePositions() {
    //     const eventsElements = document.querySelectorAll(".event");

    //     const positions: Record<number, { leftMiddle: { x: number; y: number }, rightMiddle: { x: number; y: number } }> = {};

    //     eventsElements.forEach((event, i) => {
    //         const rect = event.getBoundingClientRect();
    //         const eventId = events[i].id;

    //         positions[eventId] = {
    //             leftMiddle: {
    //                 x: rect.left,
    //                 y: (rect.top + rect.bottom) / 2
    //             },
    //             rightMiddle: {
    //                 x: rect.right,
    //                 y: (rect.top + rect.bottom) / 2
    //             }
    //         };
    //     });

    //     setEventsPos(positions);

    //     return () => positions
    // }

    useEffect(() => {
        const fetchTimelineData = async () => {
            if (!accessToken) return;

            const result = await getTimelineData(accessToken);

            console.log(result);

            if (result) {
                setEvents(result.events);
                setConnections(result.connections);
            }
        };

        fetchTimelineData();
    }, [accessToken])

    // useEffect(() => {
    //     window.addEventListener("resize", calculatePositions);

    //     return () => {
    //         window.removeEventListener("resize", calculatePositions)
    //     }
    // }, [])

    return (
        <>
            {/* <svg className="connection-lines">
                {Connections.map((conn, i) => {
                    const from = eventsPos[conn.from];
                    const to = eventsPos[conn.to];
                    if (!from || !to) return null;

                    const fromEvent = Events.find(e => e.id === conn.from);
                    const toEvent = Events.find(e => e.id === conn.to);
                    const fromStep = fromEvent?.stepId ?? 0;
                    const toStep = toEvent?.stepId ?? 0;
                    const stepDiff = toStep - fromStep;

                    const midX = (from.rightMiddle.x + to.leftMiddle.x) / 2;

                    let d = "";

                    if (stepDiff === 1) {
                        d = `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${midX} ${from.rightMiddle.y}
                            L ${midX} ${to.leftMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                        `;
                    } else {
                        d = `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                        `;
                    }

                    return (
                        <path
                            key={i}
                            d={d}
                            stroke="black"
                            strokeWidth="2"
                            fill="none"
                        />
                    );
                })}
            </svg> */}
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12 p-1">
                        {isLoggedIn && (
                            <button className="btn btn-primary" onClick={() => {
                                setShowManageTimeline(true);
                                setTempEvents(events);
                            }}>
                                <SettingsIcon /> Manage timeline
                            </button>
                        )}
                    </div>
                </div>
                <div className="row">
                    <div className="col-12 p-1">
                        {isLoggedIn && events && connections && (
                            <div className="timeline">
                                {[0, 1, 2, 3].map((step, stepIndex) => (
                                    <div key={stepIndex} className="step">
                                        {events.filter(e => e.step_id === stepIndex).map(event => (
                                            <div key={event.id} className="event">
                                                {event.name}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showManageTimeLine && (
                <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Manage your timeline</h5>
                                <button type="button" className="btn-close" onClick={() => setShowManageTimeline(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3 d-flex flex-column">
                                    <div className="form-floating">
                                        <select className="form-select" id="select-step" value={selectedStep ?? ''} onChange={(e) => setSelectedStep(Number(e.target.value))}>
                                            <option defaultValue="">Step</option>
                                            <option value="0">1</option>
                                            <option value="1">2</option>
                                            <option value="2">3</option>
                                            <option value="3">4</option>
                                        </select>
                                        <label htmlFor="select-step">Select the step to modify</label>
                                    </div>
                                </div>
                                <div className="mb-3 d-flex flex-column">
                                    {selectedStep !== null && selectedStep !== undefined && (
                                        tempEvents.filter(e => e.step_id === selectedStep).map(event => (
                                            <div
                                                key={event.id}
                                                className="border rounded p-1 my-1 d-flex justify-content-between align-items-center"
                                                draggable
                                                style={{ cursor: "move" }}
                                                onDragStart={(e) => setDraggedEventId(event.id)}
                                                onDragOver={(e) => e.preventDefault()}
                                                onDrop={(e) => {
                                                    if (draggedEventId === null || draggedEventId === event.id) return;

                                                    const draggedIndex = tempEvents.findIndex(e => e.id === draggedEventId);
                                                    const dropIndex = tempEvents.findIndex(e => e.id === event.id);

                                                    const updated = [...tempEvents];
                                                    const [movedItem] = updated.splice(draggedIndex, 1);
                                                    updated.splice(dropIndex, 0, movedItem);

                                                    setTempEvents(updated);
                                                }}>
                                                {event.name}
                                                <button className="btn btn-danger" onClick={() => setTempEvents(tempEvents.filter(e => e.id !== event.id))}>
                                                    Remove
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-primary" onClick={() => {
                                    setEvents(tempEvents);
                                    setShowManageTimeline(false);
                                }}>
                                    Save
                                </button>
                                <button className="btn btn-danger" onClick={() => setShowManageTimeline(false)}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div >
            )
            }
        </>
    )
}