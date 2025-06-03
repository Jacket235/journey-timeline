import axios from "axios";

const userLogOut = () => {
    return axios.post("https://desktop-app-production.up.railway.app/logout", {}, {
        withCredentials: true
    })
        .then((res) => {
            return true;
        })
        .catch((err) => {
            return false;
        })
}

export default userLogOut;