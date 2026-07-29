(() => {
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const cropSources = new WeakMap();

  function restoreNaturalImage(img) {
    if (!cropSources.has(img)) {
      cropSources.set(img, img.getAttribute("src"));
    }

    const originalSource = img.getAttribute("data-full-src");
    if (originalSource && img.getAttribute("src") !== originalSource) {
      img.setAttribute("src", originalSource);
    }

    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "auto", "important");
    img.style.setProperty("max-height", "none", "important");
    img.style.setProperty("aspect-ratio", "auto", "important");
    img.style.setProperty("object-fit", "contain", "important");
    img.style.setProperty("object-position", "center", "important");
  }

  function restoreDesktopCrop(img) {
    const cropSource = cropSources.get(img);
    if (cropSource && img.getAttribute("src") !== cropSource) {
      img.setAttribute("src", cropSource);
    }

    [
      "width",
      "height",
      "max-height",
      "aspect-ratio",
      "object-fit",
      "object-position",
    ].forEach((property) => img.style.removeProperty(property));
  }

  function syncDetailImages() {
    document.querySelectorAll("img[data-full-src]").forEach((img) => {
      if (mobileQuery.matches) {
        restoreNaturalImage(img);
      } else {
        restoreDesktopCrop(img);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", syncDetailImages);
  window.addEventListener("load", syncDetailImages);

  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener("change", syncDetailImages);
  } else {
    mobileQuery.addListener(syncDetailImages);
  }

  new MutationObserver(syncDetailImages).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();
