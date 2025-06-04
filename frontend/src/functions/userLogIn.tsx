import axios from "axios";

const userLogIn = (email: string, username: string, password: string) => {
    return axios.post("https://desktop-app-production.up.railway.app/login", {
        email,
        username,
        password
    })
        .then((res) => {
            return res.data
        })
        .catch((err) => {
            return null;
        })
}

export default userLogIn;