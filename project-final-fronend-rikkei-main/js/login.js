import validate from "./validate.js";

if (!localStorage.getItem("users")) {
  const existingUser = [
    {
      id: 2,
      fullName: "Adminn",
      email: "admin@gmail.com",
      password: "admin123",
    },
    {
      id: 3,
      fullName: "Messi",
      email: "messi@gmail.com",
      password: "12345678",
    },
    {
      id: 4,
      fullName: "Ronaldo",
      email: "r7g@gmail.com",
      password: "12345678",
    },
    {
      id: 5,
      fullName: "Saka",
      email: "saka@gmail.com",
      password: "12345678",
    },
    {
      id: 6,
      fullName: "Salah",
      email: "salah@gmail.com",
      password: "12345678",
    },
    {
      id: 7,
      fullName: "Yamal",
      email: "yamal@gmail.com",
      password: "12345678",
    },
  ];
  localStorage.setItem("users", JSON.stringify(existingUser));
}

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const users = JSON.parse(localStorage.getItem("users")) || [];

let userLogin = null;

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

  if (validationFn(inputElement.value)) {
    return;
  } else {
    const errorElement = createErrorElement(errorMessage);
    inputElement.parentElement.appendChild(errorElement);
  }
}

document
  .getElementById("form-login")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const existingErrors = document.querySelectorAll(".error-message");
    existingErrors.forEach((error) => error.remove());

    let isValid = true;

    if (validate.isEmpty(emailInput.value)) {
      const error = createErrorElement("Email không được để trống");
      emailInput.parentElement.appendChild(error);
      isValid = false;
    } else if (!validate.isEmail(emailInput.value)) {
      const error = createErrorElement("Email không đúng định dạng");
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

    if (isValid) {
      const user = users.find((user) => user.email === emailInput.value);
      if (user && user.password === passwordInput.value) {
        userLogin = user;
        localStorage.setItem("userLogin", JSON.stringify(userLogin));
        window.location.href = "../pages/projectManager.html";
      } else {
        const error = createErrorElement("Gmail hoặc mật khẩu không đúng");
        document.getElementById("form-login").appendChild(error);
      }
    }
  });

emailInput.addEventListener("input", () => {
  validateInput(
    emailInput,
    (value) => !validate.isEmpty(value),
    "Email không được để trống"
  );
});
emailInput.addEventListener("input", () => {
  validateInput(
    emailInput,
    (value) => validate.isEmail(value),
    "Email không hợp lệ"
  );
});
passwordInput.addEventListener("input", () => {
  validateInput(
    passwordInput,
    (value) => !validate.isEmpty(value),
    "Mật khẩu không được để trống"
  );
});

passwordInput.addEventListener("input", () => {
  validateInput(
    passwordInput,
    (value) => validate.isMinLength(value, 8),
    "Mật khẩu phải có ít nhất 8 ký tự"
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
