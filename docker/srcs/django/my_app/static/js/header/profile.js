import Component from "../spa/component.js";
import Route from "../spa/route.js";
import { showToast } from "../utils/toast.js";
import { getCookie } from "../utils/cookie.js";

const isAlpha = (str) => /^[A-Za-zÀ-ÿ\u00C0-\u017F]+$/.test(str);
const isAlphaSpace = (str) => /^[A-Za-zÀ-ÿ\u00C0-\u017F\s]+$/.test(str);

class UserProfile extends Component {
  constructor() {
    super("static/html/profile.html");
    this.selectedFile = null;
    this.avatarSaved = false;
    this.uploadListenerAdded = false;

  }

  onInit() {
    if (!window.loggedInUserId) {
      console.error("User ID is not defined.");
      Route.go('/login');
      return;
    }

    const form = this.querySelector("form");
    const firstNameInput = form.querySelector("#name1");
    const lastNameInput = form.querySelector("#name2");
    const emailInput = form.querySelector("#email");
    this.saveButton = this.querySelector("button[type='submit']");
    const firstNameError = form.querySelector("#firstname_error");
    const lastNameError = form.querySelector("#lastname_error");

    if (!form || !firstNameInput || !lastNameInput || !emailInput || !this.saveButton) {
      console.error("Some form elements were not found. Check HTML structure.");
      return;
    }

    fetch(`/api/user/${window.loggedInUserId}/`)
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error uploading user info:", data.error);
          return;
        }

        document.getElementById("dname").value = data.username || "";
        document.getElementById("name1").value = data.first_name || "";
        document.getElementById("name2").value = data.last_name || "";
        document.getElementById("email").value = data.email || "";
        document.getElementById("profileImage").src =
          data.avatar_url ||
          "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

        this.originalData = {
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
        };

