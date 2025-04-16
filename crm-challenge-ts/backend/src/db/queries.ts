import queryDb from './postgres';
import { v4 as uuidv4 } from 'uuid';


export function getCustomer(customer_id: string): Promise<string[]> {
  const queryString: string = `
  SELECT customer_id, first_name, last_name, mail
  FROM customers
  WHERE customer_id = $1
  `; // note: basic string formatting is NOT save against SQL-injections -> thats why use positional placeholder + sanitized to prevent xss attacks
  return queryDb(queryString, [customer_id]);
}

export function getAllCustomers(): Promise<string[]> {
  const queryString: string = `SELECT customer_id, first_name, last_name, mail, tss_id
  FROM customers`;
  return queryDb(queryString);
}

export function createCustomer(first_name: string, last_name: string, mail: string): Promise<string[]> {
  const newId = uuidv4();
  const queryString: string = `INSERT INTO customers (customer_id, first_name, last_name, mail) VALUES ($1, $2, $3, $4) RETURNING *`
  return queryDb(queryString, [newId, first_name, last_name, mail]);
}

export async function generateUniqueTssId(customer_id: string) {
  const tssId = uuidv4();
  const existingCustomer = await getCustomerByTssId(tssId);

  if(existingCustomer.length <= 0)
  {
    console.log("Function to be implemented.");
  } else {
    generateUniqueTssId(customer_id);
  }

  throw new Error("Function not implemented yet.");
}

export function getCustomerByTssId(tssId: string): Promise<string[]> {
  const queryString: string = `SELECT tss_id FROM customers WHERE tss_id = $1`;
  return queryDb(queryString, [tssId]);
}