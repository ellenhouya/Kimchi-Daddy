const slide = document.getElementById("slide");

addEventListener("mousemove", (e) => {
  const x = e.clientX;
  slide.style.left = x + "px";
});

jarallax(document.querySelectorAll(".jarallax"), {
  speed: 0.2,
  // type: 'scale-opacity',
});
