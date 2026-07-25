const backToProjects = document.querySelector(".back-to-projects");

if (backToProjects) {
  backToProjects.addEventListener("click", (event) => {
    const cameFromThisSite = document.referrer.startsWith(window.location.origin);

    if (cameFromThisSite && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });
}
