document.addEventListener('DOMContentLoaded', () => {
    // Data
    let plans = JSON.parse(localStorage.getItem('academicPlans')) || [];

    const plannerForm = document.getElementById('planner-form');
    const plannerTableBody = document.getElementById('planner-table-body');
    const filterInput = document.getElementById('filter-subject');

    // Utilities
    const savePlans = () => localStorage.setItem('academicPlans', JSON.stringify(plans));
    const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    // Highlight Active Nav
    const currentPage = window.location.pathname.split("/").pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === currentPage) link.classList.add('active');
    });

    // Dashboard stats (if present)
    if (document.getElementById('stat-total-subjects')) {
        const subjects = [...new Set(plans.map(p => p.subject))].length;
        const classes = [...new Set(plans.map(p => p.classSection))].length;
        const completed = plans.filter(p => p.status === 'Completed').length;
        const upcoming = plans.filter(p => p.type === 'Exam / Test').length;

        document.getElementById('stat-total-subjects').innerText = subjects;
        document.getElementById('stat-total-classes').innerText = classes;
        document.getElementById('stat-planned').innerText = plans.length;
        document.getElementById('stat-completed').innerText = completed;
        document.getElementById('stat-exams').innerText = upcoming;
    }

    // Render
    function renderPlans(filterData = plans) {
        if (!plannerTableBody) return;
        plannerTableBody.innerHTML = '';

        const data = [...filterData].sort((a, b) => new Date(a.date) - new Date(b.date));
        if (data.length === 0) {
            plannerTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No lesson plans found.</td></tr>';
            return;
        }

        data.forEach(plan => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${plan.date || ''}</td>
                <td><strong>${escapeHtml(plan.subject)}</strong><br><small>${escapeHtml(plan.classSection)}</small></td>
                <td>${escapeHtml(plan.topic)}</td>
                <td><span class="badge">${escapeHtml(plan.type)}</span></td>
                <td><span class="badge ${plan.status === 'Completed' ? 'badge-completed' : 'badge-planned'}">${escapeHtml(plan.status)}</span></td>
                <td>
                    <button onclick="toggleStatus('${plan.id}')">✓</button>
                    <button class="btn-delete" onclick="deletePlan('${plan.id}')">✕</button>
                </td>
            `;
            plannerTableBody.appendChild(row);
        });
    }

    // Simple HTML escaper
    function escapeHtml(str = '') {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Form submit
    if (plannerForm) {
        plannerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newPlan = {
                id: genId(),
                teacher: document.getElementById('teacher-name').value || '',
                subject: document.getElementById('subject').value || '',
                classSection: document.getElementById('class-section').value || '',
                topic: document.getElementById('topic').value || '',
                type: document.getElementById('lesson-type').value || '',
                date: document.getElementById('date').value || '',
                status: document.getElementById('status').value || 'Planned',
                createdAt: new Date().toISOString()
            };

            plans.push(newPlan);
            savePlans();
            plannerForm.reset();
            renderPlans();
            alert('Lesson plan added successfully!');
        });
    }

    // Global functions for CRUD by id
    window.deletePlan = (id) => {
        if (!id) return;
        if (confirm('Are you sure you want to delete this plan?')) {
            plans = plans.filter(p => p.id !== id);
            savePlans();
            renderPlans();
        }
    };

    window.toggleStatus = (id) => {
        const i = plans.findIndex(p => p.id === id);
        if (i === -1) return;
        plans[i].status = plans[i].status === 'Planned' ? 'Completed' : 'Planned';
        savePlans();
        renderPlans();
    };

    // Filter/search
    window.filterPlans = () => {
        const searchTerm = (filterInput && filterInput.value || '').toLowerCase().trim();
        const filtered = plans.filter(p =>
            p.subject.toLowerCase().includes(searchTerm) ||
            p.classSection.toLowerCase().includes(searchTerm) ||
            p.topic.toLowerCase().includes(searchTerm)
        );
        renderPlans(filtered);
    };

    if (filterInput) {
        filterInput.addEventListener('input', () => window.filterPlans());
    }

    // Initial render
    renderPlans();
});