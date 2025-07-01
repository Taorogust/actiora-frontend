import React, { useContext } from 'react';
import { IncidentContext } from '../context/IncidentContext';
import { useTranslation } from 'react-i18next';

export const Pagination: React.FC<{
  total: number; page: number; pageSize: number; hasNext: boolean; fetchNext():void;
}> = ({ total, page, pageSize, hasNext, fetchNext }) => {
  const { t } = useTranslation();
  const { setFilters } = useContext(IncidentContext);
  const totalPages = Math.ceil(total/pageSize);
  return (
    <div className="flex justify-between items-center py-4">
      <span>{t('Página')} {page} / {totalPages}</span>
      <div className="space-x-2">
        <button disabled={page===1} onClick={()=>setFilters({page:page-1})} className="btn btn-sm">{t('Anterior')}</button>
        <button disabled={!hasNext} onClick={fetchNext} className="btn btn-sm">{hasNext ? t('Siguiente') : t('Fin')}</button>
      </div>
    </div>
  );
};
