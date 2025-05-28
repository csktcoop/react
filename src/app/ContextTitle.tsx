import React, { createContext, useContext, useMemo } from 'react';

const ContextTitle = createContext<string[]>([]);

export const useTitleSegments = () => useContext(ContextTitle);

export const TitleProvider = ({ segment, children }: { segment: string, children: React.ReactNode }) => {
  const parentSegments = useTitleSegments();
  const segments = useMemo(() => [...parentSegments, segment], [parentSegments, segment]);

  return (
    <ContextTitle.Provider value={segments}>
      {children}
    </ContextTitle.Provider>
  );
};