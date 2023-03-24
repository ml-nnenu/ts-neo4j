import { v4 as uuidv4 } from "uuid";

export const generateGraphNodeId = (
  nodeType: "instance" | "object" | "spacetime" | "concept"
) => {
  const uuid = uuidv4();
  return `${nodeType}-${uuid}`;
};

const ObjectGrapghCreator = () => {
  const data: ObjectDetail = {
    concept: {
      nodes: [],
      adjacencyList: {},
    },
    object: {
      nodes: [],
      adjacencyList: {},
    },
    instance: {
      nodes: [],
      adjacencyList: {},
    },
    spacetime: {
      nodes: [],
      adjacencyList: {},
    },
  };

  const addConceptNode = (name: string, id = generateGraphNodeId("concept")) => {
    // const id = generateGraphNodeId("concept");
    data.concept.nodes.push({
      id,
      name,
    });

    const addConceptNodeAdjListMapping = (id: string) => {
      const adjListMapping: {
        instance: string[];
      } = {
        instance: [],
      };
      data.concept.adjacencyList[id] = adjListMapping;
    };

    addConceptNodeAdjListMapping(id);
    return id;
  };

  const addObjectNode = (id = generateGraphNodeId("object")) => {
    // const id = generateGraphNodeId("object");
    const createdAt = new Date().toISOString();
    data.object.nodes.push({
      id,
      createdAt,
    });

    const addObjectNodeAdjListMapping = (id: string) => {
      const adjListMapping: {
        instance: string[];
        location: string[];
      } = {
        instance: [],
        location: [],
      };
      data.object.adjacencyList[id] = adjListMapping;
    };
    addObjectNodeAdjListMapping(id);

    return id;
  };

  const addInstanceNode = (id =  generateGraphNodeId("instance")) => {
    // const id = generateGraphNodeId("instance");
    data.instance.nodes.push({
      id,
      description: "",
      hashtags: {},
      prices: [
        {
          value: 0,
          currency: "HKD",
          description: "",
        },
      ],
      isRecommended: null,
    });

    const addInstanceNodeAdjListMapping = (id: string) => {
      const adjListMapping: {
        concept: string[];
        spacetime: string[];
        object: string[];
        instance: string[];
      } = {
        concept: [],
        spacetime: [],
        object: [],
        instance: [],
      };
      data.instance.adjacencyList[id] = adjListMapping;
    };
    addInstanceNodeAdjListMapping(id);

    return id;
  };

  const editInstanceNode = (
    id: string,
    detail: {
      description?: string;
      hashtags?: { [keyword: string]: string[] };
      prices?: {
        value: number;
        currency: string;
        description: string;
      }[];
      isRecommended?: boolean | null;
    }
  ) => {
    const mappedInstanceNodes = [...data.instance.nodes].map((value) => {
      if (value.id === id) {
        return {
          ...value,
          ...detail,
        };
      }
      return { ...value };
    });

    data.instance.nodes = mappedInstanceNodes;
  };

  const addSpacetimeNode = (photoUri: string,  id = generateGraphNodeId("spacetime")) => {
    // const id = generateGraphNodeId("spacetime");
    data.spacetime.nodes.push({
      id,
      photoUri,
    });

    const addSpacetimeNodeAdjListMapping = (id: string) => {
      const adjListMapping: {
        instance: {
          id: string;
          relationship?: {
            name: "tag" | "areaTag";
            coordinate?: {
              x: number;
              y: number;
            };
            tagDotPosition?: string;
            iconPosition?: string;
          };
        }[];
      } = {
        instance: [],
      };
      data.spacetime.adjacencyList[id] = adjListMapping;
    };
    addSpacetimeNodeAdjListMapping(id);

    return id;
  };

  const addConceptAndInstanceEdge = ({
    conceptId,
    instanceId,
  }: {
    conceptId: string;
    instanceId: string;
  }) => {
    data.concept.adjacencyList[conceptId].instance.push(instanceId);
    data.instance.adjacencyList[instanceId].concept.push(conceptId);
  };

  const addSpacetimeToInstanceEdge = (
    spacetimeId: string,
    instanceId: string,
    relationship?: TagInfo
  ) => {
    if (relationship) {
      data.spacetime.adjacencyList[spacetimeId].instance.push({
        id: instanceId,
        relationship,
      });
    } else {
      data.spacetime.adjacencyList[spacetimeId].instance.push({
        id: instanceId,
      });
    }
  };

  const addInstanceToSpacetimeEdge = (
    instanceId: string,
    spacetimeId: string
  ) => {
    data.instance.adjacencyList[instanceId].spacetime.push(spacetimeId);
  };

  const addObjectAndInstanceEdge = ({
    objectId,
    instanceId,
  }: {
    objectId: string;
    instanceId: string;
  }) => {
    data.object.adjacencyList[objectId].instance.push(instanceId);
    data.instance.adjacencyList[instanceId].object.push(objectId);
  };

  const addInstanceToInstanceEdge = (
    parentInstanceId: string,
    childInstanceId: string
  ) => {
    data.instance.adjacencyList[parentInstanceId].instance.push(
      childInstanceId
    );
  };

  const createNewObectAndInstance = (name: string) => {
    const objectId = addObjectNode();
    const instanceId = addInstanceNode();
    const conceptId = addConceptNode(name);

    addConceptAndInstanceEdge({ conceptId, instanceId });
    addObjectAndInstanceEdge({ objectId, instanceId });

    return { instanceId, objectId, conceptId };
  };

  return {
    data,
    addConceptNode,
    addInstanceNode,
    addObjectNode,
    addSpacetimeNode,
    editInstanceNode,
    addConceptAndInstanceEdge,
    addInstanceToSpacetimeEdge,
    addObjectAndInstanceEdge,
    addInstanceToInstanceEdge,
    addSpacetimeToInstanceEdge,
    createNewObectAndInstance,
  };
};

