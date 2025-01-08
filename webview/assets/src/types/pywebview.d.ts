declare global {
  const pywebview: {
    api: {
      get_networks: (
        simStart: string, 
        timeOffset: number, 
        distThreshold: number, 
        requiredRatio: number
      ) => Promise<Network>,

      get_lines: (
        simStart: string,
        timeOffset: number
      ) => Promise<Line[]>
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
  node_clusters: Record<string, number>;
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
