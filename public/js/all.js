let fpt = {};

fpt.setActiveNavLink = route => {
  const navItems = document.querySelectorAll(".navbar a");
  const navItemActive = document.querySelector(`.navbar a[href='${route}']`);
  navItems.forEach(item => item.classList.remove("active"));
  if (!!navItemActive) navItemActive.classList.add("active");
};
