import { DB } from './db.js';
import { generateId } from './helper.js';

export const Task = {
    create: async (userId, title, desc, priority, deadline) => {
        const task = { id: generateId(), userId, title, desc, priority, deadline, status: 'todo', createdAt: new Date().toISOString() };
        await DB.add('tasks', task);
        return task;
    },
    update: async (task) => { await DB.put('tasks', task); return task; },
    delete: async (id) => { await DB.delete('tasks', id); return id; },
    getById: async (id) => await DB.get('tasks', id),
    getAllByUser: async (userId) => {
        const tasks = await DB.getAll('tasks');
        return tasks.filter(t => t.userId === userId);
    }
};