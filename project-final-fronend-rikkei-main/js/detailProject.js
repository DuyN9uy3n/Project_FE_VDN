import validate from "./validate.js";

const projectNameEl = document.getElementById("projectName");
const projectDescriptionEl = document.getElementById("projectDescription");
const memberListEl = document.getElementById("memberList");
const taskListEl = document.getElementById("taskList");

const allProjects = JSON.parse(localStorage.getItem("allProjects")) || [];
const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get("id");
const project = allProjects.find((project) => project.id === Number(projectId));
const users = JSON.parse(localStorage.getItem("users")) || [];
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let projectTasks = tasks.filter((task) => task.projectId === Number(projectId));
let isAdding = false;

let currentPage = 1;
const itemsPerPage = 5;

function getCurrentTasks(filteredTasks = projectTasks) {
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTasks.slice(start, end);
}

function renderPagination(filteredTasks = projectTasks) {
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
      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
      renderPagination(filteredTasks);
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
      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
      renderPagination(filteredTasks);
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
      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
      renderPagination(filteredTasks);
    }
  });
  pagination.appendChild(nextItem);
}

function validateInput(value, field, taskId = null) {
  const errors = [];
  if (field === "taskName") {
    if (validate.isEmpty(value)) {
      errors.push("Tên nhiệm vụ không được để trống");
    }
    if (value.length < 5 || value.length > 50) {
      errors.push("Tên nhiệm vụ phải từ 5 - 50 ký tự");
    }
    if (
      projectTasks.some((task) => task.taskName === value && task.id !== taskId)
    ) {
      errors.push("Tên nhiệm vụ đã tồn tại trong dự án");
    }
  }
  if (field === "dueDate") {
    if (validate.isEmpty(value)) {
      errors.push("Hạn chót không được để trống");
    }
    const today = new Date().toISOString().split("T")[0];
    if (value < today) {
      errors.push("Hạn chót phải từ hôm nay trở đi");
    }
  }
  if (field === "priority" || field === "progress") {
    if (validate.isEmpty(value)) {
      errors.push(
        `${field === "priority" ? "Độ ưu tiên" : "Tiến độ"} không được để trống`
      );
    }
  }
  if (field === "assigneeId") {
    if (!value) {
      errors.push("Vui lòng chọn người phụ trách");
    }
  }
  return errors;
}

function renderDetailProject() {
  if (project) {
    projectNameEl.innerText = project.projectName;
    projectDescriptionEl.innerText = project.description;
    const projectMembers = getProjectMembersWithRoles(projectId);
    memberListEl.innerHTML = projectMembers
      .map(
        (member) => `
          <div class="member-card">
            <span class="member-initials" style="background-color: ${getRandomColor()}">
              ${getInitials(member.fullName)}
            </span>
            <div class="member-info">
              <p class="member-name">${member.fullName}</p>
              <span class="member-role">${member.role}</span>
            </div>
          </div>`
      )
      .join("");
  } else {
    console.error("Không tìm thấy dự án");
    projectNameEl.innerText = "Dự án không tồn tại";
  }
}

function getProjectMembersWithRoles(projectId) {
  const project = allProjects.find((p) => p.id === Number(projectId));
  if (!project) {
    console.log("Dự án không tồn tại");
    return [];
  }
  return project.members
    .map((member) => {
      const user = users.find((u) => u.id === member.userId);
      if (user) {
        return {
          userId: user.id,
          fullName: user.fullName,
          role: member.role,
          email: user.email,
        };
      }
    })
    .filter((member) => member);
}

function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const priorityColors = {
  Thấp: "#6c757d",
  "Trung bình": "#007bff",
  Cao: "#dc3545",
};

const progressColors = {
  "Đúng tiến độ": "#28a745",
  "Có rủi ro": "#ffc107",
  "Trễ hạn": "#dc3545",
  "Hoàn thành": "#28a745",
  "Đang chờ": "#17a2b8",
  "Chưa hoàn thành": "#dc3545",
};

