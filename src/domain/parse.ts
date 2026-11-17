import * as XLSX from 'xlsx';
import { headers, requiredHeaders, type RawRow } from './schema';
export function parseBuffer(buffer: ArrayBuffer, filename: string): RawRow[] {
  const book = XLSX.read(buffer, { type: 'array', raw: true, cellDates: false });
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) throw new Error('The file has no worksheet.');
  const matrix = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1, defval: null, blankrows: false });
  const found = (matrix[0] || []).map(v => String(v ?? '').trim());
  const missing = requiredHeaders.filter(h => !found.some(f => f.toLowerCase() === h.toLowerCase()));
  if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}. Found: ${found.join(', ') || '(none)'}.`);
  if (!/\.(xlsx|csv)$/i.test(filename)) throw new Error('Choose an .xlsx or .csv file.');
  const indices = headers.map(h => found.findIndex(f => f.toLowerCase() === h.toLowerCase()));
  return matrix.slice(1).filter(row => row.some(v => v !== null && v !== '')).map(row => Object.fromEntries(headers.map((h,i) => [h, indices[i] < 0 ? null : row[indices[i]]])) as RawRow);
}
