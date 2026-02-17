// global baseurl
const BASE_URL = "https://blogs2.csm.linkpc.net/api/v1";



const navLinks = document.querySelectorAll(".nav-link[data-page]");
const pageTitle = document.getElementById("pageTitle");
const pageContents = document.querySelectorAll(".page-content");
const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");

const articleList = document.getElementById("article");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchInput");
const dashboardToolbar = document.getElementById("dashboardtool");
const createBtn = document.getElementById("createBtn");
const rangeInfo = document.getElementById("rangeInfo");

const logoutModalEl = document.getElementById("dashboardLogoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogout");

// state
let allArticles = [];
let currentPage = 1;
const itemsPerPage = 6;

// log out button

confirmLogoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "../auth_page/login.html";
});

// navigation for all page sidebar
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const page = link.dataset.page;
    if (!page) return;

    // Logout
    if (page === "logout") {
      bootstrap.Modal.getOrCreateInstance(logoutModalEl).show();
      return;
    }

    // Hide all pages
    pageContents.forEach((p) => p.classList.add("d-none"));

    // Show selected page
    const selectedPage = document.getElementById(`page-${page}`);
    if (!selectedPage) {
      console.error(`page-${page} not found`);
      return;
    }

    selectedPage.classList.remove("d-none");

    // Update title
    pageTitle.textContent = link.innerText.trim();

    // Show toolbar only on dashboard
    dashboardToolbar?.classList.toggle("d-none", page !== "dashboard");

    // Initialize pages
    if (page === "dashboard") {
      initDashboard();
    }

    if (page === "category" && typeof initCategory === "function") {
      initCategory();
    }

    if (page === "profile" && typeof loadProfile === "function") {
      loadProfile();
    }

    if (page === "articleCreate" && typeof renderCreateForm === "function") {
      renderCreateForm();
    }

    if (page === "articleList" && typeof initArticleList === "function") {
      initArticleList();
    }


    // Active style
    navLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Close sidebar on mobile
    if (window.innerWidth < 992) {
      sidebar?.classList.remove("show");
    }
  });
});

// mobile sidebar
toggleBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("show");
});

// dashboard data 
const articleApi = `${BASE_URL}/articles?search=&_page=1&_per_page=100`;

function initDashboard() {
  showSkeleton();

  fetch(articleApi)
    .then((res) => res.json())
    .then((data) => {
      allArticles = data.data?.items || [];
      currentPage = 1;
      renderArticles();
    })
    .catch(() => {
      articleList.innerHTML = `<div class="alert alert-danger">Failed to load articles</div>`;
    });
}

// skeleton 
function showSkeleton() {
  if (!articleList) return;

  articleList.innerHTML = "";

  for (let i = 0; i < itemsPerPage; i++) {
    articleList.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="skeleton skeleton-img"></div>
          <div class="card-body">
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
        </div>
      </div>`;
  }
}

// render aritcle by search item title / content / fullname
function renderArticles() {
  if (!articleList) return;

  articleList.innerHTML = "";

  const keyword = searchInput?.value.toLowerCase().trim() || "";


  // filter item by title / content / fullname use filter
  const filtered = allArticles.filter((item) => {
    const fullName =
      `${item.creator?.firstName || ""} ${item.creator?.lastName || ""}`.toLowerCase();

    return (
      item.title?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword) ||
      fullName.includes(keyword)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const pageItems = filtered.slice(start, start + itemsPerPage);

  pageItems.forEach((item) => {
    articleList.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100">

          <img src="${item.thumbnail}"
               class="card-img-top"
               style="max-height:220px;object-fit:cover">

          <div class="card-body">
            <h5 class="fw-semibold text-darkblue">${item.title}</h5>
            <p class="text-muted">
              ${item.content?.slice(0, 120) || ""}...
            </p>
          </div>

          <div class="card-footer bg-white">
            <div class="d-flex align-items-center gap-2">
              <img src="${item.creator?.avatar || "https://via.placeholder.com/40"}"
                   class="rounded-circle"
                   style="width:40px;height:40px;object-fit:cover">
              <div>
                <div class="fw-semibold small text-darkblue">
                  ${item.creator?.firstName || ""} ${item.creator?.lastName || ""}
                </div>
                <div class="text-muted small">
                  ID: ${item.creator?.id || "-"}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>`;
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  rangeInfo.textContent =
    filtered.length === 0
      ? "Showing 0–0 of 0"
      : `Showing ${start + 1}–${start + pageItems.length} of ${filtered.length}`;
}

// search and navigation
searchInput?.addEventListener("input", () => {
  currentPage = 1;
  renderArticles();
});

prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderArticles();
  }
});

nextBtn?.addEventListener("click", () => {
  currentPage++;
  renderArticles();
});

createBtn?.addEventListener("click", () => {
  document.querySelector('[data-page="articleCreate"]')?.click();
});

// default load when login 
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector('[data-page="dashboard"]')?.click();
});