function renderTaskList(searchKeyword = "", sortOption = "") {
  taskListEl.innerHTML = "";

  let filteredTasks = projectTasks.filter((task) =>
    task.taskName.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  if (sortOption) {
    filteredTasks.sort((a, b) => {
      const priorities = { Cao: 3, "Trung bình": 2, Thấp: 1 };
      if (sortOption === "priority-desc") {
        return priorities[b.priority] - priorities[a.priority];
      } else if (sortOption === "priority-asc") {
        return priorities[a.priority] - priorities[b.priority];
      } else if (sortOption === "dueDate-asc") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortOption === "dueDate-desc") {
        return new Date(b.dueDate) - new Date(a.dueDate);
      }
      return 0;
    });
  }

  if (filteredTasks.length === 0 && !isAdding) {
    taskListEl.innerHTML = `
      <tr>
        <td colspan="8" class="text-center">Không có nhiệm vụ nào.</td>
      </tr>
    `;
    renderPagination(filteredTasks);
    return;
  }

  if (isAdding) {
    const today = new Date().toISOString().split("T")[0];
    const projectMembers = getProjectMembersWithRoles(projectId);
    taskListEl.innerHTML += `
      <tr>
        <td class="text-center">N/A</td>
        <td>
          <input type="text" class="form-control" id="addTaskName" placeholder="Tên nhiệm vụ">
          <div class="error-message" id="addTaskNameError"></div>
        </td>
        <td>
          <select class="form-control" id="addAssigneeId">
            <option value="" disabled selected>Chọn người phụ trách</option>
            ${projectMembers
              .map(
                (member) =>
                  `<option value="${member.userId}">${member.fullName}</option>`
              )
              .join("")}
          </select>
          <div class="error-message" id="addAssigneeIdError"></div>
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
          <input type="date" class="form-control" id="addAsignDate" value="${today}" readonly>
        </td>
        <td>
          <input type="date" class="form-control" id="addDueDate" min="${today}">
          <div class="error-message" id="addDueDateError"></div>
        </td>
        <td>
          <select class="form-control" id="addProgress">
            <option value="" disabled selected>Chọn tiến độ</option>
            <option value="Chưa hoàn thành">Chưa hoàn thành</option>
            <option value="Hoàn thành">Hoàn thành</option>
          </select>
          <div class="error-message" id="addProgressError"></div>
        </td>
        <td class="text-center">
          <button class="btn btn-success btn-sm btn-save-add" type="button">Lưu</button>
          <button class="btn btn-secondary btn-sm btn-cancel-add" type="button">Hủy</button>
        </td>
      </tr>
    `;
  }

  const currentTasks = getCurrentTasks(filteredTasks);
  currentTasks.forEach((task) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", task.id);
    const assignee =
      users.find((user) => user.id === task.assigneeId)?.fullName ||
      "Không xác định";
    if (task.isEditing) {
      const today = new Date().toISOString().split("T")[0];
      const projectMembers = getProjectMembersWithRoles(projectId);
      row.innerHTML = `
        <td class="text-center">${task.id}</td>
        <td>
          <input type="text" class="form-control" id="editTaskName-${
            task.id
          }" value="${task.taskName}">
          <div class="error-message" id="editTaskNameError-${task.id}"></div>
        </td>
        <td>
          <select class="form-control" id="editAssigneeId-${task.id}">
            ${projectMembers
              .map(
                (member) =>
                  `<option value="${member.userId}" ${
                    member.userId === task.assigneeId ? "selected" : ""
                  }>${member.fullName}</option>`
              )
              .join("")}
          </select>
          <div class="error-message" id="editAssigneeIdError-${task.id}"></div>
        </td>
        <td>
          <select class="form-control" id="editPriority-${task.id}">
            <option value="Thấp" ${
              task.priority === "Thấp" ? "selected" : ""
            }>Thấp</option>
            <option value="Trung bình" ${
              task.priority === "Trung bình" ? "selected" : ""
            }>Trung bình</option>
            <option value="Cao" ${
              task.priority === "Cao" ? "selected" : ""
            }>Cao</option>
          </select>
          <div class="error-message" id="editPriorityError-${task.id}"></div>
        </td>
        <td>${task.asignDate}</td>
        <td>
          <input type="date" class="form-control" id="editDueDate-${
            task.id
          }" value="${task.dueDate}" min="${today}">
          <div class="error-message" id="editDueDateError-${task.id}"></div>
        </td>
        <td>
          <select class="form-control" id="editProgress-${task.id}">
            <option value="Chưa hoàn thành" ${
              task.progress === "Chưa hoàn thành" ? "selected" : ""
            }>Chưa hoàn thành</option>
            <option value="Hoàn thành" ${
              task.progress === "Hoàn thành" ? "selected" : ""
            }>Hoàn thành</option>
          </select>
          <div class="error-message" id="editProgressError-${task.id}"></div>
        </td>
        <td class="text-center">
          <button class="btn btn-success btn-sm btn-save-edit" data-id="${
            task.id
          }" type="button">Lưu</button>
          <button class="btn btn-secondary btn-sm btn-cancel-edit" data-id="${
            task.id
          }" type="button">Hủy</button>
        </td>
      `;
    } else {
      row.innerHTML = `
        <td class="text-center">${task.id}</td>
        <td>${task.taskName}</td>
        <td>${assignee}</td>
        <td style="color: ${
          priorityColors[task.priority] || "#000"
        }; font-weight: bold">${task.priority}</td>
        <td>${task.asignDate}</td>
        <td>${task.dueDate}</td>
        <td style="color: ${
          progressColors[task.progress] || "#000"
        }; font-weight: bold">${task.progress}</td>
        <td class="text-center">
          <button class="btn btn-warning btn-sm btn-edit" data-id="${
            task.id
          }" type="button">Sửa</button>
          <button class="btn btn-danger btn-sm btn-delete" data-id="${
            task.id
          }" type="button">Xóa</button>
        </td>
      `;
    }
    taskListEl.appendChild(row);
  });
  renderPagination(filteredTasks);
}

