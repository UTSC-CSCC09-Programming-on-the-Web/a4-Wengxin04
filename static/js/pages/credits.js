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
        <h1>Credits</h1>

        <h2>Colors</h2>
        <ul>
          <li>
            Color palette inspired by
            <a
              href="https://mui.com/material-ui/customization/color/"
              target="_blank"
              rel="noopener noreferrer"
            >MUI Color Tool</a>
          </li>
        </ul>

        <h2>Icons</h2>
        <ul>
          <li>
            Add photo button icon from
            <a
              href="https://www.flaticon.com/free-icon/add-button_4174487"
              target="_blank"
              rel="noopener noreferrer"
            >Freepik - Flaticon</a>
          </li>
          <li>
            Left and right button icons from
            <a
              href="https://www.vecteezy.com/png/15270848-left-arrow-direction-solid-icon-in-gradient-colors-interface-signs-illustration"
              target="_blank"
              rel="noopener noreferrer"
            >Vecteezy</a>
          </li>
        </ul>
      </div>
    </main>
  `;
}

export default { render };
