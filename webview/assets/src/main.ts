import { initMaps, populateMap } from "./map";
import { initNetworks, populateNetwork, resetCameras, resetLayouts } from "./network";


let previousButton: HTMLButtonElement;
let nextButton: HTMLButtonElement;

let resetViewsButton: HTMLButtonElement;
let resetLayoutsButton: HTMLButtonElement;

let leftNetworkHeading: HTMLHeadingElement;
let rightNetworkHeading: HTMLHeadingElement;

let currentTimeOffset = 0;


async function init() {
  setupPage();

  initNetworks();
  initMaps();

  await populateGraphs();
}


async function populateGraphs() {
  toggleInputs(false);
  leftNetworkHeading.textContent = "Loading..."
  rightNetworkHeading.textContent = "Loading..."

  await Promise.all([
      populateNetwork("left", "2024101900", currentTimeOffset, 50, 0.05)
        .then((nodeClusters) => populateMap("left", "2024101900", currentTimeOffset, nodeClusters))
        .then(() => leftNetworkHeading.textContent = `2024101900 +${currentTimeOffset}h`),
      
      populateNetwork("right", "2024101900", currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), 50, 0.05)
        .then((nodeClusters) => populateMap("right", "2024101900", currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), nodeClusters))
        .then(() => rightNetworkHeading.textContent = `2024101900 +${currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6)}h`)
    ]);

  toggleInputs(true);
}


function setupPage() {
  // Setup previous and next button events
  previousButton = document.querySelector("#previous") as HTMLButtonElement;
  nextButton = document.querySelector("#next") as HTMLButtonElement;

  previousButton.addEventListener("click", function() {
    if (currentTimeOffset > 0) {
      currentTimeOffset -= currentTimeOffset < 78 ? 3 : 6;
    }

    populateGraphs();
  })

  nextButton.addEventListener("click", function() {
    if (currentTimeOffset < 240) {
      currentTimeOffset += currentTimeOffset < 72 ? 3 : 6;
    }

    populateGraphs();
  })

  // Setup reset buttons
  resetViewsButton = document.querySelector("#reset-views-button") as HTMLButtonElement;
  resetLayoutsButton = document.querySelector("#reset-layouts-button") as HTMLButtonElement;

  resetViewsButton.addEventListener("click", resetCameras);
  resetLayoutsButton.addEventListener("click", resetLayouts);

  // Get headings
  leftNetworkHeading = document.querySelector("#left-network-heading") as HTMLHeadingElement;
  rightNetworkHeading = document.querySelector("#right-network-heading") as HTMLHeadingElement;
}


function toggleInputs(on: boolean) {
  previousButton.disabled = !on;
  nextButton.disabled = !on;
  resetViewsButton.disabled = !on;
  resetLayoutsButton.disabled = !on;
}


// Wait untill pywebview is ready before intializing the visualizations
window.addEventListener('pywebviewready', async function() {
  init();
});
