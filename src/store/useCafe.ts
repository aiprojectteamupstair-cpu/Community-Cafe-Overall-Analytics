import { create } from 'zustand';
import { defaultRules, type Rules } from '../domain/config';
import { emptyFilters, type Filters } from '../domain/aggregate';
import type { Invoice, RawRow } from '../domain/schema';

const readFilters = (): Filters => {
  const query = new URLSearchParams(location.search);
  return { ...emptyFilters, ...Object.fromEntries(Object.keys(emptyFilters).map(key => [key, query.get(key) || emptyFilters[key as keyof Filters]])) };
};
const syncFilters = (filters: Filters) => {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key,value]) => { if (value && value !== 'All') query.set(key,value); });
  history.replaceState(null,'',`${location.pathname}${query.size ? `?${query}` : ''}`);
};
type State = {
  rows: Invoice[]; raw: RawRow[]; filename: string; parsedAt: string;
  filters: Filters; rules: Rules; language: 'en'|'my'; mask: boolean; dark: boolean;
  loading: number; error: string;
  setData: (rows:Invoice[],raw:RawRow[],filename:string)=>void;
  setFilter: (key:keyof Filters,value:string)=>void;
  resetFilters: ()=>void; setRules:(rules:Rules)=>void;
  setLanguage:(value:'en'|'my')=>void; setMask:(value:boolean)=>void; setDark:(value:boolean)=>void;
  setLoading:(value:number)=>void; setError:(value:string)=>void;
};
export const useCafe = create<State>((set,get)=>({
  rows:[],raw:[],filename:'',parsedAt:'',filters:readFilters(),rules:defaultRules,
  language:localStorage.getItem('cafe-language')==='my'?'my':'en',
  mask:localStorage.getItem('cafe-mask')!=='false',dark:localStorage.getItem('cafe-dark')==='true',loading:0,error:'',
  setData:(rows,raw,filename)=>{
    const dates=rows.map(row=>row.dateKey).sort();
    const prior=get();
    const reupload=prior.raw.length>0 && raw!==prior.raw;
    const filters=reupload ? {...emptyFilters,from:dates[0]||'',to:dates.at(-1)||''} : {...prior.filters,from:prior.filters.from||dates[0]||'',to:prior.filters.to||dates.at(-1)||''};
    syncFilters(filters);
    set({rows,raw,filename,parsedAt:new Date().toLocaleTimeString(),filters,error:''});
  },
  setFilter:(key,value)=>{const filters={...get().filters,[key]:value};syncFilters(filters);set({filters});},
  resetFilters:()=>{const dates=get().rows.map(row=>row.dateKey).sort();const filters={...emptyFilters,from:dates[0]||'',to:dates.at(-1)||''};syncFilters(filters);set({filters});},
  setRules:rules=>set({rules}),
  setLanguage:language=>{localStorage.setItem('cafe-language',language);set({language});},
  setMask:mask=>{localStorage.setItem('cafe-mask',String(mask));set({mask});},
  setDark:dark=>{localStorage.setItem('cafe-dark',String(dark));set({dark});},
  setLoading:loading=>set({loading}),setError:error=>set({error})
}));
