import neo4j, { Session, Node, Relationship, Integer } from "neo4j-driver";
import ObjectGrapghCreator from "./ObjectGraphCreator";

type Object = Node<Integer, { id: string }>;
type Instance = Node<Integer, { id: string }>;
type Concept = Node<Integer, { name: string }>;
type Spacetime = Node<Integer, { name: string; photoUri: string }>;

type Includes = Relationship<Integer, {}>;
type IsNamed = Relationship<Integer, {}>;
type IsAttached = Relationship<Integer, {
    name: "tag" | "areaTag";
    tagDotPosition?: string;
    iconPosition?: string;
}>;
type HasChild = Relationship<Integer, {}>;

interface ObjectIncludesInstance {
    o: Object;
    i: Instance;
    r: Includes;
};

interface InstanceIsNamedConcept {
    i: Instance;
    c: Concept;
    r: IsNamed;
};

interface SpacetimeIsAttachedInstance {
    s: Spacetime;
    r: IsAttached;
    i: Instance;
};

interface ParentInstanceHasChildInstance{
    p: Instance;
    c:Instance;
    r: HasChild;
};

const RELATIONSHIP = {

    objectToInstance: "INCLUDES",

    instanceToConcept: "IS_NAMED",

    spacetimeToInstance: "IS_ATTACHED",

    instanceToInstance: "HAS_CHILD"

};

export const deleteAllNodes = async (session: Session) => {

    await session.run(
        `MATCH (n)
         DETACH DELETE n`
    );

};

export const addNodes = async (session: Session) => {

    //1. chocolate ice cream first instance

    const chocolateIceCreamObject = `Object{id:"chocolate_ice_cream"}`;

    const chocolateIceCreamConcept = `Concept{name:"chocolate ice cream"}`;

    const chocolateIceCreamInstance = `Instance{id:"chocolate_ice_cream_0"`;

    await session.run(
        `CREATE(o:${chocolateIceCreamObject}) - [r: ${RELATIONSHIP.objectToInstance}] -> (i: ${chocolateIceCreamInstance}}) - [: ${RELATIONSHIP.instanceToConcept}] -> (c:${chocolateIceCreamConcept})`
    );

    await session.run(
        `CREATE(s:Spacetime{name:"chocolate_ice_cream_image_0", photoUri: "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_center,w_730,h_913/k%2Farchive%2F7508725f114196a0f4fc1cad5a708dfe5c0b874e"})`
    );

    await session.run(
        `
        MATCH (s:Spacetime{name:"chocolate_ice_cream_image_0"}) , (i:Instance{id:"chocolate_ice_cream_0"})
        CREATE (s) - [r:${RELATIONSHIP.spacetimeToInstance}{name:"area tag"}] -> (i)
        RETURN type(r)
        `
    );

    //2. freezer tray first instance

    await session.run(
        `CREATE(o:Object{id:"freezer_tray"}) - [r: ${RELATIONSHIP.objectToInstance}] -> (i: Instance{id:"freezer_tray_0"}) - [: ${RELATIONSHIP.instanceToConcept}] -> (c:Concept{name:"freezer tray"})`
    );

    await session.run(
        `MATCH (i:Instance{id:"freezer_tray_0"}) , (s:Spacetime{name: "chocolate_ice_cream_image_0"})
         CREATE (s) - [r:${RELATIONSHIP.spacetimeToInstance}{name:"tag",tagDotPosition: "right",iconPosition: "top"}] -> (i)
         RETURN type(r)
         `
    );

    await session.run(
        `MATCH (p: Instance{id:"chocolate_ice_cream_0"}), (c: Instance{id:"freezer_tray_0"})
         CREATE (p) - [r:${RELATIONSHIP.instanceToInstance}] -> (c)
         RETURN type(r)
        `
    );

    //3. freezer tray second instance

    await session.run(
        `
       CREATE(i:Instance{id: "freezer_tray_1"})
        `
    );

    await session.run(
        `MATCH (i:Instance{id: "freezer_tray_1"}), (o:Object{id:"freezer_tray"}), (c:Concept{name:"freezer tray"})
         CREATE (o) - [r:${RELATIONSHIP.objectToInstance}] -> (i) - [l:${RELATIONSHIP.instanceToConcept}] -> (c)
        `
    );

    await session.run(

        `
 MATCH (i:Instance{id: "freezer_tray_1"})
 CREATE (s:Spacetime{name:"freezer_tray_image_0", photoUri:"https://handletheheat.com/wp-content/uploads/2016/05/death-by-chocolate-ice-cream-SQUARE-1-1536x1536.jpg"}) - [r:${RELATIONSHIP.spacetimeToInstance}{name:"area tag"}] -> (i)
 `
    );

    //4.ice cream ball first instance

    const iceCreamBallObject = `Object{id:"ice_cream_ball"}`;

    const iceCreamBallConcept = `Concept{name:"ice cream ball"}`;

    const iceCreamBallInstance = `Instance{id:"ice_cream_ball_0"}`;

    await session.run(
        `
 CREATE (:${iceCreamBallObject}) - [:${RELATIONSHIP.objectToInstance}] -> (:${iceCreamBallInstance}) - [:${RELATIONSHIP.instanceToConcept}] -> (:${iceCreamBallConcept})
 `
    );

    await session.run(
        `
 MATCH (i:${iceCreamBallInstance}), (s:Spacetime{name:"freezer_tray_0"})
 CREATE (s) - [:${RELATIONSHIP.spacetimeToInstance}{name: "tag",
 tagDotPosition: "right",
 iconPosition: "top"}] -> (i)
 `
    );

    await session.run(
        `
 MATCH(p:Instance{id:"freezer_tray_1"}), (c:${iceCreamBallInstance})
 CREATE (p) - [r:${RELATIONSHIP.instanceToInstance}] -> (c)
 RETURN type(r)
 `
    );

};

