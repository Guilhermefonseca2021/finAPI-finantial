import express, { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { Customer, StatementOperation } from "./types/customer";

const app = express();
const port = 3333;

app.use(express.json());

const customers: Customer[] = [];

function verifyIfExistAccountCPF(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const { cpf } = request.headers;

  console.log(cpf);
  const customer = customers.find((customer) => customer.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: "Customer not found." });
  }

  (request as RequestWithCustomer).customer = customer;

  return next();
}

interface RequestWithCustomer extends Request {
  customer: Customer;
}

app.post("/account", (request: Request, response: Response) => {
  const { cpf, name } = request.body;

  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  );

  if (customerAlreadyExists) {
    return response.status(400).json({ error: "Customer already exists." });
  }

  customers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return response.status(201).json({ message: "created account", customers });
});

app.get("/statement", verifyIfExistAccountCPF, (request, response) => {
  const { customer } = request as RequestWithCustomer;
  return response.json(customer.statement);
});

app.post("/deposit", verifyIfExistAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request as RequestWithCustomer;

  const statementOperation: StatementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: "credit",
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.get(
  "/statement/date",
  verifyIfExistAccountCPF,
  (request: Request, response: Response) => {
    const { customer } = request as RequestWithCustomer;
    const { date } = request.query;

    const dateFormat = new Date(`${date} 00:00`);

    const statement = customer.statement.filter(
      (statement) =>
        statement.created_at.toDateString() === dateFormat.toDateString()
    );

    return response.json(customer.statement);
  }
);

app.put(
  "/account",
  verifyIfExistAccountCPF,
  (request: Request, response: Response) => {
    const { name } = request.body;
    const { customer } = request as RequestWithCustomer;

    customer.name = name;

    return response.status(201).send(customer);
  }
);

app.get(
  "/account",
  verifyIfExistAccountCPF,
  (request: Request, response: Response) => {
    const { customer } = request as RequestWithCustomer;

    return response.json(customer);
  }
);

app.delete(
  "/account",
  verifyIfExistAccountCPF,
  (request: Request, response: Response) => {
    const { customer } = request as RequestWithCustomer;

    const customerIndex = customers.indexOf(customer);

    if (customerIndex !== -1) {
      customers.splice(customerIndex, 1);
      
      response.send("Account deleted successfully");
    } else {
      response.status(404).send("Customer not found");
    }
  }
);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
