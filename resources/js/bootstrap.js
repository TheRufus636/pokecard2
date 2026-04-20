import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;



const handleRegister = async (e) => {
    e.preventDefault();
    try {

        await axios.get('/sanctum/csrf-cookie');


        await axios.post('/register', {
            name: name,
            email: email,
            password: password,
            password_confirmation: password_confirmation
        });


        setScreen('tienda');
    } catch (error) {

        console.error(error.response.data);
    }
};