const projectDetail = document.querySelector(".project-detail-page");
const horizontalProjectLayout = window.matchMedia("(min-width: 901px)");
const projectMoreTemplate = projectDetail?.querySelector(".project-more-content");
const projectTitle = projectDetail?.querySelector(".project-title");
const projectName =
  projectTitle?.querySelector("h1, h2")?.textContent.trim() || "Project";
const projectDescription = projectDetail?.querySelector(".project-description");

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
    { size: 1, layout: "layout-cross-page" },
    { size: 2, layout: "layout-asymmetric" },
  ];
  let imageCursor = 0;
  let patternCursor = 0;
  while (imageCursor < stackImages.length) {
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
      figure.append(image);
    });

    const copy = document.createElement("aside");
    copy.className = "project-spread-copy";

    const folio = document.createElement("p");
    folio.className = "project-spread-folio";
    folio.textContent = `${projectName} / ${String(index + 2).padStart(2, "0")}`;

    const caption = document.createElement("h2");
    const mainCaption = group[0]?.alt || group[0]?.dataset.caption || `${projectName} project view`;
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
    const target = pages[targetPage];
    target.classList.add("is-turn-target");
    target.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-page-turning");
    previous.disabled = true;
    next.disabled = true;

    window.setTimeout(() => {
      document.body.classList.remove("project-page-turning");
      currentPage = targetPage;
      isTurning = false;
      updatePage();
    }, 860);
  }

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
    lightboxImage.src = sourceImage.currentSrc || sourceImage.src;
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
    if (lightbox.hidden) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showLightboxImage(activeImageIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(activeImageIndex + 1);
  });
}
