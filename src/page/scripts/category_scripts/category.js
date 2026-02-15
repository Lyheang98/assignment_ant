function initCategory() {
  // ================= OPEN CREATE MODAL =================
  const createNewBtn = document.getElementById("createNewBtn");

  createNewBtn?.addEventListener("click", () => {
    document.getElementById("categoryName").value = "";
    createModal.show();
  });

  if (typeof BASE_URL === "undefined") {
    console.error("BASE_URL is not defined");
    return;
  }

  const token = localStorage.getItem("token");
  const CATEGORY_ENDPOINT = BASE_URL + "/categories";

  const tbody = document.getElementById("displayCategory");
  if (!tbody) {
    console.error("displayCategory not found");
    return;
  }

  const createModalEl = document.getElementById("categoryCreateModal");
  const editModalEl = document.getElementById("categoryEditModal");
  const deleteModalEl = document.getElementById("categoryDeleteModal");
  const alertModalEl = document.getElementById("categoryAlertModal");

  const createModal = new bootstrap.Modal(createModalEl);
  const editModal = new bootstrap.Modal(editModalEl);
  const deleteModal = new bootstrap.Modal(deleteModalEl);
  const alertModal = new bootstrap.Modal(alertModalEl);

  let editId = null;
  let deleteId = null;

  // ================= ALERT =================
  function showAlert(title, message, type = "primary") {
    document.getElementById("alertModalTitle").innerText = title;
    document.getElementById("alertModalBody").innerText = message;

    const header = alertModalEl.querySelector(".modal-header");
    header.className = "modal-header bg-" + type + " text-white";

    alertModal.show();
  }

  // ================= FETCH =================
  async function fetchCategories() {
    tbody.innerHTML = `
      <tr>
        <td colspan="2" class="text-center">
          <div class="spinner-border spinner-border-sm"></div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch(
        CATEGORY_ENDPOINT + "?_page=1&_per_page=100&sortBy=name&sortDir=ASC",
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const data = await res.json();

      if (!data.result) {
        render([]);
        return;
      }

      render(data.data.items || []);
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `<tr><td colspan="2" class="text-danger text-center">Failed to load</td></tr>`;
    }
  }

  // ================= RENDER =================
  function render(categories) {
    tbody.innerHTML = "";

    if (!categories.length) {
      tbody.innerHTML = `<tr><td colspan="2" class="text-muted text-center">No categories</td></tr>`;
      return;
    }

    categories.forEach((cat) => {
      tbody.innerHTML += `
        <tr>
          <td class="ps-4">${cat.name}</td>
          <td class="text-end pe-4">
            <button class="btn btn-sm btn-outline-secondary me-2 edit-btn"
              data-id="${cat.id}" data-name="${cat.name}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger delete-btn"
              data-id="${cat.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>`;
    });
  }

  // ================= CREATE =================
  document.getElementById("btnCreate").onclick = async () => {
    const name = document.getElementById("categoryName").value.trim();

    if (!name) {
      showAlert("Warning", "Category name cannot be empty", "warning");
      return;
    }

    try {
      const res = await fetch(CATEGORY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!data.result) {
        showAlert("Error", data.message, "danger");
        return;
      }

      createModal.hide();
      fetchCategories();
      showAlert("Success", "Category created", "success");
    } catch {
      showAlert("Error", "Create failed", "danger");
    }
  };

  // ================= TABLE EVENTS =================
  tbody.onclick = (e) => {
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      editId = editBtn.dataset.id;
      document.getElementById("editCategoryName").value = editBtn.dataset.name;
      editModal.show();
    }

    if (deleteBtn) {
      deleteId = deleteBtn.dataset.id;
      deleteModal.show();
    }
  };

  // ================= EDIT =================
  document.getElementById("btnEdit").onclick = async () => {
    const name = document.getElementById("editCategoryName").value.trim();

    if (!name) {
      showAlert("Warning", "Category name cannot be empty", "warning");
      return;
    }

    await fetch(CATEGORY_ENDPOINT + "/" + editId, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name }),
    });

    editModal.hide();
    fetchCategories();
    showAlert("Success", "Updated successfully", "success");
  };

  // ================= DELETE =================
  document.getElementById("confirmDeleteBtn").onclick = async () => {
    await fetch(CATEGORY_ENDPOINT + "/" + deleteId, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    deleteModal.hide();
    fetchCategories();
    showAlert("Deleted", "Category deleted", "success");
  };

  fetchCategories();
}
