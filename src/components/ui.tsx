import React, { useMemo, useRef, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useCafe } from '../store/useCafe';
import { labels } from '../i18n/labels';
export const money=(n:number)=>`${Math.round(n).toLocaleString()} MMK`;
export const compact=(n:number)=>n>=1e6?`${(n/1e6).toFixed(1)}M`:n>=1000?`${(n/1000).toFixed(1)}K`:Math.round(n).toString();
export function T({children}:{children:string}){const lang=useCafe(s=>s.language);return <>{lang==='my'?labels[children]||children:children}</>}
export function csvDownload(name:string,rows:Record<string,unknown>[]){if(!rows.length)return;const keys=Object.keys(rows[0]);const q=(v:unknown)=>`"${String(v??'').replace(/"/g,'""')}"`;const csv=[keys.map(q).join(','),...rows.map(r=>keys.map(k=>q(r[k])).join(','))].join('\r\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff',csv],{type:'text/csv'}));a.download=`${name}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
export function DataTable({rows,name,height=300}:{rows:Record<string,unknown>[];name:string;height?:number}){
 const parent=useRef<HTMLDivElement>(null);
 const keys=Object.keys(rows[0]||{});
 const columns=useMemo(()=>keys.map(k=>({accessorKey:k,header:k})),[keys.join('|')]);
 const table=useReactTable({data:rows,columns,getCoreRowModel:getCoreRowModel()});
 const model=table.getRowModel().rows;
 const virtual=useVirtualizer({count:model.length,getScrollElement:()=>parent.current,estimateSize:()=>38,overscan:8});
 const renderRow=(index:number)=><tr key={model[index].id}>{model[index].getVisibleCells().map(c=><td key={c.id}>{String(c.getValue()??'')}</td>)}</tr>;
 return <div><div className="table-tools"><span>{rows.length.toLocaleString()} rows</span><button onClick={()=>csvDownload(name,rows)}>↓ CSV</button></div><div ref={parent} className="table-scroll" style={{maxHeight:height}}><table><thead>{table.getHeaderGroups().map(h=><tr key={h.id}>{h.headers.map(c=><th key={c.id}>{flexRender(c.column.columnDef.header,c.getContext())}</th>)}</tr>)}</thead><tbody>{rows.length>200?<><tr style={{height:virtual.getVirtualItems()[0]?.start||0}}><td colSpan={keys.length}/></tr>{virtual.getVirtualItems().map(v=>renderRow(v.index))}<tr style={{height:virtual.getTotalSize()-(virtual.getVirtualItems().at(-1)?.end||0)}}><td colSpan={keys.length}/></tr></>:model.map((_,i)=>renderRow(i))}</tbody></table></div></div>
}
class CardBoundary extends React.Component<{children:React.ReactNode},{error:boolean}>{state={error:false};static getDerivedStateFromError(){return{error:true}}render(){return this.state.error?<div role="alert" className="error">This card could not be rendered. Check the source data or rules.</div>:this.props.children}}
export function Card({title,info,children,className=''}:{title:string;info:string;children:React.ReactNode;className?:string}){return <section className={`card ${className}`}><div className="card-head"><h2><T>{title}</T></h2><span className="info" tabIndex={0} aria-label={info} title={info}>ⓘ</span></div><CardBoundary>{children}</CardBoundary></section>}
export function ChartCard({title,info,option,rows,name,height=300,onClick}:{title:string;info:string;option:EChartsOption;rows:Record<string,unknown>[];name:string;height?:number;onClick?:(params:{name:string})=>void}){const [table,setTable]=useState(false);const chart=useRef<ReactECharts>(null);return <Card title={title} info={info}><div className="chart-actions"><button onClick={()=>setTable(!table)}><T>{table?'View chart':'View as table'}</T></button><button onClick={()=>csvDownload(name,rows)}>↓ CSV</button><button onClick={()=>{const url=chart.current?.getEchartsInstance().getDataURL({type:'png',pixelRatio:2,backgroundColor:'#fff'});if(url){const a=document.createElement('a');a.href=url;a.download=`${name}.png`;a.click()}}}>↓ PNG</button></div>{table?<DataTable rows={rows} name={name} height={height}/>:<div role="img" aria-label={`${title}. ${info}`}><ReactECharts ref={chart} option={{...option,backgroundColor:'transparent',textStyle:{fontFamily:'Inter, Noto Sans Myanmar, sans-serif'},color:['#8E1616','#D78A8A','#424242','#9E9E9E','#FFB74D','#4DB6AC']}} style={{height}} onEvents={onClick?{click:onClick}:undefined}/></div>}</Card>}
export function Kpi({label,value,info,delta}:{label:string;value:string;info:string;delta?:string}){return <div className="kpi"><span><T>{label}</T> <span title={info} aria-label={info} className="info">ⓘ</span></span><strong>{value}</strong>{delta&&<small>{delta} vs previous period</small>}</div>}
export function Donut({title,info,data,name}:{title:string;info:string;data:{name:string;value:number}[];name:string}){return <ChartCard title={title} info={info} name={name} rows={data} option={{tooltip:{trigger:'item',formatter:'{b}: {c} ({d}%)'},legend:{bottom:0},series:[{type:'pie',radius:['48%','70%'],label:{formatter:'{b}: {d}%'},data}]}}/>}
