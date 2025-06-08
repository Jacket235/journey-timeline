import axios from "axios";

const userAutoLogIn = (refreshToken: string) => {
    return axios.post("https://journey-timeline-backend.up.railway.app/autologin", {
        token: refreshToken
    })
        .then((res) => {
            return res.data
        })
        .catch(() => null);
}

export default userAutoLogIn;