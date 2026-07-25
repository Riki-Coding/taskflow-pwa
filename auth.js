import { DB } from './db.js';

export const Auth = {
    register: async (username, password, name) => {
        const existing = await DB.get('users', username);
        if (existing) throw new Error('Username sudah digunakan');
        const user = { username, password, name };
        await DB.add('users', user);
        return user;
    },
    login: async (username, password) => {
        const user = await DB.get('users', username);
        if (!user || user.password !== password) throw new Error('Username atau Password salah');
        const session = { id: 'active', username: user.username, name: user.name };
        await DB.put('session', session);
        return session;
    },
    logout: async () => await DB.delete('session', 'active'),
    getSession: async () => await DB.get('session', 'active')
};