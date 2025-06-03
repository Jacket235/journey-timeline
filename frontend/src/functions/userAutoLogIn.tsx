import axios from "axios";

const userAutoLogIn = () => {
    return axios.post("https://desktop-app-production.up.railway.app/refreshToken", {}, {
        withCredentials: true
    })
        .then(res => {
            return res.data
            // setAccessToken(res.data.accessToken);
            // setUserLoggedIn(true);
        })
        .catch(() => {
            // Token expired or invalid
            // setAccessToken("");
            // setUserLoggedIn(false);
            return null;
        });
}

export default userAutoLogIn;
