import React, { createContext, useState, useCallback, useEffect } from 'react';
import { subscribeIncidents, unsubscribeIncidents, IncidentSchema, incidentEmitter } from '../services/incidentService';
import type { Incident } from '../types';

export interface Filters {
  status?: string; severity?: string; q?: string;
  dateFrom?: string; dateTo?: string;
  page: number; pageSize: number;
}
interface Ctx { filters: Filters; setFilters(upd: Partial<Filters>): void; selected: Incident|null; setSelected(i: Incident|null): void; }
export const IncidentContext = createContext<Ctx>(null!);

export const IncidentProvider: React.FC = ({ children }) => {
  const [filters, _setFilters] = useState<Filters>({ page:1, pageSize:20 });
  const [selected, setSelected] = useState<Incident|null>(null);
  const setFilters = useCallback((upd: Partial<Filters>) => _setFilters(f => ({ ...f, ...upd, page: upd.page?upd.page:1 })), []);

  useEffect(() => { subscribeIncidents(); const h=i=>setSelected(i); incidentEmitter.on('incident',h); return ()=>{ incidentEmitter.off('incident',h); unsubscribeIncidents(); }; }, [setSelected]);

  return <IncidentContext.Provider value={{ filters, setFilters, selected, setSelected }}>{children}</IncidentContext.Provider>;
};
