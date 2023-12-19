export interface Customer {
  id: string;
  cpf: string;
  name: string;
  statement: Array<StatementOperation>;
}

export interface StatementOperation {
  description: string;
  amount: number;
  created_at: Date;
  type: "credit" | "debit";
}
