import type { Invoice } from './schema';
export const qualityChecks=[
  ['missingPayment','Missing payment method','warning','Payment split has an Unknown slice.'],
  ['duplicateInvoice','Duplicate Invoice No','error','Invoice counts and sales may be overstated.'],
  ['reconciliation','Total mismatch','error','Sales totals may be incorrect.'],
  ['timeAnomaly','Duration anomaly','warning','Excluded from occupancy statistics.'],
  ['testingCreator','Testing creator','warning','Review outlet attribution.'],
  ['mixedCreators','Mixed creators','info','Attributed to Cafe unless exactly Express.'],
  ['mixedType','Mixed service type','info','Reported as Mixed.'],
  ['largeItemLine','Large item quantity','warning','Review normal-sale best sellers.'],
  ['itemsParseWarning','Unparsed Items','warning','Item counts may be understated.'],
  ['unknownPayment','Unknown payment provider','warning','Reported as Other.'],
  ['unknownSegment','Unknown customer segment','warning','Excluded from student/guest comparison.'],
  ['outsideRange','Outside file date range','warning','Check export scope.']
] as const;
export function quality(rows:Invoice[],filename:string){const match=filename.match(/(\d{4}-\d{2}-\d{2})-to-(\d{4}-\d{2}-\d{2})/);return qualityChecks.map(([id,name,severity,affects])=>({id,name,severity,affects,rows:rows.filter(r=>id==='missingPayment'?r.paymentGroup==='Unknown':id==='outsideRange'?Boolean(match&&(r.dateKey<match[1]||r.dateKey>match[2])):r.flags.includes(id))}));}
