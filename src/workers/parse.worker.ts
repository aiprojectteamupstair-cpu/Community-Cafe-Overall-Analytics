import { parseBuffer } from '../domain/parse';
import { normalizeRows } from '../domain/normalize';
import type { Rules } from '../domain/config';
self.onmessage=(e:MessageEvent<{buffer:ArrayBuffer;filename:string;rules:Rules}>)=>{try{self.postMessage({progress:30});const raw=parseBuffer(e.data.buffer,e.data.filename);self.postMessage({progress:60});const rows=normalizeRows(raw,e.data.rules);self.postMessage({progress:100,rows,raw});}catch(err){self.postMessage({error:err instanceof Error?err.message:String(err)});}};
