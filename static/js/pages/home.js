export function render(container) {
  container.innerHTML = `
    <header class="row gallery-header">
      <div class="col-12 header-content">
        <h1 class="site-title">🌆 Web Gallery</h1>
        <div id="authSection">
          <a href="#login" class="btn" id="loginBtn">Sign In / Sign Up</a>
          <button class="btn hidden" id="signoutButton">Sign Out</button>
          <span id="currentUser" class="user-info hidden"></span>
        </div>
      </div>
    </header>

    <main class="row">
      <div class="col-12">
        <h2>Explore Public Galleries</h2>
        <div id="galleryList" class="gallery-list"></div>
        <div class="pagination-controls">
          <button id="prevPageBtn" class="btn" disabled>Previous</button>
          <span id="pageIndicator">Page 1</span>
          <button id="nextPageBtn" class="btn" disabled>Next</button>
        </div>
      </div>
    </main>

    <footer>
      <a href="#credits">Credits</a>
    </footer>
  `;
}

export function init(container) {
  const [, getCurrentPage, setCurrentPage] = meact.useState(1);
  const limit = 5;

  function renderGalleries(page) {
    apiService
      .getGalleries(page, limit)
      .then(({ galleries, totalPages, currentPage: serverPage }) => {
        const listEl = container.querySelector("#galleryList");
        listEl.innerHTML = "";

        galleries.forEach((g) => {
          const div = document.createElement("div");
          div.classList.add("gallery-card");
          div.innerHTML = `
            <h3>${g.name}</h3>
            <p>by <strong>${g.User.username}</strong></p>
            <a href="#gallery?id=${g.id}" class="btn">View Gallery</a>
          `;
          listEl.appendChild(div);
        });

        setCurrentPage(serverPage);
        container.querySelector(
          "#pageIndicator"
        ).textContent = `Page ${serverPage}`;
        container.querySelector("#prevPageBtn").disabled = serverPage <= 1;
        container.querySelector("#nextPageBtn").disabled =
          serverPage >= totalPages;
      })
      .catch(() => {
        container.querySelector("#galleryList").innerHTML =
          "<p>Failed to load galleries.</p>";
      });
  }

  const token = localStorage.getItem("token");

  if (token) {
    apiService
      .getCurrentUser(token)
      .then((user) => {
        container.querySelector("#loginBtn").classList.add("hidden");
        container.querySelector("#signoutButton").classList.remove("hidden");
        const userSpan = container.querySelector("#currentUser");
        userSpan.textContent = `👋 Hello, ${user.username}`;
        userSpan.classList.remove("hidden");

        container
          .querySelector("#signoutButton")
          .addEventListener("click", () => {
            apiService.signOut(token).then(() => {
              localStorage.removeItem("token");
              location.hash = "#login";
            });
          });
      })
      .catch(() => {
        localStorage.removeItem("token");
      });
  }

  renderGalleries(getCurrentPage());

  container.querySelector("#prevPageBtn").addEventListener("click", () => {
    const page = getCurrentPage();
    if (page > 1) {
      renderGalleries(page - 1);
    }
  });

  container.querySelector("#nextPageBtn").addEventListener("click", () => {
    const page = getCurrentPage();
    renderGalleries(page + 1);
  });
}

export default { render, init };
