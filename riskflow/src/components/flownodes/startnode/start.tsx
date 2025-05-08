
import { Handle, Position } from '@xyflow/react';
import './start.css'; // Import the CSS styles

export default function StartNode({ data, id }: any) {
  const outgoingCount = data?.edges?.filter((e: any) => e.source === id).length || 0;

  return (
    <div className="start-node">
      <div className="start-content">
        <label htmlFor="text" className="start-label">Inicio</label>
      </div>

      {/* Bottom Handle */}
      <Handle type="source" position={Position.Bottom} className="handle handle-bottom" isValidConnection={() => outgoingCount < 1}  />
    </div>
  );
}
