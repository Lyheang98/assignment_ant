
const token = localStorage.getItem("token");
const profileContainer = document.getElementById("profileContainer");

if (!token) {
  window.location.href = "../auth_page/login.html";
}

// ================= LOAD PROFILE =================
const loadProfile = async () => {

  profileContainer.innerHTML = `
    <div class="text-center p-5">
      <div class="spinner-border text-darkblue"></div>
      <div class="text-darkblue mt-2">Loading profile...</div>
    </div>
  `;

  try {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!data.result) {
      profileContainer.innerHTML =
        `<div class="alert alert-danger">${data.message}</div>`;
      return;
    }

    renderProfile(data.data);

  } catch {
    profileContainer.innerHTML =
      `<div class="alert alert-danger">Failed to load profile</div>`;
  }
};

// ================= RENDER =================
const renderProfile = (user) => {

  profileContainer.innerHTML = `
    <div class="card shadow-sm p-4">

      <div class="d-flex justify-content-between align-items-center mb-4">

        <div class="d-flex align-items-center gap-4">

          <div class="position-relative">
            <img src="${user.avatar || "https://via.placeholder.com/130"}"
                 class="rounded-circle"
                 style="width:130px;height:130px;object-fit:cover">

            <button id="deleteAvatarBtn"
              class="btn btn-danger btn-sm rounded-circle position-absolute"
              style="bottom:0;left:0;">
              <i class="fas fa-trash"></i>
            </button>

            <label class="btn btn-dark btn-sm rounded-circle position-absolute"
              style="bottom:0;right:0;">
              <i class="fas fa-camera"></i>
              <input type="file" id="avatarInput" hidden>
            </label>
          </div>

          <div>
            <h3 class="fw-bold">${user.firstName} ${user.lastName}</h3>
            <small class="text-muted">
              Registered: ${new Date(user.registeredAt).toLocaleDateString()}
            </small>
          </div>

        </div>

        <button id="editBtn" class="btn btn-dark">
          <i class="fas fa-pen me-2"></i>Edit Profile
        </button>

      </div>

      <form id="profileForm">

        <div class="row g-3">

          <div class="col-md-6">
            <label class="form-label">First Name</label>
            <input type="text" id="firstName"
              class="form-control"
              value="${user.firstName}" disabled>
          </div>

          <div class="col-md-6">
            <label class="form-label">Last Name</label>
            <input type="text" id="lastName"
              class="form-control"
              value="${user.lastName}" disabled>
          </div>

          <div class="col-12">
            <label class="form-label">Email</label>
            <input type="email" id="email"
              class="form-control"
              value="${user.email}" disabled>
          </div>

          <div class="col-12">
            <label class="form-label">User ID</label>
            <input type="number"
              class="form-control"
              value="${user.id}" disabled>
          </div>

        </div>

        <div id="actionButtons" class="mt-4 d-none">
          <button type="submit" class="btn btn-dark me-2">
            <i class="fas fa-save me-1"></i> Save Changes
          </button>
          <button type="button" class="btn btn-secondary" id="cancelBtn">
            Cancel
          </button>
        </div>

      </form>
    </div>
  `;

  updateNavbarInfo(user);
  attachEvents();
};

// ================= UPDATE NAVBAR =================
function updateNavbarInfo(user) {
  const navAvatar = document.getElementById("navAvatar");
  const navUsername = document.getElementById("navUsername");

  if (navAvatar) {
    navAvatar.src = user.avatar || "https://via.placeholder.com/32";
  }

  if (navUsername) {
    navUsername.textContent = `${user.firstName} ${user.lastName}`;
  }
}

// ================= EVENTS =================
const attachEvents = () => {

  const editBtn = document.getElementById("editBtn");
  const inputs = document.querySelectorAll("#profileForm input:not([type=number])");
  const actionButtons = document.getElementById("actionButtons");
  const form = document.getElementById("profileForm");
  const avatarInput = document.getElementById("avatarInput");
  const deleteBtn = document.getElementById("deleteAvatarBtn");
  const cancelBtn = document.getElementById("cancelBtn");

  // Enable edit
  editBtn.addEventListener("click", () => {
    inputs.forEach(input => input.disabled = false);
    actionButtons.classList.remove("d-none");
  });

  // Cancel edit
  cancelBtn.addEventListener("click", loadProfile);

  // ================= UPDATE PROFILE =================
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim();

    const res = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ firstName, lastName, email }),
    });

    const data = await res.json();

    if (data.result) loadProfile();
    else showProfileAlert(data.message, "danger");
  });

  // ================= UPLOAD AVATAR =================
  avatarInput.addEventListener("change", async () => {

    const file = avatarInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    const res = await fetch(`${BASE_URL}/profile/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data.result) loadProfile();
    else showProfileAlert(data.message, "danger");
  });

  // ================= DELETE AVATAR =================
  deleteBtn.addEventListener("click", async () => {

    const res = await fetch(`${BASE_URL}/profile/avatar`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.result) loadProfile();
    else showProfileAlert(data.message, "danger");
  });
};

// ================= ALERT =================
const showProfileAlert = (message, type = "success") => {

  profileContainer.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="alert alert-${type} alert-dismissible fade show">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
    `
  );
};

// ================= INITIAL LOAD =================
loadProfile();
