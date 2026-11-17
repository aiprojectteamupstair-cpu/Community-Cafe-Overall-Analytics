import { addDays, differenceInCalendarDays, format } from 'date-fns';
import type { Invoice } from './schema';
export type Filters = { from:string; to:string; outlet:string; segment:string; payment:string; service:string };
export const emptyFilters: Filters = {from:'',to:'',outlet:'All',segment:'All',payment:'All',service:'All'};
export const sum = (rows:Invoice[], key:'total'|'subtotal'|'discount'|'itemQty')=>rows.reduce((n,r)=>n+r[key],0);
export const aov = (rows:Invoice[])=>rows.length?sum(rows,'total')/rows.length:0;
export function filterInvoices(rows:Invoice[], f:Filters) {return rows.filter(r=>(!f.from||r.dateKey>=f.from)&&(!f.to||r.dateKey<=f.to)&&(f.outlet==='All'||r.outlet===f.outlet)&&(f.segment==='All'||r.segment===f.segment)&&(f.payment==='All'||r.paymentGroup===f.payment)&&(f.service==='All'||r.serviceType===f.service));}
export function daily(rows:Invoice[], from?:string, to?:string) {
  const keys=rows.map(r=>r.dateKey).sort(); const start=from||keys[0], end=to||keys.at(-1);
  if(!start||!end)return [];
  const by=new Map<string,Invoice[]>(); for(const r of rows){if(!by.has(r.dateKey))by.set(r.dateKey,[]);by.get(r.dateKey)!.push(r)}
  const output:{date:string;invoices:number;sales:number;normal:number;service:number;students:number;guests:number;CAFE:number;EXPRESS:number;moving:number}[]=[];
  for(let d=new Date(`${start}T12:00:00`);format(d,'yyyy-MM-dd')<=end;d=addDays(d,1)){
    const date=format(d,'yyyy-MM-dd'), v=by.get(date)||[];
    output.push({date,invoices:v.length,sales:sum(v,'total'),normal:sum(v.filter(x=>x.segment!=='STUDENT_SERVICE_ACC'),'total'),service:sum(v.filter(x=>x.segment==='STUDENT_SERVICE_ACC'),'total'),students:v.filter(x=>x.segment==='SFU_STUDENT').length,guests:v.filter(x=>x.segment==='GUEST').length,CAFE:sum(v.filter(x=>x.outlet==='CAFE'),'total'),EXPRESS:sum(v.filter(x=>x.outlet==='EXPRESS'),'total'),moving:0});
  }
  output.forEach((x,i)=>x.moving=output.slice(Math.max(0,i-6),i+1).reduce((n,r)=>n+r.invoices,0)/Math.min(i+1,7));
  return output;
}
export function items(rows:Invoice[], merge=false){const m=new Map<string,{name:string;qty:number;invoices:number;category:string}>();let total=0;for(const r of rows.filter(x=>x.segment!=='STUDENT_SERVICE_ACC')){const seen=new Set<string>();for(const item of r.items){const name=merge?item.name.replace(/ \((Hot|Iced)\)$/,''):item.name;const v=m.get(name)||{name,qty:0,invoices:0,category:'Uncategorized'};v.qty+=item.qty;total+=item.qty;if(!seen.has(name)){v.invoices++;seen.add(name)}m.set(name,v)}}return [...m.values()].map(x=>({...x,share:total?x.qty/total:0})).sort((a,b)=>b.qty-a.qty);}
export function group(rows:Invoice[], selector:(r:Invoice)=>string){const m=new Map<string,Invoice[]>();for(const r of rows){const k=selector(r);if(!m.has(k))m.set(k,[]);m.get(k)!.push(r)}return [...m].map(([name,v])=>({name,invoices:v.length,sales:sum(v,'total'),gross:sum(v,'subtotal'),discount:sum(v,'discount'),items:sum(v,'itemQty'),aov:aov(v),max:v.reduce((n,r)=>Math.max(n,r.total),0)}));}
export const normal=(rows:Invoice[])=>rows.filter(r=>r.segment!=='STUDENT_SERVICE_ACC');
export function duration(rows:Invoice[]){const v=rows.filter(r=>r.durationMinutes!==null);const s=v.map(r=>r.durationMinutes!).sort((a,b)=>a-b);const percentile=(p:number)=>s.length?s[Math.min(s.length-1,Math.floor((s.length-1)*p))]:0;return{rows:v,mean:s.length?s.reduce((a,b)=>a+b,0)/s.length:0,median:percentile(.5),p90:percentile(.9),max:s.at(-1)||0,coverage:v.length,eligible:rows.filter(r=>r.table.startsWith('Table')&&/Dine In/i.test(r.type)).length};}
export function hourly(rows:Invoice[]){return Array.from({length:24},(_,h)=>({hour:h,invoices:rows.filter(r=>r.hour===h).length,sales:sum(rows.filter(r=>r.hour===h),'total')}));}
export function weekday(rows:Invoice[]){return ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((name,i)=>({name,day:(i+1)%7,invoices:rows.filter(r=>r.weekday===(i+1)%7).length,sales:sum(rows.filter(r=>r.weekday===(i+1)%7),'total')}));}
export function previousPeriod(rows:Invoice[], from:string,to:string){if(!from||!to)return [];const days=differenceInCalendarDays(new Date(`${to}T12:00:00`),new Date(`${from}T12:00:00`))+1;const start=format(addDays(new Date(`${from}T12:00:00`),-days),'yyyy-MM-dd');const end=format(addDays(new Date(`${from}T12:00:00`),-1),'yyyy-MM-dd');return rows.filter(r=>r.dateKey>=start&&r.dateKey<=end);}
