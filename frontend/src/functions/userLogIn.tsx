import axios from "axios";

const userLogIn = (username: string, password: string) => {
    return axios.post("https://desktop-app-production.up.railway.app/login", {
        username,
        password
    })
        .then((res) => {
            if (res.data.auth) {
                return res.data;
            } else {
                return null;
            }
        })
        .catch((err) => {
            console.error(err);
            return null;
        })
}

export default userLogIn;