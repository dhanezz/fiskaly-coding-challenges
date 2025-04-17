import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { getCustomer, getAllCustomers, createCustomer, generateUniqueTssId } from '../../db/queries';
import { Any, Type } from '@sinclair/typebox';
import { onlyLetterRegex } from '../../utils/regexPattern';

// Notes: Helps validations + makes code cleaner
const Customer = Type.Object({
  customer_id: Type.Optional(Type.String({format: 'uuid'})),
  first_name: Type.String({minLength: 1, pattern: onlyLetterRegex }),
  last_name: Type.String({minLength: 1, pattern: onlyLetterRegex }),
  mail: Type.String({format: 'email'}),
  tss_id: Type.Optional(Type.String({format: 'uuid'})),
})

const CustomerArray = Type.Array(Customer);
const RequiredCustomerIdOnly = Type.Required(Type.Pick(Customer, ['customer_id']));

export default async function customer(fastify: FastifyInstance){
  //POST - Customer by customer_id
  fastify.route({
    method: 'POST',
    url: '/customer',
    schema: {
      response: {
        200: CustomerArray
      },
      body: RequiredCustomerIdOnly
    },
    handler: getCustomerByIdHandler
  });
  
  //GET - all customers
  fastify.route({
    method: 'GET',
    url: '/customers',
    schema: {
      response: {
        200: CustomerArray
      }
    },
    handler: getAllCustomerHandler
  });

  //POST - Create new customer
  fastify.route({
    method: 'POST',
    url: '/customer/new',
    schema: {
      body: Customer,
      response: {
        201: Customer
      }
    },
    handler:createCustomerHandler
  });

  //PUT - Generate new TSS ID
  fastify.route({
    method: 'PUT',
    url:'/customer/generateTssId/:customer_id',
    schema: {
      params: RequiredCustomerIdOnly,
      response: {
        200: Customer          
      }
    },
    handler: generateUniqueTssIdHandler
  })
}

// HANDLERS START //
const getCustomerByIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  // @ts-ignore
  const customerId: string = request.body['customer_id'];
  const customerResult: string[] = await getCustomer(customerId);

  reply.send(customerResult);
}

const getAllCustomerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  // @ts-ignore
  const customersResult: string[] = await getAllCustomers();
  reply.send(customersResult);
}

const createCustomerHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const customer:any = request.body;
  //note: should actually sanitize first before inserting, to prevent injections/xss-attacks
  const newCustomer = await createCustomer(customer["first_name"], customer["last_name"], customer["mail"]);
  reply.code(201).send(newCustomer[0]);
}

const generateUniqueTssIdHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const customer:any = request.params;
  const result = await generateUniqueTssId(customer.customer_id);
  reply.send(result[0]);
}