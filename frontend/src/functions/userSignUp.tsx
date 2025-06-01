import axios from "axios";

const userSignUp = async (username: string, email: string, password: string) => {
    return axios.post("https://desktop-app-production.up.railway.app/signup", {
        username,
        email,
        password
    })
        .then((res) => {
            console.log(res);
            return res.data;
        })
        .catch((err) => {
            console.log(err);
            return err;
        })
}

export default userSignUp;