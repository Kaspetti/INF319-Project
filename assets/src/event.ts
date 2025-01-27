export interface ContingencyClickEvent {
  oldId: string;
  newId: string;
  value: number;
}

export const CONTINGENCY_CELL_CLICK = 'contingency-cell-click';

export function isContingencyClickEvent(event: any): event is CustomEvent<ContingencyClickEvent> {
  return event.type === CONTINGENCY_CELL_CLICK;
}


export interface NetworkClickEvent {
  lineId: string;
  clusterId: string;
  t: 0 | 1;
}

export const NETWORK_NODE_CLICK = "network-node-click";

export function isNetworkClickEvent(event: any): event is CustomEvent<NetworkClickEvent> {
  return event.type === NETWORK_NODE_CLICK;
}
