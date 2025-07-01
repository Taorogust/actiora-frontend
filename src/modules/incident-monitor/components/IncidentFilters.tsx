import React, { useContext } from 'react';
import { IncidentContext } from '../context/IncidentContext';
import { useTranslation } from 'react-i18next';
import { DateRangePicker } from '@/components/DateRangePicker';
import { Select } from '@/components/Select';
import { Input } from '@/components/Input';

export const IncidentFilters: React.FC = () => {
  const { t } = useTranslation();
  const { filters, setFilters } = useContext(IncidentContext);
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      <Input label={t('Buscar')} value={filters.q} onChange={val=>setFilters({q:val})} placeholder={t('Fuente o tipo')}/>
      <Select label={t('Severidad')} options={['','low','medium','high','critical']} value={filters.severity} onChange={v=>setFilters({severity:v})}/>
      <Select label={t('Estado')} options={['','new','processing','resolved','failed']} value={filters.status} onChange={v=>setFilters({status:v})}/>
      <DateRangePicker label={t('Rango Fecha')} onChange={({from,to})=>setFilters({dateFrom:from,dateTo:to})}/>
      <button onClick={()=>setFilters({page:1})} className="btn btn-outline-secondary">{t('Reset')}</button>
    </div>
  );
};