export default ObjectGrapghCreator;


export interface ObjectDetail {
  concept: {
    nodes: ConceptNode[];
    adjacencyList: ConceptAdjacencyList;
  };
  object: {
    nodes: ObjectNode[];
    adjacencyList: ObjectAdjacencyList;
  };
  instance: {
    nodes: InstanceNode[];
    adjacencyList: InstanceAdjacencyList;
  };
  spacetime: {
    nodes: SpacetimeNode[];
    adjacencyList: SpacetimeAdjacencyList;
  };
}

export interface AdjacencyListMapping {
  instance: string[];
  concept: string[];
  object: string[];
  spacetime: string[];
  location: string[];
}

interface ConceptNode {
  id: string;
  name: string;
}

export type ConceptAdjacencyListMapping = Pick<
  AdjacencyListMapping,
  "instance"
>;

interface ConceptAdjacencyList {
  [id: string]: ConceptAdjacencyListMapping;
}

interface ObjectNode {
  id: string;
  createdAt: string;
}

export type ObjectAdjacencyListMapping = Pick<
  AdjacencyListMapping,
  "instance" | "location"
>;

interface ObjectAdjacencyList {
  [id: string]: ObjectAdjacencyListMapping;
}

export interface InstanceNode extends InstanceDetail {
  id: string;
}

export interface InstanceDetail {
  description: string;
  hashtags: { [keyword: string]: string[] };
  prices: Price[];
  isRecommended: boolean | null;
}

export interface Price {
  value: number;
  currency: string;
  description: string;
}

export type InstanceAdjacencyListMapping = Omit<
  AdjacencyListMapping,
  "location"
>;

interface InstanceAdjacencyList {
  [id: string]: InstanceAdjacencyListMapping;
}

interface SpacetimeNode {
  id: string;
  photoUri: string;
}

interface SpacetimeAdjacencyList {
  [id: string]: {
    instance: {
      id: string;
      relationship?: TagInfo;
    }[];
  };
}

export interface TagInfo {
  name: "tag" | "areaTag";
  coordinate?: {
    x: number;
    y: number;
  };
  tagDotPosition?: string;
  iconPosition?: string;
}