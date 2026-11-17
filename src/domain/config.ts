export type Rules = {
  servicePatterns: string[]; guestName: string; expressCreator: string;
  payment: Record<string, string>; aliases: Record<string, string>;
  categories: Record<string, string>; dayParts: { name: string; start: number; end: number }[];
};
export const defaultRules: Rules = {
  servicePatterns: ['student service$'], guestName: 'Guest', expressCreator: 'The Community Cafe Express',
  payment: { 'sfu wallet': 'Wallet', cash: 'Cash', 'kbz pay': 'Mobile Banking', 'wave pay': 'Mobile Banking', 'aya pay': 'Mobile Banking', 'cb pay': 'Mobile Banking', 'uab pay': 'Mobile Banking' },
  aliases: { 'Americano (Ice)': 'Americano (Iced)' }, categories: {},
  dayParts: [{ name: 'Morning', start: 0, end: 11 }, { name: 'Lunch', start: 11, end: 14 }, { name: 'Afternoon', start: 14, end: 17 }, { name: 'Evening', start: 17, end: 21 }, { name: 'Late', start: 21, end: 24 }]
};
