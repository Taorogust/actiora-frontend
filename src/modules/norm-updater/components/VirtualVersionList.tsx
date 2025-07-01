// src/modules/norm-updater/components/VirtualVersionList.tsx
import React, { useContext } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { NormContext } from '../context/NormContext';
import { format } from 'date-fns';
import type { NormVersion } from '../types';

export const VirtualVersionList: React.FC<{ versions: NormVersion[]; loadMore():void; hasNext:boolean }> = ({ versions, loadMore, hasNext }) => {
  const { selected, setSelected } = useContext(NormContext);
  return (
    <Virtuoso
      style={{ height: '400px' }}
      totalCount={versions.length + (hasNext?1:0)}
      endReached={loadMore}
      itemContent={index => {
        if (index === versions.length) return <div>⏳ Loading more…</div>;
        const v = versions[index];
        const sel = selected.includes(v.version_id);
        return (
          <div
            onClick={()=>setSelected(prev=>{
              const next = sel? prev.filter(x=>x!==v.version_id):[...prev,v.version_id].slice(-2);
              return next;
            })}
            className={`p-2 flex justify-between cursor-pointer ${sel?'bg-primary/20':''}`}
          >
            <span>v{v.version_id}</span>
            <small>{format(v.fetched_at,'dd/MM/yyyy')}</small>
          </div>
        );
      }}
    />
  );
};
