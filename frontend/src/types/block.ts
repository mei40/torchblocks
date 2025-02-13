export interface Block {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: {
      label: string;
      [key: string]: any;
    };
  }
  
  export interface Connection {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }
  
  