import { parse as parseDate, format, isValid } from 'date-fns';
import { rawSchema, type RawRow, type Invoice } from './schema';
import type { Rules } from './config';
const str = (v: unknown) => String(v ?? '').trim();
const money = (v: unknown) => Number(str(v).replace(/,/g, '')) || 0;
export function parseItems(input: string, aliases: Record<string,string>) {
  const items: {name:string;qty:number}[] = [];
  const regex = /(.+?) x(\d+)(?:, |$)/g;
  let match: RegExpExecArray | null; let consumed = 0;
  while ((match = regex.exec(input))) {
    if (match.index !== consumed) break;
    const name = match[1].trim().replace(/\s+/g,' ');
    items.push({ name: aliases[name] ?? name, qty: Number(match[2]) });
    consumed = regex.lastIndex;
  }
  return { items, warning: consumed !== input.length };
}
function clock(input: string, day: Date) { const t = parseDate(input, 'hh:mm a', day); return isValid(t) ? t : null; }
export function normalizeRow(raw: RawRow, sourceRow: number, rules: Rules): Invoice {
  const r = rawSchema.parse(raw) as RawRow;
  const date = parseDate(str(r.Date), 'dd MMM yyyy', new Date(2000,0,1));
  if (!isValid(date)) throw new Error(`Invalid date in row ${sourceRow}: ${str(r.Date)}`);
  const dateKey = format(date,'yyyy-MM-dd');
  const time = str(r.Time); const parts = time.split(/\s+-\s+/);
  const startAt = clock(parts[0] || '', date); let endAt = parts.length > 1 ? clock(parts.at(-1) || '', date) : null;
  const flags: string[] = [];
  if (startAt && endAt && endAt < startAt) { endAt = new Date(endAt.getTime() + 86400000); flags.push('midnightCrossing'); }
  let durationMinutes = startAt && endAt ? (endAt.getTime()-startAt.getTime())/60000 : null;
  if (durationMinutes !== null && durationMinutes > 720) { flags.push('timeAnomaly'); durationMinutes = null; }
  const itemResult = parseItems(str(r.Items), rules.aliases);
  if (itemResult.warning) flags.push('itemsParseWarning');
  const subtotal=money(r['Subtotal (MMK)']), discount=money(r['Discount (MMK)']), serviceCharge=money(r['Service Charge (MMK)']), tax=money(r['Commercial Tax (MMK)']), takeawayFee=money(r['Takeaway Fee (MMK)']), total=money(r['Total (MMK)']);
  if (Math.abs(subtotal-discount+serviceCharge+tax+takeawayFee-total)>1) flags.push('reconciliation');
  const customer=str(r.Customer), studentCode=str(r['Student Code']), createdBy=str(r['Created By']), type=str(r.Type), paymentMethod=/^(n\/a|na|unknown)?$/i.test(str(r['Payment Method'])) ? 'Unknown' : str(r['Payment Method']);
  const segment = rules.servicePatterns.some(p=>{try{return new RegExp(p,'i').test(customer)}catch{return false}}) ? 'STUDENT_SERVICE_ACC' : customer.toLowerCase()===rules.guestName.toLowerCase() && !studentCode ? 'GUEST' : studentCode ? 'SFU_STUDENT' : 'UNKNOWN';
  if (segment==='UNKNOWN') flags.push('unknownSegment');
  if (/testing/i.test(createdBy)) flags.push('testingCreator');
  if (createdBy.includes(',')) flags.push('mixedCreators');
  if (type.includes('/')) flags.push('mixedType');
  if (itemResult.items.some(i=>i.qty>=30) && segment!=='STUDENT_SERVICE_ACC') flags.push('largeItemLine');
  const paymentGroup = paymentMethod==='Unknown' ? 'Unknown' : rules.payment[paymentMethod.toLowerCase()] ?? 'Other';
  if (paymentGroup==='Other') flags.push('unknownPayment');
  const outlet = createdBy === rules.expressCreator ? 'EXPRESS' : 'CAFE';
  const cafeBranch = /cafe 1/i.test(createdBy) && /cafe 2/i.test(createdBy) ? 'Mixed' : /cafe 1/i.test(createdBy) ? 'Cafe 1' : /cafe 2/i.test(createdBy) ? 'Cafe 2' : 'Other';
  const serviceType = type.includes('/') ? 'Mixed' : /takeaway/i.test(type) ? 'Takeaway' : 'Dine In';
  const table=str(r.Table);
  if (!table.startsWith('Table') || !/Dine In/i.test(type)) durationMinutes=null;
  return { invoiceNo:str(r['Invoice No']), orderNo:str(r['Order #']), table, customer, studentCode, itemsText:str(r.Items), items:itemResult.items, subtotal,discount,serviceCharge,tax,takeawayFee,total,paymentMethod,paymentGroup,type,serviceType,createdBy,outlet,cafeBranch,time,dateKey,date,startAt,endAt,durationMinutes,hour:startAt?.getHours() ?? -1,weekday:date.getDay(),segment,genericDiscount:/community cafe student discount/i.test(customer),orderCount:str(r['Order #']).split(',').filter(Boolean).length,itemQty:itemResult.items.reduce((s,i)=>s+i.qty,0),flags,sourceRow };
}
export function normalizeRows(rows: RawRow[], rules: Rules) {
  const seen=new Set<string>();
  return rows.map((r,i)=>{const v=normalizeRow(r,i+2,rules); if(seen.has(v.invoiceNo))v.flags.push('duplicateInvoice'); seen.add(v.invoiceNo); return v;});
}