document.getElementById("addTask").addEventListener("click", function () {
  if (isAdding) return;
  if (projectTasks.some((t) => t.isEditing)) return;

  isAdding = true;
  renderTaskList(
    document.getElementById("searchTask").value,
    document.getElementById("sortTasks").value
  );
});

document.getElementById("taskList").addEventListener("click", function (e) {
  const target = e.target;
  const id = target.dataset.id ? +target.dataset.id : null;

  if (target.classList.contains("btn-save-add")) {
    const taskNameInput = document.getElementById("addTaskName");
    const assigneeIdInput = document.getElementById("addAssigneeId");
    const priorityInput = document.getElementById("addPriority");
    const asignDateInput = document.getElementById("addAsignDate");
    const dueDateInput = document.getElementById("addDueDate");
    const progressInput = document.getElementById("addProgress");

    const taskName = taskNameInput.value.trim();
    const assigneeId = +assigneeIdInput.value;
    const priority = priorityInput.value;
    const asignDate = asignDateInput.value;
    const dueDate = dueDateInput.value;
    const progress = progressInput.value;
    const status = progress; // Đồng bộ status với progress

    const nameErrors = validateInput(taskName, "taskName");
    const assigneeErrors = validateInput(assigneeId, "assigneeId");
    const priorityErrors = validateInput(priority, "priority");
    const dueDateErrors = validateInput(dueDate, "dueDate");
    const progressErrors = validateInput(progress, "progress");

    document.getElementById("addTaskNameError").innerText =
      nameErrors.join(", ");
    document.getElementById("addAssigneeIdError").innerText =
      assigneeErrors.join(", ");
    document.getElementById("addPriorityError").innerText =
      priorityErrors.join(", ");
    document.getElementById("addDueDateError").innerText =
      dueDateErrors.join(", ");
    document.getElementById("addProgressError").innerText =
      progressErrors.join(", ");

    if (
      nameErrors.length === 0 &&
      assigneeErrors.length === 0 &&
      priorityErrors.length === 0 &&
      dueDateErrors.length === 0 &&
      progressErrors.length === 0
    ) {
      const newTask = {
        id: tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1,
        taskName,
        projectId: Number(projectId),
        assigneeId,
        priority,
        asignDate,
        dueDate,
        progress,
        status,
        description: "",
      };

      tasks.push(newTask);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      projectTasks = tasks.filter(
        (task) => task.projectId === Number(projectId)
      );

      isAdding = false;
      currentPage = 1;
      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
    }
  }

  if (target.classList.contains("btn-cancel-add")) {
    isAdding = false;
    renderTaskList(
      document.getElementById("searchTask").value,
      document.getElementById("sortTasks").value
    );
  }

  if (target.classList.contains("btn-edit") && id) {
    if (isAdding) return;
    if (projectTasks.some((t) => t.isEditing)) return;

    projectTasks = projectTasks.map((task) => ({
      ...task,
      isEditing: task.id === id ? true : false,
    }));
    renderTaskList(
      document.getElementById("searchTask").value,
      document.getElementById("sortTasks").value
    );
  }

  if (target.classList.contains("btn-save-edit") && id) {
    const taskNameInput = document.getElementById(`editTaskName-${id}`);
    const assigneeIdInput = document.getElementById(`editAssigneeId-${id}`);
    const priorityInput = document.getElementById(`editPriority-${id}`);
    const dueDateInput = document.getElementById(`editDueDate-${id}`);
    const progressInput = document.getElementById(`editProgress-${id}`);

    const taskName = taskNameInput.value.trim();
    const assigneeId = +assigneeIdInput.value;
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;
    const progress = progressInput.value;
    const status = progress;

    const nameErrors = validateInput(taskName, "taskName", id);
    const assigneeErrors = validateInput(assigneeId, "assigneeId");
    const priorityErrors = validateInput(priority, "priority");
    const dueDateErrors = validateInput(dueDate, "dueDate");
    const progressErrors = validateInput(progress, "progress");

    document.getElementById(`editTaskNameError-${id}`).innerText =
      nameErrors.join(", ");
    document.getElementById(`editAssigneeIdError-${id}`).innerText =
      assigneeErrors.join(", ");
    document.getElementById(`editPriorityError-${id}`).innerText =
      priorityErrors.join(", ");
    document.getElementById(`editDueDateError-${id}`).innerText =
      dueDateErrors.join(", ");
    document.getElementById(`editProgressError-${id}`).innerText =
      progressErrors.join(", ");

    if (
      nameErrors.length === 0 &&
      assigneeErrors.length === 0 &&
      priorityErrors.length === 0 &&
      dueDateErrors.length === 0 &&
      progressErrors.length === 0
    ) {
      const index = projectTasks.findIndex((t) => t.id === id);
      projectTasks[index] = {
        ...projectTasks[index],
        taskName,
        assigneeId,
        priority,
        dueDate,
        progress,
        status,
        isEditing: false,
      };

      const globalIndex = tasks.findIndex((t) => t.id === id);
      tasks[globalIndex] = { ...projectTasks[index] };
      localStorage.setItem("tasks", JSON.stringify(tasks));

      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
    }
  }

  if (target.classList.contains("btn-cancel-edit") && id) {
    projectTasks = projectTasks.map((task) => ({
      ...task,
      isEditing: false,
    }));
    renderTaskList(
      document.getElementById("searchTask").value,
      document.getElementById("sortTasks").value
    );
  }

  if (target.classList.contains("btn-delete") && id) {
    if (isAdding || projectTasks.some((t) => t.isEditing)) return;
    if (window.confirm("Bạn chắc chắn muốn xóa nhiệm vụ này?")) {
      const index = projectTasks.findIndex((t) => t.id === id);
      projectTasks.splice(index, 1);
      tasks = tasks.filter((t) => t.id !== id);
      localStorage.setItem("tasks", JSON.stringify(tasks));

      const totalPages = Math.ceil(projectTasks.length / itemsPerPage);
      currentPage = Math.min(currentPage, totalPages) || 1;
      renderTaskList(
        document.getElementById("searchTask").value,
        document.getElementById("sortTasks").value
      );
    }
  }
});

