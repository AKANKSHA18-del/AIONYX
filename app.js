const API_URL = '/api';

// --- CONFIG & HELPERS ---
const getToken = () => localStorage.getItem('token');
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`
});

function escapeSingleQuotes(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
}

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        fetchSections();
    }
});

// --- CONTENT CONTROLLER ---
async function fetchSections() {
    try {
        const res = await fetch(`${API_URL}/content/sections`, { headers: getHeaders() });
        const sections = await res.json();
        renderSections(sections);
    } catch (err) {
        console.error('Core error:', err);
    }
}

async function renderSections(sections) {
    const container = document.getElementById('sectionsContainer');
    container.innerHTML = '';

    for (const section of sections) {
        const qRes = await fetch(`${API_URL}/content/questions/${section.id}`, { headers: getHeaders() });
        const questions = await qRes.json();

        const sectionEl = document.createElement('div');
        sectionEl.className = 'section-card';

        let questionsHtml = '';
        if (questions.length > 0) {
            questions.forEach(q => {
                questionsHtml += `
                    <div class="problem-card" id="problem-${q.id}">
                        <div class="problem-main" onclick="toggleProblem(${q.id})">
                            <div class="problem-info">
                                <span class="difficulty-pill pill-${q.difficulty || 'Medium'}">${q.difficulty || 'Medium'}</span>
                                <span class="problem-title">${q.title}</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div class="actions">
                                    <button class="btn btn-ghost" style="padding: 4px 8px;" onclick="event.stopPropagation(); openContentModal(${section.id}, ${q.id})">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-ghost" style="padding: 4px 8px; color: var(--error);" onclick="event.stopPropagation(); deleteQuestion(${q.id})">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <i class="fas fa-chevron-down problem-expand-btn"></i>
                            </div>
                        </div>
                        <div class="problem-details" id="details-${q.id}">
                            <div class="detail-tabs">
                                <button class="tab-btn active" onclick="switchTab(${q.id}, 'procedure')">Procedure</button>
                                <button class="tab-btn" onclick="switchTab(${q.id}, 'solution')">Solution</button>
                                <button class="tab-btn" onclick="switchTab(${q.id}, 'metadata')">Properties</button>
                            </div>
                            
                            <div id="tab-procedure-${q.id}" class="tab-content active">
                                <div class="content-box">${q.procedure || 'No procedure documented.'}</div>
                            </div>
                            
                            <div id="tab-solution-${q.id}" class="tab-content">
                                <div class="content-box">${q.answer || 'No solution provided.'}</div>
                            </div>

                            <div id="tab-metadata-${q.id}" class="tab-content">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <p style="color: var(--text-muted); font-size: 0.8rem;">Time Complexity</p>
                                        <p style="font-weight: 600;">${q.time_complexity || 'TBD'}</p>
                                    </div>
                                    <div>
                                        <p style="color: var(--text-muted); font-size: 0.8rem;">Space Complexity</p>
                                        <p style="font-weight: 600;">${q.space_complexity || 'TBD'}</p>
                                    </div>
                                </div>
                                <div style="margin-top: 1rem;">
                                    <p style="color: var(--text-muted); font-size: 0.8rem;">LeetCode Connection</p>
                                    <a href="${q.leetcode_url}" target="_blank" style="color: var(--primary); font-size: 0.9rem; text-decoration: none;">Link to External Problem <i class="fas fa-external-link-alt"></i></a>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
        } else {
            questionsHtml = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Architect your first problem for this chapter.</p>';
        }

        sectionEl.innerHTML = `
            <div class="section-header">
                <span class="section-title">${section.section_name}</span>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-ghost" onclick="openContentModal(${section.id})"><i class="fas fa-plus"></i> Add Problem</button>
                    <button class="btn btn-ghost" onclick="openSectionModal(${section.id}, '${section.section_name}')"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-ghost" onclick="deleteSection(${section.id})"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            ${questionsHtml}
        `;
        container.appendChild(sectionEl);
    }
}

