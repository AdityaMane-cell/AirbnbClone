// Toggle visibility of tax info when the switch is clicked
let taxSwitch = document.getElementById("taxSwitch");
taxSwitch.addEventListener("click", () => {
  let taxinfo = document.getElementsByClassName("tax-info");
  for (let info of taxinfo) {
    const isHidden = getComputedStyle(info).display === "none";
    info.style.display = isHidden ? "inline" : "none"; // Toggle visibility
  }
});

// Handle filter selection (visual feedback)
document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", () => {
    // Remove active state from all filters
    document
      .querySelectorAll(".filter")
      .forEach((f) => f.classList.remove("active"));
    // Add active to the selected filter
    filter.classList.add("active");
  });

  // Keyboard accessibility: allow Enter or Space to select filter
  filter.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      filter.click(); // Trigger click handler
      e.preventDefault(); // Prevent page scroll on Space
    }
  });
});

// Scroll filters left or right by given pixel amount
function scrollFilters(amount) {
  const filters = document.getElementById("filters");
  filters.scrollLeft += amount;
}

// DOM references
const container = document.getElementById("filters-container");
const filters = document.getElementById("filters");

// Show or hide gradient edges depending on scroll position
filters.addEventListener("scroll", () => {
  container.classList.toggle("scrollable-left", filters.scrollLeft > 0);
  container.classList.toggle(
    "scrollable-right",
    filters.scrollLeft < filters.scrollWidth - filters.clientWidth
  );
});

// Auto-scroll when mouse is near edges (adaptive smooth scroll)
const edgeSize = 50; // px from edge to trigger scroll
let scrollInterval;

container.addEventListener("mousemove", (e) => {
  const rect = container.getBoundingClientRect();
  const x = e.clientX - rect.left;
  clearInterval(scrollInterval);

  let scrollSpeed = 0;

  // Scroll left if near left edge
  if (x < edgeSize) {
    scrollSpeed = -Math.min(10, (edgeSize - x) / 5);
  }
  // Scroll right if near right edge
  else if (rect.width - x < edgeSize) {
    scrollSpeed = Math.min(10, (edgeSize - (rect.width - x)) / 5);
  }

  // Start smooth scrolling if needed
  if (scrollSpeed !== 0) {
    scrollInterval = setInterval(() => {
      scrollFilters(scrollSpeed);
    }, 30); // adjust for smoother/slower scroll
  }
});

// Stop scrolling when mouse leaves container
container.addEventListener("mouseleave", () => {
  clearInterval(scrollInterval);
});
