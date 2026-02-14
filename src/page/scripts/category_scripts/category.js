window.initCategory = function () {

  const BASE_URL = "https://blogs2.csm.linkpc.net/api/v1/categories";
  const token = localStorage.getItem("token");

  const tbody = document.getElementById("displayCategory");
  if (!tbody) return;

  const createModal = new bootstrap.Modal(
    document.getElementById("categoryCreateModal")
  );
  const editModal = new bootstrap.Modal(
    document.getElementById("categoryEditModal")
  );
  const deleteModal = new bootstrap.Modal(
    document.getElementById("categoryDeleteModal")
  );
  const alertModal = new bootstrap.Modal(
    document.getElementById("categoryAlertModal")
  );

  let editId = null;
  let deleteId = null;

  function showAlert(title, message, type = "primary") {
    document.getElementById("alertModalTitle").innerText = title;
    document.getElementById("alertModalBody").innerText = message;

    const header = document
      .getElementById("categoryAlertModal")
      .querySelector(".modal-header");

    header.className = "modal-header bg-" + type + " text-white";

    alertModal.show();
  }

  function fetchCategories() {
    fetch(BASE_URL + "?_page=1&_per_page=100&sortBy=name&sortDir=ASC", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => render(data?.data?.items || []))
      .catch(() => {
        tbody.innerHTML =
          `<tr><td colspan="2" class="text-danger text-center">Failed to load</td></tr>`;
      });
  }

  function render(categories) {
    tbody.innerHTML = "";

    if (!categories.length) {
      tbody.innerHTML =
        `<tr><td colspan="2" class="text-muted text-center">No categories</td></tr>`;
      return;
    }

    categories.forEach(cat => {
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

  // CREATE OPEN
  document.getElementById("createNewBtn").onclick = () => {
    document.getElementById("categoryName").value = "";
    createModal.show();
  };

  // CREATE
  document.getElementById("btnCreate").onclick = () => {
    const name = document.getElementById("categoryName").value.trim();

    if (!name) {
      showAlert("Warning", "Category name cannot be empty", "warning");
      return;
    }

    fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    })
      .then(() => {
        createModal.hide();
        fetchCategories();
        showAlert("Success", "Category created", "success");
      })
      .catch(() => showAlert("Error", "Create failed", "danger"));
  };

  // TABLE EVENTS
  tbody.onclick = (e) => {

    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");

    if (editBtn) {
      editId = editBtn.dataset.id;
      document.getElementById("editCategoryName").value =
        editBtn.dataset.name;
      editModal.show();
    }

    if (deleteBtn) {
      deleteId = deleteBtn.dataset.id;
      deleteModal.show();
    }
  };

  // EDIT
  document.getElementById("btnEdit").onclick = () => {
    const name = document.getElementById("editCategoryName").value.trim();

    if (!name) {
      showAlert("Warning", "Category name cannot be empty", "warning");
      return;
    }

    fetch(`${BASE_URL}/${editId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    })
      .then(() => {
        editModal.hide();
        fetchCategories();
        showAlert("Success", "Updated successfully", "success");
      })
      .catch(() => showAlert("Error", "Update failed", "danger"));
  };

  // DELETE
  document.getElementById("confirmDeleteBtn").onclick = () => {
    fetch(`${BASE_URL}/${deleteId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        deleteModal.hide();
        fetchCategories();
        showAlert("Deleted", "Category deleted", "success");
      })
      .catch(() => showAlert("Error", "Delete failed", "danger"));
  };

  fetchCategories();
};
