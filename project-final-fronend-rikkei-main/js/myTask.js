import validate from "./validate.js";

const userLogin = JSON.parse(localStorage.getItem("userLogin"));
if (!userLogin || !userLogin.id) {
  window.location.href = "login.html";
}

const priorityColors = {
  Thấp: "#6c757d",
  "Trung bình": "#007bff",
  Cao: "#dc3545",
};

const progressColors = {
  "Hoàn thành": "#28a745",
  "Chưa hoàn thành": "#dc3545",
};

let allProjects = JSON.parse(localStorage.getItem("allProjects")) || [];
const projects = allProjects.filter(
  (project) =>
    project &&
    project.members &&
    project.members.some((member) => member.userId === userLogin.id)
);

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
if (!Array.isArray(tasks)) tasks = [];
tasks = tasks.map((task) => ({
  id: task.id || 0,
  taskName: task.taskName || "Nhiệm vụ không tên",
  projectId: task.projectId || 1,
  assigneeId: task.assigneeId || userLogin.id,
  status: task.status || "Chưa hoàn thành",
  priority: task.priority || "Thấp",
  asignDate: task.asignDate || new Date().toISOString().split("T")[0],
  dueDate: task.dueDate || "",
  progress: task.progress || "Chưa hoàn thành",
  description: task.description || "",
}));
localStorage.setItem("tasks", JSON.stringify(tasks));

let myTasks = tasks.filter((task) => task.assigneeId === userLogin.id);
let isAdding = false;
let currentSortOption = "";

let currentPage = 1;
const itemsPerPage = 5;

function getCurrentTasks(filteredTasks) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTasks.slice(start, end);
}

function renderPagination(filteredTasks) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalItems = filteredTasks.length;

  const prevItem = document.createElement("li");
  prevItem.classList.add("page-item");
  if (currentPage <= 1) prevItem.classList.add("disabled");
  prevItem.innerHTML = `<a class="page-link" href="#">Prev</a>`;
  prevItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage > 1) {
      currentPage--;
      renderMyTask(document.getElementById("searchTasks").value);
    }
  });
  pagination.appendChild(prevItem);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  for (let i = 1; i <= totalPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.classList.add("page-item");
    if (i === currentPage) pageItem.classList.add("active");
    pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
    pageItem.addEventListener("click", (e) => {
      e.preventDefault();
      currentPage = i;
      renderMyTask(document.getElementById("searchTasks").value);
    });
    pagination.appendChild(pageItem);
  }

  const nextItem = document.createElement("li");
  nextItem.classList.add("page-item");
  if (currentPage >= totalPages) nextItem.classList.add("disabled");
  nextItem.innerHTML = `<a class="page-link" href="#">Next</a>`;
  nextItem.addEventListener("click", (e) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      currentPage++;
      renderMyTask(document.getElementById("searchTasks").value);
    }
  });
  pagination.appendChild(nextItem);
}

function validateInput(value, field, taskId = null) {
  const errors = [];
  if (field === "taskName") {
    if (!value || validate.isEmpty(value)) {
      errors.push("Tên nhiệm vụ không được để trống");
    }
    if (value.length < 5 || value.length > 50) {
      errors.push("Tên nhiệm vụ phải từ 5 - 50 ký tự");
    }
    if (tasks.some((task) => task.taskName === value && task.id !== taskId)) {
      errors.push("Tên nhiệm vụ đã tồn tại");
    }
  }
  if (field === "dueDate") {
    if (!value || validate.isEmpty(value)) {
      errors.push("Hạn chót không được để trống");
    }
    const today = new Date().toISOString().split("T")[0];
    if (value < today) {
      errors.push("Hạn chót phải từ hôm nay trở đi");
    }
  }
  if (field === "priority" || field === "status") {
    if (!value || validate.isEmpty(value)) {
      errors.push(
        `${
          field === "priority" ? "Độ ưu tiên" : "Trạng thái"
        } không được để trống`
      );
    }
  }
  return errors;
}

function sortTasks(tasksToSort) {
  if (!currentSortOption || tasksToSort.length === 0) return tasksToSort;

  const priorities = { Cao: 3, "Trung bình": 2, Thấp: 1 };
  return [...tasksToSort].sort((a, b) => {
    const aPriority = priorities[a.priority] || 0;
    const bPriority = priorities[b.priority] || 0;
    const aDueDate = a.dueDate ? new Date(a.dueDate) : new Date();
    const bDueDate = b.dueDate ? new Date(b.dueDate) : new Date();

    switch (currentSortOption) {
      case "priority-desc":
        return bPriority - aPriority;
      case "priority-asc":
        return aPriority - bPriority;
      case "dueDate-asc":
        return aDueDate - bDueDate;
      case "dueDate-desc":
        return bDueDate - aDueDate;
      default:
        return 0;
    }
  });
}

