import Component from "../spa/component.js"

export default class HeaderBar extends Component
{
	constructor()
	{
		super('static/html/header.html')
	}

	onInit(){

		/* document.getElementById('profilebtn').addEventListener('click', () => {
			window.location.href = '#/profile';
		}); */
  
		/* document.getElementById('profilebtn').addEventListener('click', () => {
			Route.go('/profile');
		}); */
		
		/* document.getElementById('profilebtn').addEventListener('click', () => {
			fetch('../static/html/profile.html')
			.then(response => {
				if(!response.ok) {
					throw new Error('erro ba ba ba');
				}
				return(response.text());
			})
			.then(template => {
				console.log('tem fetch: ', template);
				document.getElementById("content").innerHTML = template;
			})
			.catch(error => {
				console.error('erro fetching: ', error);
			});
		
		}); 
 */
		document.getElementById('profilebtn').addEventListener('click', () => {
			loadPage('profilebtn', '../static/html/profile.html');
		});

		document.getElementById('playgamebtn').addEventListener('click', () => {
			loadPage('playgamebtn', '../static/html/play_games.html');
		});


		function loadPage(buttonId, pageUrl) {
			document.getElementById(buttonId).addEventListener('click', () => {
				fetch(pageUrl)
					.then(response => {
						if (!response.ok) {
							throw new Error(`Erro ao carregar ${pageUrl}`);
						}
						return response.text();
					})
					.then(template => {
						console.log(`Conteúdo carregado de ${pageUrl}:`, template);
						document.getElementById("content").innerHTML = template;
					})
					.catch(error => {
						console.error(`Erro ao buscar ${pageUrl}:`, error);
					});
			});
		}
		
		

		/* // 🔹 Chamando a função para diferentes botões/páginas
		loadPage('profilebtn', '../static/html/profile.html');
		loadPage('dashboardbtn', '../static/html/dashboard.html');
		loadPage('settingsbtn', '../static/html/settings.html'); */
		

		/* document.addEventListener("DOMContentLoaded", () => {
			const contentDiv = document.querySelector("#content");
		
			document.body.addEventListener("click", (event) => {
				const target = event.target.closest("a");
				if (target && target.getAttribute("href").startsWith("/")) {
					event.preventDefault();
					navigateTo(target.getAttribute("href"));
				}
			});
		
			const navigateTo = async (url) => {
				const response = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
				const html = await response.text();
		
				const parser = new DOMParser();
				const doc = parser.parseFromString(html, "text/html");
				const newContent = doc.querySelector("#content");
		
				// Substitui o conteúdo
				contentDiv.innerHTML = newContent.innerHTML;
		
				// Remove scripts antigos e executa os novos
				reloadScripts(newContent);
		
				// Atualiza a URL no histórico
				history.pushState(null, null, url);
			};
		
			// Função para recarregar scripts da nova página carregada
			const reloadScripts = (newContent) => {
				document.querySelectorAll("script.dynamic").forEach(script => script.remove()); // Remove scripts antigos
		
				newContent.querySelectorAll("script").forEach(oldScript => {
					const newScript = document.createElement("script");
					newScript.textContent = oldScript.textContent;  // Copia código inline
					if (oldScript.src) newScript.src = oldScript.src;  // Copia o src
					newScript.classList.add("dynamic"); // Marcar para futuras limpezas
					document.body.appendChild(newScript); // Adiciona ao documento
				});
			};
		
			window.addEventListener("popstate", () => {
				navigateTo(window.location.pathname);
			});
		}); */
		
		
		
		/*document.getElementById('playgamebtn').addEventListener('click', () => {
			Route.go('/play_games');
		}); */
		/* document.addEventListener("DOMContentLoaded", function() {
			function loadContent(url) {
				fetch(url)
				.then(response => response.text())
				.then(html => {
					document.getElementById("content").innerHTML = html;
				})
				.catch(error => console.error('Error:', error));
			}
		
			document.querySelectorAll(".nav-link").forEach(link => {
				link.addEventListener("click", function(event) {
					event.preventDefault();  // Evita recarregar a página
					loadContent(this.getAttribute("data-url"));
				});
			});
		});
		
		document.getElementById('logoutbtn').addEventListener('click', () => {
			fetch('/logout/', { method: 'POST', credentials: 'include' })
			.then(() => window.location.href = '/login/')
			.catch(error => console.error('Erro ao fazer logout:', error));
		}); */
		


	/* 	document.addEventListener('DOMContentLoaded', function () {
			const homeLink = document.getElementById('home');
			const profileLink = document.getElementById('profilebtn');
			const playLink = document.getElementById('playgamebtn'); 
		  
			function carregarConteudo(page) {
			  fetch(page)
				.then(response => response.text())
				.then(data => {
				  document.getElementById('content').innerHTML = data;
				})
				.catch(error => {
				  console.error('Erro ao carregar o conteúdo:', error);
				  document.getElementById('content').innerHTML = '<p>Erro ao carregar o conteúdo.</p>';
				});
			} 
		  
			 homeLink.addEventListener('click', function () {
			  carregarConteudo('home.html');
			});
		}); */
			/* profileLink.addEventListener('click', function () {
			  carregarConteudo('profile.html');
			});
		  
			playLink.addEventListener('click', function () {
			  carregarConteudo('play_games.html');
			}); 
		  });
		/* document.getElementById('profilebtn').addEventListener('click', () => {
			document.getElementById('content').innerHTML = profile;
		}); */

		
		/* document.getElementById('profilebtn').addEventListener('click', () => {
            this.changeContent('profile');
            history.pushState(null, null, '#/profile');
        }); */

		/* document.getElementById('playgamebtn').addEventListener('click', () => {
			window.location.href = '#/play_games';
		});*/
	
		/* document.getElementById('logoutbtn').addEventListener('click', () => {
			window.location.href = '#/login';
		}); */

		/* function changeContent(page) {
			const contentDiv = document.getElementById("content");
		
			// Usando fetch para carregar o conteúdo de arquivos HTML externos
			fetch(`${page}.html`)
				.then(response => {
					if (!response.ok) {
						throw new Error('Falha ao carregar o conteúdo');
					}
					return response.text();
				})
				.then(html => {
					// Coloca o conteúdo do arquivo carregado dentro da div
					contentDiv.innerHTML = html;
				})
				.catch(error => {
					console.error('Erro ao carregar o conteúdo:', error);
					contentDiv.innerHTML = `<p>Ocorreu um erro ao carregar o conteúdo.</p>`;
			});
		}
		 */
		/*function changeContent(page) {
			const contentDiv = document.getElementById("content");
		
			// Verifica qual página deve ser exibida
			if (page === "profile") {
				contentDiv.innerHTML = profile.html;
			} /* else if (page === "about") {
				contentDiv.innerHTML = `
					<h2>Sobre</h2>
					<p>Esta é a página "Sobre". Aqui você encontra informações sobre o projeto.</p>
				`;
			} else if (page === "contact") {
				contentDiv.innerHTML = `
					<h2>Contato</h2>
					<p>Esta é a página "Contato". Entre em contato conosco pelo e-mail: contato@exemplo.com</p>
				`; 
			}
		}*/
		// Example usage
		//updateHeader('John Doe', 'https://upload.wikimedia.org/wikipedia/commons/3/3f/Placeholder_view_vector.svg');
	}

	/* // Function to update user details
	updateHeader(userName, profileImage) {
		const userNameElement = document.getElementById('userName');
		const profileImageElement = document.querySelector('header img');

		if (userName) userNameElement.textContent = userName;
		if (profileImage) profileImageElement.src = profileImage;
	}
 */
}
