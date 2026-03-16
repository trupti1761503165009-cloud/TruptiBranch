import * as React from 'react';

interface CommonFilterPanelProps {
  title?: string;
  children: React.ReactNode;
}

export const CommonFilterPanel: React.FC<CommonFilterPanelProps> = ({ title = 'Filters', children }) => {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #edebe9',
        borderRadius: 8,
        padding: 16
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 12 }}>{title}</div>
      {children}
    </div>
  );
};

