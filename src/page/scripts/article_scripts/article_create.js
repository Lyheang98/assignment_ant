const articlecreate = document.getElementById("articlecontainer");

// render form 
const messageModal = new bootstrap.Modal(
  document.getElementById("messageModal"),
);

function showMessage(title, message, type = "dark") {
  document.getElementById("messageModalTitle").innerText = title;
  document.getElementById("messageModalBody").innerText = message;

  const header = document.getElementById("messageModalHeader");
  header.className = `modal-header bg-${type} text-white`;

  messageModal.show();
}

function renderCreateForm() {

  articlecreate.innerHTML = `
    <div class="container py-2">
      <div class="card border rounded">
        <div class="card-body p-4">

          <form id="articleForm">

            <div class="mb-3">
              <label class="form-label small fw-semibold">
                Title <span class="text-danger">*</span>
              </label>
              <input 
                type="text" 
                id="title"
                class="form-control rounded-3"
                placeholder="Enter article title"
                required
              />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">
                Category <span class="text-danger">*</span>
              </label>
              <select 
                id="category"
                class="form-select rounded-3"
                required
              >
                <option value="">Select category</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">
                Thumbnail
              </label>
              <input 
                type="file"
                id="thumbnail"
                class="form-control rounded-3"
                accept="image/*"
              />
            </div>

            <div class="mb-3">
              <label class="form-label small fw-semibold">
                Content <span class="text-danger">*</span>
              </label>
              <textarea 
                id="content"
                class="form-control rounded-3"
                rows="5"
                placeholder="Write content here..."
                required
              ></textarea>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-4">
  <button 
    type="button"
    id="backToArticleList"
    class="btn btn-outline-secondary rounded-3 px-4 py-2"
  >
    ← Back to Articles
  </button>

  <button 
    type="submit"
    class="btn btn-dark rounded-3 px-5 py-2"
  >
    ✈ Publish Now
  </button>
</div>


          </form>
        </div>
      </div>
    </div>
  `;

  loadCategories();
  handleSubmit();


  document.getElementById("backToArticleList")
    .addEventListener("click", () => {
      document.querySelector('[data-page="articleList"]')?.click();
    });
}


window.renderCreateForm = renderCreateForm;

// load category
async function loadCategories() {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/categories?_page=1&_per_page=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.result) return;

    const select = document.getElementById("category");

    select.innerHTML = `<option value="">Select category</option>`;

    data.data.items.forEach((cat) => {
      select.innerHTML += `
        <option value="${cat.id}">
          ${cat.name}
        </option>
      `;
    });
  } catch {
    showMessage("Error", "Failed to load categories", "danger");
  }
}


// handle submit
function handleSubmit() {
  document
    .getElementById("articleForm")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const token = localStorage.getItem("token");

      const title = document.getElementById("title").value.trim();
      const content = document.getElementById("content").value.trim();
      const category = document.getElementById("category").value;
      const thumbnailFile = document.getElementById("thumbnail").files[0];

      if (!title || !content || !category) {
        showMessage("Warning", "Please fill all required fields", "warning");
        return;
      }

      try {
        // STEP 1: CREATE ARTICLE
        const createRes = await fetch(`${BASE_URL}/articles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            content,
            categoryId: Number(category),
          }),
        });

        const createData = await createRes.json();

        if (!createData.result) {
          showMessage(
            "Error",
            createData.message || "Failed to create article",
            "danger",
          );
          return;
        }

        const articleId = createData.data?.id;

        // STEP 2: UPLOAD THUMBNAIL
        if (thumbnailFile && articleId) {
          const formData = new FormData();
          formData.append("thumbnail", thumbnailFile);

          await fetch(`${BASE_URL}/articles/${articleId}/thumbnail`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }

        showMessage("Success", "Article created successfully!", "success");

        renderCreateForm();
      } catch (err) {
        console.error(err);
        showMessage("Error", "Something went wrong", "danger");
      }
    });
}
