import { initMaps } from "./map";
import { initNetworks } from "./network";


async function init() {
  await initMaps();
  await initNetworks();
}


// Wait untill pywebview is ready before intializing the visualizations
window.addEventListener('pywebviewready', async function() {
  init();
});
