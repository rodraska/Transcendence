let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "1rem";
    toastContainer.style.right = "1rem";
    toastContainer.style.zIndex = 9999;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = "info", title = "") {
  const container = getToastContainer();

  const toast = document.createElement("div");
  toast.classList.add("toast", "show", "align-items-center", "border-0", `bg-${type}`, "text-white");
  toast.style.minWidth = "250px";
  toast.style.marginBottom = "0.5rem";
  toast.setAttribute("role", "alert");

  const toastBody = document.createElement("div");
  toastBody.classList.add("d-flex", "p-3");

  let html = "";
  if (title) {
    html += `<strong class="me-auto">${title}</strong><br/>`;
  }
  html += `<span>${message}</span>`;
  toastBody.innerHTML = html;

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.classList.add("btn-close", "btn-close-white", "me-2", "m-auto");
  closeBtn.setAttribute("aria-label", "Close");
  closeBtn.addEventListener("click", () => toast.remove());
  toastBody.appendChild(closeBtn);

  toast.appendChild(toastBody);
  container.appendChild(toast);

  setTimeout(() => toast.remove(), 5000);
}
