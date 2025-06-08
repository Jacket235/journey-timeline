import axios from "axios";

const userLogOut = async (email: string) => {
    return axios.post("https://journey-timeline-backend.up.railway.app/logout", {
        email
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return null;
        })
}

export default userLogOut;