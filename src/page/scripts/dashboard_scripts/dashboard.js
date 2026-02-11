/* =====================================================
   ELEMENTS
===================================================== */
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
const dashboardtoolbar = document.getElementById("dashboardtool");
const createBtn = document.getElementById("createBtn");
const rangeInfo = document.getElementById("rangeInfo");


/* =====================================================
   STATE
===================================================== */
let allArticles = [];
let currentPage = 1;
const itemsPerPage = 6;

/* =====================================================
   PAGE CONFIG
===================================================== */
const pageConfig = {
  dashboard: { title: "Dashboard", file: null },
  articleList: {
    title: "Article List",
    file: "../article_page/article_list.html",
  },
  articleCreate: {
    title: "Create Article",
    file: "../article_page/article_create.html",
  },
  category: {
    title: "Category",
    file: "../category_page/category.html",
  },
};

/* =====================================================
   SIDEBAR NAVIGATION
===================================================== */
navLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const page = link.dataset.page;

    if (page === "logout") {
      window.location.href = "../auth_page/logout.html";
      return;
    }

    const config = pageConfig[page];
    if (!config) return;

    pageContents.forEach((p) => p.classList.add("d-none"));
    const selectedPage = document.getElementById(`page-${page}`);
    selectedPage.classList.remove("d-none");
    pageTitle.textContent = config.title;
    // ✅ Show toolbar only on dashboard
    if (page === "dashboard") {
      dashboardtoolbar?.classList.remove("d-none");
    } else {
      dashboardtoolbar?.classList.add("d-none");
    }

    navLinks.forEach((l) => {
      l.classList.remove("text-white");
      l.classList.add("text-white-50");
      l.style.background = "transparent";
    });

    link.classList.add("text-white");
    link.classList.remove("text-white-50");
    link.style.background = "rgba(255,255,255,0.1)";

    if (config.file) {
      selectedPage.innerHTML = `<div class="p-3 text-muted">Loading...</div>`;
      const res = await fetch(config.file);
      const html = await res.text();
      selectedPage.innerHTML = html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<link[^>]*>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    }

    if (window.innerWidth < 992) sidebar.classList.remove("show");
  });
});

/* =====================================================
   SIDEBAR TOGGLE
===================================================== */
toggleBtn.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});
function showSkeleton(count = 6) {
  articleList.innerHTML = "";
  for (let i = 0; i < count; i++) {
      let skeletoncard =
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
      </div> `
    ;
    articleList.innerHTML += skeletoncard;
  }
  
}

function renderWithSkeleton() {
  showSkeleton(itemsPerPage);
  setTimeout(() => {
    renderArticles();
  }, 800);
}
/* =====================================================
   FETCH ARTICLES
===================================================== */
const articleApi =
  "https://blogs2.csm.linkpc.net/api/v1/articles?search=&_page=1&_per_page=100";
  showSkeleton(itemsPerPage);

fetch(articleApi)
  .then((res) => res.json())
  .then((data) => {
    allArticles = data.data.items || [];
    renderArticles();
  })
  .catch(() => {
    articleList.innerHTML = `<div class="alert alert-danger">Failed to load articles</div>`;
  });

/* =====================================================
   RENDER (SEARCH + PAGINATION INSIDE)
===================================================== */
function renderArticles() {
  articleList.innerHTML = "";

  const keyword = searchInput.value.toLowerCase().trim();

  // 1️⃣ FILTER
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

  // 3️⃣ RENDER
  pageArticles.forEach((item) => {
    let cardarticle = `
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
              <span class="text-muted small">ID: ${item.creator.id}</span>
            </div>
          </div>
        </div>
      </div>
      `;
    articleList.innerHTML += cardarticle;
  });


  // 4️⃣ PAGINATION + RANGE INFO
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  if (totalItems === 0) {
    rangeInfo.textContent = "Showing 0–0 of 0";
  } else {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(startItem + pageArticles.length - 1, totalItems);
    rangeInfo.textContent = `Showing ${startItem}–${endItem} of ${totalItems}`;
  }

}

/* =====================================================
   SEARCH
===================================================== */
searchInput.addEventListener("input", () => {
  currentPage = 1;
   renderWithSkeleton();
});

/* =====================================================
   PAGINATION BUTTONS
===================================================== */
prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
     renderWithSkeleton();
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
   renderWithSkeleton();
});


createBtn?.addEventListener("click", () => {
  const createLink = document.querySelector(
    '.nav-link[data-page="articleCreate"]'
  );

  if (createLink) {
    createLink.click(); 
  }
});

