(() => {
  const params = new URLSearchParams(window.location.search);
  if (!params.has("desktop")) return;

  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute("content", "width=1440");
  }

  document.documentElement.classList.add("desktop-preview");
})();
