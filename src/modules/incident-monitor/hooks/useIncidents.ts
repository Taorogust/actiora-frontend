import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { getIncidents, incidentEmitter, subscribeIncidents, unsubscribeIncidents } from '../services/incidentService';
import { useContext, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { toast } from 'react-toastify';
import { IncidentContext } from '../context/IncidentContext';
import type { Incident } from '../types';

export function useIncidents() {
  const qc = useQueryClient();
  const { filters, setSelected } = useContext(IncidentContext);

  const iq = useInfiniteQuery(
    ['incidents', filters],
    ({ pageParam = filters.page }) => getIncidents({ ...filters, page: pageParam }),
    {
      getNextPageParam: last => last.page < Math.ceil(last.total/last.pageSize) ? last.page+1 : undefined,
      staleTime:120000, retry:1, keepPreviousData:true,
      onError: e=>toast.error(`📡 ${e.message}`)
    }
  );

  // SSE real-time inject
  useEffect(() => {
    subscribeIncidents();
    const h=(inc: Incident)=>qc.setQueryData<any>(['incidents',filters],old=>{
      if(!old) return old;
      const first = old.pages[0];
      return { ...old, pages:[{...first, items:[inc,...first.items.filter((x:Incident)=>x.incidentId!==inc.incidentId)]},...old.pages.slice(1)]};
    });
    incidentEmitter.on('incident',h);
    return ()=>{ incidentEmitter.off('incident',h); unsubscribeIncidents(); };
  }, [qc,filters]);

  // debounce refetch on filters change
  useEffect(() => { const d=debounce(iq.refetch,300); d(); return ()=>d.cancel(); }, [filters]);

  const incidents: Incident[] = iq.data?.pages.flatMap(p=>p.items) ?? [];
  return { 
    incidents, total:iq.data?.pages[0]?.total||0, 
    page:iq.data?.pages[0]?.page||filters.page, pageSize:iq.data?.pages[0]?.pageSize||filters.pageSize, 
    hasNext:!!iq.hasNextPage, loadMore:iq.fetchNextPage, 
    isLoading:iq.isLoading, isError:iq.isError, select:setSelected 
  };
}
