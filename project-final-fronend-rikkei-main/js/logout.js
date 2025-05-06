document.getElementById("logoutBtn").addEventListener("click", function () {
  localStorage.removeItem("userLogin");

  window.location.href = "login.html";
});
