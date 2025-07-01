// src/utils/export.ts
export function exportToCSV<T>(
  data: T[],
  fields: (keyof T)[],
  filename = `export-${Date.now()}.csv`
) {
  const headers = fields.map(f => String(f));
  const rows = data.map(item =>
    fields
      .map(f => {
        const cell = item[f];
        const str = cell == null ? '' : String(cell).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',')
  );

  const csv = [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToJSON<T>(
  data: T[],
  filename = `export-${Date.now()}.json`
) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
