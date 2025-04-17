import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, InputGroup, Modal, Spinner, Table } from 'react-bootstrap';
import config from './config';
import axios from 'axios';


// example customer id: 171c0f84-0b77-4cfc-96b1-368ddba2eb52
// function fetchCustomer(customer_id) {
//   const url = `${config.BACKEND_URL}:${config.BACKEND_PORT}/customer`;
//   axios.post(url, { customer_id: customer_id }).then((res) => {
//     console.log(res.data);
//   });
// }

export default function CustomerTable(props) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmiting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [alertData, setAlertData] = useState({type: 'error', message: ''});
  const [validated, setValidated] = useState(false);
  const [generating, setGenerating] = useState({state: false, key: ''});

  const API_BASE_URL = `${config.BACKEND_URL}:${config.BACKEND_PORT}`;
  const onlyLetterRegex = "^[a-zA-Z]+$";

  const triggerAlert = (type, message) => {
    if(type !== 'error' && type !== 'success')
    {
      throw new Error("Invalid argument. Type can only be 'error' or 'success'."); 
    }

    setAlertData({type: type, message: message});
    setShowAlert(true);

    setTimeout(() => setShowAlert(false), 3000);
  }

  const fetchAllCustomers = () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/customers`)
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => console.log("Failed to fetch customers", err))
      .finally(() => setLoading(false));
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;

    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true)
      return;
    }

    setSubmiting(true);

    const formData = new FormData(form);
    //note: should also add html sanatize to avoid xss-attacks but since it's already validating for letter only its fine
    const customer = {
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      mail: formData.get("email"),
    };

    axios.post(`${API_BASE_URL}/customer/new`, customer)
      .then((res) => {
        if(res.status === 201)
        {
          setCustomers((prev) => [...prev, res.data]);
          form.reset();
          triggerAlert("success", "Customer was successfuly created.");
        } else if(res.status === 400) {
          triggerAlert("error", "Invalid Inputs. Please only enter valid First Name and Last Name.");
        }
      })
      .catch((err) => {
        triggerAlert("error", "Failed to create customer.");
        console.log("Failed to add customer", err)
      })
      .finally(() => {
        setShowModal(false);
        setSubmiting(false);
        setValidated(false);
      });
  }

  const searchInputHandler = (e) => {
    const lowerCaseVal = e.target.value.toLowerCase();
    setSearchString(lowerCaseVal);
  }

  const generateTssId = (customerId) => {
    setGenerating({ state: true, key: customerId });
    axios
      .put(`${API_BASE_URL}/customer/generateTssId/${customerId}`)
      .then((res) => {
        if (res.status === 200) {
          setCustomers((prev) => {
            const index = prev.findIndex(cu => cu.customer_id === res.data.customer_id);
            if(index === -1) return prev;

            const customers = [...prev];
            customers[index] = res.data;
            return customers;
          })
          triggerAlert("success", "Customer tss_id was succesfully generated.");
        }
      })
      .catch((err) => {
        triggerAlert("error", "Failed to generate tss_id customer.");
        console.log("Failed to add customer", err);
      })
      .finally(() => {
        setGenerating({ state: false });
      });
  }

  const renderCustomerListHTML = (searchString, customers) => {
    const filteredCustomers = customers.filter((customer) => {
      return searchString === ""
        ? customer
        : customer.last_name.toLowerCase().includes(searchString);
    });

    if(filteredCustomers.length > 0)
    {
      return filteredCustomers.map((customer) => (
        <tr>
          <td>{customer.tss_id}</td>
          <td>{customer.first_name}</td>
          <td>{customer.last_name}</td>
          <td>{customer.mail}</td>
          <td>
            {customer.tss_id === "" ? (
              <Button
                variant="primary"
                onClick={() => generateTssId(customer.customer_id)}
                disabled={generating.state}
                key={customer.customer_id}
              >
                {generating.state && generating.key === customer.customer_id ? (
                  <Spinner animation="border" />
                ) : (
                  "Generate TSS ID"
                )}
              </Button>
            ) : (
              ""
            )}
          </td>
        </tr>
      ));
    } else {
      return (
        <tr>
          <td colSpan={5}>Keine Einträge gefunden</td>
        </tr>
      );
    }
  }

  useEffect(() => {
    fetchAllCustomers();
  }, []);
  
  return (
    <div className="container-fluid">
      <h2>Customer List</h2>

      {showAlert && (
        <Alert variant={alertData.type === "error" ? "danger" : "success"}>
          {alertData.message}
        </Alert>
      )}

      <Card className="rounded mx-4">
        <Card.Body>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "cemter",
              marginBottom: "30px",
            }}
          >
            <div>
              <InputGroup className="mb-3">
                <InputGroup.Text>Search</InputGroup.Text>
                <Form.Control
                  value={searchString}
                  onChange={searchInputHandler}
                  placeholder="Search for a last name"
                />
              </InputGroup>
            </div>
            <div>
              <Button variant="primary" onClick={() => setShowModal(true)}>
                Add New Customer
              </Button>
            </div>
          </div>

          <Table responsive striped bordered size='md'>
            <thead>
              <tr>
                <th>TSS_ID</th>
                <th>Firstname</th>
                <th>Lastname</th>
                <th>Mail</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4}>
                    <Spinner animation="border" />
                  </td>
                </tr>
              )}

              {!loading && renderCustomerListHTML(searchString, customers)}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>Create A New Customer</Modal.Header>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                required
                placeholder="First Name"
                pattern={onlyLetterRegex}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid first name (alphabetic characters only).
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                required
                placeholder="Last Name"
                pattern={onlyLetterRegex}
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid last name (alphabetic characters only).
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                required
                placeholder="Email"
              />
              <Form.Control.Feedback type="invalid">
                Please enter a valid email (e.g. maxmustermann@muster.com).
              </Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}