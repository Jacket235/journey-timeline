import axios from "axios";

const userAutoLogIn = () => {
    return axios.post("https://desktop-app-production.up.railway.app/autologin", {}, {
        withCredentials: true
    })
        .then((res) => res.data)
        .catch(() => null);
}

export default userAutoLogIn;