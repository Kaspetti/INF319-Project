declare global {
  const pywebview: {
    api: {
      get_networks: (
        simStart: string, 
        timeOffset: number, 
        distThreshold: number, 
        requiredRatio: number
      ) => Promise<Network>
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

export {};
