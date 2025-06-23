import queryDb from './postgres';
import { v4 as uuidv4 } from 'uuid';


export function getCustomer(customerId: string): Promise<string[]> {
  const queryString: string = `
  SELECT customer_id, first_name, last_name, mail
  FROM customers
  WHERE customer_id = $1
  `; // note: basic string formatting is NOT save against SQL-injections -> thats why use positional placeholder + sanitized to prevent xss attacks
  return queryDb(queryString, [customerId]);
}

export function getAllCustomers(): Promise<string[]> {
  const queryString: string = `SELECT customer_id, first_name, last_name, mail, tss_id
  FROM customers ORDER BY last_name`;
  return queryDb(queryString);
}

export function createCustomer(first_name: string, last_name: string, mail: string): Promise<string[]> {
  const newId = uuidv4();
  //note: either handle tss_id as primary key or generate tss_id here and insert it with new customers
  const queryString: string = `INSERT INTO customers (customer_id, first_name, last_name, mail) VALUES ($1, $2, $3, $4) RETURNING *`
  return queryDb(queryString, [newId, first_name, last_name, mail]);
}

export async function generateUniqueTssId(customerId: string, onlyId: boolean = false): Promise<string[]> {
  const tssId = uuidv4();
  const existingCustomer = await getCustomerByTssId(tssId);

  if(existingCustomer.length > 0)
  {
    return generateUniqueTssId(customerId);
  }

  const queryString: string = `
      UPDATE customers SET tss_id= $1 WHERE customer_id = (SELECT customer_id FROM customers WHERE customer_id = $2 ORDER BY last_name LIMIT 1) RETURNING *
    `
    return queryDb(queryString, [tssId, customerId])
}

export function getCustomerByTssId(tssId: string): Promise<string[]> {
  const queryString: string = `SELECT tss_id FROM customers WHERE tss_id = $1`;
  return queryDb(queryString, [tssId]);
}