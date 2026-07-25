const projectDetail = document.querySelector(".project-detail-page");
const horizontalProjectLayout = window.matchMedia("(min-width: 901px)");

if (projectDetail && !horizontalProjectLayout.matches) {
  document.body.classList.remove("project-entering");
  document.body.classList.add("project-ready");
}

if (projectDetail && horizontalProjectLayout.matches) {
  document.body.classList.add("project-entering");

  const title = projectDetail.querySelector(".project-title");
  const mainPhoto = projectDetail.querySelector(".project-photo");
  const description = projectDetail.querySelector(".project-description");
  const stackImages = [...projectDetail.querySelectorAll(".project-image-stack img")];
  const projectName = title?.querySelector("h1, h2")?.textContent.trim() || "Project";
  const rail = document.createElement("div");
  rail.className = "project-spread-rail";

  const intro = document.createElement("article");
  intro.className = "project-spread project-spread-intro";
  if (title) intro.append(title);
  if (mainPhoto) intro.append(mainPhoto);
  if (description) intro.append(description);
  rail.append(intro);

  const imageGroups = [];
  for (let i = 0; i < stackImages.length; i += 2) {
    imageGroups.push(stackImages.slice(i, i + 2));
  }

  imageGroups.forEach((group, index) => {
    const spread = document.createElement("article");
    spread.className = `project-spread project-spread-image ${index % 2 === 0 ? "image-left" : "image-right"}${group.length > 1 ? " multi-image" : ""}`;
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
    const mainCaption = group[0]?.alt || `${projectName} project view`;
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
  const moreToggle = document.createElement("button");
  moreToggle.className = "project-more-toggle";
  moreToggle.type = "button";
  moreToggle.textContent = "Know more";
  moreToggle.setAttribute("aria-expanded", "false");
  moreToggle.setAttribute("aria-controls", "project-more-panel");

  const morePanel = document.createElement("section");
  morePanel.className = "project-more-panel";
  morePanel.id = "project-more-panel";
  morePanel.setAttribute("aria-hidden", "true");
  morePanel.inert = true;
  morePanel.innerHTML = `
    <p class="project-more-label">Project notes</p>
    <h2>${projectName}</h2>
    <p>
      This project brings together landscape, architecture, material, and
      planting as one connected environment. The work responds to its site
      through careful observation, collaborative design, and an attention to
      how the place will change over time.
    </p>
  `;

  document.body.append(previous, next, counter, moreToggle, morePanel);

  function setMoreOpen(open) {
    morePanel.classList.toggle("is-open", open);
    morePanel.setAttribute("aria-hidden", open ? "false" : "true");
    morePanel.inert = !open;
    moreToggle.setAttribute("aria-expanded", open ? "true" : "false");
    moreToggle.textContent = open ? "Less" : "Know more";
  }

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
    setMoreOpen(false);
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
  moreToggle.addEventListener("click", () => {
    setMoreOpen(!morePanel.classList.contains("is-open"));
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && morePanel.classList.contains("is-open")) {
      setMoreOpen(false);
      moreToggle.focus();
      return;
    }
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