function renderMyTask(searchKeyword = "") {
  const taskListEl = document.getElementById("myTaskList");
  if (!taskListEl) return;
  taskListEl.innerHTML = "";

  tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  if (!Array.isArray(tasks)) tasks = [];
  tasks = tasks.map((task) => ({
    id: task.id || 0,
    taskName: task.taskName || "Nhiệm vụ không tên",
    projectId: task.projectId || 1,
    assigneeId: task.assigneeId || userLogin.id,
    status: task.status || "Chưa hoàn thành",
    priority: task.priority || "Thấp",
    asignDate: task.asignDate || new Date().toISOString().split("T")[0],
    dueDate: task.dueDate || "",
    progress: task.progress || "Chưa hoàn thành",
    description: task.description || "",
  }));
  localStorage.setItem("tasks", JSON.stringify(tasks));

  myTasks = tasks.filter((task) => task.assigneeId === userLogin.id);

  let filteredTasks = myTasks.filter((task) =>
    task.taskName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  filteredTasks = sortTasks(filteredTasks);

  const currentTasks = getCurrentTasks(filteredTasks);

  const projectOrder = [];
  const taskMap = {};
  currentTasks.forEach((task) => {
    if (!taskMap[task.projectId]) {
      taskMap[task.projectId] = [];
      projectOrder.push(task.projectId);
    }
    taskMap[task.projectId].push(task);
  });

  if (projectOrder.length === 0 && !isAdding) {
    taskListEl.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Không có nhiệm vụ nào.</td>
      </tr>
    `;
    renderPagination(filteredTasks);
    return;
  }

  if (isAdding) {
    const addRow = document.createElement("tr");
    const today = new Date().toISOString().split("T")[0];
    addRow.innerHTML = `
      <tr>
        <td colspan="7">
          <table class="project-table">
            <tr>
              <td class="text-center">N/A</td>
              <td>
                <input type="text" class="form-control" id="addTaskName" placeholder="Tên nhiệm vụ">
                <div class="error-message" id="addTaskNameError"></div>
              </td>
              <td>
                <select class="form-control" id="addProjectId">
                  <option value="" disabled selected>Chọn dự án</option>
                  ${projects
                    .map(
                      (project) =>
                        `<option value="${project.id}">${project.projectName}</option>`
                    )
                    .join("")}
                </select>
                <div class="error-message" id="addProjectIdError"></div>
              </td>
              <td>
                <select class="form-control" id="addStatus">
                  <option value="" disabled selected>Chọn trạng thái</option>
                  <option value="Chưa hoàn thành">Chưa hoàn thành</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
                <div class="error-message" id="addStatusError"></div>
              </td>
              <td>
                <select class="form-control" id="addPriority">
                  <option value="" disabled selected>Chọn độ ưu tiên</option>
                  <option value="Thấp">Thấp</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Cao">Cao</option>
                </select>
                <div class="error-message" id="addPriorityError"></div>
              </td>
              <td>
                <input type="date" class="form-control" id="addDueDate" min="${today}">
                <div class="error-message" id="addDueDateError"></div>
              </td>
              <td class="text-center">
                <button class="btn btn-success btn-sm btn-save-add" type="button">Lưu</button>
                <button class="btn btn-secondary btn-sm btn-cancel-add" type="button">Hủy</button>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
    taskListEl.appendChild(addRow);
  }

  projectOrder.forEach((projectId) => {
    const project = allProjects.find((p) => p && p.id === Number(projectId));
    const projectName = project ? project.projectName : "Dự án không rõ";
    const collapseId = `collapse-${projectId}`;

    const taskRows = taskMap[projectId]
      .map((task) => {
        const row = document.createElement("tr");
        row.setAttribute("data-id", task.id);
        row.innerHTML = `
          <td class="text-center">${task.id}</td>
          <td>${task.taskName}</td>
          <td>${projectName}</td>
          <td>
            <label style="color: ${
              progressColors[task.status] || "#000"
            }; font-weight: bold">
              <input type="checkbox" class="status-checkbox" data-id="${
                task.id
              }" ${task.status === "Hoàn thành" ? "checked" : ""}>
              ${task.status}
            </label>
          </td>
          <td style="color: ${
            priorityColors[task.priority] || "#000"
          }; font-weight: bold">${task.priority}</td>
          <td>${task.dueDate || ""}</td>
          <td class="text-center">
            <button class="btn btn-primary btn-sm btn-detail" data-id="${
              task.id
            }" type="button">Chi tiết</button>
          </td>
        `;
        return row.outerHTML;
      })
      .join("");

    taskListEl.innerHTML += `
      <tr class="project-header" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="true" aria-controls="${collapseId}" style="cursor: pointer;">
        <td colspan="7"><strong>▼ ${projectName}</strong></td>
      </tr>
      <tr class="collapse show" id="${collapseId}">
        <td colspan="7" class="p-0">
          <table class="project-table">
            <thead>
              <tr>
                <th class="text-center">ID</th>
                <th>Tên Nhiệm Vụ</th>
                <th>Dự Án</th>
                <th>Trạng Thái</th>
                <th>Độ Ưu Tiên</th>
                <th>Hạn Chót</th>
                <th class="text-center">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              ${taskRows}
            </tbody>
          </table>
        </td>
      </tr>
    `;
  });

  renderPagination(filteredTasks);
}

document.getElementById("addTaskBtn").addEventListener("click", function () {
  if (isAdding) {
    alert(
      "Vui lòng hoàn thành việc thêm nhiệm vụ trước khi thêm nhiệm vụ mới!"
    );
    return;
  }
  isAdding = true;
  renderMyTask(document.getElementById("searchTasks").value);
});

document.getElementById("myTaskList").addEventListener("click", function (e) {
  const target = e.target;
  const id = target.dataset.id ? parseInt(target.dataset.id, 10) : null;

  if (target.classList.contains("btn-save-add")) {
    const taskNameInput = document.getElementById("addTaskName");
    const projectIdInput = document.getElementById("addProjectId");
    const statusInput = document.getElementById("addStatus");
    const priorityInput = document.getElementById("addPriority");
    const dueDateInput = document.getElementById("addDueDate");

    const taskName = taskNameInput.value.trim();
    const projectId = +projectIdInput.value;
    const status = statusInput.value;
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;
    const progress = status;

    const nameErrors = validateInput(taskName, "taskName");
    const projectErrors = projectId ? [] : ["Vui lòng chọn dự án"];
    const statusErrors = validateInput(status, "status");
    const priorityErrors = validateInput(priority, "priority");
    const dueDateErrors = validateInput(dueDate, "dueDate");

    document.getElementById("addTaskNameError").innerText =
      nameErrors.join(", ");
    document.getElementById("addProjectIdError").innerText =
      projectErrors.join(", ");
    document.getElementById("addStatusError").innerText =
      statusErrors.join(", ");
    document.getElementById("addPriorityError").innerText =
      priorityErrors.join(", ");
    document.getElementById("addDueDateError").innerText =
      dueDateErrors.join(", ");

    if (
      nameErrors.length === 0 &&
      projectErrors.length === 0 &&
      statusErrors.length === 0 &&
      priorityErrors.length === 0 &&
      dueDateErrors.length === 0
    ) {
      const newTask = {
        id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        taskName,
        projectId,
        assigneeId: userLogin.id,
        status,
        priority,
        asignDate: new Date().toISOString().split("T")[0],
        dueDate,
        progress,
        description: "",
      };

      tasks.push(newTask);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      myTasks = tasks.filter((task) => task.assigneeId === userLogin.id);

      isAdding = false;
      const totalPages = Math.ceil(myTasks.length / itemsPerPage);
      currentPage = Math.max(1, Math.min(currentPage, totalPages));
      renderMyTask(document.getElementById("searchTasks").value);
    }
  }

  if (target.classList.contains("btn-cancel-add")) {
    isAdding = false;
    renderMyTask(document.getElementById("searchTasks").value);
  }

  if (target.classList.contains("btn-detail") && id) {
    if (isAdding) return;
    const task = myTasks.find((t) => t.id === id);
    if (task) {
      alert(
        `Chi tiết nhiệm vụ ID: ${id}\nTên: ${task.taskName}\nMô tả: ${
          task.description || "Không có mô tả"
        }`
      );
    }
  }
});

document.getElementById("myTaskList").addEventListener("change", function (e) {
  const target = e.target;
  if (target.classList.contains("status-checkbox")) {
    const id = parseInt(target.dataset.id, 10);
    const newStatus = target.checked ? "Hoàn thành" : "Chưa hoàn thành";

    const statusErrors = validateInput(newStatus, "status");
    if (statusErrors.length === 0) {
      const index = myTasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        myTasks[index] = {
          ...myTasks[index],
          status: newStatus,
          progress: newStatus,
        };
        const globalIndex = tasks.findIndex((t) => t.id === id);
        if (globalIndex !== -1) {
          tasks[globalIndex] = { ...myTasks[index] };
          localStorage.setItem("tasks", JSON.stringify(tasks));
        }
      }
      renderMyTask(document.getElementById("searchTasks").value);
    }
  }
});

document.getElementById("searchTasks").addEventListener("input", (e) => {
  const searchKeyword = e.target.value;
  currentPage = 1;
  renderMyTask(searchKeyword);
});

document.getElementById("sortTasks").addEventListener("change", (e) => {
  currentSortOption = e.target.value;
  currentPage = 1;
  renderMyTask(document.getElementById("searchTasks").value);
});

document.addEventListener("DOMContentLoaded", () => {
  renderMyTask();
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
