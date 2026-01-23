javascript:(async () => {

  const d = ms => new Promise(r => setTimeout(r, ms));

  const play = url => {
    const a = new Audio(url);
    a.volume = 0.7;
    a.play();
  };

  // Fonte
  const style = document.createElement("style");
  style.innerHTML = `
    @font-face {
      font-family: 'MuseoSans';
      src: url('https://corsproxy.io/?url=https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/ynddewua.ttf')
      format('truetype');
    }
  `;
  document.head.appendChild(style);

  // Splash
  const splash = document.createElement("div");
  splash.style = `
    position: fixed;
    inset: 0;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999999;
    opacity: 0;
    transition: opacity .5s ease;
    font-family: MuseoSans, sans-serif;
    font-size: 48px;
    letter-spacing: 6px;
    user-select: none;
  `;
  splash.innerHTML = `
    <span style="color:#fff;">OI </span>
    <span style="color:#ff2a2a;">BUT</span>
  `;
  document.body.appendChild(splash);

  play("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/gcelzszy.wav");

  await d(20);
  splash.style.opacity = "1";
  await d(2300);
  splash.style.opacity = "0";
  await d(800);
  splash.remove();

  // GUI
  const gui = document.createElement("div");
  gui.style = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #000;
    border: 1px solid #333;
    padding: 20px 24px;
    z-index: 999999;
    font-family: MuseoSans, sans-serif;
    color: #fff;
    min-width: 260px;
    box-shadow: 0 0 20px rgba(0,0,0,.6);
  `;
  gui.innerHTML = `
    <div style="margin-bottom:10px;font-size:14px;opacity:.85">
      Você sabe o que fazer
    </div>

    <input type="password" placeholder="key"
      style="
        width:100%;
        padding:8px;
        background:#111;
        border:1px solid #333;
        color:#fff;
        outline:none;
        font-family:MuseoSans;
      "
    />

    <div style="margin-top:12px;text-align:right">
      <button
        style="
          background:#ff2a2a;
          border:none;
          color:#fff;
          padding:6px 12px;
          font-family:MuseoSans;
          cursor:pointer;
        "
      >
        OK
      </button>
    </div>
  `;
  document.body.appendChild(gui);

  gui.querySelector("button").onclick = async () => {
    const value = gui.querySelector("input").value;

    if (value !== "diddy2026") {
      gui.remove();
      return;
    }

    gui.innerHTML = `
      <div style="text-align:center;font-size:16px;color:#72ff72">
        boa but
      </div>
    `;
    await d(900);
    gui.remove();

    const texto = prompt("Cola aí but");
    if (!texto) return;

    const waitTextarea = () =>
      new Promise(r => {
        const i = setInterval(() => {
          const t = document.querySelector("textarea");
          if (t) {
            clearInterval(i);
            r(t);
          }
        }, 400);
      });

    const campo = await waitTextarea();
    campo.focus();

    for (const c of texto) {
      campo.setRangeText(
        c,
        campo.selectionStart,
        campo.selectionEnd,
        "end"
      );

      campo.dispatchEvent(new KeyboardEvent("keydown", {
        key: c,
        bubbles: true
      }));

      campo.dispatchEvent(new InputEvent("input", {
        bubbles: true,
        data: c,
        inputType: "insertText"
      }));

      campo.dispatchEvent(new KeyboardEvent("keyup", {
        key: c,
        bubbles: true
      }));

      await d(20);
    }

    alert("Terminou but");
  };

})();
