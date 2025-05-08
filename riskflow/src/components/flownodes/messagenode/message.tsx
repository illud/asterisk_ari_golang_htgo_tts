import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import './MessageNode.css'; // Import the CSS styles

export default function MessageNode({ data, id }: any) {
  const onChange = useCallback((evt: React.ChangeEvent<HTMLTextAreaElement>) => {
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
    <div className="message-node">
      <button className="delete-btn" onClick={onDelete}>×</button>
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} className="handle handle-top" />

      {/* Node Content */}
      <div className="message-content">
        <label htmlFor="text" className="message-label">Mensaje</label>
        <textarea
          id="text"
          name="text"
          className="message-input nodrag"
          onChange={onChange}
          defaultValue={data?.value || 'Texto de mensaje'}
          rows={3}
        />
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
