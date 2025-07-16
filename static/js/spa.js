const routes = {
  "#login": () => import("./pages/login.js").then((m) => m.default || m),
  "#home": () => import("./pages/home.js").then((m) => m.default || m),
  "#gallery": () => import("./pages/gallery.js").then((m) => m.default || m),
  "#credits": () => import("./pages/credits.js").then((m) => m.default || m),
};

function handleRoute() {
  const [routeBase] = (location.hash || "#home").split("?");
  const loadPage = routes[routeBase];

  const app = document.querySelector("#app");
  app.innerHTML = "";

  if (loadPage) {
    loadPage()
      .then((pageModule) => {
        if (pageModule.render) {
          pageModule.render(app);
        }
        if (pageModule.init) {
          pageModule.init(app);
        }
      })
      .catch((err) => {
        console.error("Failed to load route:", err);
        app.innerHTML = "<p>Error loading page.</p>";
      });
  } else {
    app.innerHTML = "<p>404 - Page Not Found</p>";
  }
}

if (!location.hash) {
  location.hash = "#home";
}

window.addEventListener("hashchange", handleRoute);
window.addEventListener("DOMContentLoaded", handleRoute);
