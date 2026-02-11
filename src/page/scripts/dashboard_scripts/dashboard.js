/* =====================================================
   ELEMENTS
===================================================== */
const navLinks = document.querySelectorAll(".nav-link[data-page]");
const toggleBtn = document.getElementById("toggleBtn");
const sidebar = document.getElementById("sidebar");

const articleList = document.getElementById("article");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");
const searchInput = document.getElementById("searchInput");
const rangeInfo = document.getElementById("rangeInfo");
const createBtn = document.getElementById("createBtn");

/* =====================================================
   ROUTING CONFIG (CLEAN URLS)
===================================================== */
const pageRoutes = {
  dashboard: "/dashboard",
  articleList: "/article-list",
  articleCreate: "/article-create",
  category: "/category",
  logout: "/login"
};

/* =====================================================
   SIDEBAR NAVIGATION (REAL PAGE ROUTING)
===================================================== */
navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const page = link.dataset.page;
    const route = pageRoutes[page];

    if (!route) return;

    window.location.href = route;
  });
});

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */
toggleBtn?.addEventListener("click", () => {
  sidebar?.classList.toggle("show");
});

/* =====================================================
   STATE
===================================================== */
let allArticles = [];
let currentPage = 1;
const itemsPerPage = 6;

/* =====================================================
   SKELETON LOADING
===================================================== */
function showSkeleton(count = 6) {
  if (!articleList) return;

  articleList.innerHTML = "";

  for (let i = 0; i < count; i++) {
    articleList.insertAdjacentHTML(
      "beforeend",
      `
      <div class="col-md-4 mb-4">
        <div class="card h-100 border rounded-3 overflow-hidden">
          <div class="skeleton skeleton-img"></div>
          <div class="card-body">
            <div class="skeleton skeleton-text short"></div>
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text"></div>
          </div>
          <div class="card-footer bg-white border-top">
            <div class="d-flex align-items-center gap-3">
              <div class="skeleton rounded-circle" style="width:40px;height:40px;"></div>
              <div class="skeleton skeleton-text short"></div>
            </div>
          </div>
        </div>
      </div>
      `
    );
  }
}

/* =====================================================
   FETCH ARTICLES
===================================================== */
const articleApi =
  "https://blogs2.csm.linkpc.net/api/v1/articles?search=&_page=1&_per_page=100";

if (articleList) {
  showSkeleton(itemsPerPage);

  fetch(articleApi)
    .then((res) => res.json())
    .then((data) => {
      allArticles = data.data.items || [];
      renderArticles();
    })
    .catch(() => {
      articleList.innerHTML =
        `<div class="alert alert-danger">Failed to load articles</div>`;
    });
}

/* =====================================================
   RENDER ARTICLES (SEARCH + PAGINATION)
===================================================== */
function renderArticles() {
  if (!articleList) return;

  articleList.innerHTML = "";

  const keyword = searchInput?.value.toLowerCase().trim() || "";

  const filtered = allArticles.filter((item) => {
    const firstName = item.creator?.firstName?.toLowerCase() || "";
    const lastName = item.creator?.lastName?.toLowerCase() || "";
    const fullName = `${firstName} ${lastName}`;

    return (
      item.title?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword) ||
      fullName.includes(keyword)
    );
  });

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageArticles = filtered.slice(start, end);

  pageArticles.forEach((item) => {
    const card = `
      <div class="col-md-4 mb-4">
        <div class="card h-100 border rounded-3 overflow-hidden">
          <img src="${item.thumbnail}" class="card-img-top" style="max-height:220px;object-fit:cover">
          <div class="card-body">
            <span class="badge bg-primary mb-2">${item.category}</span>
            <h5 class="text-darkblue">${item.title}</h5>
            <p class="text-darkblue">${item.content.slice(0,120)}...</p>
          </div>
          <div class="card-footer bg-white border-top">
            <div class="d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-3">
                <img
                  src="${item.creator?.avatar || 'https://via.placeholder.com/40'}"
                  class="rounded-circle"
                  style="width:40px;height:40px;object-fit:cover"
                />
                <span class="fw-semibold text-darkblue">
                  ${item.creator?.firstName || ""} ${item.creator?.lastName || ""}
                </span>
              </div>
              <span class="text-muted small">ID: ${item.creator?.id || ""}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    articleList.innerHTML += card;
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  if (prevBtn) prevBtn.disabled = currentPage === 1;
  if (nextBtn) nextBtn.disabled = currentPage === totalPages;

  if (rangeInfo) {
    if (totalItems === 0) {
      rangeInfo.textContent = "Showing 0–0 of 0";
    } else {
      const startItem = (currentPage - 1) * itemsPerPage + 1;
      const endItem = Math.min(startItem + pageArticles.length - 1, totalItems);
      rangeInfo.textContent = `Showing ${startItem}–${endItem} of ${totalItems}`;
    }
  }
}

/* =====================================================
   SEARCH
===================================================== */
searchInput?.addEventListener("input", () => {
  currentPage = 1;
  showSkeleton(itemsPerPage);
  setTimeout(renderArticles, 500);
});

/* =====================================================
   PAGINATION
===================================================== */
prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    showSkeleton(itemsPerPage);
    setTimeout(renderArticles, 500);
  }
});

nextBtn?.addEventListener("click", () => {
  currentPage++;
  showSkeleton(itemsPerPage);
  setTimeout(renderArticles, 500);
});

/* =====================================================
   CREATE BUTTON
===================================================== */
createBtn?.addEventListener("click", () => {
  window.location.href = "/article-create";
});
