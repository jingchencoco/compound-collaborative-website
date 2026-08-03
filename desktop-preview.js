(() => {
  const params = new URLSearchParams(window.location.search);
  const editMode = params.has("edit") && ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (!params.has("desktop") && !editMode) return;

  const start = () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) viewport.setAttribute("content", "width=1440");
    document.documentElement.classList.add("desktop-preview");
    if (!editMode) return;
    document.documentElement.classList.add("layout-editor-active");

    const key = `layout-editor:${location.pathname}`;
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (_) { saved = {}; }
    let selected = null;
    let drag = null;
    const undoStack = [];
    const redoStack = [];

    const css = document.createElement("style");
    css.textContent = `
      .layout-editor-active .project-spread-figure { overflow: visible !important; }
      .layout-editor-active .project-spread-figure img,
      .layout-editor-active .project-spread-figure video { max-width: none !important; max-height: none !important; }
      .layout-editor-toolbar { position: fixed; z-index: 10000; top: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 7px; align-items: center; padding: 8px 10px; background: #252521; color: #fff; font: 12px Arial,sans-serif; box-shadow: 0 5px 18px #0004; white-space: nowrap; }
      .layout-editor-toolbar button { border: 1px solid #aaa; background: transparent; color: #fff; padding: 6px 8px; cursor: pointer; }
      .layout-editor-toolbar input { width: 42px; }
      .layout-editor-target { outline: 2px solid #e53935 !important; outline-offset: 3px; cursor: grab !important; }
      .layout-editor-guides { position: fixed; z-index: 9998; inset: 0; pointer-events: none; border: 1px dashed #e53935aa; }
      .layout-editor-guides::before, .layout-editor-guides::after { content: ""; position: absolute; background: #e5393577; }
      .layout-editor-guides::before { top: 0; bottom: 0; left: 50%; width: 1px; }
      .layout-editor-guides::after { left: 0; right: 0; top: 50%; height: 1px; }
    `;
    document.head.append(css);

    const toolbar = document.createElement("div");
    toolbar.className = "layout-editor-toolbar";
    toolbar.innerHTML = '<strong>本地编辑</strong><button data-action="save">保存</button><button data-action="undo">撤销</button><button data-action="redo">重做</button><button data-action="reset">重置</button><label>目标页 <input data-page type="number" min="2"></label><button data-action="move">移动</button><button data-action="close">退出</button><span data-status>点击图片后拖动，滚轮缩放，Ctrl+Z 撤销</span>';
    document.body.append(toolbar);
    const guides = document.createElement("div");
    guides.className = "layout-editor-guides";
    document.body.append(guides);

    const media = () => [...document.querySelectorAll(".project-spread-figure img, .project-spread-figure video, .project-photo img")];
    const idOf = (el) => el.dataset.editorId || el.currentSrc || el.src || el.poster || `${el.tagName}-${media().indexOf(el)}`;
    const stateOf = (el) => ({ x: Number(el.dataset.editorX || 0), y: Number(el.dataset.editorY || 0), scale: Number(el.dataset.editorScale || 1) });
    const apply = (el, state) => {
      el.dataset.editorX = state.x;
      el.dataset.editorY = state.y;
      el.dataset.editorScale = state.scale;
      el.style.setProperty("transform", `translate(${state.x}px,${state.y}px) scale(${state.scale})`, "important");
    };
    const pageOf = (el) => el.closest(".project-spread-image")?.getAttribute("aria-label") || "";
    const snapshot = () => media().map((el) => ({ id: idOf(el), state: stateOf(el), page: pageOf(el) }));
    const restore = (items) => items.forEach((item) => {
      const el = media().find((candidate) => idOf(candidate) === item.id);
      if (!el) return;
      const target = [...document.querySelectorAll(".project-spread-image")].find((spread) => spread.getAttribute("aria-label") === item.page);
      if (target) target.querySelector(".project-spread-figure")?.append(el);
      apply(el, item.state);
    });
    const checkpoint = () => { undoStack.push(snapshot()); if (undoStack.length > 80) undoStack.shift(); redoStack.length = 0; };
    const undo = () => { if (!undoStack.length) return; redoStack.push(snapshot()); restore(undoStack.pop()); };
    const redo = () => { if (!redoStack.length) return; undoStack.push(snapshot()); restore(redoStack.pop()); };
    const select = (el) => {
      selected?.classList.remove("layout-editor-target");
      selected = el;
      selected.classList.add("layout-editor-target");
      toolbar.querySelector("[data-status]").textContent = "已选中：拖动、滚轮缩放、方向键微调";
    };

    const initMedia = () => media().forEach((el) => {
      const state = saved[idOf(el)];
      if (state) {
        const target = [...document.querySelectorAll(".project-spread-image")].find((spread) => spread.getAttribute("aria-label") === state.page);
        if (target) target.querySelector(".project-spread-figure")?.append(el);
        apply(el, state);
      } else apply(el, { x: 0, y: 0, scale: 1 });
      el.addEventListener("click", (event) => { event.preventDefault(); event.stopPropagation(); select(el); }, true);
      el.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        checkpoint();
        select(el);
        const state = stateOf(el);
        drag = { el, x: state.x, y: state.y, startX: event.clientX, startY: event.clientY };
        el.setPointerCapture(event.pointerId);
      });
      el.addEventListener("pointermove", (event) => {
        if (!drag || drag.el !== el) return;
        apply(el, { ...stateOf(el), x: drag.x + event.clientX - drag.startX, y: drag.y + event.clientY - drag.startY });
      });
      el.addEventListener("pointerup", () => { drag = null; });
      el.addEventListener("wheel", (event) => {
        event.preventDefault();
        checkpoint();
        select(el);
        const state = stateOf(el);
        apply(el, { ...state, scale: Math.max(.05, Math.min(20, state.scale + (event.deltaY < 0 ? .05 : -.05))) });
      }, { passive: false });
    });

    document.addEventListener("keydown", (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); return; }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); return; }
      if (!selected) return;
      const delta = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
      if (!delta) return;
      event.preventDefault();
      checkpoint();
      const state = stateOf(selected);
      const step = event.shiftKey ? 10 : 1;
      apply(selected, { ...state, x: state.x + delta[0] * step, y: state.y + delta[1] * step });
    });

    toolbar.addEventListener("click", (event) => {
      const action = event.target.dataset.action;
      if (action === "undo") undo();
      if (action === "redo") redo();
      if (action === "reset" && selected) { checkpoint(); apply(selected, { x: 0, y: 0, scale: 1 }); }
      if (action === "move" && selected) {
        const page = Number(toolbar.querySelector("[data-page]").value);
        const target = [...document.querySelectorAll(".project-spread-image")][page - 2];
        if (target) { checkpoint(); target.querySelector(".project-spread-figure")?.append(selected); }
      }
      if (action === "save") {
        saved = {};
        media().forEach((el) => { saved[idOf(el)] = { ...stateOf(el), page: pageOf(el) }; });
        localStorage.setItem(key, JSON.stringify(saved));
        toolbar.querySelector("[data-status]").textContent = "已保存，刷新后会恢复";
      }
      if (action === "close") location.href = location.pathname + location.hash;
    });

    initMedia();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
