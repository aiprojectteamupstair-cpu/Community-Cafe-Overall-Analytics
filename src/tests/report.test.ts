import { describe, expect, it } from 'vitest';
import fixtureText from '../../public/sample-anonymized.csv?raw';
import { parseBuffer } from '../domain/parse';
import { normalizeRows } from '../domain/normalize';
import { defaultRules } from '../domain/config';
import { emptyFilters } from '../domain/aggregate';
import { buildReport } from '../report/pptx';

describe('PowerPoint report',()=>{
 it('creates a valid deck from the filtered sample',async()=>{
   const buffer=new TextEncoder().encode(fixtureText).buffer;
   const rows=normalizeRows(parseBuffer(buffer,'sample.csv'),defaultRules);
   const pptx=buildReport({rows,filters:{...emptyFilters,from:'2026-09-01',to:'2026-09-30'},rules:defaultRules,mask:true,filename:'sample.csv'});
   const output=await pptx.write({outputType:'uint8array',compression:true});
   const bytes=output as Uint8Array;
   expect(bytes.byteLength).toBeGreaterThan(20_000);
   expect(Array.from(bytes.slice(0,4))).toEqual([80,75,3,4]);
 });
});
