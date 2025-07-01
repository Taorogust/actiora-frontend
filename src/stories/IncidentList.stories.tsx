import React from 'react';
import { IncidentList } from '../modules/incident-monitor/components/IncidentList';
import { IncidentContext } from '../modules/incident-monitor/context/IncidentContext';
import type { Incident } from '../modules/incident-monitor/types';

export default { title: 'IncidentMonitor/IncidentList', component: IncidentList };

const sample: Incident[] = Array.from({length:50},(_,i)=>({
  incidentId:`id-${i}`,source:'SYS',type:'TYPE',severity:'low',payload:{},timestamp:new Date(),status:'new'
}));

export const Default = () => (
  <IncidentContext.Provider value={{
    filters:{page:1,pageSize:20}, setFilters:()=>{}, selected:null, setSelected:()=>{}
  }}>
    <IncidentList incidents={sample} isLoading={false} hasNext={true} loadMore={()=>alert('loadMore')} />
  </IncidentContext.Provider>
);
