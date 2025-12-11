// == Khanware Minimal — Versão "Bonitinha" ==
// Mantive a lógica original, apenas reestruturei, comentei e melhorei a aparência do splash/toasts.
// Use com cuidado — execute apenas no domínio do Khan Academy conforme o comportamento original.

(() => {
  'use strict';

  /* ---------------------------
     Config & Estado Inicial
     --------------------------- */
  const loadedPlugins = [];
  const plppdo = new (class EventEmitter {
    constructor() { this.events = {}; }
    on(name, fn) { if (typeof name === 'string') name = [name]; name.forEach(n => { this.events[n] = this.events[n] || []; this.events[n].push(fn); }); }
    off(name, fn) { if (typeof name === 'string') name = [name]; name.forEach(n => { if (this.events[n]) this.events[n] = this.events[n].filter(x => x !== fn); }); }
    emit(name, ...args) { (this.events[name] || []).forEach(fn => { try { fn(...args); } catch (e) { console.error(e); } }); }
    once(name, fn) { const wrapper = (...a) => { fn(...a); this.off(name, wrapper); }; this.on(name, wrapper); }
  })();

  // Utility helpers
  const delay = ms => new Promise(res => setTimeout(res, ms));
  const playAudio = url => { try { const a = new Audio(url); a.play().catch(()=>{}); } catch(e){} };
  const findAndClickBySelector = s => { try { const el = document.querySelector(s); if (el) el.click(); } catch(e){} };
  const sendToast = (text, duration = 5000, gravity = 'bottom') => {
    if (typeof Toastify === 'undefined') {
      console.info('Toast not ready:', text);
      return;
    }
    Toastify({
      text,
      duration,
      gravity,
      position: 'center',
      stopOnFocus: true,
      style: {
        background: '#111',
        color: '#fff',
        borderRadius: '8px',
        padding: '8px 14px',
        fontFamily: 'MuseoSans, sans-serif'
      }
    }).showToast();
  };

  /* ---------------------------
     DOM: Splash / Styles
     --------------------------- */
  // Create splash element (use a div rather than unknown element name)
  const splashScreen = document.createElement('div');
  splashScreen.id = 'khanware-splash';

  // Inject fonts & global small styles
  (function injectStyles() {
    // Font face (kept your original font location — remove corsproxy if undesired)
    const fontUrl = 'https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/ynddewua.ttf';
    const style = document.createElement('style');
    style.innerHTML = `
      @font-face{
        font-family: 'MuseoSans';
        src: url('${fontUrl}') format('truetype');
        font-weight: normal;
        font-style: normal;
      }
      #khanware-splash{
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999;
        background: linear-gradient(135deg, rgba(8,8,8,0.95), rgba(20,20,20,0.95));
        color: #fff;
        font-family: MuseoSans, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
        user-select: none;
        transition: opacity 400ms ease, transform 400ms ease;
        opacity: 0;
        transform: translateY(8px);
        flex-direction: column;
        gap: 14px;
      }
      #khanware-splash .logo {
        font-weight: 700;
        font-size: 28px;
        letter-spacing: 1px;
      }
      #khanware-splash .sub {
        font-size: 13px;
        color: #d0d0d0;
        opacity: .9;
      }
      #khanware-splash .progress {
        width: 240px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255,255,255,0.06);
        overflow: hidden;
      }
      #khanware-splash .progress > i {
        display: block;
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #8b5cf6, #06b6d4);
        transition: width 600ms linear;
      }
      ::-webkit-scrollbar { width: 8px; }
      ::-webkit-scrollbar-track { background: #f1f1f1; }
      ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }
      ::-webkit-scrollbar-thumb:hover { background: #555; }
    `;
    document.head.appendChild(style);

    // favicon (optional)
    try { const link = document.querySelector("link[rel~='icon']"); if (link) link.href = 'https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/ukh0rq22.png'; } catch (e) {}
  })();

  async function showSplashScreen() {
    splashScreen.innerHTML = `
      <div class="logo">KHANWARE.SPACE</div>
      <div class="sub">Minimal • Injector • Spoofs</div>
      <div class="progress"><i></i></div>
    `;
    document.body.appendChild(splashScreen);
    // animate in
    await delay(10);
    splashScreen.style.opacity = '1';
    splashScreen.style.transform = 'translateY(0)';
    // small progress animation
    const bar = splashScreen.querySelector('.progress > i');
    let percent = 0;
    const interval = setInterval(() => {
      percent = Math.min(100, percent + (Math.random() * 15));
      bar.style.width = percent + '%';
      if (percent >= 100) clearInterval(interval);
    }, 220);
    return () => {
      // returns a hide function
      splashScreen.style.opacity = '0';
      splashScreen.style.transform = 'translateY(8px)';
      setTimeout(() => splashScreen.remove(), 700);
    };
  }

  /* ---------------------------
     Loaders (scripts & css)
     --------------------------- */
  function loadScript(url, label) {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to fetch ${url}`);
        return res.text();
      })
      .then(script => {
        loadedPlugins.push(label || url);
        try { /* eslint-disable no-eval */ eval(script); /* eslint-enable no-eval */ } catch (e) { console.error('Error eval plugin', label, e); }
      })
      .catch(err => console.error('loadScript', err));
  }

  function loadCss(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error('CSS load failed: ' + url));
      document.head.appendChild(link);
    });
  }

  /* ---------------------------
     Real-time DOM observer
     --------------------------- */
  new MutationObserver(mutationsList => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') plppdo.emit('domChanged', mutation);
    }
  }).observe(document.body, { childList: true, subtree: true });

  /* ---------------------------
     Spoof Modules (fetch overrides)
     - questionSpoof
     - videoSpoof
     - minuteFarm
     --------------------------- */

  // Helper: convert decimal to fraction when desired (kept from original)
  function toFraction(d) {
    if (d === 0 || d === 1) return String(d);
    const decimals = (String(d).split('.')[1] || '').length;
    let num = Math.round(d * Math.pow(10, decimals)), den = Math.pow(10, decimals);
    const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
    const div = gcd(Math.abs(num), Math.abs(den));
    return den / div === 1 ? String(num / div) : `${num / div}/${den / div}`;
  }

  function installQuestionSpoof() {
    const phrases = [
      "🔥 Get good, get Khanware!",
      "🤍 Made by @im.nix.",
      "☄️ By Niximkk/khanware.",
      "🌟 Star the project on GitHub!",
      "🦢 Nix é lindo e maravilhoso!"
    ];
    const originalFetch = window.fetch.bind(window);
    const correctAnswers = new Map();

    window.fetch = async function (input, init) {
      try {
        const url = input instanceof Request ? input.url : input;
        let body = input instanceof Request ? await input.clone().text() : init?.body;

        // Intercept responses that include getAssessmentItem in the URL or body
        if (url && url.includes('getAssessmentItem') && body) {
          const res = await originalFetch(...arguments);
          const clone = res.clone();
          try {
            const data = await clone.json();
            let item = null;
            if (data?.data) {
              for (const key in data.data) {
                if (data.data[key]?.item) { item = data.data[key].item; break; }
              }
            }
            if (!item?.itemData) return res;
            let itemData = JSON.parse(item.itemData);
            const answers = [];

            // Parse widgets to capture answers
            for (const [key, w] of Object.entries(itemData.question.widgets || {})) {
              if (w.type === 'radio' && w.options?.choices) {
                const choices = w.options.choices.map((c, i) => ({ ...c, id: c.id || `radio-choice-${i}` }));
                const correct = choices.find(c => c.correct);
                if (correct) answers.push({ type: 'radio', choiceId: correct.id, widgetKey: key });
              } else if (w.type === 'numeric-input' && w.options?.answers) {
                const correct = w.options.answers.find(a => a.status === 'correct');
                if (correct) {
                  const val = correct.answerForms?.some(f => f === 'proper' || f === 'improper') ? toFraction(correct.value) : String(correct.value);
                  answers.push({ type: 'numeric', value: val, widgetKey: key });
                }
              } else if (w.type === 'expression' && w.options?.answerForms) {
                const correct = w.options.answerForms.find(f => f.considered === 'correct' || f.form === true);
                if (correct) answers.push({ type: 'expression', value: correct.value, widgetKey: key });
              } else if (w.type === 'grapher' && w.options?.correct) {
                const c = w.options.correct;
                if (c.type && c.coords) answers.push({ type: 'grapher', graphType: c.type, coords: c.coords, asymptote: c.asymptote || null, widgetKey: key });
              }
            }

            if (answers.length > 0) {
              correctAnswers.set(item.id, answers);
              sendToast(`📦 ${answers.length} resposta(s) capturada(s).`, 750);
            }

            // Spoof question content: replace with random phrase + call to action (kept original behavior)
            if (itemData.question.content?.[0] === itemData.question.content[0].toUpperCase()) {
              itemData.answerArea = { calculator: false, chi2Table: false, periodicTable: false, tTable: false, zTable: false };
              itemData.question.content = phrases[Math.floor(Math.random() * phrases.length)]
                + "\n\n**Onde você deve obter seus scripts?**" + `[[☃ radio 1]]`
                + `\n\n**💎 Quer ter a sua mensagem lida para TODOS utilizando o Khanware?** \nFaça uma [Donate Aqui](https://livepix.gg/nixyy)!`;

              itemData.question.widgets = {
                "radio 1": {
                  type: "radio",
                  alignment: "default",
                  static: false,
                  graded: true,
                  options: {
                    choices: [
                      { content: "**I Can Say** e **Platform Destroyer**.", correct: true, id: "correct-choice" },
                      { content: "Qualquer outro kibador **viado**.", correct: false, id: "incorrect-choice" }
                    ],
                    randomize: false, multipleSelect: false, displayCount: null, deselectEnabled: false
                  },
                  version: { major: 1, minor: 0 }
                }
              };

              const modified = JSON.parse(JSON.stringify(data));
              if (modified.data) {
                for (const key in modified.data) {
                  if (modified.data[key]?.item?.itemData) {
                    modified.data[key].item.itemData = JSON.stringify(itemData);
                    break;
                  }
                }
              }
              sendToast("🔓 Questão exploitada.", 750);
              return new Response(JSON.stringify(modified), { status: res.status, statusText: res.statusText, headers: res.headers });
            }

          } catch (e) {
            console.error('questionSpoof parse error', e);
          }
          return res;
        }

        // Intercept attemptProblem requests to auto-fill answers
        if (body?.includes('"operationName":"attemptProblem"')) {
          try {
            let bodyObj = JSON.parse(body);
            const itemId = bodyObj.variables?.input?.assessmentItemId;
            const answers = correctAnswers.get(itemId);
            if (answers?.length > 0) {
              const content = [], userInput = {};
              let state = bodyObj.variables.input.attemptState ? JSON.parse(bodyObj.variables.input.attemptState) : null;
              answers.forEach(a => {
                if (a.type === 'radio') {
                  content.push({ selectedChoiceIds: [a.choiceId] });
                  userInput[a.widgetKey] = { selectedChoiceIds: [a.choiceId] };
                } else if (a.type === 'numeric') {
                  content.push({ currentValue: a.value });
                  userInput[a.widgetKey] = { currentValue: a.value };
                  if (state?.[a.widgetKey]) state[a.widgetKey].currentValue = a.value;
                } else if (a.type === 'expression') {
                  content.push(a.value);
                  userInput[a.widgetKey] = a.value;
                  if (state?.[a.widgetKey]) state[a.widgetKey].value = a.value;
                } else if (a.type === 'grapher') {
                  const graph = { type: a.graphType, coords: a.coords, asymptote: a.asymptote };
                  content.push(graph);
                  userInput[a.widgetKey] = graph;
                  if (state?.[a.widgetKey]) state[a.widgetKey].plot = graph;
                }
              });

              bodyObj.variables.input.attemptContent = JSON.stringify([content, []]);
              bodyObj.variables.input.userInput = JSON.stringify(userInput);
              if (state) bodyObj.variables.input.attemptState = JSON.stringify(state);

              body = JSON.stringify(bodyObj);
              if (input instanceof Request) input = new Request(input, { body });
              else init.body = body;
              sendToast(`✨ ${answers.length} resposta(s) aplicada(s).`, 750);
            }
          } catch (e) {
            console.error('questionSpoof apply error', e);
          }
        }

      } catch (err) {
        console.error('questionSpoof outer fetch hook error', err);
      }

      return originalFetch(...arguments);
    };
  }

  function installVideoSpoof() {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input, init) {
      try {
        let body = input instanceof Request ? await input.clone().text() : (init && init.body);
        if (body && body.includes('"operationName":"updateUserVideoProgress"')) {
          try {
            const bodyObj = JSON.parse(body);
            if (bodyObj.variables && bodyObj.variables.input) {
              const durationSeconds = bodyObj.variables.input.durationSeconds;
              bodyObj.variables.input.secondsWatched = durationSeconds;
              bodyObj.variables.input.lastSecondWatched = durationSeconds;
              const newBody = JSON.stringify(bodyObj);
              if (input instanceof Request) input = new Request(input, { body: newBody });
              else init.body = newBody;
              sendToast("🔓 Vídeo exploitado.", 1000);
            }
          } catch (e) {
            console.error('videoSpoof parse error', e);
          }
        }
      } catch (e) {
        console.error('videoSpoof outer', e);
      }
      return originalFetch(...arguments);
    };
  }

  function installMinuteFarm() {
    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input, init = {}) {
      try {
        let body = input instanceof Request ? await input.clone().text() : init.body;
        if (body && (typeof input === 'string' ? input : input.url).includes("mark_conversions")) {
          try {
            if (body.includes("termination_event")) {
              sendToast("🚫 Limitador de tempo bloqueado.", 1000);
              return;
            }
          } catch (e) {
            console.error('minuteFarm parse error', e);
          }
        }
      } catch (e) {
        console.error('minuteFarm outer', e);
      }
      return originalFetch(...arguments);
    };
  }

  /* ---------------------------
     AutoAnswer (automatic clicks)
     --------------------------- */
  function installAutoAnswer() {
    const baseSelectors = [
      `.perseus_hm3uu-sq`,
      `[data-testid="exercise-check-answer"]`,
      `[data-testid="exercise-next-question"]`,
      `._1wi2tma4`
    ];
    let running = true;

    (async () => {
      while (running) {
        const selectorsToCheck = [...baseSelectors];
        for (const q of selectorsToCheck) {
          try {
            findAndClickBySelector(q);
            const container = document.querySelector(q + "> div");
            if (container && container.innerText === "Mostrar resumo") {
              sendToast("🎉 Exercício concluído!", 3000);
              playAudio("https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/4x5g14gj.wav");
            }
          } catch (e) { /* ignore */ }
        }
        await delay(800);
      }
    })();
  }

  /* ---------------------------
     Main setup: inject and run
     --------------------------- */
  async function setupMain() {
    // Install the various spoof modules (they monkey-patch fetch)
    try {
      installQuestionSpoof();
      installVideoSpoof();
      installMinuteFarm();
      installAutoAnswer();
    } catch (e) {
      console.error('setupMain error', e);
    }
  }

  // Validate host (preserve original injection guard)
  if (!/^https?:\/\/([a-z0-9-]+\.)?khanacademy\.org/.test(window.location.href)) {
    alert("❌ Khanware Failed to Inject!\n\nVocê precisa executar o Khanware no site do Khan Academy (https://pt.khanacademy.org/).");
    window.location.href = "https://pt.khanacademy.org/";
    return;
  }

  // Run: show splash, load plugins, then init
  (async () => {
    const hide = await showSplashScreen(); // returns hide function via resolved promise

    // Attempt to load DarkReader + Toastify (non-blocking)
    try {
      await loadScript('https://cdn.jsdelivr.net/npm/darkreader@4.9.92/darkreader.min.js', 'darkReaderPlugin');
      if (window.DarkReader) {
        try { DarkReader.setFetchMethod(window.fetch); DarkReader.enable(); } catch (e) {}
      }
    } catch (e) { console.warn('darkreader failed', e); }

    try {
      await loadCss('https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css');
      await loadScript('https://cdn.jsdelivr.net/npm/toastify-js', 'toastifyPlugin');
    } catch (e) { console.warn('toastify load failed', e); }

    sendToast("🪶 Khanware Minimal injetado com sucesso!", 3000);
    sendToast("Por que diabos você usa isso?", 3000);
    playAudio('https://r2.e-z.host/4d0a0bea-60f8-44d6-9e74-3032a64a9f32/gcelzszy.wav');

    // small delay so user can see splash
    await delay(600);
    // hide splash
    if (typeof hide === 'function') hide();

    // start main behavior
    setupMain();
    console.clear();
  })();

})();
