// src/modules/compliance-dashboard/context/ComplianceContext.tsx
import React, { createContext, useState, useEffect } from 'react';
import { ComplianceState, Task } from '../types';
import { subscribeCompliance, unsubscribeCompliance, complianceEmitter } from '../services/complianceService';

interface Thresholds { green: number; yellow: number; }

interface Ctx {
  state: ComplianceState|null;
  tasks: Task[];
  thresholds: Thresholds;
  setThresholds: (t: Partial<Thresholds>) => void;
}
export const ComplianceContext = createContext<Ctx>(null!);

export const ComplianceProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<ComplianceState|null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [thresholds, setThresholds] = useState<Thresholds>({ green:0.8, yellow:0.5 });

  useEffect(() => {
    subscribeCompliance();
    complianceEmitter.on('state', setState);
    complianceEmitter.on('tasks', setTasks);
    return () => unsubscribeCompliance();
  }, []);

  return (
    <ComplianceContext.Provider value={{ state, tasks, thresholds, setThresholds }}>
      {children}
    </ComplianceContext.Provider>
  );
};
