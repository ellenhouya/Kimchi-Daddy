const alert = document.querySelector(".alert");

export const hideAlert = () => {
  alert.style.top = 0;
  alert.classList.remove("alert--error");
  alert.classList.remove("alert--success");
};

export const showAlert = (type, msg, time = 2.5) => {
  hideAlert();
  alert.classList.add(`alert--${type}`);
  alert.innerHTML = `<i class="fas fa-${
    type === "success" ? "check" : "times"
  }"></i> ${msg}`;

  alert.style.top = "90px";
  setTimeout(hideAlert, time * 1000);
};