export const readInstanceAndObjectNodes = async (session: Session) => {

    try {
        const readResult = await session.run<ObjectIncludesInstance>(
            `
            MATCH (o: Object) - [r:${RELATIONSHIP.objectToInstance}] -> (i: Instance)
            RETURN o , i
            `
        );

        const { records } = readResult;
        const mappedRecords: {
            objectNode: {
                id: string;
            },
            instanceNode: {
                id: string;
            }
        }[] = records.map((record) => {

            return {
                objectNode: {
                    id: record.get("o").properties.id
                },
                instanceNode: {
                    id: record.get("i").properties.id
                }
            }
        });

        return mappedRecords
    } catch {
        return null
    };
};

export const readInstanceAndConceptNodes = async (session: Session) => {
    try {
        const readResult = await session.run<InstanceIsNamedConcept>(
            `
            MATCH (i:Instance) - [r:${RELATIONSHIP.instanceToConcept}] -> (c:Concept)
            RETURN i , c
            `
        )
        const { records } = readResult;
        const mappedResult = records.map((record) => {
            return {
                instanceNode: { ...record.get("i").properties },
                conceptNode: { ...record.get("c").properties }
            }
        });
        return mappedResult
    } catch {
        return null
    }
};

export const readSpacetimeAndInstanceNodes = async (session: Session) => {
    try {
        const readResult = await session.run<SpacetimeIsAttachedInstance>(
            `
            MATCH (s:Spacetime) - [r:${RELATIONSHIP.spacetimeToInstance}] -> (i :Instance)
            RETURN s , i ,r
            `
        );

        const { records } = readResult;
        const mappedResult = records.map((record) => {
            return {
                spacetimeNode: { ...record.get("s").properties },
                instanceNode: { ...record.get("i").properties },
                spacetimeToInstanceEdge: { ...record.get("r").properties }
            }
        });
        return mappedResult
    } catch {
        return null
    }
};

export const readInstanceToInstanceEdges = async (session:Session) => {
    try{
        const readResult = await session.run<ParentInstanceHasChildInstance>(
            `
            MATCH (p: Instance) - [r:${RELATIONSHIP.instanceToInstance}] -> (c: Instance)
            RETURN p , c
            `
        );

        const {records} = readResult;
        const mappedResult = records.map((record) => ({
            parentInstance: {...record.get("p").properties},
            childInstance: {...record.get("c").properties}
        }));
        return mappedResult
    }catch{
        return null
    }
};

const main = async () => {

    const driver = neo4j.driver(
        "bolt://localhost:7687",
        neo4j.auth.basic('neo4j', 'ml-nnenu')
    );

    const session = driver.session();

    const objectGrapghCreator = ObjectGrapghCreator();

    try {

        const objectAndInstanceNodeIds = await readInstanceAndObjectNodes(session);

        const setObjectNodesAndInstanceNodesEdges = () => {
            if (!objectAndInstanceNodeIds) return

            const objectNodeSet = new Set<string>();

            for (const objectAndInstanceNodeId of objectAndInstanceNodeIds) {
                const { objectNode, instanceNode } = objectAndInstanceNodeId;

                //Create Object Node
                if (!objectNodeSet.has(objectNode.id)) {
                    objectGrapghCreator.addObjectNode(objectNode.id);
                    objectNodeSet.add(objectNode.id);
                };

                //Create Instance Node 
                objectGrapghCreator.addInstanceNode(instanceNode.id);

                //Create Edge
                objectGrapghCreator.addObjectAndInstanceEdge({
                    objectId: objectNode.id,
                    instanceId: instanceNode.id,
                });
            };
        };

        const instanceAndConceptNodes = await readInstanceAndConceptNodes(session);

        const setConceptNodes = () => {
            if (!instanceAndConceptNodes) return

            for (const instanceAndConceptNode of instanceAndConceptNodes) {
                const { instanceNode, conceptNode } = instanceAndConceptNode;
                const conceptId = objectGrapghCreator.addConceptNode(conceptNode.name);
                objectGrapghCreator.addConceptAndInstanceEdge({
                    conceptId,
                    instanceId: instanceNode.id
                });
            };
        };

        const spacetimeAndInstanceNodes = await readSpacetimeAndInstanceNodes(session);

        const setSpacetimeNodes = () => {
            if (!spacetimeAndInstanceNodes) return

            for (const spacetimeAndInstanceNode of spacetimeAndInstanceNodes) {
                const { spacetimeNode, spacetimeToInstanceEdge, instanceNode } = spacetimeAndInstanceNode;

                const spacetimeId = objectGrapghCreator.addSpacetimeNode(spacetimeNode.photoUri);
                objectGrapghCreator.addSpacetimeToInstanceEdge(
                    spacetimeId, instanceNode.id, {
                    ...spacetimeToInstanceEdge
                });
                objectGrapghCreator.addInstanceToSpacetimeEdge(instanceNode.id, spacetimeId);
            }
        };

        const instanceToInstanceEdges = await readInstanceToInstanceEdges(session);

        const setInstanceToInstanceEdges = () => {
            if(!instanceToInstanceEdges) return

            for(const instanceToInstanceEdge of instanceToInstanceEdges){
                const { parentInstance, childInstance} = instanceToInstanceEdge;
                objectGrapghCreator.addInstanceToInstanceEdge(parentInstance.id, childInstance.id);
            };
        };

        await deleteAllNodes(session);
        await addNodes(session);
        setObjectNodesAndInstanceNodesEdges();
        setConceptNodes();
        setSpacetimeNodes();
        setInstanceToInstanceEdges();
        
    } finally {
        await session.close()
    };

    await driver.close();
};

main();