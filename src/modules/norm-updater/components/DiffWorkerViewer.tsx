// src/modules/norm-updater/components/DiffWorkerViewer.tsx
import React, { useState, useEffect } from 'react';
import { Spinner } from '@/components/Spinner';
import type { Change } from 'diff';

export const DiffWorkerViewer: React.FC<{ oldId:number; newId:number; loadContent:(id:number)=>Promise<string> }> = ({ oldId, newId, loadContent }) => {
  const [changes, setChanges] = useState<Change[]|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let worker = new Worker(new URL('../../workers/diff.worker.ts', import.meta.url));
    setLoading(true);
    Promise.all([loadContent(oldId), loadContent(newId)])
      .then(([oldText,newText]) => {
        worker.postMessage({ oldText, newText });
        worker.onmessage = ({ data }) => { setChanges(data); setLoading(false); worker.terminate(); };
      });
    return () => { worker.terminate(); };
  }, [oldId,newId,loadContent]);

  if (loading || !changes) return <Spinner />;
  return (
    <div className="overflow-auto border rounded p-2">
      {changes.map((c,i)=>(
        <div key={i} className={`whitespace-pre-wrap ${c.added?'bg-green-50':c.removed?'bg-red-50':''}`}>
          {c.value}
        </div>
      ))}
    </div>
  );
};
