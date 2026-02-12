//
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

const logoutModalEl = document.getElementById("logoutModal");
const confirmLogoutBtn = document.getElementById("confirmLogout");

// declare array to store from api
let allArticles = [];
let currentPage = 1;
const itemsPerPage = 6;

// logout comfirm ( mean that logout is direct to login and roemove token )
confirmLogoutBtn?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href =
    "/src/page/html/auth_page/login.html";
});

const pageConfig = {
  dashboard: { title: "Dashboard", file: null },
  articleList: {
    title: "Article List",
    file: "/src/page/html/article_page/article_list.html",
  },
  articleCreate: {
    title: "Create Article",
    file: "/src/page/html/article_page/article_create.html",
  },
  category: {
    title: "Category",
    file: "/src/page/html/category_page/category.html",
  },
};



//
navLinks.forEach((link) => {
  link.addEventListener("click", async (e) => {
    e.preventDefault();
    // dataset is get value of data-page
    const page = link.dataset.page;

    // handle modal when click logout sidebar
    if (page === "logout") {
      const modal = new bootstrap.Modal(logoutModalEl);
      modal.show();
      return;
    }

    // get value navlink-page in pageconfig and store in config varaible 
    const config = pageConfig[page];
    // Hide pages first
    pageContents.forEach((p) => p.classList.add("d-none"));

    // it get the uniqe id of each page store in selectedpage variable
    const selectedPage = document.getElementById(`page-${page}`);
    // show page when click
    selectedPage.classList.remove("d-none");
    // list the title of page from value of all page that store in config variable
    pageTitle.textContent = config.title;

    // Show toolbar only on dashboard 
    if (page === "dashboard") {
      // it mean show toolbar only dashboard page
      dashboardtoolbar?.classList.remove("d-none");
    } else {
      // mean that we another page is hide the toolbar
      dashboardtoolbar?.classList.add("d-none");
    }

    // Reset active style for navlink
    navLinks.forEach((l) => {
      l.classList.remove("text-white");
      l.classList.add("text-white-50");
      l.style.background = "transparent";
    });

    link.classList.add("text-white");
    link.classList.remove("text-white-50");
    link.style.background = "rgba(255,255,255,0.1)";

    // Load external page if exists
    if (config.file) {
      selectedPage.innerHTML = `<div class="p-3 text-muted">Loading...</div>`;

      // Use fetch becuase to request the file from the config becuase the page file route is in the variable we need to use fetch to request
      fetch(config.file)
        .then((res) => res.text())
        .then((html) => {
          selectedPage.innerHTML = html
          // replace the javascripts link style from external to prevent overide style in dashboard-page
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<link[^>]*>/gi, "")
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
        })
        .catch(() => {
          selectedPage.innerHTML = `
        <div class="alert alert-danger">
          Failed to load page
        </div>`;
        });
    }

    if (window.innerWidth < 992) {
      sidebar.classList.remove("show");
    }
  });
});

// handle toggle btn show when phone screen
toggleBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("show");
});


// render skeleton 
function showSkeleton(count = 6) {
  articleList.innerHTML = "";

  for (let i = 0; i < count; i++) {
    articleList.innerHTML += `
      <div class="col-md-4 mb-4">
        <div class="card h-100 border rounded-3 overflow-hidden">
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
// render skeleton in a page 
function renderWithSkeleton() {
  showSkeleton(itemsPerPage);
  setTimeout(renderArticles, 600);
}

// fetch to get all article
const articleApi =
  "https://blogs2.csm.linkpc.net/api/v1/articles?search=&_page=1&_per_page=100";
// render skeleton before fetching
showSkeleton(itemsPerPage);
// start fetch from api using fetch method
fetch(articleApi)
  .then((res) => res.json())
  .then((data) => {
    allArticles = data.data?.items || [];
    renderArticles();
  })
  .catch(() => {
    articleList.innerHTML = `<div class="alert alert-danger">Failed to load articles</div>`;
  });

/* =====================================================
   RENDER ARTICLES
===================================================== */
function renderArticles() {
  articleList.innerHTML = "";

  const keyword = searchInput.value.toLowerCase().trim();

  const filtered = allArticles.filter((item) => {
    const fullName =
      `${item.creator?.firstName || ""} ${item.creator?.lastName || ""}`.toLowerCase();

    return (
      item.title?.toLowerCase().includes(keyword) ||
      item.content?.toLowerCase().includes(keyword) ||
      fullName.includes(keyword)
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const pageArticles = filtered.slice(start, start + itemsPerPage);

  pageArticles.forEach((item) => {
    articleList.innerHTML += `
      <div class="col-md-4 mb-4">
  <div class="card h-100 border rounded-3 overflow-hidden">

    <!-- Thumbnail -->
    <img src="${item.thumbnail}" 
         class="card-img-top"
         style="max-height:220px;object-fit:cover">

    <!-- Body -->
    <div class="card-body">
      <span class="badge bg-primary mb-2">
        ${item.category}
      </span>

      <h5 class="text-darkblue fw-semibold">
        ${item.title}
      </h5>

      <p class="text-muted">
        ${item.content.slice(0, 120)}...
      </p>
    </div>

    <!-- Footer (Avatar Section) -->
    <div class="card-footer bg-white border-top">
      <div class="d-flex align-items-center justify-content-between">

        <!-- Left: Avatar + Name -->
        <div class="d-flex align-items-center gap-2">
          <img 
            src="${item.creator?.avatar || "https://via.placeholder.com/40"}"
            class="rounded-circle"
            style="width:40px;height:40px;object-fit:cover"
          />

          <div class="d-flex flex-column">
            <span class="fw-semibold text-darkblue small">
              ${item.creator?.firstName || ""} 
              ${item.creator?.lastName || ""}
            </span>
            <span class="text-muted small">
              ID: ${item.creator?.id || "-"}
            </span>
          </div>
        </div>

      </div>
    </div>

  </div>
</div>
`;
  });

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;

  if (totalItems === 0) {
    rangeInfo.textContent = "Showing 0–0 of 0";
  } else {
    rangeInfo.textContent = `Showing ${start + 1}–${start + pageArticles.length} of ${totalItems}`;
  }
}

searchInput?.addEventListener("input", () => {
  currentPage = 1;
  renderWithSkeleton();
});

prevBtn?.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderWithSkeleton();
  }
});

nextBtn?.addEventListener("click", () => {
  currentPage++;
  renderWithSkeleton();
});

createBtn?.addEventListener("click", () => {
  document.querySelector('.nav-link[data-page="articleCreate"]')?.click();
});
