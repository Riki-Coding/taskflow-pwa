import { $, $$, formatDate } from './helper.js';

export const UI = {
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast glass ${type}`;
        toast.innerText = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 3000);
    },
    toggleModal: (modalId, show) => {
        const modal = $(`#${modalId}`);
        if (show) { modal.style.display = 'flex'; setTimeout(() => modal.classList.add('active'), 10); }
        else { modal.classList.remove('active'); setTimeout(() => modal.style.display = 'none', 300); }
    },
    switchView: (viewId) => {
        $$('.view-section').forEach(el => el.classList.remove('active'));
        $$('.nav-item').forEach(el => el.classList.remove('active'));
        $(`#${viewId}`).classList.add('active');
        const navBtn = $(`[data-target="${viewId}"]`);
        if (navBtn) navBtn.classList.add('active');
    },
    renderDashboardStats: (stats) => {
        $('#stat-total').innerText = stats.total;
        $('#stat-done').innerText = stats.done;
        $('#stat-todo').innerText = stats.todo;
        $('#progress-fill').style.width = `${stats.progress}%`;
        $('#progress-text').innerText = `${stats.progress}% Selesai`;
    },
    renderTasks: (tasks, containerId, onEdit, onDelete, onToggleStatus) => {
        const container = $(`#${containerId}`);
        container.innerHTML = '';
        if (tasks.length === 0) { container.innerHTML = '<div class="empty-state glass">Belum ada tugas.</div>'; return; }
        tasks.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card glass ${task.status === 'done' ? 'done' : ''} priority-${task.priority}`;
            card.innerHTML = `
                <div class="task-header"><h3 class="task-title">${task.title}</h3><span class="badge priority-${task.priority}">${task.priority.toUpperCase()}</span></div>
                <p class="task-desc">${task.desc}</p>
                <div class="task-footer">
                    <span class="task-date">📅 ${formatDate(task.deadline)}</span>
                    <div class="task-actions">
                        <button class="btn-icon btn-toggle" data-id="${task.id}" title="Toggle">${task.status === 'done' ? '✅' : '⭕'}</button>
                        <button class="btn-icon btn-edit" data-id="${task.id}" title="Edit">✏️</button>
                        <button class="btn-icon btn-delete" data-id="${task.id}" title="Hapus">🗑️</button>
                    </div>
                </div>`;
            container.appendChild(card);
        });
        $$(`#${containerId} .btn-toggle`).forEach(btn => btn.addEventListener('click', (e) => onToggleStatus(e.currentTarget.dataset.id)));
        $$(`#${containerId} .btn-edit`).forEach(btn => btn.addEventListener('click', (e) => onEdit(e.currentTarget.dataset.id)));
        $$(`#${containerId} .btn-delete`).forEach(btn => btn.addEventListener('click', (e) => onDelete(e.currentTarget.dataset.id)));
    },
    renderActivityLog: (logs) => {
        const container = $('#activity-list');
        container.innerHTML = '';
        if (logs.length === 0) { container.innerHTML = '<div class="empty-state glass">Belum ada log aktivitas.</div>'; return; }
        logs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'activity-item glass';
            item.innerHTML = `<div class="activity-type ${log.type.toLowerCase()}">${log.type}</div><div class="activity-detail">${log.detail}</div><div class="activity-time">${formatDate(log.timestamp)}</div>`;
            container.appendChild(item);
        });
    },
    setTheme: (isDark) => {
        if (isDark) { document.body.classList.add('dark-mode'); $('#theme-toggle').innerText = '☀️'; }
        else { document.body.classList.remove('dark-mode'); $('#theme-toggle').innerText = '🌙'; }
    }
};