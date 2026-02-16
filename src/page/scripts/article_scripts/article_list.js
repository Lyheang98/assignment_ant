// ==========================================
// ARTICLE LIST CORE LOGIC
// ==========================================
let ownArticles = [];

// 1. Initialize the page
async function initArticleList() {
    const tableBody = document.getElementById("articleTableBody");
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    }
    await fetchOwnArticles();
}

// 2. Fetch data using your Postman GET endpoint
async function fetchOwnArticles() {
    const token = localStorage.getItem("token");
    const url = `${BASE_URL}/articles/own?_page=1&_per_page=100&sortBy=createdAt&sortDir=asc`;

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const result = await response.json();

        if (result.result) {
            ownArticles = result.data.items;
            renderOwnArticlesTable(result.data);
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

// 3. Render the table as shown in your design
function renderOwnArticlesTable(data) {
    const tableBody = document.getElementById("articleTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    ownArticles.forEach(item => {
        tableBody.innerHTML += `
            <tr>
                <td class="fw-bold">${item.title}</td>
                <td><span class="badge bg-info text-dark">${item.category?.name || 'N/A'}</span></td>
                <td class="text-truncate" style="max-width: 150px;">${item.content}</td>
                <td>
                    <img src="${item.thumbnail}" class="rounded border" style="width:60px; height:40px; object-fit:cover;">
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id})">
                        ✏️
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle(${item.id})">
                        🗑️
                    </button>
                </td>
            </tr>
        `;
    });

    // Update range info
    const rangeDisplay = document.getElementById("rangeInfo");
    if (rangeDisplay) {
        rangeDisplay.textContent = `Showing 1–${ownArticles.length} of ${data?.total_items || ownArticles.length}`;
    }
}

// Ensure these functions are globally accessible for the onclick handlers
window.openEditModal = function(id) {
    const article = ownArticles.find(a => a.id === id);
    if (!article) return;

    document.getElementById("editArticleId").value = article.id;
    document.getElementById("editTitle").value = article.title;
    document.getElementById("editContent").value = article.content;
    document.getElementById("editThumbnail").value = article.thumbnail;
    document.getElementById("editThumbnailPreview").src = article.thumbnail;

    const modal = new bootstrap.Modal(document.getElementById("editArticleModal"));
    modal.show();
};

window.deleteArticle = async function(id) {
    if (!confirm("Are you sure you want to delete this article?")) return;
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${BASE_URL}/articles/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) initArticleList();
    } catch (err) {
        console.error("Delete failed", err);
    }
};