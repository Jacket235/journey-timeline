import axios from "axios";

const userSignUp = async (username: string, email: string, password: string) => {
    return axios.post("https://journey-timeline-backend.up.railway.app/signup", {
        username,
        email,
        password
    })
        .then((res) => {
            return res.data;
        })
        .catch((err) => {
            return null;
        })
}

export default userSignUp;