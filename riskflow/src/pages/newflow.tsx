import React, { useCallback } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import MessageNode from '../components/flownodes/messagenode/message';
import QuestionNode from '../components/flownodes/questionnode/question';
import StartNode from '../components/flownodes/startnode/start';
import DeletableEdge from '../components/flownodes/edges/DeletableEdge';
import YesNode from '../components/flownodes/yesnode/yes';
import NoNode from '../components/flownodes/nonode/no';

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2', animated: true }];
const nodeTypes = { messageNode: MessageNode, questionNode: QuestionNode, startNode: StartNode, yesNode: YesNode, noNode: NoNode };


const edgeTypes = {
    deletable: DeletableEdge,
};

const rfStyle = {
    backgroundColor: '#B8CEFF',
};

const initialNodes = [
    // {
    //     id: '1',
    //     type: 'startNode',
    //     position: { x: 300, y: 10 },
    //     data: { animated: true, label: 'Inicio' }
    // },
    //   { id: '2', position: { x: 0, y: 100 }, data: { label: '2' } },
    // {
    //     id: 'node-1',
    //     type: 'textUpdater',
    //     position: { x: 0, y: 200 },
    //     data: { value: 123 },
    //     animated: true,
    // },
];

export default function NewFlow() {
    const [nodes, setNodes, onNodesChange]: any = useNodesState([]);
    const [edges, setEdges, onEdgesChange]: any = useEdgesState([]);

    // add edges to nodes
    const enhancedNodes = nodes.map((node: any) => ({
        ...node,
        data: {
            ...node.data,
            edges, // 👈 necessary for connection validation
        },
    }));

    const onConnect = useCallback(
        (params: any) =>
            setEdges((eds: any) =>
                addEdge(
                    {
                        ...params,
                        type: 'deletable',
                        data: {
                            onDelete: (id: string) =>
                                setEdges((es: any) => es.filter((e: any) => e.id !== id)),
                        },
                    },
                    eds
                )
            ),
        [setEdges]
    );


    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragOver = (event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const onDrop = (event: React.DragEvent) => {
        event.preventDefault();

        const reactFlowBounds = event.currentTarget.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        if (!type) return;

        const position = {
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        };

        const newNode: any = {
            id: `${+new Date()}`,
            type,
            position,
            data: { deleteNode, setNodes, animated: true },
        };

        setNodes((nds: any) => nds.concat(newNode));
    };

    const deleteNode = (id: string) => {
        // First: call onDelete for all edges connected to this node (to update flow state correctly)
        // edges.forEach((edge: any) => {
        //     if (edge.source === id || edge.target === id) {
        //         edge.data?.onDelete?.(edge.id);
        //     }
        // });
    
        // Then: remove the node
        setNodes((nds: any) => nds.filter((node: any) => node.id !== id));
    
        // Optionally: remove any remaining edges tied to that node
        setEdges((eds: any) =>
            eds.filter((edge: any) => edge.source !== id && edge.target !== id)
        );
    };
    

    function convertReactFlowToJsonFlow(nodes: any, edges: any) {
        console.log('Nodes:', nodes);
        console.log('Edges:', edges);
        const flow: any = [];
        const idMap: any = {}; // Map internal node ID => sequential ID
        let nextId = 1;

        // Step 1: Map all nodes to flow IDs
        nodes.forEach((node: any) => {
            idMap[node.id] = nextId++;
        });

        // Step 2: Build node map for easy access
        const nodeMap = Object.fromEntries(nodes.map((n: any) => [n.id, n]));

        // Step 3: Group edges by source
        const outgoing: any = {};
        edges.forEach((edge: any) => {
            if (!outgoing[edge.source]) outgoing[edge.source] = [];
            outgoing[edge.source].push(edge.target);
        });

        // Step 4: Construct flow JSON
        nodes.forEach((node: any) => {
            const flowNode: any = {
                id: idMap[node.id],
                type: node.type.replace("Node", ""), // strip "Node"
                text: node.data?.value || node.data?.label || "Sin texto",
            };

            const targets = outgoing[node.id] || [];

            if (node.type === "questionNode") {
                flowNode.options = {};
                targets.forEach((targetId: any, idx: any) => {
                    const key = String(idx + 1); // Choice labels: "1", "2", etc.
                    flowNode.options[key] = idMap[targetId];
                });
            } else if (targets.length > 0) {
                flowNode.next = idMap[targets[0]];
            } else {
                flowNode.next = null;
            }

            flow.push(flowNode);
        });

        return flow;
    }

    const makeCall = async () => {

        const flowJson = convertReactFlowToJsonFlow(nodes, edges);
        console.log(JSON.stringify(flowJson, null, 2));

        var dataToSend: any = {
            "phoneNumber": "1000",
            "language": "es",
            "flow": flowJson
        }

        const response = await fetch('http://localhost:5000/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });
        const data = await response.json();
        console.log(data);
    }

    // React.useEffect(() => {
    //     // console.log('Edges updated:', edges);
    //     // console.log('nodes updated:', nodes);
    // }, [nodes, edges]);

    return (
        <div style={{ display: 'flex', backgroundColor: '#212121' }}>
            {/* Sidebar with draggable nodes */}
            <div style={{ width: 150, padding: 10, borderRight: '1px solid #212121' }}>
                <h3 style={{ color: '#fff' }}>Nodos</h3>
                <div
                    onDragStart={(event) => onDragStart(event, 'messageNode')}
                    draggable
                    style={{
                        padding: 10,
                        background: '#fff',
                        border: '1px solid #333',
                        cursor: 'grab',
                        marginBottom: 10,
                    }}
                >
                    Mensaje
                </div>
                <div
                    onDragStart={(event) => onDragStart(event, 'questionNode')}
                    draggable
                    style={{
                        padding: 10,
                        background: '#fff',
                        border: '1px solid #333',
                        cursor: 'grab',
                        marginBottom: 10,
                    }}
                >
                    Pregunta
                </div>
                <div
                    onDragStart={(event) => onDragStart(event, 'yesNode')}
                    draggable
                    style={{
                        padding: 10,
                        background: '#fff',
                        border: '1px solid #333',
                        cursor: 'grab',
                        marginBottom: 10,
                    }}
                >
                    Si
                </div>
                <div
                    onDragStart={(event) => onDragStart(event, 'noNode')}
                    draggable
                    style={{
                        padding: 10,
                        background: '#fff',
                        border: '1px solid #333',
                        cursor: 'grab',
                        marginBottom: 10,
                    }}
                >
                    No
                </div>
                <button
                    style={{ top: 10, right: 10, padding: 10, width: '100%', background: '#2e7d32', color: '#fff', border: '1px solid #333' }}
                    onClick={() => {
                        makeCall();
                    }}
                >
                    LLAMAR
                </button>
            </div>

            {/* React Flow canvas */}
            <div style={{ flexGrow: 1, height: '100vh', width: '100vh' }} onDrop={onDrop} onDragOver={onDragOver}>
                <ReactFlow
                    nodes={enhancedNodes}
                    // nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    style={rfStyle}
                    colorMode="dark"
                >
                    <Controls />
                    <MiniMap />
                    <Background variant={"dots" as any} gap={15} size={2} />
                </ReactFlow>


            </div>
        </div>
    );
}
