import axios from "axios";

const userLogOut = async (email: string) => {
    return axios.post("https://desktop-app-production.up.railway.app/logout", {
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