        this.updateSubmitState();
      })
      .catch((error) => console.error("Error loading user:", error));

    const isChanged = () => {
      return (
        firstNameInput.value.trim() !== this.originalData.first_name ||
        lastNameInput.value.trim() !== this.originalData.last_name ||
        emailInput.value.trim() !== this.originalData.email
      );
    };

    const validateFirstName = () => {
      const value = firstNameInput.value.trim();
      let errorMsg = "";

      if (value.length > 15) {
        errorMsg = "First name is too long.";
      } else if (value && !isAlpha(value)) {
        errorMsg = "First name must contain only letters.";
      }

      if (errorMsg) {
        firstNameError.textContent = errorMsg;
        firstNameError.classList.remove("d-none");
        return false;
      } else {
        firstNameError.classList.add("d-none");
        return true;
      }
    };

    const validateLastName = () => {
      const value = lastNameInput.value.trim();
      let errorMsg = "";

      if (value.length > 30) {
        errorMsg = "Last name is too long.";
      } else if (value && !isAlphaSpace(value)) {
        errorMsg = "Last name must contain only letters and spaces.";
      }

      if (errorMsg) {
        lastNameError.textContent = errorMsg;
        lastNameError.classList.remove("d-none");
        return false;
      } else {
        lastNameError.classList.add("d-none");
        return true;
      }
    };

    this.updateSubmitState = () => {
      const isValidFirstName = validateFirstName();
      const isValidLastName = validateLastName();
      const isEmailFilled = emailInput.value.trim() !== "";
      const hasChanges = isChanged();

      this.saveButton.disabled = !(hasChanges && isValidFirstName && isValidLastName && isEmailFilled);
    };

    firstNameInput.addEventListener("input", this.updateSubmitState);
    lastNameInput.addEventListener("input", this.updateSubmitState);
    emailInput.addEventListener("input", this.updateSubmitState);
    firstNameInput.addEventListener("blur", validateFirstName);
    lastNameInput.addEventListener("blur", validateLastName);

    this.saveButton.disabled = true;

    document.getElementById("changeImageBtn").addEventListener("click", this.openAvatarSelection.bind(this));
    document.getElementById("resetImageBtn").addEventListener("click", this.resetAvatar.bind(this));
    form.addEventListener("submit", this.updateProfile.bind(this));
  }

  openAvatarSelection() {
    if (!navigator.onLine) {
      showToast("Offline: Cannot change profile photo", "warning");
      return;
    }

    this.tempAvatarUrlBeforeModal = document.getElementById("profileImage").src;
    this.avatarSaved = false;

    const avatarModalElement = document.getElementById("avatarModal");
    if (!avatarModalElement) {
      console.error("Error: Modal not found!");
      return;
    }

    const avatarModal = new bootstrap.Modal(avatarModalElement);
    avatarModal.show();

    avatarModalElement.addEventListener("hidden.bs.modal", () => {
        if (!this.avatarSaved) {
            document.getElementById("profileImage").src = this.tempAvatarUrlBeforeModal;
        } else {
            this.tempAvatarUrlBeforeModal = document.getElementById("profileImage").src;
        }
        this.selectedFile = null;
        this.toggleSaveAvatarButton();
    });

    document.querySelectorAll(".avatar-option").forEach((option) => {
      option.addEventListener("click", () => {
        document.getElementById("profileImage").src = option.dataset.avatarUrl;
        this.selectedFile = null;
        this.toggleSaveAvatarButton();
      });
    });

    const uploadInput = document.getElementById("uploadAvatarBtn");
    if (uploadInput) {
      uploadInput.value = "";

    if (!this.uploadListenerAdded) {
      uploadInput.addEventListener("change", this.handleFileUpload.bind(this));
      this.uploadListenerAdded = true;
    }

  }

    const newSaveBtn = document.getElementById("saveAvatarBtn");

    // Remove any existing click listeners
    const newSaveBtnClone = newSaveBtn.cloneNode(true);
    newSaveBtn.parentNode.replaceChild(newSaveBtnClone, newSaveBtn);

    newSaveBtnClone.addEventListener("click", () => {
    const selectedAvatarUrl = document.getElementById("profileImage").src;
    this.avatarSaved = true;
    this.updateAvatar(selectedAvatarUrl);
    avatarModal.hide();
    });

    this.toggleSaveAvatarButton();
  }

  toggleSaveAvatarButton() {
    const currentAvatar = document.getElementById("profileImage").src;
    const saveBtn = document.getElementById("saveAvatarBtn");
    const hasChanges = currentAvatar !== this.tempAvatarUrlBeforeModal;
    saveBtn.disabled = !hasChanges;
  }

  handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const maxFileSize = 1 * 1024 * 1024; // 1MB
    if (file.size > maxFileSize) {
      showToast("Image is too large. Max size is 1MB.", "warning");
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("profileImage").src = e.target.result;
      this.toggleSaveAvatarButton();
    };
    reader.readAsDataURL(file);
  }


  updateAvatar(selectedAvatarUrl = null) {
    if (!navigator.onLine) {
      showToast("Offline: Cannot update avatar", "warning");
      return;
    }

    const formData = new FormData();

    if (this.selectedFile) {
      formData.append("avatar", this.selectedFile);
    } else if (selectedAvatarUrl) {
      formData.append("avatar_url", selectedAvatarUrl);
    } else {
      return;
    }

    fetch(`/api/user/${window.loggedInUserId}/update_avatar/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": getCookie("csrftoken"),
      },
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          showToast("Error updating avatar!", "danger");
        } else {
          showToast("Updated Avatar!", "success", "Profile");
          window.loggedInAvatarUrl = data.avatar_url;

          const headerComponent = document.querySelector("header");
          if (headerComponent && headerComponent.component) {
            headerComponent.component.updateHeader(window.loggedInUserName, data.avatar_url);
          }
        }
      })
      .catch((error) => console.error("Error updating avatar: ", error));
  }

  resetAvatar() {
    if (!navigator.onLine) {
      showToast("Offline: Cannot reset avatar", "warning");
      return;
    }
    const defaultAvatar =
      "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
    document.getElementById("profileImage").src = defaultAvatar;
    this.updateAvatar(defaultAvatar);
  }

  updateProfile(event) {
    event.preventDefault();

    if (!navigator.onLine) {
      showToast("Offline: Cannot save changes", "warning");
      return;
    }

    const updatedData = {
      first_name: document.getElementById("name1").value.trim(),
      last_name: document.getElementById("name2").value.trim(),
      email: document.getElementById("email").value.trim(),
    };

    const csrftoken = getCookie("csrftoken");
    fetch(`/api/user/${window.loggedInUserId}/update/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(updatedData),
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          showToast("Error: " + data.error, "danger", "Profile");
        } else {
          showToast("Updated profile!", "success", "Profile");
          this.originalData = { ...updatedData };
          this.updateSubmitState();
        }
      })
      .catch((error) => console.error("Error updating profile: ", error));
  }
}

export default UserProfile;
