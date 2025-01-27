declare global {
  const pywebview: {
    api: {
      get_network: (
        simStart: string, 
        timeOffset: number, 
        distThreshold: number, 
        requiredRatio: number,
        lineType: "jet" | "mta"
      ) => Promise<Network>,

      get_lines: (
        simStart: string,
        timeOffset: number,
        lineType: "jet" | "mta"
      ) => Promise<Line[]>,

      get_contingency_table: (
        simStart: string,
        timeOffset: number,
        distThreshold: number, 
        requiredRatio: number,
        lineType: "jet" | "mta"
      ) => Promise<number[][]>
    }
  };
}

type Connection = {
  source: string;
  target: string;
  weight: number;
}

type Node = {
  id: string;
}

type Network = {
  nodes: Node[];
  clusters: Record<number, Connection[]>;
  node_clusters: Record<string, string>;
}

type CoordGeo = {
  lat: number;
  lon: number;
}

type Line = {
  id: string;
  coords: CoordGeo[];
  centroid: CoordGeo;
}

export { Network, Line };
