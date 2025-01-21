import { getContingencyTable } from "./contingencyTable";
import { CONTINGENCY_CELL_CLICK, isContingencyClickEvent } from "./event";
import { clearMaps, highlightLines, initMaps, populateMap, resetMapView } from "./map";
import { highlightClusters, initNetworks, populateNetwork, resetLayouts, resetNetworkView } from "./network";

import './styles/main.css';


let previousButton: HTMLButtonElement;
let nextButton: HTMLButtonElement;

let resetViewsButton: HTMLButtonElement;
let resetLayoutsButton: HTMLButtonElement;

let leftNetworkHeading: HTMLHeadingElement;
let rightNetworkHeading: HTMLHeadingElement;

let currentTimeOffset = 0;

let t0NodeClusters: Record<string, number>;
let t1NodeClusters: Record<string, number>;


async function init() {
  setupPage();

  initNetworks();
  initMaps();

  await populateGraphs();
}


async function populateGraphs() {
  clearMaps();

  toggleInputs(false);
  leftNetworkHeading.textContent = "Loading..."
  rightNetworkHeading.textContent = "Loading..."

    await Promise.all([
      populateNetwork("left", "2024101900", currentTimeOffset, 50, 0.05, "jet")
        .then((nodeClusters) => {
          populateMap("left", "2024101900", currentTimeOffset, "jet", nodeClusters);
          t0NodeClusters = nodeClusters;
        })
        .then(() => leftNetworkHeading.textContent = `2024101900 +${currentTimeOffset}h`),
      
      populateNetwork("right", "2024101900", currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), 50, 0.05, "jet")
        .then((nodeClusters) => {
          populateMap("right", "2024101900", currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), "jet", nodeClusters);
          t1NodeClusters = nodeClusters;
        })
        .then(() => rightNetworkHeading.textContent = `2024101900 +${currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6)}h`)
  ]);

  await getContingencyTable("2024101900", currentTimeOffset, 50, 0.05, "jet");
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
    if (currentTimeOffset < 234) {
      currentTimeOffset += currentTimeOffset < 72 ? 3 : 6;
    }

    populateGraphs();
  })

  // Setup reset buttons
  resetViewsButton = document.querySelector("#reset-views-button") as HTMLButtonElement;
  resetLayoutsButton = document.querySelector("#reset-layouts-button") as HTMLButtonElement;

  resetViewsButton.addEventListener("click", resetNetworkView);
  resetViewsButton.addEventListener("click", () => resetMapView(t0NodeClusters, t1NodeClusters));
  resetLayoutsButton.addEventListener("click", resetLayouts);

  // Get headings
  leftNetworkHeading = document.querySelector("#left-network-heading") as HTMLHeadingElement;
  rightNetworkHeading = document.querySelector("#right-network-heading") as HTMLHeadingElement;

  document.addEventListener(CONTINGENCY_CELL_CLICK, (e) => {
    if (isContingencyClickEvent(e)) {
      const {oldId, newId, value} = e.detail;

      highlightClusters(oldId, newId, t0NodeClusters, t1NodeClusters);
      highlightLines(oldId, newId, t0NodeClusters, t1NodeClusters);
    }
  })
}


function toggleInputs(on: boolean) {
  if (currentTimeOffset <= 0) {
    previousButton.disabled = true;
  } else {
    previousButton.disabled = !on;
  }

  if (currentTimeOffset >= 234) {
    nextButton.disabled = true;
  } else {
    nextButton.disabled = !on;
  }

  resetViewsButton.disabled = !on;
  resetLayoutsButton.disabled = !on;
}


// Wait untill pywebview is ready before intializing the visualizations
window.addEventListener('pywebviewready', async function() {
  init();
});
