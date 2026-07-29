const projectDetail = document.querySelector(".project-detail-page");
const forceDesktopPreview = new URLSearchParams(window.location.search).has("desktop");
const responsiveProjectLayout = window.matchMedia("(min-width: 901px)");
const horizontalProjectLayout = {
  get matches() {
    return forceDesktopPreview || responsiveProjectLayout.matches;
  },
  addEventListener(...args) {
    responsiveProjectLayout.addEventListener(...args);
  },
};
const projectMoreTemplate = projectDetail?.querySelector(".project-more-content");
const projectTitle = projectDetail?.querySelector(".project-title");
const projectName =
  projectTitle?.querySelector("h1, h2")?.textContent.trim() || "Project";
const projectDescription = projectDetail?.querySelector(".project-description");

function markMediaOrientation(media) {
  const applyOrientation = () => {
    const width = media.videoWidth || media.naturalWidth || 0;
    const height = media.videoHeight || media.naturalHeight || 0;
    if (!width || !height) return;
    const ratio = width / height;
    media.classList.remove("is-landscape", "is-portrait", "is-square");
    media.classList.add(
      ratio > 1.18 ? "is-landscape" : ratio < 0.85 ? "is-portrait" : "is-square"
    );
  };

  applyOrientation();
  if (!media.classList.contains("is-landscape") &&
      !media.classList.contains("is-portrait") &&
      !media.classList.contains("is-square")) {
    media.addEventListener(media.tagName === "VIDEO" ? "loadedmetadata" : "load", applyOrientation, { once: true });
  }
}

let generatedMoreContent = "";
if (projectDescription) {
  const descriptionParagraphs = projectDescription.innerHTML
    .trim()
    .split(/\s*(?:<br\s*\/?>\s*){2,}/i)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (descriptionParagraphs.length > 2) {
    projectDescription.innerHTML = descriptionParagraphs
      .slice(0, 2)
      .join("<br><br>");
    generatedMoreContent = `
      <p class="project-more-label">Project notes</p>
      <h2>${projectName}</h2>
      <p>${descriptionParagraphs.slice(2).join("<br><br>")}</p>
    `;
  }
}

const projectMoreContent =
  projectMoreTemplate?.innerHTML.trim() ||
  generatedMoreContent ||
  `
    <p class="project-more-label">Project notes</p>
    <h2>${projectName}</h2>
    <p>Further project information and archive material will be added here.</p>
  `;

if (projectDetail && !horizontalProjectLayout.matches) {
  document.body.classList.remove("project-entering");
  document.body.classList.add("project-ready");

  const description = projectDetail.querySelector(".project-description");
  const details = document.createElement("details");
  details.className = "project-more-inline";
  const summary = document.createElement("summary");
  summary.textContent = "Know more";
  const content = document.createElement("div");
  content.innerHTML = projectMoreContent;
  details.append(summary, content);
  (description || projectDetail.querySelector(".project-title"))?.insertAdjacentElement("afterend", details);
}

