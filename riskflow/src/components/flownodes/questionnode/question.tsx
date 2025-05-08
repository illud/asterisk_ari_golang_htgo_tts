import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import './question.css'; // Import the CSS styles

export default function QuestionNode({ data, id }: any) {
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
    <div className="question-node">
      <button className="delete-btn" onClick={onDelete}>×</button>
      {/* Top Handle */}
      <Handle type="target" position={Position.Top} className="handle handle-top" />

      <Handle
        type="target"
        position={Position.Top}
        className="handle handle-top"
        isValidConnection={(connection: any) => {
          return connection.sourceNode?.type === 'messageNode';
        }}
      />

      {/* Node Content */}
      <div className="question-content">
        <label htmlFor="text" className="question-label">Pregunta</label>
        <textarea
          id="text"
          name="text"
          className="question-input nodrag"
          onChange={onChange}
          defaultValue={data?.value || 'Texto de pregunta'}
          rows={3}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="handle handle-bottom"
        isValidConnection={(connection: any) => {
          return connection.targetNode?.type === 'messageNode';
        }}
      />

      {/* Bottom Handle */}
      <Handle type="source" position={Position.Bottom} className="handle handle-bottom" />
    </div>
  );
}
