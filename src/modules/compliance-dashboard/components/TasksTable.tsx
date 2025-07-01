// src/modules/compliance-dashboard/components/TasksTable.tsx
import React, { useContext, useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { ComplianceContext } from '../context/ComplianceContext';
import type { Task } from '../types';
import { format } from 'date-fns';

interface Props {
  tasks: Task[];
  complete: (id:string)=>void;
  isCompleting: boolean;
}

export const TasksTable: React.FC<Props> = ({ tasks, complete, isCompleting }) => {
  const { thresholds } = useContext(ComplianceContext);
  const items = useMemo(() => tasks.sort((a,b)=>+a.due_date - +b.due_date), [tasks]);

  const Row = ({ index, style }:{index:number;style:any}) => {
    const t = items[index];
    const late = t.status==='pending' && t.due_date < new Date();
    return (
      <div style={style} className={`grid grid-cols-5 gap-4 p-2 items-center ${late?'bg-red-50':''}`}>
        <span>{t.module}</span>
        <span>{t.description}</span>
        <span>{format(t.due_date,'dd/MM/yyyy')}</span>
        <span className={`capitalize ${t.status==='completed'?'text-green-600':'text-yellow-600'}`}>
          {t.status}
        </span>
        <button
          disabled={isCompleting || t.status==='completed'}
          onClick={()=>complete(t.task_id)}
          className="btn btn-sm btn-primary"
        >
          {t.status==='completed'?'✔️':'Completar'}
        </button>
      </div>
    );
  };

  return (
    <List
      height={400} width="100%"
      itemCount={items.length}
      itemSize={50}
      className="border rounded"
    >
      {Row}
    </List>
  );
};
