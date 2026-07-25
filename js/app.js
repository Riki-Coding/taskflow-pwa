import { $, $$, formatShortDate, debounce } from './helper.js';
import { DB } from './db.js';
import { Auth } from './auth.js';
import { Task } from './task.js';
import { Activity } from './activity.js';
import { UI } from './ui.js';

let currentUser = null;
let currentTasks = [];
let editingTaskId = null;

const initApp = async () => {
    try {
        await DB.init();
        const themeSetting = await DB.get('settings', 'theme');
        UI.setTheme(themeSetting ? themeSetting.darkMode : true);
        currentUser = await Auth.getSession();
        if (currentUser) showMainApp();
        else { $('#login-screen').style.display = 'flex'; $('#main-app').style.display = 'none'; }
        setupEventListeners();
        registerServiceWorker();
    } catch (error) { console.error("Init Error:", error); UI.showToast("Gagal memuat database", "error"); }
};

const showMainApp = async () => {
    $('#login-screen').style.display = 'none';
    $('#main-app').style.display = 'block';
    $('#user-greeting').innerText = `Halo, ${currentUser.name}`;
    await loadData();
    UI.switchView('dashboard-view');
};

const loadData = async () => {
    currentTasks = await Task.getAllByUser(currentUser.username);
    renderDashboard();
    renderCalendar();
};

const renderDashboard = () => {
    const sortVal = $('#sort-task').value;
    let sortedTasks = [...currentTasks];
    if (sortVal === 'deadline') sortedTasks.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    else if (sortVal === 'priority') {
        const pVal = { high: 3, med: 2, low: 1 };
        sortedTasks.sort((a, b) => pVal[b.priority] - pVal[a.priority]);
    }
    const searchVal = $('#search-task').value.toLowerCase();
    const filterVal = $('#filter-task').value;
    let filtered = sortedTasks.filter(t => t.title.toLowerCase().includes(searchVal) || t.desc.toLowerCase().includes(searchVal));
    if (filterVal !== 'all') filtered = filtered.filter(t => t.status === filterVal);

    const total = currentTasks.length;
    const done = currentTasks.filter(t => t.status === 'done').length;
    const todo = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);
    UI.renderDashboardStats({ total, done, todo, progress });
    UI.renderTasks(filtered, 'task-list', handleEditTask, handleDeleteTask, handleToggleTask);
};

const renderCalendar = () => {
    let calendarTasks = currentTasks.filter(t => t.deadline).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    UI.renderTasks(calendarTasks, 'calendar-task-list', handleEditTask, handleDeleteTask, handleToggleTask);
};

const handleEditTask = async (id) => {
    const task = await Task.getById(id);
    if (task) {
        editingTaskId = id;
        $('#task-title').value = task.title;
        $('#task-desc').value = task.desc;
        $('#task-priority').value = task.priority;
        $('#task-deadline').value = formatShortDate(task.deadline);
        $('#modal-title').innerText = 'Edit Tugas';
        UI.toggleModal('task-modal', true);
    }
};

const handleDeleteTask = async (id) => {
    if (confirm("Hapus tugas ini?")) {
        await Task.delete(id);
        await Activity.log(currentUser.username, 'DELETE', 'Tugas Dihapus');
        UI.showToast("Tugas dihapus");
        await loadData();
    }
};

const handleToggleTask = async (id) => {
    const task = await Task.getById(id);
    if (task) {
        task.status = task.status === 'done' ? 'todo' : 'done';
        await Task.update(task);
        await Activity.log(currentUser.username, 'UPDATE', `Status tugas diubah ke ${task.status}`);
        await loadData();
    }
};

