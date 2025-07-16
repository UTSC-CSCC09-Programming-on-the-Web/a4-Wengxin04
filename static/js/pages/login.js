export function render(container) {
  container.innerHTML = `
    <header class="row gallery-header">
      <div class="col-12 header-content">
        <h1 class="site-title">🌆 Web Gallery</h1>
        <a href="#home" class="btn">Home</a>
      </div>
    </header>

    <main class="row">
      <div class="col-12">
        <form class="form login-form">
          <input
            type="text"
            name="username"
            class="form-element input"
            placeholder="Enter a username"
            required
          />
          <input
            type="password"
            name="password"
            class="form-element input"
            placeholder="Enter a password"
            required
          />
          <div class="login-actions">
            <button type="button" class="btn login-btn sign-in-btn">Sign in</button>
            <span class="or-text">or</span>
            <button type="button" class="btn login-btn sign-up-btn">Sign up</button>
          </div>
        </form>
      </div>
    </main>
  `;
}

export function init(container) {
  const [, getUsername, setUsername] = meact.useState("");
  const [, getPassword, setPassword] = meact.useState("");
  const [, , setLoading] = meact.useState(false);

  const dom = {
    signInBtn: container.querySelector(".sign-in-btn"),
    signUpBtn: container.querySelector(".sign-up-btn"),
    usernameInput: container.querySelector("input[name='username']"),
    passwordInput: container.querySelector("input[name='password']"),
  };

  function disableButtons(disabled) {
    dom.signInBtn.disabled = disabled;
    dom.signUpBtn.disabled = disabled;
  }

  function handleError(message) {
    alert(message);
  }

  function signIn(event) {
    event.preventDefault();
    setUsername(dom.usernameInput.value);
    setPassword(dom.passwordInput.value);
    setLoading(true);
    disableButtons(true);

    apiService
      .signIn(getUsername(), getPassword())
      .then((data) => {
        localStorage.setItem("token", data.token);
        location.hash = "#home";
      })
      .catch((err) => {
        handleError("Login failed: " + (err.message || "Unknown error"));
      })
      .finally(() => {
        setLoading(false);
        disableButtons(false);
      });
  }

  function signUp(event) {
    event.preventDefault();
    setUsername(dom.usernameInput.value);
    setPassword(dom.passwordInput.value);
    setLoading(true);
    disableButtons(true);

    apiService
      .signUp(getUsername(), getPassword())
      .then((data) => {
        localStorage.setItem("token", data.token);
        location.hash = "#home";
      })
      .catch((err) => {
        handleError("Sign up failed: " + (err.message || "Unknown error"));
      })
      .finally(() => {
        setLoading(false);
        disableButtons(false);
      });
  }

  dom.signInBtn?.addEventListener("click", signIn);
  dom.signUpBtn?.addEventListener("click", signUp);
}

export default { render, init };