if (projectDetail && horizontalProjectLayout.matches) {
  document.body.classList.add("project-entering");

  const title = projectDetail.querySelector(".project-title");
  const mainPhoto = projectDetail.querySelector(".project-photo");
  const description = projectDetail.querySelector(".project-description");
  const stackImages = [...projectDetail.querySelectorAll(".project-image-stack img, .project-image-stack video")];
  const rail = document.createElement("div");
  rail.className = "project-spread-rail";

  const intro = document.createElement("article");
  intro.className = "project-spread project-spread-intro";
  const introCopy = document.createElement("div");
  introCopy.className = "project-intro-copy";
  if (title) intro.append(title);
  if (mainPhoto) intro.append(mainPhoto);
  if (description) introCopy.append(description);
  const details = document.createElement("details");
  details.className = "project-more-inline project-more-inline--desktop";
  const summary = document.createElement("summary");
  summary.textContent = "Know more";
  const content = document.createElement("div");
  content.innerHTML = projectMoreContent;
  details.append(summary, content);
  introCopy.append(details);
  if (introCopy.childElementCount) intro.append(introCopy);
  rail.append(intro);

  const imageGroups = [];
  const editorialPattern = [
    { size: 2, layout: "layout-pair" },
    { size: 1, layout: "layout-single-page" },
    { size: 2, layout: "layout-asymmetric" },
  ];
  let imageCursor = 0;
  let patternCursor = 0;
  while (imageCursor < stackImages.length) {
    if (projectDetail.dataset.singleImageSpreads === "true") {
      imageGroups.push({
        group: stackImages.slice(imageCursor, imageCursor + 1),
        layout: "layout-single-page",
      });
      imageCursor += 1;
      continue;
    }
    const forcedPair = stackImages[imageCursor]?.dataset.spreadPair;
    if (
      forcedPair &&
      stackImages[imageCursor + 1]?.dataset.spreadPair === forcedPair
    ) {
      imageGroups.push({
        group: stackImages.slice(imageCursor, imageCursor + 2),
        layout: "layout-pair",
      });
      imageCursor += 2;
      continue;
    }
    const pattern = editorialPattern[patternCursor % editorialPattern.length];
    const group = stackImages.slice(imageCursor, imageCursor + pattern.size);
    imageGroups.push({ group, layout: pattern.layout });
    imageCursor += group.length;
    patternCursor += 1;
  }

  imageGroups.forEach(({ group, layout }, index) => {
    const spread = document.createElement("article");
    const editorialLayout = ` ${layout}`;
    spread.className = `project-spread project-spread-image ${index % 2 === 0 ? "image-left" : "image-right"}${group.length > 1 ? " multi-image" : ""} ${editorialLayout}`;
    spread.setAttribute("aria-label", `Project image ${index + 2}`);

    const figure = document.createElement("figure");
    figure.className = `project-spread-figure${group.length > 1 ? " project-spread-figure--multi" : ""}`;
    group.forEach((image) => {
      markMediaOrientation(image);
      figure.append(image);
    });

    if (group.length === 1) {
      const image = group[0];
      const allowCrossPageOnlyForPanoramas = () => {
        const width = image.videoWidth || image.naturalWidth || 0;
        const height = image.videoHeight || image.naturalHeight || 0;
        if (!width || !height) return;
        const isPanorama = width / height >= 2.1;
        spread.classList.toggle("layout-cross-page", isPanorama);
        spread.classList.toggle("layout-single-page", !isPanorama);
      };

      allowCrossPageOnlyForPanoramas();
      if (!(image.videoWidth || image.naturalWidth)) {
        image.addEventListener(
          image.tagName === "VIDEO" ? "loadedmetadata" : "load",
          allowCrossPageOnlyForPanoramas,
          { once: true }
        );
      }
    }

    const copy = document.createElement("aside");
    copy.className = "project-spread-copy";

    const folio = document.createElement("p");
    folio.className = "project-spread-folio";
    folio.textContent = `${projectName} / ${String(index + 2).padStart(2, "0")}`;

    const caption = document.createElement("h2");
    const mainCaption = group[0]?.dataset.caption || group[0]?.alt || `${projectName} project view`;
    const extraCount = Math.max(0, group.length - 1);
    caption.textContent = extraCount > 0 ? `${mainCaption} (+${extraCount})` : mainCaption;

    const note = document.createElement("p");
    note.className = "project-spread-note";
    note.textContent = "Exhibition view / project archive";

    copy.append(folio, caption, note);
    spread.append(figure, copy);
    rail.append(spread);
  });

  projectDetail.replaceChildren(rail);
  projectDetail.classList.add("is-horizontal");
  document.body.classList.add("project-horizontal");

  const pages = [...rail.children];
  let currentPage = 0;
  const previous = document.createElement("button");
  previous.className = "project-page-edge project-page-previous";
  previous.type = "button";
  previous.setAttribute("aria-label", "Previous project page");
  previous.innerHTML = '<span aria-hidden="true"></span>';
  const next = document.createElement("button");
  next.className = "project-page-edge project-page-next";
  next.type = "button";
  next.setAttribute("aria-label", "Next project page");
  next.innerHTML = '<span aria-hidden="true"></span>';
  const counter = document.createElement("p");
  counter.className = "project-page-counter";
  document.body.append(previous, next, counter);

  function updatePage() {
    pages.forEach((page, index) => {
      page.classList.remove("is-turn-target");
      page.classList.toggle("is-active", index === currentPage);
      page.classList.toggle("is-before", index < currentPage);
      page.classList.toggle("is-after", index > currentPage);
      page.setAttribute("aria-hidden", index === currentPage ? "false" : "true");
    });
    previous.disabled = currentPage === 0;
    next.disabled = currentPage === pages.length - 1;
    counter.textContent = `${String(currentPage + 1).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
  }

  let isTurning = false;

  function turnTo(targetPage) {
    if (isTurning || targetPage === currentPage || targetPage < 0 || targetPage >= pages.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      currentPage = targetPage;
      updatePage();
      return;
    }

    isTurning = true;
    const currentQuietSwap = pages[currentPage]?.querySelector("[data-quiet-swap]")?.dataset.quietSwap;
    const target = pages[targetPage];
    const targetQuietSwap = target.querySelector("[data-quiet-swap]")?.dataset.quietSwap;
    const isQuietSwap = currentQuietSwap && currentQuietSwap === targetQuietSwap;
    target.classList.add("is-turn-target");
    target.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-page-turning");
    document.body.classList.toggle("project-page-quiet-swap", Boolean(isQuietSwap));
    previous.disabled = true;
    next.disabled = true;

    window.setTimeout(() => {
      document.body.classList.remove("project-page-turning");
      document.body.classList.remove("project-page-quiet-swap");
      currentPage = targetPage;
      isTurning = false;
      updatePage();
    }, isQuietSwap ? 420 : 620);
  }
  window.projectTurnTo = turnTo;

  previous.addEventListener("click", () => {
    turnTo(currentPage - 1);
  });
  next.addEventListener("click", () => {
    turnTo(currentPage + 1);
  });
  window.addEventListener("keydown", (event) => {
    if (document.body.classList.contains("project-lightbox-open")) return;
    if (event.key === "ArrowLeft") previous.click();
    if (event.key === "ArrowRight") next.click();
  });
  window.addEventListener("resize", updatePage);
  updatePage();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document.body.classList.remove("project-entering");
        document.body.classList.add("project-ready");
      }, 120);
    });
  });
}

horizontalProjectLayout.addEventListener("change", () => {
  window.location.reload();
});

const projectImages = [...document.querySelectorAll(".project-detail-page img")];

if (projectImages.length) {
  const overviewButton = document.createElement("button");
  overviewButton.className = "project-overview-button";
  overviewButton.type = "button";
  overviewButton.textContent = "All photos";
  overviewButton.setAttribute("aria-label", "View all project photos");
  document.body.append(overviewButton);

  const overview = document.createElement("div");
  overview.className = "project-photo-overview";
  overview.hidden = true;
  overview.setAttribute("role", "dialog");
  overview.setAttribute("aria-modal", "true");
  overview.setAttribute("aria-label", "All project photos");
  overview.innerHTML = `
    <div class="project-photo-overview-panel">
      <button class="project-photo-overview-close" type="button" aria-label="Close photo overview">Close</button>
      <div class="project-photo-overview-grid"></div>
    </div>
  `;
  document.body.append(overview);

  const overviewGrid = overview.querySelector(".project-photo-overview-grid");
  const overviewClose = overview.querySelector(".project-photo-overview-close");

  function findImagePageIndex(image) {
    const page = image.closest(".project-spread");
    if (!page) return -1;
    return [...page.parentElement.children].indexOf(page);
  }

  function openOverview() {
    overview.hidden = false;
    document.body.classList.add("project-overview-open");
    overviewClose.focus();
  }

  function closeOverview() {
    overview.hidden = true;
    document.body.classList.remove("project-overview-open");
    overviewButton.focus();
  }

  projectImages.forEach((image, index) => {
    const item = document.createElement("button");
    item.className = "project-photo-overview-item";
    item.type = "button";
    item.setAttribute("aria-label", image.alt || `Project image ${index + 1}`);
    item.innerHTML = `<img alt=""><span>${String(index + 1).padStart(2, "0")}</span>`;
    const thumbnail = item.querySelector("img");
    thumbnail.src = image.currentSrc || image.src;
    thumbnail.alt = "";
    item.addEventListener("click", () => {
      const pageIndex = findImagePageIndex(image);
      closeOverview();
      if (pageIndex >= 0 && typeof window.projectTurnTo === "function") {
        window.projectTurnTo(pageIndex);
      } else {
        image.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    overviewGrid.append(item);
  });

  overviewButton.addEventListener("click", openOverview);
  overviewClose.addEventListener("click", closeOverview);
  overview.addEventListener("click", (event) => {
    if (event.target === overview) closeOverview();
  });

  const lightbox = document.createElement("div");
  lightbox.className = "project-lightbox";
  lightbox.hidden = true;
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Project image viewer");
  lightbox.innerHTML = `
    <button class="project-lightbox-close" type="button" aria-label="Close image viewer">Close</button>
    <button class="project-lightbox-previous" type="button" aria-label="Previous image">&larr;</button>
    <figure>
      <img alt="">
      <figcaption></figcaption>
    </figure>
    <button class="project-lightbox-next" type="button" aria-label="Next image">&rarr;</button>
  `;
  document.body.append(lightbox);

  const lightboxImage = lightbox.querySelector("img");
  const lightboxCaption = lightbox.querySelector("figcaption");
  const lightboxClose = lightbox.querySelector(".project-lightbox-close");
  const lightboxPrevious = lightbox.querySelector(".project-lightbox-previous");
  const lightboxNext = lightbox.querySelector(".project-lightbox-next");
  let activeImageIndex = 0;

  function showLightboxImage(index) {
    activeImageIndex = (index + projectImages.length) % projectImages.length;
    const sourceImage = projectImages[activeImageIndex];
    lightboxImage.src = sourceImage.dataset.fullSrc || sourceImage.currentSrc || sourceImage.src;
    lightboxImage.alt = sourceImage.alt || "";
    lightboxCaption.textContent = sourceImage.alt || "";
    lightboxPrevious.hidden = projectImages.length < 2;
    lightboxNext.hidden = projectImages.length < 2;
  }

  function openLightbox(index) {
    showLightboxImage(index);
    lightbox.hidden = false;
    document.body.classList.add("project-lightbox-open");
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.classList.remove("project-lightbox-open");
    projectImages[activeImageIndex]?.focus();
  }

  projectImages.forEach((image, index) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-label", `Enlarge image: ${image.alt || `Project image ${index + 1}`}`);
    image.addEventListener("click", () => openLightbox(index));
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrevious.addEventListener("click", () => showLightboxImage(activeImageIndex - 1));
  lightboxNext.addEventListener("click", () => showLightboxImage(activeImageIndex + 1));
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  window.addEventListener("keydown", (event) => {
    if (!overview.hidden && event.key === "Escape") closeOverview();
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showLightboxImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(activeImageIndex + 1);
  });
}