// --- UI INTERACTIONS ---
window.toggleProblem = (id) => {
    const card = document.getElementById(`problem-${id}`);
    const details = document.getElementById(`details-${id}`);
    const isExpanded = card.classList.contains('expanded');

    // Close others
    document.querySelectorAll('.problem-card.expanded').forEach(el => {
        if (el.id !== `problem-${id}`) {
            el.classList.remove('expanded');
            el.querySelector('.problem-details').style.display = 'none';
        }
    });

    if (isExpanded) {
        card.classList.remove('expanded');
        details.style.display = 'none';
    } else {
        card.classList.add('expanded');
        details.style.display = 'block';
    }
};

window.switchTab = (id, tabName) => {
    const details = document.getElementById(`details-${id}`);
    details.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    details.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(`tab-${tabName}-${id}`).classList.add('active');
};

// --- MODAL OPERATIONS ---
window.openSectionModal = (id = null, name = '') => {
    document.getElementById('sectionId').value = id || '';
    document.getElementById('sectionName').value = name;
    document.getElementById('sectionModalTitle').innerText = id ? 'Edit Chapter Architect' : 'Create New Chapter';
    document.getElementById('sectionModal').style.display = 'block';
};

window.openContentModal = async (sectionId, qId = null) => {
    document.getElementById('contentSectionId').value = sectionId;
    document.getElementById('contentId').value = qId || '';

    if (qId) {
        const qRes = await fetch(`${API_URL}/content/questions/${sectionId}`, { headers: getHeaders() });
        const questions = await qRes.json();
        const q = questions.find(x => x.id == qId);

        if (q) {
            document.getElementById('contentTitle').value = q.title;
            document.getElementById('contentUrl').value = q.leetcode_url;
            document.getElementById('contentDifficulty').value = q.difficulty;
            document.getElementById('contentProcedure').value = q.procedure || '';
            document.getElementById('contentAnswer').value = q.answer || '';
            document.getElementById('contentTime').value = q.time_complexity;
            document.getElementById('contentSpace').value = q.space_complexity;
            document.getElementById('contentInsights').value = q.key_insights;
        }
    } else {
        document.getElementById('contentForm').reset();
    }

    document.getElementById('contentModalTitle').innerText = qId ? 'Edit Problem Architect' : 'New Problem Architect';
    document.getElementById('contentModal').style.display = 'block';
};

window.closeModal = (id) => {
    document.getElementById(id).style.display = 'none';
};

// --- FORM SUBMISSIONS ---
document.getElementById('sectionForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('sectionId').value;
    const section_name = document.getElementById('sectionName').value;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/content/sections/${id}` : `${API_URL}/content/sections`;

    try {
        const res = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify({ section_name })
        });
        if (res.ok) {
            closeModal('sectionModal');
            fetchSections();
        }
    } catch (err) { console.error(err); }
});

document.getElementById('contentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('contentId').value;
    const section_id = document.getElementById('contentSectionId').value;

    const data = {
        section_id,
        title: document.getElementById('contentTitle').value,
        leetcode_url: document.getElementById('contentUrl').value,
        difficulty: document.getElementById('contentDifficulty').value,
        procedure: document.getElementById('contentProcedure').value,
        answer: document.getElementById('contentAnswer').value,
        time_complexity: document.getElementById('contentTime').value,
        space_complexity: document.getElementById('contentSpace').value,
        key_insights: document.getElementById('contentInsights').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/content/questions/${id}` : `${API_URL}/content/questions`;

    try {
        const res = await fetch(url, {
            method,
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (res.ok) {
            closeModal('contentModal');
            fetchSections();
        }
    } catch (err) { console.error(err); }
});

// --- DELETIONS ---
window.deleteSection = async (id) => {
    if (!confirm('Destroy this chapter and all associated architecture?')) return;
    await fetch(`${API_URL}/content/sections/${id}`, { method: 'DELETE', headers: getHeaders() });
    fetchSections();
};

window.deleteQuestion = async (id) => {
    if (!confirm('Remove this problem architect?')) return;
    await fetch(`${API_URL}/content/questions/${id}`, { method: 'DELETE', headers: getHeaders() });
    fetchSections();
};

// --- LOGOUT ---
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = 'login.html';
});