const setupEventListeners = () => {
    $('#btn-toggle-register').addEventListener('click', () => { $('#login-form').style.display = 'none'; $('#register-form').style.display = 'flex'; });
    $('#btn-toggle-login').addEventListener('click', () => { $('#register-form').style.display = 'none'; $('#login-form').style.display = 'flex'; });
    
    $('#login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            currentUser = await Auth.login($('#login-username').value, $('#login-password').value);
            await Activity.log(currentUser.username, 'LOGIN', 'User Login');
            UI.showToast("Login Berhasil", "success");
            showMainApp();
        } catch (err) { UI.showToast(err.message, "error"); }
    });

    $('#register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            await Auth.register($('#reg-username').value, $('#reg-password').value, $('#reg-name').value);
            UI.showToast("Registrasi Berhasil. Silakan Login.", "success");
            $('#btn-toggle-login').click();
        } catch (err) { UI.showToast(err.message, "error"); }
    });

    $('#btn-logout').addEventListener('click', async () => {
        await Activity.log(currentUser.username, 'LOGOUT', 'User Logout');
        await Auth.logout();
        currentUser = null;
        $('#login-screen').style.display = 'flex';
        $('#main-app').style.display = 'none';
        UI.showToast("Berhasil Logout");
    });

    $$('.nav-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const target = e.currentTarget.dataset.target;
            UI.switchView(target);
            if (target === 'activity-view') {
                const logs = await Activity.getAllByUser(currentUser.username);
                UI.renderActivityLog(logs);
            }
        });
    });

    $('#theme-toggle').addEventListener('click', async () => {
        const isDark = document.body.classList.contains('dark-mode');
        UI.setTheme(!isDark);
        await DB.put('settings', { id: 'theme', darkMode: !isDark });
    });

    $('#fab-add').addEventListener('click', () => {
        editingTaskId = null;
        $('#task-form').reset();
        $('#modal-title').innerText = 'Tambah Tugas';
        UI.toggleModal('task-modal', true);
    });

    $('#btn-close-modal').addEventListener('click', () => UI.toggleModal('task-modal', false));

    $('#task-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = $('#task-title').value;
        const desc = $('#task-desc').value;
        const priority = $('#task-priority').value;
        const deadline = $('#task-deadline').value;

        if (editingTaskId) {
            const task = await Task.getById(editingTaskId);
            task.title = title; task.desc = desc; task.priority = priority; task.deadline = deadline;
            await Task.update(task);
            await Activity.log(currentUser.username, 'UPDATE', `Memperbarui tugas: ${title}`);
            UI.showToast("Tugas diperbarui", "success");
        } else {
            await Task.create(currentUser.username, title, desc, priority, deadline);
            await Activity.log(currentUser.username, 'CREATE', `Membuat tugas baru: ${title}`);
            UI.showToast("Tugas ditambahkan", "success");
        }
        UI.toggleModal('task-modal', false);
        await loadData();
    });

    $('#search-task').addEventListener('input', debounce(renderDashboard, 300));
    $('#filter-task').addEventListener('change', renderDashboard);
    $('#sort-task').addEventListener('change', renderDashboard);

    $('#btn-export').addEventListener('click', async () => {
        try {
            const data = { tasks: await DB.getAll('tasks'), activity: await DB.getAll('activity') };
            const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
            a.click(); URL.revokeObjectURL(url);
            UI.showToast("Backup berhasil diunduh", "success");
        } catch (e) { UI.showToast("Gagal export data", "error"); }
    });

    $('#btn-import').addEventListener('click', () => $('#import-file').click());

    $('#import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.tasks) { await DB.clear('tasks'); for (const t of data.tasks) await DB.add('tasks', t); }
                if (data.activity) { await DB.clear('activity'); for (const a of data.activity) await DB.add('activity', a); }
                UI.showToast("Restore berhasil", "success");
                await loadData();
            } catch (err) { UI.showToast("Format file tidak valid", "error"); }
            finally { e.target.value = ''; }
        };
        reader.readAsText(file);
    });
};

const registerServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(err => console.error('SW Error:', err)); });
    }
};

window.addEventListener('DOMContentLoaded', initApp);