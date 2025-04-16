import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";
import { getCookie } from "../utils/cookie.js";

class UserProfile extends Component {
    constructor() {
        super('static/html/profile.html');
        this.selectedFile = null; // upload file
    }

    onInit() {
        console.log("UserProfile carregado!");

        
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
            })
            .catch(error => console.error("Error loading user:", error));

       
        document.getElementById("changeImageBtn").addEventListener("click", this.openAvatarSelection.bind(this));
        document.getElementById("resetImageBtn").addEventListener("click", this.resetAvatar.bind(this));

        document.querySelector("form").addEventListener("submit", this.updateProfile.bind(this));
    }

    
    openAvatarSelection() {
        const avatarModalElement = document.getElementById('avatarModal');
        if (!avatarModalElement) {
            console.error("Erro: Modal não encontrado!");
            return;
        }

        const avatarModal = new bootstrap.Modal(avatarModalElement);
        avatarModal.show(); 

        // option list
        document.querySelectorAll(".avatar-option").forEach(option => {
            option.addEventListener("click", () => {
                document.getElementById("profileImage").src = option.dataset.avatarUrl;
                this.selectedFile = null; 
            });
        });

        // upload file
        const uploadInput = document.getElementById("uploadAvatarBtn");
        if (uploadInput) {
            uploadInput.addEventListener("change", this.handleFileUpload.bind(this));
        }

        // save avatar
        document.getElementById("saveAvatarBtn").addEventListener("click", () => {
            const selectedAvatarUrl = document.getElementById("profileImage").src;
            this.updateAvatar(selectedAvatarUrl);
            avatarModal.hide(); 
        });
    }

    // upload avatar
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

        if (this.selectedFile) { // Upload
            formData.append("avatar", this.selectedFile);
        } else if (selectedAvatarUrl) { // Option List
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

                // update HeaderBar
                const headerComponent = document.querySelector("header");
                if (headerComponent && headerComponent.component) {
                    headerComponent.component.updateHeader(window.loggedInUserName, data.avatar_url);
                }
            }
        })
        .catch(error => console.error("Error updating avatar: ", error));
    }

    // default avatar
    resetAvatar() {
        const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
        document.getElementById("profileImage").src = defaultAvatar;
        this.updateAvatar(defaultAvatar);
    }

    updateProfile(event) {
        event.preventDefault();

        const updatedData = {
            first_name: document.getElementById("name1").value,
            last_name: document.getElementById("name2").value,
            email: document.getElementById("email").value
        };

        const csrftoken = getCookie("csrftoken");
        console.log(csrftoken);
        fetch(`/api/user/${window.loggedInUserId}/update/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json",
                "X-CSRFToken": csrftoken
            },
            body: JSON.stringify(updatedData),
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error updating profile!", "danger");
            } else {
                showToast("Updated profile!", "success", "Profile");
            }
        })
        .catch(error => console.error("Error updating profile: ", error));
    }
}

export default UserProfile;
