import React, { memo, useContext } from 'react';
import { FixedSizeList as List } from 'react-window';
import { IncidentContext } from '../context/IncidentContext';
import type { Incident } from '../types';
import { Badge } from '@/components/Badge';
import { format } from 'date-fns';

interface Props { incidents: Incident[]; isLoading: boolean; hasNext: boolean; loadMore(): void; }
export const IncidentList: React.FC<Props> = memo(({ incidents, isLoading, hasNext, loadMore }) => {
  const { select, selected } = useContext(IncidentContext);
  if (isLoading && !incidents.length) return <div className="py-8 text-center">⏳ Cargando…</div>;
  if (!incidents.length) return <p className="italic text-gray-500">No hay incidencias.</p>;

  return (
    <List
      height={450}
      width="100%"
      itemCount={hasNext ? incidents.length+1 : incidents.length}
      itemSize={52}
      onItemsRendered={({ visibleStopIndex })=>{
        if (visibleStopIndex >= incidents.length-1 && hasNext) loadMore();
      }}
      itemData={incidents}
    >
      {({ index, style, data }) => {
        if (index === incidents.length) return <div style={style} className="text-center">⬇️ Cargando más…</div>;
        const inc = data[index] as Incident;
        const sel = selected?.incidentId===inc.incidentId;
        return (
          <div
            style={style}
            onClick={()=>select(inc)}
            className={`grid grid-cols-6 px-4 items-center h-full cursor-pointer ${sel?'bg-primary/10':'hover:bg-gray-50'}`}
          >
            <div className="truncate">{inc.incidentId}</div>
            <div>{inc.source}</div>
            <div>{inc.type}</div>
            <Badge variant={inc.severity}>{inc.severity}</Badge>
            <Badge variant={inc.status}>{inc.status}</Badge>
            <div>{format(inc.timestamp,'dd/MM/yyyy HH:mm')}</div>
          </div>
        );
      }}
    </List>
  );
});
