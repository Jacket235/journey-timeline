import axios from "axios"

interface Event {
    id: number;
    name: string;
    step_id: number;
    position: number;
}

const modifyEvents = (accessToken: string, added: Event[], modified: Event[], removed: Event[]) => {
    return axios.post("https://journey-timeline-backend.up.railway.app/syncevents", {
        added,
        modified,
        removed
    }, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((res) => res.data)
        .catch((err) => err)
}

export default modifyEvents;