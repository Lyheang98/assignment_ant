// Handle Create Article button click
document.addEventListener("DOMContentLoaded", function() {
    const createBtn = document.getElementById("createArticleBtn");
    if (createBtn) {
        createBtn.addEventListener("click", function() {
            // Try to use SPA navigation if available
            const navCreate = document.querySelector('[data-page="articleCreate"]');
            if (navCreate) {
                navCreate.click();
            } else {
                // Fallback: direct link
                window.location.href = "../article_page/article_create.html";
            }
        });
    }
});
// ==========================================
// ARTICLE LIST CORE LOGIC (FIXED)
// ==========================================
let ownArticles = [];

// 1. Initialize and ensure it's globally accessible
window.initArticleList = async function() {
    const tableBody = document.getElementById("articleTableBody");
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    }
    await fetchOwnArticles();
};

// 2. Fetch data
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
            console.log("Fetched articles from server:", ownArticles);
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}

// 3. Render Table
function renderOwnArticlesTable(data) {
    const tableBody = document.getElementById("articleTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";
    ownArticles.forEach(item => {
        // Cache busting with Date.now() to force image refresh
        const thumbUrl = item.thumbnail ? `${item.thumbnail}?t=${Date.now()}` : 'https://via.placeholder.com/60x40?text=No+Image';
        
        tableBody.innerHTML += `
            <tr>
                <td class="fw-bold">${item.title}</td>
                <td><span class="badge bg-light text-dark border">${item.category?.name || 'N/A'}</span></td>
                <td class="text-truncate" style="max-width: 150px;">${item.content}</td>
                <td>
                    <img src="${thumbUrl}" class="rounded border" style="width:60px; height:40px; object-fit:cover;">
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${item.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteArticle(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    const rangeDisplay = document.getElementById("rangeInfo");
    if (rangeDisplay) {
        rangeDisplay.textContent = `Showing 1–${ownArticles.length} of ${data?.total_items || ownArticles.length}`;
    }
}

// 4. Open edit modal
window.openEditModal = function(id) {
    const article = ownArticles.find(a => a.id === id);
    if (!article) return;

    document.getElementById("editArticleId").value = article.id;
    document.getElementById("editTitle").value = article.title;
    document.getElementById("editContent").value = article.content;

    const categorySelect = document.getElementById("editCategory");
    if (categorySelect) categorySelect.value = article.categoryId || "";

    const thumbPreview = document.getElementById("editThumbnailPreview");
    if (thumbPreview) {
        thumbPreview.src = article.thumbnail ? `${article.thumbnail}?t=${Date.now()}` : "";
    }

    const modal = new bootstrap.Modal(document.getElementById("editArticleModal"));
    modal.show();
};

// 5. Handle edit form submit (Fixed Duplicate Logic & Thumbnail Error)
document.getElementById("editArticleForm")?.addEventListener("submit", async function(e) {
    e.preventDefault();

    const id = document.getElementById("editArticleId").value;
    const title = document.getElementById("editTitle").value;
    const content = document.getElementById("editContent").value;
    const thumbInput = document.getElementById("editThumbnail");
    const categorySelect = document.getElementById("editCategory");
    const categoryId = categorySelect ? categorySelect.value : null;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    
    formData.append("title", title);
    formData.append("content", content);
    if (categoryId) formData.append("categoryId", categoryId);
    
    // Only append thumbnail if a new file is selected
    if (thumbInput.files && thumbInput.files[0]) {
        formData.append("thumbnail", thumbInput.files[0]);
    }

    try {
        const res = await fetch(`${BASE_URL}/articles/${id}`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData // Use FormData to avoid JSON "property thumbnail" errors
        });

        if (res.ok) {
            const modalEl = document.getElementById("editArticleModal");
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();
            
            initArticleList(); // Refresh table
        } else {
            const err = await res.json();
            alert("Error: " + (err.message || "Update failed"));
        }
    } catch (err) {
        console.error("Update failed", err);
    }
});

// 6. Delete Logic
let articleIdToDelete = null;

window.deleteArticle = function(id) {
    articleIdToDelete = id;
    const delModal = new bootstrap.Modal(document.getElementById("deleteArticleModal"));
    delModal.show();
};

document.getElementById("confirmDeleteArticleBtn")?.addEventListener("click", async function() {
    if (!articleIdToDelete) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${BASE_URL}/articles/${articleIdToDelete}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
            const delModalEl = document.getElementById("deleteArticleModal");
            bootstrap.Modal.getInstance(delModalEl).hide();
            initArticleList();
        }
    } catch (err) {
        console.error("Delete failed", err);
    }
});