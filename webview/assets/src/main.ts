import { initMaps } from "./map";
import { initNetworks, populateNetworks } from "./network";

let timeOffsetInput: HTMLInputElement;
let distThresholdInput: HTMLInputElement;
let ratioInput: HTMLInputElement;


async function init() {
  const timeOffsetElement = document.getElementById("time-offset-input");
  if (!timeOffsetElement || !(timeOffsetElement instanceof HTMLInputElement)) {
    throw new Error("Could not find time-offset-input input element");
  }
  timeOffsetInput = timeOffsetElement;

  const distThresholdElement = document.getElementById("dist-threshold-input");
  if (!distThresholdElement || !(distThresholdElement instanceof HTMLInputElement)) {
    throw new Error("Could not find dist-threshold-input input element");
  }
  distThresholdInput = distThresholdElement;

  const ratioElement = document.getElementById("ratio-input");
  if (!ratioElement || !(ratioElement instanceof HTMLInputElement)) {
    throw new Error("Could not find ratio-input input element");
  }
  ratioInput = ratioElement;

  const submitButton = document.getElementById("submit-button");
  if (submitButton) {
    submitButton.onclick = showData;
  }

  const nodeClusters = await initNetworks();
  await initMaps(nodeClusters[0], nodeClusters[1]);
}


function showData() {
  populateNetworks(timeOffsetInput.valueAsNumber, distThresholdInput.valueAsNumber, ratioInput.valueAsNumber);
}


// Wait untill pywebview is ready before intializing the visualizations
window.addEventListener('pywebviewready', async function() {
  init();
});