document.getElementById("searchTask").addEventListener("input", (e) => {
  const searchKeyword = e.target.value;
  projectTasks = tasks.filter((task) => task.projectId === Number(projectId));
  currentPage = 1;
  renderTaskList(searchKeyword, document.getElementById("sortTasks").value);
});

document.getElementById("sortTasks").addEventListener("change", (e) => {
  const sortOption = e.target.value;
  renderTaskList(document.getElementById("searchTask").value, sortOption);
});

// Quản lý thành viên
function renderListMember() {
  const projectMembers = getProjectMembersWithRoles(projectId);
  const titleModal = document.getElementById("exampleModalLabel");
  titleModal.innerText = "Quản lý thành viên";

  const modalBody = document.getElementById("modalContent");
  const memberGrid = modalBody.querySelector(".member-grid");
  memberGrid.innerHTML = projectMembers
    .map((member, index) => {
      const isProjectOwner = project.members.some(
        (m) =>
          m.userId === member.userId && m.role.toLowerCase() === "project owner"
      );
      return `
        <div class="member-card-modal">
          <div class="member-avatar" style="background: ${getRandomColor()}">
            ${getInitials(member.fullName)}
          </div>
          <div class="member-details">
            <h5 class="member-name">${member.fullName}</h5>
            <p class="member-email opacity">${member.email}</p>
            <div class="member-actions d-flex">
              <input type="text" class="form-control role-input mr-2" data-user-id="${
                member.userId
              }" id="role-${index}" value="${
        member.role
      }" placeholder="Nhập vai trò">
              <button class="btn btn-danger btn-sm deleteMemberBtn ${
                isProjectOwner ? "disabled" : ""
              }" data-user-id="${member.userId}">
                Xóa
              </button>
            </div>
            <div class="error-message" id="roleFeedback-${index}"></div>
          </div>
        </div>`;
    })
    .join("");

  document.getElementById("btnSave").innerText = "Lưu";

  document.querySelectorAll(".role-input").forEach((input) => {
    input.addEventListener("input", function () {
      const userId = Number(input.getAttribute("data-user-id"));
      const newRole = input.value.trim();
      const feedbackElement = document.getElementById(
        `roleFeedback-${input.id.split("-")[1]}`
      );

      feedbackElement.innerText = "";

      if (!newRole) {
        feedbackElement.innerText = "Vai trò không được để trống";
        return;
      }

      const project = allProjects.find((p) => p.id === Number(projectId));
      const member = project.members.find((m) => m.userId === userId);
      if (member) {
        member.role = newRole;
        localStorage.setItem("allProjects", JSON.stringify(allProjects));
        renderDetailProject();
      }
    });
  });
}

