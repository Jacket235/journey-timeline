import axios from "axios";

const getTestUser = async () => {
    axios({
        url: "https://desktop-app-production.up.railway.app/user",
    })
        .then((res) => {
            console.log(res);
        })
        .catch((err) => {
            console.error(err);
        })
}

export default getTestUser;