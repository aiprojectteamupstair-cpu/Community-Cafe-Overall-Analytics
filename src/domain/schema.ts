import { z } from 'zod';
export const headers = ['Invoice No', 'Order #', 'Table', 'Customer', 'Student Code', 'Items', 'Subtotal (MMK)', 'Discount (MMK)', 'Service Charge (MMK)', 'Commercial Tax (MMK)', 'Takeaway Fee (MMK)', 'Total (MMK)', 'Payment Method', 'Type', 'Created By', 'Time', 'Date'] as const;
export const requiredHeaders = headers;
export const rawSchema = z.object(Object.fromEntries(headers.map(h => [h, z.union([z.string(), z.number(), z.null(), z.undefined()])])) as unknown as Record<(typeof headers)[number], z.ZodType>);
export type RawRow = Record<(typeof headers)[number], string | number | null | undefined>;
export type Segment = 'STUDENT_SERVICE_ACC' | 'GUEST' | 'SFU_STUDENT' | 'UNKNOWN';
export type Invoice = { invoiceNo: string; orderNo: string; table: string; customer: string; studentCode: string; itemsText: string; items: {name:string;qty:number}[]; subtotal:number; discount:number; serviceCharge:number; tax:number; takeawayFee:number; total:number; paymentMethod:string; paymentGroup:string; type:string; serviceType:string; createdBy:string; outlet:'CAFE'|'EXPRESS'; cafeBranch:string; time:string; dateKey:string; date:Date; startAt:Date|null; endAt:Date|null; durationMinutes:number|null; hour:number; weekday:number; segment:Segment; genericDiscount:boolean; orderCount:number; itemQty:number; flags:string[]; sourceRow:number };