document.getElementById("menuMember").addEventListener("click", function () {
  document.getElementById("modalHeader").innerHTML = `
    <div class="col-12">
      <h5 class="text-center mb-4 opacity">Danh sách thành viên</h5>
    </div>
  `;
  renderListMember();
});

document.addEventListener("click", function (event) {
  const deleteBtn = event.target.closest(".deleteMemberBtn");
  if (deleteBtn) {
    const userId = deleteBtn.getAttribute("data-user-id");
    const project = allProjects.find(
      (project) => project.id === Number(projectId)
    );
    if (project) {
      const memberIndex = project.members.findIndex(
        (member) => member.userId === Number(userId)
      );
      if (memberIndex !== -1) {
        Swal.fire({
          title: "Bạn chắc chắn?",
          text: "Xóa thành viên sẽ xóa luôn các nhiệm vụ của họ trong dự án này. Bạn có muốn tiếp tục?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Xóa",
          cancelButtonText: "Hủy",
        }).then((result) => {
          if (result.isConfirmed) {
            project.members.splice(memberIndex, 1);
            localStorage.setItem("allProjects", JSON.stringify(allProjects));

            tasks = tasks.filter(
              (task) =>
                !(
                  task.projectId === Number(projectId) &&
                  task.assigneeId === Number(userId)
                )
            );
            localStorage.setItem("tasks", JSON.stringify(tasks));
            projectTasks = tasks.filter(
              (task) => task.projectId === Number(projectId)
            );

            renderDetailProject();
            renderListMember();
            renderTaskList(
              document.getElementById("searchTask").value,
              document.getElementById("sortTasks").value
            );
            Swal.fire(
              "Đã xóa!",
              "Thành viên và các nhiệm vụ của họ đã được xóa.",
              "success"
            );
          }
        });
      }
    }
  }
});

