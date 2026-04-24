import axios from 'axios';

const client = axios.create({
    baseURL: '/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
});

// Obtener cookie CSRF antes de mutaciones
async function csrf() {
    await axios.get('/sanctum/csrf-cookie', { withCredentials: true });
}

export const api = {
    // Auth
    async register(data) {
        await csrf();
        const res = await client.post('/register', data);
        return res.data;
    },
    async login(data) {
        await csrf();
        const res = await client.post('/login', data);
        return res.data;
    },
    async logout() {
        const res = await client.post('/logout');
        return res.data;
    },
    async me() {
        const res = await client.get('/me');
        return res.data;
    },

    // Tienda
    async buyPack(packType) {
        const res = await client.post('/shop/buy', { pack_type: packType });
        return res.data;
    },
    async reloadCoins() {
        const res = await client.post('/shop/reload');
        return res.data;
    },

    // Colección
    async getCollection() {
        const res = await client.get('/collection');
        return res.data;
    },

    // Mazo
    async getDeck() {
        const res = await client.get('/deck');
        return res.data;
    },
    async saveDeck(deck) {
        const res = await client.post('/deck', { deck });
        return res.data;
    },

    // Social
    async getSocial(order = 'likes') {
        const res = await client.get(`/social?order=${order}`);
        return res.data;
    },
    async vote(ownerId, voteType) {
        const res = await client.post(`/social/${ownerId}/vote`, { vote_type: voteType });
        return res.data;
    },
};
