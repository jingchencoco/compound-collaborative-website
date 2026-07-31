(() => {
  const params = new URLSearchParams(window.location.search);
  const editMode = params.has("edit");

  if (!params.has("desktop") && !editMode) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute("content", "width=1440");
  }

  document.documentElement.classList.add("desktop-preview");

  if (!editMode) return;

  const storageKey = `layout-editor:${window.location.pathname}`;
  const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
  let selected = null;
  let drag = null;

  const style = document.createElement("style");
  style.textContent = `
    .layout-editor-toolbar { position: fixed; z-index: 10000; top: 16px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; align-items: center; padding: 8px 10px; background: rgba(25,25,23,.94); color: #fff; font: 12px/1.2 Arial,sans-serif; box-shadow: 0 5px 20px rgba(0,0,0,.22); }
    .layout-editor-toolbar button { border: 1px solid rgba(255,255,255,.45); background: transparent; color: inherit; padding: 6px 9px; cursor: pointer; }
    .layout-editor-toolbar button:hover { background: rgba(255,255,255,.16); }
    .layout-editor-target { cursor: grab !important; outline: 2px solid #e53935 !important; outline-offset: 3px; }
    .layout-editor-target:active { cursor: grabbing !important; }
  `;
  document.head.append(style);

  const toolbar = document.createElement("div");
  toolbar.className = "layout-editor-toolbar";
  toolbar.innerHTML = '<strong>编辑模式</strong><button data-action="save">保存</button><button data-action="reset">重置当前</button><button data-action="close">退出</button><span data-status>点击图片后拖动，滚轮缩放</span>';
  document.body.append(toolbar);

  const media = () => [...document.querySelectorAll(".project-spread-figure img, .project-spread-figure video, .project-photo img")];
  const idOf = (el) => el.currentSrc || el.src || el.poster || `${el.tagName}:${media().indexOf(el)}`;
  const apply = (el, state = saved[idOf(el)] || { x: 0, y: 0, scale: 1 }) => {
    el.dataset.editorX = state.x;
    el.dataset.editorY = state.y;
    el.dataset.editorScale = state.scale;
    el.style.setProperty("transform", `translate(${state.x}px, ${state.y}px) scale(${state.scale})`, "important");
  };
  const stateOf = (el) => ({ x: Number(el.dataset.editorX || 0), y: Number(el.dataset.editorY || 0), scale: Number(el.dataset.editorScale || 1) });
  const select = (el) => {
    if (selected) selected.classList.remove("layout-editor-target");
    selected = el;
    selected.classList.add("layout-editor-target");
    toolbar.querySelector("[data-status]").textContent = "已选中：拖动移动，滚轮缩放，方向键微调";
  };

  const init = () => media().forEach((el) => {
    apply(el);
    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      select(el);
    }, true);
    el.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      select(el);
      const state = stateOf(el);
      drag = { el, startX: event.clientX, startY: event.clientY, x: state.x, y: state.y };
      el.setPointerCapture(event.pointerId);
    });
    el.addEventListener("pointermove", (event) => {
      if (!drag || drag.el !== el) return;
      apply(el, { x: drag.x + event.clientX - drag.startX, y: drag.y + event.clientY - drag.startY, scale: stateOf(el).scale });
    });
    el.addEventListener("pointerup", () => { drag = null; });
    el.addEventListener("wheel", (event) => {
      event.preventDefault();
      select(el);
      const state = stateOf(el);
      apply(el, { ...state, scale: Math.max(.2, Math.min(3, state.scale + (event.deltaY < 0 ? .05 : -.05))) });
    }, { passive: false });
  });

  document.addEventListener("keydown", (event) => {
    if (!selected || ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;
    const state = stateOf(selected);
    const step = event.shiftKey ? 10 : 1;
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
    if (!delta) return;
    event.preventDefault();
    apply(selected, { ...state, x: state.x + delta[0], y: state.y + delta[1] });
  });

  toolbar.addEventListener("click", (event) => {
    const action = event.target.dataset.action;
    if (action === "save") {
      media().forEach((el) => { saved[idOf(el)] = stateOf(el); });
      localStorage.setItem(storageKey, JSON.stringify(saved));
      toolbar.querySelector("[data-status]").textContent = "已保存到本机浏览器";
    }
    if (action === "reset" && selected) {
      delete saved[idOf(selected)];
      apply(selected, { x: 0, y: 0, scale: 1 });
    }
    if (action === "close") window.location.href = window.location.pathname + window.location.hash;
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
