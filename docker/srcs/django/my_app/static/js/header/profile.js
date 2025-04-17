import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";
import { getCookie } from "../utils/cookie.js";

const isAlpha = str => /^[A-Za-zÀ-ÿ\u00C0-\u017F]+$/.test(str);
const isAlphaSpace = str => /^[A-Za-zÀ-ÿ\u00C0-\u017F\s]+$/.test(str);

class UserProfile extends Component {
    constructor() {
        super('static/html/profile.html');
        this.selectedFile = null;
    }

    onInit() {
        if (!window.loggedInUserId) {
            console.error("User ID is not defined.");
            return;
        }

        const form = this.querySelector("form");
        const firstNameInput = form.querySelector("#name1");
        const lastNameInput = form.querySelector("#name2");
        const emailInput = form.querySelector("#email");
        const saveButton = form.querySelector("button[type='submit']");
        const firstNameError = form.querySelector("#firstname_error");
        const lastNameError = form.querySelector("#lastname_error");

        if (!form || !firstNameInput || !lastNameInput || !emailInput || !saveButton) {
            console.error("Some form elements were not found. Check HTML structure.");
            return;
        }

        fetch(`/api/user/${window.loggedInUserId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Error uploading user info:", data.error);
                    return;
                }

                document.getElementById('dname').value = data.username || "";
                document.getElementById('name1').value = data.first_name || "";
                document.getElementById('name2').value = data.last_name || "";
                document.getElementById('email').value = data.email || "";
                document.getElementById('profileImage').src = data.avatar_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";

                this.originalData = {
                    first_name: data.first_name || "",
                    last_name: data.last_name || "",
                    email: data.email || ""
                };
            })
            .catch(error => console.error("Error loading user:", error));

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

        const updateSubmitState = () => {
            const validFirst = validateFirstName();
            const validLast = validateLastName();
            const emailNotEmpty = emailInput.value.trim() !== "";
            const hasChanges = isChanged();

            const firstValidOrUnchanged = !hasChanges || (firstNameInput.value.trim() === this.originalData.first_name || validFirst);
            const lastValidOrUnchanged = !hasChanges || (lastNameInput.value.trim() === this.originalData.last_name || validLast);

            saveButton.disabled = !(hasChanges && emailNotEmpty && firstValidOrUnchanged && lastValidOrUnchanged);
        };

        firstNameInput.addEventListener("input", updateSubmitState);
        lastNameInput.addEventListener("input", updateSubmitState);
        emailInput.addEventListener("input", updateSubmitState);
        firstNameInput.addEventListener("blur", validateFirstName);
        lastNameInput.addEventListener("blur", validateLastName);

        saveButton.disabled = true;

        document.getElementById("changeImageBtn").addEventListener("click", this.openAvatarSelection.bind(this));
        document.getElementById("resetImageBtn").addEventListener("click", this.resetAvatar.bind(this));

        form.addEventListener("submit", this.updateProfile.bind(this));
    }

    openAvatarSelection() {
        const avatarModalElement = document.getElementById('avatarModal');
        if (!avatarModalElement) {
            console.error("Error: Modal not found!");
            return;
        }

        const avatarModal = new bootstrap.Modal(avatarModalElement);
        avatarModal.show();

        document.querySelectorAll(".avatar-option").forEach(option => {
            option.addEventListener("click", () => {
                document.getElementById("profileImage").src = option.dataset.avatarUrl;
                this.selectedFile = null;
            });
        });

        const uploadInput = document.getElementById("uploadAvatarBtn");
        if (uploadInput) {
            uploadInput.addEventListener("change", this.handleFileUpload.bind(this));
        }

        document.getElementById("saveAvatarBtn").addEventListener("click", () => {
            const selectedAvatarUrl = document.getElementById("profileImage").src;
            this.updateAvatar(selectedAvatarUrl);
            avatarModal.hide();
        });
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected.");
            return;
        }

        this.selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    updateAvatar(selectedAvatarUrl = null) {
        const formData = new FormData();

        if (this.selectedFile) {
            formData.append("avatar", this.selectedFile);
        } else if (selectedAvatarUrl) {
            formData.append("avatar_url", selectedAvatarUrl);
        } else {
            console.error("No avatar selected.");
            return;
        }

        fetch(`/api/user/${window.loggedInUserId}/update_avatar/`, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken")
            },
            body: formData,
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error updating avatar!", "danger");
            } else {
                showToast("Updated Avatar!", "success", "Profile");
                document.getElementById("profileImage").src = data.avatar_url;
                window.loggedInAvatarUrl = data.avatar_url;

                const headerComponent = document.querySelector("header");
                if (headerComponent && headerComponent.component) {
                    headerComponent.component.updateHeader(window.loggedInUserName, data.avatar_url);
                }
            }
        })
        .catch(error => console.error("Error updating avatar: ", error));
    }

    resetAvatar() {
        const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
        document.getElementById("profileImage").src = defaultAvatar;
        this.updateAvatar(defaultAvatar);
    }

    updateProfile(event) {
        event.preventDefault();

        const updatedData = {
            first_name: document.getElementById("name1").value.trim(),
            last_name: document.getElementById("name2").value.trim(),
            email: document.getElementById("email").value.trim()
        };

        const csrftoken = getCookie("csrftoken");
        fetch(`/api/user/${window.loggedInUserId}/update/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(updatedData),
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error: " + data.error, "danger", "Profile");
            } else {
                showToast("Updated profile!", "success", "Profile");
            }
        })
        .catch(error => console.error("Error updating profile: ", error));
    }
}

export default UserProfile;
