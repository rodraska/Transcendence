import Component from "../spa/component.js";
import { showToast } from "../utils/toast.js";

class UserProfile extends Component {
    constructor() {
        super('static/html/profile.html');
        this.selectedFile = null; // Armazena o arquivo do upload
    }

    onInit() {
        console.log("UserProfile carregado!");

        // Buscar os dados do usuário pelo endpoint
        fetch(`/api/user/${window.loggedInUserId}/`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    console.error("Erro ao obter dados do usuário:", data.error);
                    return;
                }

                // Preenchendo os campos do formulário com os dados recebidos
                document.getElementById('dname').value = data.username || "";
                document.getElementById('name1').value = data.first_name || "";
                document.getElementById('name2').value = data.last_name || "";
                document.getElementById('email').value = data.email || "";

                // Atualizar a imagem de perfil
                document.getElementById('profileImage').src = data.avatar_url ||
                    "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
            })
            .catch(error => console.error("Erro ao carregar usuário:", error));

        // Eventos dos botões
        document.getElementById("changeImageBtn").addEventListener("click", this.openAvatarSelection.bind(this));
        document.getElementById("resetImageBtn").addEventListener("click", this.resetAvatar.bind(this));

        // Evento para salvar perfil
        document.querySelector("form").addEventListener("submit", this.updateProfile.bind(this));
    }

    // 📌 Função para abrir o modal de seleção de avatar
    openAvatarSelection() {
        const avatarModalElement = document.getElementById('avatarModal');
        if (!avatarModalElement) {
            console.error("Erro: Modal não encontrado!");
            return;
        }

        const avatarModal = new bootstrap.Modal(avatarModalElement);
        avatarModal.show(); // Exibe o modal

        // Evento para selecionar avatar da lista
        document.querySelectorAll(".avatar-option").forEach(option => {
            option.addEventListener("click", () => {
                document.getElementById("profileImage").src = option.dataset.avatarUrl;
                this.selectedFile = null; // Reseta o arquivo se escolher da lista
            });
        });

        // Evento para upload de arquivo
        const uploadInput = document.getElementById("uploadAvatarBtn");
        if (uploadInput) {
            uploadInput.addEventListener("change", this.handleFileUpload.bind(this));
        }

        // Evento para salvar avatar escolhido
        document.getElementById("saveAvatarBtn").addEventListener("click", () => {
            const selectedAvatarUrl = document.getElementById("profileImage").src;
            this.updateAvatar(selectedAvatarUrl);
            avatarModal.hide(); // Fechar modal
        });
    }

    // 📌 Função para processar o arquivo de avatar enviado
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected.");
            return;
        }

        this.selectedFile = file; // Armazena o arquivo

        // Ler e exibir pré-visualização
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById("profileImage").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 📌 Atualiza o avatar no servidor
    updateAvatar(selectedAvatarUrl = null) {
        const formData = new FormData();

        if (this.selectedFile) { // Upload de novo avatar
            formData.append("avatar", this.selectedFile);
        } else if (selectedAvatarUrl) { // Seleção de um avatar da lista
            formData.append("avatar_url", selectedAvatarUrl);
        } else {
            console.error("No avatar selected.");
            return;
        }

        fetch(`/api/user/${window.loggedInUserId}/update_avatar/`, {
            method: "POST",
            body: formData,
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error updating avatar!", "danger");
                //alert("Error updating avatar: " + data.error);
            } else {
                showToast("Updated Avatar!", "success", "Profile");
                //alert("Updated Avatar!");
                document.getElementById("profileImage").src = data.avatar_url;
                window.loggedInAvatarUrl = data.avatar_url;

                // ✅ Atualiza dinamicamente a navbar chamando o método do HeaderBar
                const headerComponent = document.querySelector("header");
                if (headerComponent && headerComponent.component) {
                    headerComponent.component.updateHeader(window.loggedInUserName, data.avatar_url);
                }
            }
        })
        .catch(error => console.error("Error updating avatar: ", error));
    }

    // 📌 Resetar avatar para o padrão
    resetAvatar() {
        const defaultAvatar = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg";
        document.getElementById("profileImage").src = defaultAvatar;
        this.updateAvatar(defaultAvatar);
    }

    // 📌 Atualizar perfil do usuário
    updateProfile(event) {
        event.preventDefault();

        const updatedData = {
            first_name: document.getElementById("name1").value,
            last_name: document.getElementById("name2").value,
            email: document.getElementById("email").value
        };

        fetch(`/api/user/${window.loggedInUserId}/update/`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showToast("Error updating profile!", "danger");
                //alert("Error updating profile: " + data.error);
            } else {
                showToast("Updated profile!", "success", "Profile");
                //alert("Updated profile!");
            }
        })
        .catch(error => console.error("Error updating profile: ", error));
    }
}

export default UserProfile;
