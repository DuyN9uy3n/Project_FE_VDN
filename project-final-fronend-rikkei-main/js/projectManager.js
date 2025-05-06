import validate from "./validate.js";

let allProjects = JSON.parse(localStorage.getItem("allProjects")) || [
  {
    id: 1,
    projectName: "Xây dựng website thương mại điện tử",
    members: [{ userId: 2, role: "Project owner" }],
    description:
      "Xây dựng một website thương mại điện tử cho phép người dùng mua sắm trực tuyến, quản lý đơn hàng và thanh toán.",
  },
];
localStorage.setItem("allProjects", JSON.stringify(allProjects));

const productOwner = JSON.parse(localStorage.getItem("userLogin"));
let projects = [];
let isAdding = false;

if (!productOwner) {
  window.location.href = "login.html";
} else {
  projects = allProjects.filter((project) =>
    project.members.some(
      (member) =>
        member.userId === productOwner.id && member.role === "Project owner"
    )
  );
}

function renderProjectList(projectsToRender) {
  const projectTableBody = document.getElementById("projectTableBody");
  projectTableBody.innerHTML = "";

  if (isAdding) {
    const addRow = document.createElement("tr");
    addRow.innerHTML = `
      <td class="text-center">N/A</td>
      <td>
        <input type="text" class="form-control" id="addProjectName" placeholder="Tên dự án">
        <div class="error-message" id="addProjectNameError"></div>
      </td>
      <td>
        <textarea class="form-control" id="addProjectDescription" rows="2" placeholder="Mô tả"></textarea>
        <div class="error-message" id="addProjectDescriptionError"></div>
      </td>
      <td class="text-center">
        <button class="btn btn-success btn-sm btn-save-add" type="button">Lưu</button>
        <button class="btn btn-secondary btn-sm btn-cancel-add" type="button">Hủy</button>
      </td>
    `;
    projectTableBody.appendChild(addRow);
  }

  projectsToRender.forEach((project) => {
    const projectRow = document.createElement("tr");
    projectRow.setAttribute("data-id", project.id);
    if (project.isEditing) {
      projectRow.innerHTML = `
        <td class="text-center">${project.id}</td>
        <td>
          <input type="text" class="form-control" id="editProjectName-${project.id}" value="${project.projectName}">
          <div class="error-message" id="editProjectNameError-${project.id}"></div>
        </td>
        <td>
          <textarea class="form-control" id="editProjectDescription-${project.id}" rows="2">${project.description}</textarea>
          <div class="error-message" id="editProjectDescriptionError-${project.id}"></div>
        </td>
        <td class="text-center">
          <button class="btn btn-success btn-sm btn-save-edit" data-id="${project.id}" type="button">Lưu</button>
          <button class="btn btn-secondary btn-sm btn-cancel-edit" data-id="${project.id}" type="button">Hủy</button>
        </td>
      `;
    } else {
      projectRow.innerHTML = `
        <td class="text-center">${project.id}</td>
        <td>${project.projectName}</td>
        <td>${project.description}</td>
        <td class="text-center">
          <button class="btn btn-warning btn-sm btn-edit" data-id="${project.id}" type="button">Sửa</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${project.id}" type="button">Xóa</button>
          <button class="btn btn-primary btn-sm btn-detail" data-id="${project.id}" type="button">Chi tiết</button>
        </td>
      `;
    }
    projectTableBody.appendChild(projectRow);
  });
}

let currentPage = 1;
const itemsPerPage = 5;

function getCurrentProjects(filteredProjects = projects) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProjects.slice(start, end);
}

function renderPagination(filteredProjects = projects) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalItems = filteredProjects.length;

  const prevItem = document.createElement("li");
  prevItem.classList.add("page-item");
  if (currentPage <= 1) prevItem.classList.add("disabled");
  prevItem.innerHTML = `
    <a class="page-link" href="#">Prev</a>
  `;
  prevItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderProjectList(getCurrentProjects(filteredProjects));
      renderPagination(filteredProjects);
    }
  });
  pagination.appendChild(prevItem);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) pageItem.classList.add("active");
    pageItem.innerHTML = `
      <a class="page-link" href="#">${i}</a>
    `;
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderProjectList(getCurrentProjects(filteredProjects));
      renderPagination(filteredProjects);
    });
    pagination.appendChild(pageItem);
  }

  const nextItem = document.createElement("li");
  nextItem.classList.add("page-item");
  if (currentPage >= totalPages) nextItem.classList.add("disabled");
  nextItem.innerHTML = `
    <a class="page-link" href="#">Next</a>
  `;
  nextItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderProjectList(getCurrentProjects(filteredProjects));
      renderPagination(filteredProjects);
    }
  });
  pagination.appendChild(nextItem);
}

function validateInput(value, field, projectId = null) {
  const errors = [];
  if (field === "projectName") {
    if (validate.isEmpty(value)) {
      errors.push("Tên dự án không được để trống");
    }
    if (value.length < 5 || value.length > 50) {
      errors.push("Tên dự án phải từ 5 - 50 ký tự");
    }
    if (
      allProjects.some(
        (project) => project.projectName === value && project.id !== projectId
      )
    ) {
      errors.push("Tên dự án đã tồn tại");
    }
  }
  if (field === "description") {
    if (validate.isEmpty(value)) {
      errors.push("Mô tả không được để trống");
    }
    if (value.length < 20 || value.length > 400) {
      errors.push("Mô tả phải từ 20 - 400 ký tự");
    }
  }
  return errors;
}

