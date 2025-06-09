import axios from "axios";

const getTimelineData = (accessToken: string) => {
    return axios.get("https://journey-timeline-backend.up.railway.app/gettimelinedata", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })
        .then((res) => {
            return res.data
        })
        .catch((err) => {
            return null;
        })
}

export default getTimelineData;