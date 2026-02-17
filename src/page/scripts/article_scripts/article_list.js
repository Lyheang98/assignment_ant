
document.addEventListener("DOMContentLoaded", function () {
// create article button 
  const createBtn = document.getElementById("createArticleBtn");
  if (createBtn) {
    createBtn.addEventListener("click", function () {
      const navCreate = document.querySelector('[data-page="articleCreate"]');
      if (navCreate) {
        navCreate.click();
      } else {
        window.location.href = "../article_page/article_create.html";
      }
    });
  }

// delete modal
  const confirmDeleteBtn = document.getElementById("confirmDeleteArticleBtn");
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", handleDeleteConfirm);
  }
});

//global state
let ownArticles = [];
let articleIdToDelete = null;

// thumbnail preview
function handleThumbnailChange(event) {
    const file = event.target.files[0];
    const preview = document.getElementById("editThumbnailPreview");

    console.log("File selected:", file); 

    if (!preview) return;

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.src = e.target.result;
            preview.style.display = "block";
            // Add a data attribute to indicate this is a new file
            preview.setAttribute('data-new-file', 'true');
        };
        reader.readAsDataURL(file);
    } else {
        // If no file is selected, hide the preview
        preview.style.display = "none";
        preview.removeAttribute('data-new-file');
    }
}

// loading before fetching
window.initArticleList = async function () {
    const tableBody = document.getElementById("articleTableBody");
    if (tableBody) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading...</td></tr>';
    }
    await fetchOwnArticles();
};

