import axios from "axios"

interface Connection {
    from_event_id: number,       // Event ID from
    to_event_id: number          // Event ID to
}

const modifyConnections = (accessToken: string, connected: Connection[], disconnected: Connection[]) => {
    return axios.post("https://journey-timeline-backend.up.railway.app/syncconnections", {
        connected,
        disconnected
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((res) => res.data)
        .catch((err) => err)
}

export default modifyConnections;