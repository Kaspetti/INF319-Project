import { initMaps } from "./map";
import { initNetworks } from "./network";


async function init() {
  const nodeClusters = await initNetworks();
  await initMaps(nodeClusters[0], nodeClusters[1]);
}


// Wait untill pywebview is ready before intializing the visualizations
window.addEventListener('pywebviewready', async function() {
  init();
});
