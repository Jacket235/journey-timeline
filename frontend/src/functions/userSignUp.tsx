import axios from "axios";

const userSignUp = async (username: string, email: string, password: string) => {
    axios.post("https://desktop-app-production.up.railway.app/signup", {
        username,
        email,
        password
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        })
}

export default userSignUp;