// fetch article 
async function fetchOwnArticles() {
    const token = localStorage.getItem("token");
    // Ensure BASE_URL is defined in your global scope
    const url = `${BASE_URL}/articles/own?_page=1&_per_page=100&sortBy=createdAt&sortDir=asc`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (result.result) {
            ownArticles = result.data.items || [];
            renderOwnArticlesTable();
        }
    } catch (error) {
        console.error("Fetch failed:", error);
    }
}
// render table 
function renderOwnArticlesTable() {
    const tableBody = document.getElementById("articleTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    if (ownArticles.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No Articles Found</td></tr>';
        return;
    }

    ownArticles.forEach((item) => {
        const row = document.createElement("tr");

        // Use Date.now() to force browser to refresh the image from server
        const thumbUrl = item.thumbnail
            ? `${item.thumbnail}?v=${Date.now()}`
            : "https://via.placeholder.com/60x40?text=No+Image";

        row.innerHTML = `
            <td class="fw-bold">${item.title}</td>
            <td>
                <span class="badge bg-light text-dark border">
                    ${item.category?.name || "N/A"}
                </span>
            </td>
            <td class="text-truncate" style="max-width:150px;">
                ${item.content}
            </td>
            <td>
                <div style="
                    width:130px;
                    height:90px;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    border:1px solid #dee2e6;
                    border-radius:6px;
                    background:#f8f9fa;
                    overflow:hidden;
                ">
                  <img src="${thumbUrl}" 
                       alt="Thumbnail"
                       style="
                         max-width:100%;
                         max-height:100%;
                         object-fit:contain;
                         display:block;
                       ">
                </div>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-btn">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;

        row.querySelector(".edit-btn").addEventListener("click", () => openEditPage(item.id));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteArticle(item.id));

        tableBody.appendChild(row);
    });
}

// edit page
function openEditPage(id) {
  const article = ownArticles.find((a) => a.id === id);
  if (!article) return;

  const pageTitleEl = document.getElementById("pageTitle");
  const dashboardToolbar = document.getElementById("dashboardtool");
  const pageContents = document.querySelectorAll(".page-content");
  const editPage = document.getElementById("page-articleEdit");
  const container = document.getElementById("articleEditContainer");

  if (!editPage || !container) {
    console.error("Edit page container not found");
    return;
  }

  // Hide all pages, show edit page
  pageContents.forEach((p) => p.classList.add("d-none"));
  editPage.classList.remove("d-none");

  // Update title and hide dashboard toolbar
  if (pageTitleEl) pageTitleEl.textContent = "Edit Article";
  dashboardToolbar?.classList.add("d-none");

  // Render edit form into the page
  container.innerHTML = `
    <div class="container px-0">
      <div class="mb-3">
        <button type="button" class="btn btn-link text-decoration-none p-0" id="backToArticleList">
          <i class="fas fa-arrow-left me-1"></i> Back to articles
        </button>
      </div>

      <div class="card shadow-sm">
        <form id="editArticleForm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Edit Article</h5>
          </div>
          <div class="card-body">
            <input type="hidden" id="editArticleId" value="${article.id}" />

            <div class="mb-3">
              <label class="form-label">Title</label>
              <input type="text" class="form-control" id="editTitle" value="${article.title || ""}" required />
            </div>

            <div class="mb-3">
              <label class="form-label">Content</label>
              <textarea class="form-control" id="editContent" rows="4">${article.content || ""}</textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Thumbnail</label>
              <input type="file" id="editThumbnail" accept="image/*" class="form-control" />
              <div class="mt-2" style="
                width:180px;
                height:120px;
                display:flex;
                align-items:center;
                justify-content:center;
                border:1px solid #dee2e6;
                border-radius:6px;
                background:#f8f9fa;
                overflow:hidden;
              ">
                <img
                  id="editThumbnailPreview"
                  src="${article.thumbnail ? `${article.thumbnail}?v=${Date.now()}` : ""}"
                  style="max-width:100%; max-height:100%; object-fit:contain; display:${article.thumbnail ? "block" : "none"};"
                />
              </div>
            </div>
          </div>
          <div class="card-footer d-flex justify-content-end gap-2 bg-white">
            <button type="button" class="btn btn-outline-secondary" id="cancelEditArticle">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  // Wire up back / cancel to go back to list
  const goBack = () => {
    const listLink = document.querySelector('[data-page="articleList"]');
    if (listLink) {
      listLink.click();
    } else {
      // Fallback: show list page manually
      pageContents.forEach((p) => p.classList.add("d-none"));
      const listPage = document.getElementById("page-articleList");
      listPage?.classList.remove("d-none");
      if (pageTitleEl) pageTitleEl.textContent = "Article List";
      dashboardToolbar?.classList.add("d-none");
      initArticleList?.();
    }
  };

  document
    .getElementById("backToArticleList")
    ?.addEventListener("click", goBack);
  document
    .getElementById("cancelEditArticle")
    ?.addEventListener("click", goBack);

  // Wire up thumbnail change + submit on the freshly rendered form
  const thumbInput = document.getElementById("editThumbnail");
  thumbInput?.addEventListener("change", handleThumbnailChange);

  const editForm = document.getElementById("editArticleForm");
  editForm?.addEventListener("submit", handleEditSubmit);
}

// edit submit using button save change
async function handleEditSubmit(e) {
  e.preventDefault();

  const id = document.getElementById("editArticleId").value;
  const title = document.getElementById("editTitle").value.trim();
  const content = document.getElementById("editContent").value.trim();
  const thumbInput = document.getElementById("editThumbnail");
  const token = localStorage.getItem("token");

  if (!id) {
    alert("Missing article ID.");
    return;
  }

  if (!title) {
    alert("Title is required.");
    return;
  }

  try {
    // 1) Update article text fields
    const updateRes = await fetch(`${BASE_URL}/articles/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    const updateData = await updateRes.json().catch(() => ({}));

    if (!updateRes.ok || updateData.result === false) {
      throw new Error(updateData.message || "Failed to update article");
    }

    // 2) If user picked a new thumbnail, upload it via thumbnail endpoint
    if (thumbInput?.files?.[0]) {
      const formData = new FormData();
      formData.append("thumbnail", thumbInput.files[0]);

      const thumbRes = await fetch(
        `${BASE_URL}/articles/${id}/thumbnail`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const thumbData = await thumbRes.json().catch(() => ({}));
      if (!thumbRes.ok || thumbData.result === false) {
        throw new Error(thumbData.message || "Failed to update thumbnail");
      }
    }

    // Re-fetch list from server to stay in sync (including new thumbnail URL)
    await fetchOwnArticles();

    // Navigate back to article list page
    const listLink = document.querySelector('[data-page="articleList"]');
    if (listLink) {
      listLink.click();
    }
  } catch (err) {
    console.error("Update failed:", err);
    alert(err.message || "Failed to update article");
  }
}

// delete 
function deleteArticle(id) {
    articleIdToDelete = id;
    const delModalEl = document.getElementById("deleteArticleModal");
    let delModal = bootstrap.Modal.getInstance(delModalEl);
    if (!delModal) delModal = new bootstrap.Modal(delModalEl);
    delModal.show();
}

async function handleDeleteConfirm() {
    if (!articleIdToDelete) return;
    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${BASE_URL}/articles/${articleIdToDelete}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });

    if (res.ok) {
      // Move focus to main content before closing the modal to avoid
      // aria-hidden warnings when Bootstrap hides the dialog.
      const mainEl = document.querySelector("main");
      if (mainEl) {
        mainEl.focus();
      }

      const delModal = bootstrap.Modal.getInstance(
        document.getElementById("deleteArticleModal")
      );
      if (delModal) delModal.hide();
      await fetchOwnArticles();
    }
    } catch (err) {
        console.error("Delete failed:", err);
    }
}