const BASE_URL = "https://blogs2.csm.linkpc.net/api/v1";
const baseURL = "categories";

let itemsPerPage = 100;
let sortBy = "name";
let sortDir = "ASC";

const tbody = document.getElementById("displayCategory");
const gToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzksImlhdCI6MTc3MDg3MjY1NiwiZXhwIjoxNzcxNDc3NDU2fQ.hraAp2McYJg_Ge9aqENWWcFlaU8KVMzzjNimYPTHtl0";

let editCategoryId = null;
let categories = [];
let allCategories = [];

function fetchCategories() {
  const endPointCategory = `${baseURL}?_page=1&_per_page=${itemsPerPage}&sortBy=${sortBy}&sortDir=${sortDir}`;

  fetch(`${BASE_URL}/${endPointCategory}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${gToken}` },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((data) => {
      allCategories = data?.data?.items || [];
      categories = [...allCategories];
      renderCategoryTable();
    })
    .catch((err) => {
      console.error("Error fetching categories:", err.message);
      tbody.innerHTML = `<tr><td colspan="2" class="text-center text-danger py-3">Cannot connect to API</td></tr>`;
    });
}

function renderCategoryTable() {
  tbody.innerHTML = "";

  if (!categories.length) {
    tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted py-3">No categories found</td></tr>`;
    return;
  }

  categories.forEach((categoryItem) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="ps-4">${escapeHtml(categoryItem.name)}</td>
      <td class="text-end pe-4">
        <button class="btn btn-sm btn-outline-secondary me-2" data-id="${categoryItem.id}" data-name="${escapeHtml(categoryItem.name)}" onclick="openEditModal(${categoryItem.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="btnDelete(${categoryItem.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>`;
    tbody.appendChild(row);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

//=========================================
// Modal alert befor function have processs
function showAlert(title, message, type = "primary") {
  const modalEl = document.getElementById("alertModal");
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById("alertModalTitle").innerText = title;
  document.getElementById("alertModalBody").innerText = message;

  // Change header color
  const header = modalEl.querySelector(".modal-header");
  header.className = "modal-header bg-" + type + " text-white";

  modal.show();
}

// ==============================
function btnCreate() {
  let categoryName = document.getElementById("categoryName").value.trim();

  if (categoryName === "") {
    showAlert("Warning!", "Category name cannot be empty.", "warning");
    return;
  }

  fetch(`${BASE_URL}/${baseURL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(() => {
      const createModalEl = document.getElementById("createModal");
      const modal = bootstrap.Modal.getInstance(createModalEl);
      if (modal) modal.hide();

      clear();
      fetchCategories();

      showAlert("Created!", "Category created successfully.", "success");
    })
    .catch((error) => {
      console.error("Error creating category:", error);
      showAlert("Error!", "Failed to create category.", "danger");
    });
}

//================
function openEditModal(id) {
  editCategoryId = id;
  const button = event.target.closest("button");
  const name = button.dataset.name;
  document.getElementById("editCategoryName").value = name;

  const editModalEl = document.getElementById("editModal");
  const modal = new bootstrap.Modal(editModalEl);
  modal.show();
}

//==================
function btnEdit() {
  let categoryName = document.getElementById("editCategoryName").value.trim();

  if (!editCategoryId) {
    console.error("No category selected for editing.");
    return;
  }

  if (categoryName === "") {
    showAlert("Warning!", "Category name cannot be empty.", "warning");
    return;
  }

  fetch(`${BASE_URL}/${baseURL}/${editCategoryId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${gToken}`,
    },
    body: JSON.stringify({ name: categoryName }),
  })
    .then((response) => {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.json();
    })
    .then(() => {
      const editModalEl = document.getElementById("editModal");
      const modal = bootstrap.Modal.getInstance(editModalEl);
      if (modal) modal.hide();

      fetchCategories();

      showAlert("Updated!", "Category updated successfully.", "success");
    })
    .catch((error) => {
      console.error("Error updating category:", error);
      showAlert("Error!", "Failed to update category.", "danger");
    });
}

let deleteId = null;
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));

function btnDelete(id) {
  deleteId = id; // store selected ID
  deleteModal.show(); // open modal
}

document
  .getElementById("confirmDeleteBtn")
  .addEventListener("click", function () {
    if (!deleteId) return;

    fetch(`${BASE_URL}/${baseURL}/${deleteId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${gToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Delete failed");
        return res.json();
      })
      .then(() => {
        deleteModal.hide();
        fetchCategories();
        showAlert("Deleted!", "Category deleted successfully.", "success");
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        showAlert("Error!", "Failed to delete category.", "danger");
      });
  });

function clear() {
  document.getElementById("categoryName").value = "";
}

// call function
fetchCategories();

// Event listener for create buton
document.getElementById("createNewBtn").addEventListener("click", function () {
  clear();
  const modal = new bootstrap.Modal(document.getElementById("createModal"));
  modal.show();
});
