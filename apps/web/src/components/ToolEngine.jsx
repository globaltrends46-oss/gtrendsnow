import React, { useState } from 'react';
import ToolCard from './ToolCard.jsx';
import ToolRenderer from './ToolRenderer.jsx';

const ToolEngine = ({ tools }) => {
  const [selectedTool, setSelectedTool] = useState(null);

  if (selectedTool) {
    return (
      <ToolRenderer
        tool={selectedTool}
        onBack={() => setSelectedTool(null)}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          onLaunch={setSelectedTool}
        />
      ))}
    </div>
  );
};

export default ToolEngine;