document.getElementById("addProjectBtn").addEventListener("click", function () {
  if (isAdding) return;
  if (projects.some((p) => p.isEditing)) return;

  isAdding = true;
  renderProjectList(getCurrentProjects());
});

document
  .getElementById("projectTableBody")
  .addEventListener("click", function (e) {
    const target = e.target;
    const id = target.dataset.id ? +target.dataset.id : null;

    if (target.classList.contains("btn-save-add")) {
      const projectNameInput = document.getElementById("addProjectName");
      const projectDescriptionInput = document.getElementById(
        "addProjectDescription"
      );
      const projectName = projectNameInput.value.trim();
      const description = projectDescriptionInput.value.trim();

      const nameErrors = validateInput(projectName, "projectName");
      const descErrors = validateInput(description, "description");

      document.getElementById("addProjectNameError").innerText =
        nameErrors.join(", ");
      document.getElementById("addProjectDescriptionError").innerText =
        descErrors.join(", ");

      if (nameErrors.length === 0 && descErrors.length === 0) {
        const newProject = {
          id: allProjects.length
            ? Math.max(...allProjects.map((p) => p.id)) + 1
            : 1,
          projectName,
          members: [{ userId: productOwner.id, role: "Project owner" }],
          description,
        };

        allProjects.push(newProject);
        localStorage.setItem("allProjects", JSON.stringify(allProjects));
        projects = allProjects.filter((project) =>
          project.members.some(
            (member) =>
              member.userId === productOwner.id &&
              member.role === "Project owner"
          )
        );

        isAdding = false;
        const totalPages = Math.ceil(projects.length / itemsPerPage);
        currentPage = totalPages;
        renderProjectList(getCurrentProjects());
        renderPagination();
      }
    }

    if (target.classList.contains("btn-cancel-add")) {
      isAdding = false;
      renderProjectList(getCurrentProjects());
    }

    if (target.classList.contains("btn-edit") && id) {
      if (isAdding) return;
      if (projects.some((p) => p.isEditing)) return;

      projects = projects.map((project) => ({
        ...project,
        isEditing: project.id === id ? true : false,
      }));
      renderProjectList(getCurrentProjects());
    }

    if (target.classList.contains("btn-save-edit") && id) {
      const projectNameInput = document.getElementById(`editProjectName-${id}`);
      const projectDescriptionInput = document.getElementById(
        `editProjectDescription-${id}`
      );
      const projectName = projectNameInput.value.trim();
      const description = projectDescriptionInput.value.trim();

      const nameErrors = validateInput(projectName, "projectName", id);
      const descErrors = validateInput(description, "description");

      document.getElementById(`editProjectNameError-${id}`).innerText =
        nameErrors.join(", ");
      document.getElementById(`editProjectDescriptionError-${id}`).innerText =
        descErrors.join(", ");

      if (nameErrors.length === 0 && descErrors.length === 0) {
        const index = projects.findIndex((p) => p.id === id);
        projects[index] = {
          ...projects[index],
          projectName,
          description,
          isEditing: false,
        };

        const globalIndex = allProjects.findIndex((p) => p.id === id);
        allProjects[globalIndex] = { ...projects[index] };
        localStorage.setItem("allProjects", JSON.stringify(allProjects));

        renderProjectList(getCurrentProjects());
      }
    }

    if (target.classList.contains("btn-cancel-edit") && id) {
      projects = projects.map((project) => ({
        ...project,
        isEditing: false,
      }));
      renderProjectList(getCurrentProjects());
    }

    if (target.classList.contains("btn-delete") && id) {
      if (isAdding || projects.some((p) => p.isEditing)) return;
      if (window.confirm("Bạn chắc chắn muốn xóa dự án này?")) {
        const index = projects.findIndex((p) => p.id === id);
        projects.splice(index, 1);
        allProjects = allProjects.filter((p) => p.id !== id);
        localStorage.setItem("allProjects", JSON.stringify(allProjects));

        const totalPages = Math.ceil(projects.length / itemsPerPage);
        currentPage = Math.min(currentPage, totalPages) || 1;
        renderProjectList(getCurrentProjects());
        renderPagination();
      }
    }

    if (target.classList.contains("btn-detail") && id) {
      if (isAdding || projects.some((p) => p.isEditing)) return;
      window.location.href = "../pages/detailProject.html?id=" + id;
    }
  });

document.getElementById("findProject").addEventListener("input", function () {
  const searchValue = this.value.toLowerCase();
  let filteredProjects = allProjects
    .filter((project) =>
      project.members.some(
        (member) =>
          member.userId === productOwner.id && member.role === "Project owner"
      )
    )
    .filter((project) =>
      project.projectName.toLowerCase().includes(searchValue)
    );

  projects = filteredProjects;
  currentPage = 1;
  renderProjectList(getCurrentProjects(projects));
  renderPagination(projects);

  if (this.value === "") {
    projects = allProjects.filter((project) =>
      project.members.some(
        (member) =>
          member.userId === productOwner.id && member.role === "Project owner"
      )
    );
    renderProjectList(getCurrentProjects());
    renderPagination();
  }
});

renderProjectList(getCurrentProjects());
renderPagination();

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
