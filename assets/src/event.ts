export interface ContingencyClickEvent {
  oldId: string;
  newId: string;
  value: number;
}

export const CONTINGENCY_CELL_CLICK = 'contingency-cell-click';

export function isContingencyClickEvent(event: any): event is CustomEvent<ContingencyClickEvent> {
  return event.type === CONTINGENCY_CELL_CLICK;
}
