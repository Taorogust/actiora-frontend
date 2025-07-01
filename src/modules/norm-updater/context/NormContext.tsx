// src/modules/norm-updater/context/NormContext.tsx
import React, { createContext, useState, FC, useCallback, useEffect } from 'react';
import { NormVersion, AuditTask } from '../types';

interface Context {
  selected: [number?,number?];
  setSelected: (v: [number?,number?]) => void;
  versions: NormVersion[];
  tasks: AuditTask[];
}
export const NormContext = createContext<Context>(null!);

export const NormProvider: FC = ({ children }) => {
  const [selected, setSelected] = useState<[number?,number?]>([]);
  const [versions, setVersions] = useState<NormVersion[]>([]);
  const [tasks, setTasks] = useState<AuditTask[]>([]);

  // prefetch PWA cache on mount
  useEffect(() => {
    if ('caches' in window) caches.open('norm-versions').then(cache =>
      cache.matchAll('/norm/versions').then(() => {})
    );
  }, []);

  return (
    <NormContext.Provider value={{ selected, setSelected, versions, tasks }}>
      {children}
    </NormContext.Provider>
  );
};
