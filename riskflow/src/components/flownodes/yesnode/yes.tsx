import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import './yes.css'; // Import the CSS styles

export default function YesNode({ data, id }: any) {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLInputElement>) => {
    data.setNodes((nds: any) =>
      nds.map((node: any) =>
        node.id === id ? { ...node, data: { ...node.data, value: evt.target.value } } : node
      )
    );
  }, [data.setNodes, id]);
  const onDelete = () => {
    if (data?.deleteNode) {
      data.deleteNode(id);
    }
  };
  return (
    <div className="yes-node">
      <button className="delete-btn" onClick={onDelete}>×</button>
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} className="handle handle-top" />

      {/* Node Content */}
      <div className="yes-content">
        <label htmlFor="text" className="yes-label">Si</label>
        {/* <input
          id="text"
          name="text"
          type="text"
          className="message-input nodrag"
          onChange={onChange}
          defaultValue={data?.value || 'Respuesta(ejemplo teclado: 1)'}
        /> */}
      </div>

      {/* Bottom Handle */}
      <Handle type="source" position={Position.Bottom} className="handle handle-bottom" />

      {/* Bottom Handle: only connect to questionNode */}
      {/* <Handle
        type="source"
        position={Position.Bottom}
        className="handle handle-bottom"
        isValidConnection={(connection:any) =>
          connection.targetNode?.type === 'questionNode'
        }
      /> */}
    </div>
  );
}
