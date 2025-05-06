import validate from "./validate.js";

const emailInput = document.getElementById("email");
const fullNameInput = document.getElementById("fullName");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirm-password");

if (!localStorage.getItem("users")) {
  const existingUser = [
    {
      id: 2,
      fullName: "Admin Super",
      email: "admin@gmail.com",
      password: "12345678",
    },
    {
      id: 3,
      fullName: "Bách Nguyễn",
      email: "bach@gmail.com",
      password: "abc123123",
    },
    {
      id: 4,
      fullName: "Cường Trần",
      email: "cuong@gmail.com",
      password: "abc123",
    },
    { id: 5, fullName: "Duy Phạm", email: "duy@gmail.com", password: "abc123" },
    { id: 6, fullName: "Hùng Lê", email: "hung@gmail.com", password: "abc123" },
    {
      id: 7,
      fullName: "Trang Mai",
      email: "trang@gmail.com",
      password: "abc123",
    },
  ];
  localStorage.setItem("users", JSON.stringify(existingUser));
}

function createErrorElement(message) {
  const errorElement = document.createElement("div");
  errorElement.classList.add("error-message");
  errorElement.textContent = message;
  return errorElement;
}

function validateInput(inputElement, validationFn, errorMessage) {
  const errorElements =
    inputElement.parentElement.querySelectorAll(".error-message");
  errorElements.forEach((error) => error.remove());

  if (!validationFn(inputElement.value)) {
    const errorElement = createErrorElement(errorMessage);
    inputElement.parentElement.appendChild(errorElement);
  }
}

document
  .getElementById("form-register")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const existingErrors = document.querySelectorAll(".error-message");
    existingErrors.forEach((error) => error.remove());

    let isValid = true;

    const users = JSON.parse(localStorage.getItem("users")) || [];

    if (validate.isEmpty(fullNameInput.value)) {
      const error = createErrorElement("Họ và tên không được để trống");
      fullNameInput.parentElement.appendChild(error);
      isValid = false;
    }

    if (validate.isEmpty(emailInput.value)) {
      const error = createErrorElement("Email không được để trống");
      emailInput.parentElement.appendChild(error);
      isValid = false;
    } else if (!validate.isEmail(emailInput.value)) {
      const error = createErrorElement("Email không đúng định dạng");
      emailInput.parentElement.appendChild(error);
      isValid = false;
    } else if (users.some((user) => user.email === emailInput.value)) {
      const error = createErrorElement("Email này đã được sử dụng");
      emailInput.parentElement.appendChild(error);
      isValid = false;
    }

    if (validate.isEmpty(passwordInput.value)) {
      const error = createErrorElement("Mật khẩu không được để trống");
      passwordInput.parentElement.appendChild(error);
      isValid = false;
    } else if (!validate.isMinLength(passwordInput.value, 8)) {
      const error = createErrorElement("Mật khẩu phải có ít nhất 8 ký tự");
      passwordInput.parentElement.appendChild(error);
      isValid = false;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
      const error = createErrorElement("Mật khẩu xác nhận không khớp");
      confirmPasswordInput.parentElement.appendChild(error);
      isValid = false;
    }

    if (isValid) {
      const maxId = users.reduce((max, user) => Math.max(max, user.id), 0);
      const newUser = {
        id: maxId + 1,
        fullName: fullNameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      Swal.fire({
        icon: "success",
        title: "Đăng ký thành công!",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.href = "../pages/login.html";
      });
      document.getElementById("form-register").reset();
    }
  });

emailInput.addEventListener("input", () => {
  validateInput(
    emailInput,
    (value) => !validate.isEmpty(value) && validate.isEmail(value),
    "Email không hợp lệ"
  );
});

fullNameInput.addEventListener("input", () => {
  validateInput(
    fullNameInput,
    (value) => !validate.isEmpty(value),
    "Họ và tên không được để trống"
  );
});

passwordInput.addEventListener("input", () => {
  validateInput(
    passwordInput,
    (value) => validate.isMinLength(value, 8),
    "Mật khẩu phải có ít nhất 8 ký tự"
  );
});

confirmPasswordInput.addEventListener("input", () => {
  validateInput(
    confirmPasswordInput,
    (value) => value === passwordInput.value,
    "Mật khẩu xác nhận không khớp"
  );
});

const themes = [
  {
    background: "#1A1A2E",
    color: "#FFFFFF",
    primaryColor: "#0F3460",
  },
  {
    background: "#461220",
    color: "#FFFFFF",
    primaryColor: "#E94560",
  },
  {
    background: "#192A51",
    color: "#FFFFFF",
    primaryColor: "#967AA1",
  },
  {
    background: "#F7B267",
    color: "#000000",
    primaryColor: "#F4845F",
  },
  {
    background: "#F25F5C",
    color: "#000000",
    primaryColor: "#642B36",
  },
  {
    background: "#231F20",
    color: "#FFF",
    primaryColor: "#BB4430",
  },
];

const setTheme = (theme) => {
  const root = document.querySelector(":root");
  root.style.setProperty("--background", theme.background);
  root.style.setProperty("--color", theme.color);
  root.style.setProperty("--primary-color", theme.primaryColor);
};

const displayThemeButtons = () => {
  const btnContainer = document.querySelector(".theme-btn-container");
  themes.forEach((theme) => {
    const div = document.createElement("div");
    div.className = "theme-btn";
    div.style.cssText = `background: ${theme.background};`;
    btnContainer.appendChild(div);
    div.addEventListener("click", () => setTheme(theme));
  });
};

displayThemeButtons();
