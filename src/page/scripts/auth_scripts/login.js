const baseurl = "https://blogs2.csm.linkpc.net/api/v1/auth/login";

const loginBtn = document.getElementById("login");
const spinner = document.getElementById("loginSpinner");


const showLoading = () => {
  loginBtn.disabled = true;
  spinner.classList.remove("d-none");
};

const hideLoading = () => {
  loginBtn.disabled = false;
  spinner.classList.add("d-none");
};


document.addEventListener("DOMContentLoaded", () => {
  hideLoading();

  const emailInput = document.getElementById("email");
  const pwInput = document.getElementById("pw");

  emailInput.addEventListener("input", () => {
    emailInput.classList.remove("is-invalid");
    document.getElementById("email-warn").textContent = "";
  });

  pwInput.addEventListener("input", () => {
    pwInput.classList.remove("is-invalid");
    document.getElementById("pw-warn").textContent = "";
  });
});

/* =====================================================
   LOGIN FUNCTION
===================================================== */
const loginpage = (event) => {
  event.preventDefault();

  const emailInput = document.getElementById("email");
  const pwInput = document.getElementById("pw");
  const emailwarning = document.getElementById("email-warn");
  const pwwarning = document.getElementById("pw-warn");
  const failedvalidation = document.getElementById("invalide-input");
  const successvalidation = document.getElementById("success-input");

  // Reset messages
  emailwarning.textContent = "";
  pwwarning.textContent = "";
  failedvalidation.textContent = "";
  successvalidation.textContent = "";

  const emailuser = emailInput.value.trim();
  const password = pwInput.value.trim();

  let isValid = true;

  if (!emailuser) {
    emailwarning.textContent = "Please input your email";
    emailInput.classList.add("is-invalid");
    isValid = false;
  }

  if (!password) {
    pwwarning.textContent = "Please input your password";
    pwInput.classList.add("is-invalid");
    isValid = false;
  }

  // ❗ DO NOT SHOW SPINNER IF INVALID
  if (!isValid) return;


  showLoading();

  fetch(baseurl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailuser, password }),
  })
    .then((res) => res.json())
    .then((datalogin) => {
      if (datalogin.result) {
        localStorage.setItem("token", datalogin.data.token);
        successvalidation.textContent = datalogin.message;

        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        failedvalidation.textContent = datalogin.message;
        hideLoading(); 
      }
    })
    .catch((err) => {
      console.error("Network error:", err);
      failedvalidation.textContent = "Cannot connect to server";
      hideLoading(); 
    });
};
