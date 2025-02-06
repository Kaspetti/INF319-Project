import { getContingencyTable, getNewIds, getOldIds, highlightCellsNewId, highlightCellsOldId, renderContingencyTable } from "./contingencyTable";
import { CONTINGENCY_CELL_CLICK, isContingencyClickEvent, isNetworkClickEvent, NETWORK_NODE_CLICK } from "./event";
import { clearMaps, highlightLines, initMaps, populateMap, resetMapView } from "./map";
import { highlightClusters, initNetworks, populateNetwork, resetLayouts, resetNetworkView } from "./network";

import './styles/main.css';
import { Settings } from "./types/pywebview";


let previousButton: HTMLButtonElement;
let nextButton: HTMLButtonElement;

let resetViewsButton: HTMLButtonElement;
let resetLayoutsButton: HTMLButtonElement;

let leftNetworkHeading: HTMLHeadingElement;
let rightNetworkHeading: HTMLHeadingElement;

let currentTimeOffset = 0;

let t0NodeClusters: Record<string, string>;
let t1NodeClusters: Record<string, string>;

let settingsForm: HTMLFormElement;
let simStartInput: HTMLInputElement;
let distThresholdInput: HTMLInputElement;
let requiredRatioInput: HTMLInputElement;
let lineTypeSelect: HTMLSelectElement;

let settings: Settings;


async function init() {
  settings = await pywebview.api.get_settings();

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
  settingsForm.classList.add('opacity-50', 'pointer-events-none');

    await Promise.all([
      populateNetwork("left", settings.simStart, currentTimeOffset, settings.distThreshold, settings.requiredRatio, settings.lineType)
        .then((nodeClusters) => {
          populateMap("left", settings.simStart, currentTimeOffset, settings.lineType, nodeClusters);
          t0NodeClusters = nodeClusters;
        })
        .then(() => leftNetworkHeading.textContent = `${settings.simStart} +${currentTimeOffset}h`),
      
      populateNetwork("right", settings.simStart, currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), settings.distThreshold, settings.requiredRatio, settings.lineType)
        .then((nodeClusters) => {
          populateMap("right", settings.simStart, currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6), settings.lineType, nodeClusters);
          t1NodeClusters = nodeClusters;
        })
        .then(() => rightNetworkHeading.textContent = `${settings.simStart} +${currentTimeOffset + (currentTimeOffset < 72 ? 3 : 6)}h`)
  ]);

  await getContingencyTable(settings.simStart, currentTimeOffset, settings.distThreshold, settings.requiredRatio, settings.lineType);
  toggleInputs(true);
  settingsForm.classList.remove('opacity-50', 'pointer-events-none');
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
  resetViewsButton.addEventListener("click", renderContingencyTable);
  resetLayoutsButton.addEventListener("click", resetLayouts);

  // Get headings
  leftNetworkHeading = document.querySelector("#left-network-heading") as HTMLHeadingElement;
  rightNetworkHeading = document.querySelector("#right-network-heading") as HTMLHeadingElement;

  document.addEventListener(CONTINGENCY_CELL_CLICK, (e) => {
    if (isContingencyClickEvent(e)) {
      const {oldId, newId, value} = e.detail;

      highlightClusters([oldId], 0);
      highlightClusters([newId], 1);

      highlightLines([oldId], 0);
      highlightLines([newId], 1);
    }
  })

  document.addEventListener(NETWORK_NODE_CLICK, (e) => {
    if (isNetworkClickEvent(e)) {
      const {lineId, clusterId, t} = e.detail;

      if (t === 0) {
        const newIds = getNewIds(clusterId);

        highlightClusters([clusterId], 0);
        highlightClusters(newIds, 1);

        highlightLines([clusterId], 0);
        highlightLines(newIds, 1);

        highlightCellsOldId(clusterId);
      } else {
        const oldIds = getOldIds(clusterId);

        highlightClusters([clusterId], 1);
        highlightClusters(oldIds, 0);

        highlightLines([clusterId], 1);
        highlightLines(oldIds, 0);

        highlightCellsNewId(clusterId);
      }
    }
  })

  settingsForm = document.querySelector("#settings-form") as HTMLFormElement;
  simStartInput = document.querySelector("#simStart") as HTMLInputElement;
  distThresholdInput = document.querySelector("#distThreshold") as HTMLInputElement;
  requiredRatioInput = document.querySelector("#requiredRatio") as HTMLInputElement;
  lineTypeSelect = document.querySelector("#lineType") as HTMLSelectElement;

  simStartInput.value = settings.simStart;
  distThresholdInput.value = settings.distThreshold.toString();
  requiredRatioInput.value = settings.requiredRatio.toString();
  lineTypeSelect.value = settings.lineType;

  settingsForm.addEventListener("submit", handleSettingsSubmit);
}


function handleSettingsSubmit(e: Event) {
  e.preventDefault();
  
  settings.simStart = simStartInput.value;
  settings.distThreshold = parseFloat(distThresholdInput.value);
  settings.requiredRatio = parseFloat(requiredRatioInput.value);
  settings.lineType = lineTypeSelect.value as 'jet' | 'mta';

  // currentTimeOffset = 0; 
  populateGraphs();
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
