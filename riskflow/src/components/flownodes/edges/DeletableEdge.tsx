import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@xyflow/react';

export default function DeletableEdge({ id, sourceX, sourceY, targetX, targetY, style, markerEnd, data }: any) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{
        stroke: '#555',
        strokeWidth: 2,
        strokeDasharray: data?.animated ? '5 5' : 'none',
        animation: data?.animated ? 'dash 1s linear infinite' : 'none',
      }} />

      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: '#ff4d4f',
            padding: '2px 6px',
            borderRadius: '10px',
            fontSize: 10,
            color: 'white',
            cursor: 'pointer',
            userSelect: 'none',
            border: 'none',
            pointerEvents: 'all',
          }}
          onClick={() => {
            console.log('Delete clicked for edge', id);
            data?.onDelete?.(id);
          }}
        >
          X
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
