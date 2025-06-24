import { useEffect, useState } from 'react';
import { useAuth } from "../context/AuthContext";
import './main.css';
import ManageTimelineModal from '../components/ManageTimelineModal';

import SettingsIcon from '@mui/icons-material/Settings';
import getTimelineData from '../functions/getTimelineData';

interface Event {
    id: number,         // Unique globally
    name: string,
    step_id: number,      // Which step it belongs to
    position: number
}

interface Connection {
    from_event_id: number,       // Event ID from
    to_event_id: number          // Event ID to
}

export default function Main() {
    const [showManageTimeLine, setShowManageTimeline] = useState(false);
    const { isLoggedIn, accessToken } = useAuth();

    const [events, setEvents] = useState<Event[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [eventsPos, setEventsPos] = useState<Record<number, {
        leftMiddle: {
            x: number,
            y: number
        },
        rightMiddle: {
            x: number,
            y: number
        }
    }>>({});

    const [tempEvents, setTempEvents] = useState(events);
    const [highlightedEventChain, setHighlightedEventChain] = useState<Set<number>>(new Set());

    function getConnectedEventChain(startId: number, visited = new Set<number>()): Set<number> {
        if (visited.has(startId)) return visited;

        visited.add(startId);

        const directlyConnected = connections
            .filter(conn => conn.from_event_id === startId)
            .map(conn => conn.to_event_id);

        directlyConnected.forEach(id => getConnectedEventChain(id, visited));

        return visited;
    }

    function calculatePositions() {
        const eventsElements = document.querySelectorAll(".timeline .event");

        const positions: Record<number, { leftMiddle: { x: number; y: number }, rightMiddle: { x: number; y: number } }> = {};

        eventsElements.forEach((event, i) => {
            const rect = event.getBoundingClientRect();
            const eventIdAttr = event.getAttribute("data-id");
            if (!eventIdAttr) return;

            const eventId = parseInt(eventIdAttr);

            positions[eventId] = {
                leftMiddle: {
                    x: rect.left,
                    y: (rect.top + rect.bottom) / 2
                },
                rightMiddle: {
                    x: rect.right,
                    y: (rect.top + rect.bottom) / 2
                }
            };
        });

        setEventsPos(positions);

        return () => positions
    }

    useEffect(() => {
        const fetchTimelineData = async () => {
            if (!accessToken) {
                setEvents([]);
                setConnections([]);

                return;
            };

            const result = await getTimelineData(accessToken);

            if (result) {
                setEvents(result.events);
                setConnections(result.connections);
            }
        };

        fetchTimelineData();
    }, [accessToken])

    useEffect(() => {
        window.addEventListener("resize", calculatePositions);

        return () => {
            window.removeEventListener("resize", calculatePositions)
        }
    }, [])

    useEffect(() => {
        calculatePositions();
    }, [events]);

    return (
        <>
            <svg className="connection-lines">
                {[
                    // Static connections
                    ...connections.filter(conn => !highlightedEventChain.has(conn.from_event_id)).map((conn, i) => {
                        const from = eventsPos[conn.from_event_id];
                        const to = eventsPos[conn.to_event_id];
                        if (!from || !to) return null;

                        const fromEvent = events.find(e => e.id === conn.from_event_id);
                        const toEvent = events.find(e => e.id === conn.to_event_id);
                        const fromStep = fromEvent?.step_id ?? 0;
                        const toStep = toEvent?.step_id ?? 0;
                        const stepDiff = toStep - fromStep;

                        const midX = (from.rightMiddle.x + to.leftMiddle.x) / 2;

                        const d = stepDiff === 1
                            ? `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${midX} ${from.rightMiddle.y}
                            L ${midX} ${to.leftMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                          `
                            : `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                          `;

                        return (
                            <path
                                key={`static-${conn.from_event_id}-${conn.to_event_id}`}
                                d={d}
                                stroke="black"
                                strokeWidth="2"
                                fill="none"
                            />
                        );
                    }),

                    // Animated connections
                    ...connections.filter(conn => highlightedEventChain.has(conn.from_event_id)).map((conn, i) => {
                        const from = eventsPos[conn.from_event_id];
                        const to = eventsPos[conn.to_event_id];
                        if (!from || !to) return null;

                        const fromEvent = events.find(e => e.id === conn.from_event_id);
                        const toEvent = events.find(e => e.id === conn.to_event_id);
                        const fromStep = fromEvent?.step_id ?? 0;
                        const toStep = toEvent?.step_id ?? 0;
                        const stepDiff = toStep - fromStep;

                        const midX = (from.rightMiddle.x + to.leftMiddle.x) / 2;

                        const d = stepDiff === 1
                            ? `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${midX} ${from.rightMiddle.y}
                            L ${midX} ${to.leftMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                          `
                            : `
                            M ${from.rightMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${from.rightMiddle.y}
                            L ${to.leftMiddle.x} ${to.leftMiddle.y}
                          `;

                        return (
                            <path
                                key={`animated-${conn.from_event_id}-${conn.to_event_id}`}
                                d={d}
                                className="path-animated"
                                strokeWidth="2"
                                fill="none"
                            />
                        );
                    })
                ]}
            </svg>

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
                                        {events.filter(e => e.step_id === stepIndex).sort((a, b) => a.position - b.position).map(event => (
                                            <div
                                                key={event.id}
                                                data-id={event.id}
                                                className="event"
                                                onClick={() => {
                                                    const chain = getConnectedEventChain(event.id);
                                                    setHighlightedEventChain(prev => (
                                                        prev.has(event.id) ? new Set() : chain
                                                    ));
                                                }}
                                            >
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
                <ManageTimelineModal
                    show={showManageTimeLine}
                    onClose={() => setShowManageTimeline(false)}
                    events={events}
                    setEvents={setEvents}
                    connections={connections}
                    setConnections={setConnections}
                />
            )}
        </>
    );
}