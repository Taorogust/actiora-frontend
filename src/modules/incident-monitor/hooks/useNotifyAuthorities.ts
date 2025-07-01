import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notifyAuthority, retryNotification } from '../services/incidentService';
import type { Notification } from '../types';
import { toast } from 'react-toastify';

export function useNotifyAuthorities() {
  const qc = useQueryClient();
  const notify = useMutation<Notification,Error,Parameters<typeof notifyAuthority>[0]>(
    ({incidentId,authority,channel})=>notifyAuthority(incidentId,authority,channel),
    { onSuccess:(_, {incidentId})=>qc.invalidateQueries(['notifications',incidentId]) }
  );
  const retry = useMutation<Notification,Error,string>(nid=>retryNotification(nid),{
    onSuccess:n=>qc.invalidateQueries(['notifications',n.incidentId])
  });
  return { notify, retry };
}
