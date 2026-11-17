import PptxGenJS from 'pptxgenjs';
import { aov, daily, duration, group, hourly, items, normal, sum, weekday, type Filters } from '../domain/aggregate';
import { quality } from '../domain/quality';
import type { Rules } from '../domain/config';
import type { Invoice } from '../domain/schema';

const RED='8E1616', INK='212121', MUTED='666666';
const palette=[RED,'D78A8A','424242','9E9E9E','FFB74D','4DB6AC'];
const fmt=(n:number)=>Math.round(n).toLocaleString('en-US');
const money=(n:number)=>`${fmt(n)} MMK`;
type ReportInput={rows:Invoice[];filters:Filters;rules:Rules;mask:boolean;filename:string;logoData?:string};

function text(slide:PptxGenJS.Slide,value:string,x:number,y:number,w:number,h:number,size=16,bold=false,color=INK){
  slide.addText(value,{x,y,w,h,fontFace:'Aptos',fontSize:size,bold,color,margin:0,breakLine:false,fit:'shrink'});
}
function header(pptx:PptxGenJS,title:string,subtitle:string,page:number){
  const slide=pptx.addSlide();slide.background={color:'FFFFFF'};
  text(slide,title,.6,.38,12,.48,25,true,RED);
  slide.addShape(pptx.ShapeType.line,{x:.6,y:1.03,w:12.1,h:0,line:{color:RED,width:1.5}});
  text(slide,subtitle,.62,1.14,12,.3,11,false,MUTED);
  text(slide,`The Community Cafe  ·  ${page}`,.62,7.12,12,.22,9,false,MUTED);
  return slide;
}
function addTable(slide:PptxGenJS.Slide,rows:(string|number)[][],x:number,y:number,w:number,options:{fontSize?:number;colW?:number[]}={}){
  slide.addTable(rows.map(row=>row.map(value=>({text:String(value)}))),{x,y,w,border:{type:'solid',pt:.5,color:'DADADA'},fontFace:'Aptos',fontSize:options.fontSize??12,color:INK,margin:.07,rowH:.36,colW:options.colW,bold:false,fill:{color:'FFFFFF'},breakLine:false});
}
function chart(slide:PptxGenJS.Slide,type:'bar'|'line'|'doughnut',series:{name:string;labels:string[];values:number[]}[],x:number,y:number,w:number,h:number,extra:Record<string,unknown>={}){
  slide.addChart(type,series,{x,y,w,h,chartColors:palette,showLegend:series.length>1||type==='doughnut',showTitle:false,showValue:type==='doughnut',showPercent:type==='doughnut',showMarker:type==='line',showBorder:false,showShadow:false,catAxisLabelFontSize:9,valAxisLabelFontSize:9,legendFontSize:10,legendPos:'b',valGridLine:{color:'E9E9E9'},...extra});
}
function maskName(name:string,mask:boolean){return mask?name.split(' ').map((part,index)=>index?`${part[0]}.`:part).join(' '):name}
function filterLabel(f:Filters){return `${f.from||'Start'} to ${f.to||'End'}  ·  Outlet: ${f.outlet}  ·  Segment: ${f.segment}  ·  Payment: ${f.payment}  ·  Service: ${f.service}`}

