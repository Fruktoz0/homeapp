export interface ExpenseItem {
  id: number;
  date: string; // ISO date (2025-11-02)
  title: string;
  amount: number;
  currency: string;
  category?: string;
  type?: 'expense' | 'income';
  icon?: string; // opcionális ikon az apphoz
}