document.getElementById("addMember").addEventListener("click", function () {
  const titleModal = document.getElementById("exampleModalLabel");
  titleModal.innerText = "Thêm thành viên";

  const modalBody = document.getElementById("modalContent");
  document.getElementById("modalHeader").innerHTML = "";
  modalBody.innerHTML = `
    <div class="mb-3">
      <label for="email">Email</label>
      <input list="userList" id="email" class="form-control">
      <datalist id="userList"></datalist>
      <div class="error-message" id="emailError"></div>
    </div>
    <div class="mb-3">
      <label for="role">Vai trò</label>
      <input type="text" id="role" class="form-control">
      <div class="error-message" id="roleError"></div>
    </div>
  `;

  const datalist = document.getElementById("userList");
  datalist.innerHTML = users
    .map((user) => `<option value="${user.email}">`)
    .join("");

  const btnAdd = document.getElementById("btnSave");
  btnAdd.innerText = "Thêm thành viên";
  const newBtnAdd = btnAdd.cloneNode(true);
  btnAdd.parentNode.replaceChild(newBtnAdd, btnAdd);

  newBtnAdd.addEventListener("click", function () {
    const emailInput = document.getElementById("email").value;
    const roleInput = document.getElementById("role").value;
    const emailError = document.getElementById("emailError");
    const roleError = document.getElementById("roleError");

    emailError.innerText = "";
    roleError.innerText = "";

    let isValid = true;

    if (!emailInput) {
      emailError.innerText = "Email không được để trống";
      isValid = false;
    }
    if (!roleInput) {
      roleError.innerText = "Vai trò không được để trống";
      isValid = false;
    }

    if (!isValid) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput)) {
      emailError.innerText = "Email không hợp lệ";
      return;
    }

    const user = users.find((user) => user.email === emailInput);
    if (!user) {
      emailError.innerText = "Email không tồn tại trong danh sách người dùng";
      return;
    }

    const isMember = project.members.some(
      (member) => member.userId === user.id
    );
    if (isMember) {
      emailError.innerText = "Người dùng đã là thành viên của dự án";
      return;
    }

    const newMember = {
      userId: user.id,
      role: roleInput,
    };
    allProjects.forEach((project) => {
      if (project.id === Number(projectId)) {
        project.members.push(newMember);
      }
    });
    localStorage.setItem("allProjects", JSON.stringify(allProjects));
    renderDetailProject();
    Swal.fire("Thành công!", "Thêm thành viên thành công!", "success");

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("exampleModal")
    );
    modal.hide();
  });
});

// Theme toggle
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

// Khởi chạy
document.addEventListener("DOMContentLoaded", () => {
  renderDetailProject();
  renderTaskList();
  displayThemeButtons();
});