export function buildReport({rows,filters,rules,mask,filename,logoData}:ReportInput){
  const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='The Community Cafe';pptx.subject='Filtered POS analytics report';pptx.title='Community Cafe Analytics';pptx.company='The Community Cafe';pptx.theme={headFontFace:'Aptos Display',bodyFontFace:'Aptos'};
  const period=filterLabel(filters),days=daily(rows,filters.from,filters.to),normalRows=normal(rows),serviceRows=rows.filter(r=>r.segment==='STUDENT_SERVICE_ACC');

  let slide=pptx.addSlide();slide.background={color:'FFFFFF'};
  text(slide,'Community Cafe Analytics',.78,.63,11,.7,36,true,RED);
  text(slide,'Full POS report',.8,1.38,11,.42,22,false,INK);
  if(logoData)slide.addImage({data:logoData,x:4.2,y:1.75,w:4.9,h:4.9});
  text(slide,period,.8,6.4,11.7,.3,12,false,MUTED);
  text(slide,`${filename}  ·  ${fmt(rows.length)} invoices`,.8,6.82,11.7,.3,11,false,MUTED);

  slide=header(pptx,'Overview',period,2);
  const metrics:[string,string][]=[['Invoices',fmt(rows.length)],['Net sales',money(sum(rows,'total'))],['Average invoice',money(aov(rows))],['Items sold',fmt(sum(rows,'itemQty'))],['Active days',fmt(new Set(rows.map(r=>r.dateKey)).size)],['Unique SFU students',fmt(new Set(rows.filter(r=>r.segment==='SFU_STUDENT').map(r=>r.studentCode)).size)]];
  metrics.forEach(([label,value],i)=>{const col=i%3,row=Math.floor(i/3),x=.7+col*4.1,y=1.65+row*.95;text(slide,label,x,y,3.75,.24,12,false,MUTED);text(slide,value,x,y+.28,3.75,.43,21,true,INK)});
  chart(slide,'line',[{name:'Net sales',labels:days.map(d=>d.date.slice(5)),values:days.map(d=>d.sales)}],.7,3.8,11.8,2.85);
  text(slide,'Daily net sales (MMK)',.75,3.57,6,.25,13,true,INK);

  slide=header(pptx,'Normal and Student Service sales',period,3);
  const service=[{name:'Normal',v:normalRows},{name:'Student Service',v:serviceRows}];
  chart(slide,'doughnut',[{name:'Net sales',labels:service.map(x=>x.name),values:service.map(x=>sum(x.v,'total'))}],.7,1.75,5.3,4.6);
  addTable(slide,[['Population','Invoices','Net sales','AOV'],...service.map(x=>[x.name,fmt(x.v.length),money(sum(x.v,'total')),money(aov(x.v))])],6.25,2.25,6.35,{fontSize:12});
  text(slide,'Service accounts are bulk department purchases.',6.25,4.15,6,.65,13,false,MUTED);
  const serviceAccounts=group(serviceRows,r=>r.customer);
  if(serviceAccounts.length)addTable(slide,[['Service account','Invoices','Net sales'],...serviceAccounts.map(x=>[x.name,fmt(x.invoices),money(x.sales)])],6.25,5.05,6.35,{fontSize:10});

  slide=header(pptx,'Best-selling items',`${period}  ·  Normal sales only`,4);
  const topItems=items(rows).slice(0,10);
  chart(slide,'bar',[{name:'Quantity',labels:topItems.map(x=>x.name),values:topItems.map(x=>x.qty)}],.65,1.58,7.6,5.2,{barDir:'bar',catAxisLabelFontSize:10,showLegend:false});
  addTable(slide,[['Rank','Item','Qty','Invoices'],...topItems.slice(0,8).map((x,i)=>[i+1,x.name,x.qty,x.invoices])],8.35,1.7,4.3,{fontSize:10});
  text(slide,'Item revenue is unavailable in the source export.',8.35,6.02,4.3,.55,11,false,MUTED);

  slide=header(pptx,'Daily invoice rate',period,5);
  chart(slide,'bar',[{name:'Invoices',labels:days.map(d=>d.date.slice(5)),values:days.map(d=>d.invoices)}],.7,1.6,11.9,4.1,{barDir:'col',showLegend:false});
  const sorted=[...days].sort((a,b)=>b.invoices-a.invoices);
  addTable(slide,[['Average / day','Busiest day','Slowest day'],[days.length?(rows.length/days.length).toFixed(1):'0',sorted[0]?.date||'—',sorted.at(-1)?.date||'—']],1.3,6.0,10.8,{fontSize:13});

  slide=header(pptx,'Invoice time',period,6);
  const hours=hourly(rows),week=weekday(rows);
  chart(slide,'bar',[{name:'Invoices',labels:hours.map(x=>String(x.hour)),values:hours.map(x=>x.invoices)}],.65,1.65,8.1,4.6,{barDir:'col',showLegend:false});
  text(slide,'Start hour (24-hour clock)',.75,6.34,7.5,.3,11,false,MUTED);
  addTable(slide,[['Weekday','Invoices'],...week.map(x=>[x.name,x.invoices])],9.0,1.65,3.55,{fontSize:11});
  const parts=rules.dayParts.map(p=>({name:p.name,v:rows.filter(r=>r.hour>=p.start&&r.hour<p.end)}));
  text(slide,`Peak hour: ${[...hours].sort((a,b)=>b.invoices-a.invoices)[0]?.hour??0}:00`,9,5.75,3.5,.55,16,true,RED);
  text(slide,`Largest day part: ${[...parts].sort((a,b)=>b.v.length-a.v.length)[0]?.name||'—'}`,9,6.25,3.5,.35,11,false,MUTED);

  slide=header(pptx,'Estimated table occupancy',`${period}  ·  First to last order`,7);
  const dur=duration(rows),buckets=[['0–15',0,15],['15–30',15,30],['30–60',30,60],['60–90',60,90],['90–120',90,120],['120+',120,Infinity]] as const;
  chart(slide,'bar',[{name:'Sessions',labels:buckets.map(x=>x[0]),values:buckets.map(([,a,b])=>dur.rows.filter(r=>r.durationMinutes!==null&&r.durationMinutes>=a&&r.durationMinutes<b).length)}],.7,1.75,7.4,4.7,{barDir:'col',showLegend:false});
  addTable(slide,[['Metric','Minutes'],['Mean',Math.round(dur.mean)],['Median',Math.round(dur.median)],['P90',Math.round(dur.p90)],['Maximum',Math.round(dur.max)]],8.4,1.8,4.05,{fontSize:13});
  text(slide,`Based on ${dur.coverage} of ${dur.eligible} dine-in invoices. Single timestamps and anomalous ranges are excluded.`,8.4,4.65,4.05,1.25,12,false,MUTED);
  text(slide,'This is a proxy for seat time. It excludes time before the first order and after the last order.',.75,6.52,11.9,.32,11,false,MUTED);

  slide=header(pptx,'Payment methods in normal sales',period,8);
  const payments=group(normalRows,r=>r.paymentGroup);
  chart(slide,'doughnut',[{name:'Net sales',labels:payments.map(x=>x.name),values:payments.map(x=>x.sales)}],.7,1.55,5.5,4.8);
  addTable(slide,[['Method','Invoices','Net sales','AOV'],...payments.map(x=>[x.name,x.invoices,money(x.sales),money(x.aov)])],6.35,1.9,6.15,{fontSize:11});
  text(slide,'Blank payment methods remain Unknown.',6.35,5.25,6.0,.45,12,false,MUTED);

  slide=header(pptx,'SFU students and guests',`${period}  ·  Normal sales only`,9);
  const students=normalRows.filter(r=>r.segment==='SFU_STUDENT'),guests=normalRows.filter(r=>r.segment==='GUEST');
  chart(slide,'doughnut',[{name:'Invoices',labels:['SFU Student','Guest'],values:[students.length,guests.length]}],.7,1.55,5.35,4.85);
  addTable(slide,[['Segment','Invoices','Net sales'],['SFU Student',students.length,money(sum(students,'total'))],['Guest',guests.length,money(sum(guests,'total'))]],6.25,1.9,6.15,{fontSize:12});
  const visits=new Map<string,{name:string;count:number}>();
  students.forEach(r=>{if(r.studentCode){const v=visits.get(r.studentCode)||{name:r.customer,count:0};v.count++;visits.set(r.studentCode,v)}});
  const repeat=[...visits].sort((a,b)=>b[1].count-a[1].count).slice(0,5);
  text(slide,`${visits.size} distinct student codes`,6.25,3.65,6,.4,17,true,RED);
  addTable(slide,[['Repeat customer','Visits'],...repeat.map(([code,v])=>[`${maskName(v.name,mask)} (${mask?`${code.slice(0,5)}****`:code})`,v.count])],6.25,4.2,6.15,{fontSize:10});

  slide=header(pptx,'Cafe and Cafe Express',`${period}  ·  Normal sales only`,10);
  const outlets=[{name:'Cafe',v:normalRows.filter(r=>r.outlet==='CAFE')},{name:'Express',v:normalRows.filter(r=>r.outlet==='EXPRESS')}];
  chart(slide,'bar',[{name:'Net sales',labels:outlets.map(x=>x.name),values:outlets.map(x=>sum(x.v,'total'))}],.7,1.65,7.0,4.8,{barDir:'col',showLegend:false});
  addTable(slide,[['Outlet','Invoices','Net sales','AOV'],...outlets.map(x=>[x.name,x.v.length,money(sum(x.v,'total')),money(aov(x.v))])],7.9,2.2,4.6,{fontSize:10});
  text(slide,'Express is defined by an exact Created By match.',7.9,5.15,4.6,.65,11,false,MUTED);

  slide=header(pptx,'Data quality',period,11);
  const checks=quality(rows,filename);
  addTable(slide,[['Check','Severity','Rows affected'],...checks.map(x=>[x.name,x.severity,x.rows.length])],.78,1.48,11.8,{fontSize:10});
  text(slide,'Checks use the current filtered dataset. Review the dashboard for offending-row CSV exports.',.8,6.77,11.7,.27,10,false,MUTED);
  return pptx;
}

async function logoData(){const response=await fetch('/community-cafe-logo.png');if(!response.ok)return undefined;const blob=await response.blob();return new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result));reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});}
export async function downloadReport(input:Omit<ReportInput,'logoData'>){
  const pptx=buildReport({...input,logoData:await logoData()});
  const name=`community-cafe-report-${input.filters.from||'start'}-to-${input.filters.to||'end'}.pptx`;
  await pptx.writeFile({fileName:name,compression:true});
}
