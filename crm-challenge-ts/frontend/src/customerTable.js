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

  const API_BASE_URL = `${config.BACKEND_URL}:${config.BACKEND_PORT}`;

  const triggerAlert = (type, message) => {
    if(type !== 'error' && type !== 'success')
    {
      throw new Error("Invalid argument. Type can only be 'error' or 'success'."); 
    }

    setAlertData({type: type, message: message});
    setShowAlert(true);

    setTimeout(() => setShowAlert(false), 3000);
  }

  const fetchAllCustomers = async () => {
    setLoading(true);
    axios
      .get(`${API_BASE_URL}/customers`)
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => console.log("Failed to fetch customers", err))
      .finally(() => setLoading(false));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmiting(true);
    
    const form = e.target;
    const formData = new FormData(form);

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
          triggerAlert("error", "Invalid Inputs. Please only entere valid First Name and Last Name.");
        }
      })
      .catch((err) => {
        triggerAlert("error", "Failed to create customer.");
        console.log("Failed to add customer", err)
      })
      .finally(() => {
        setShowModal(false);
        setSubmiting(false);
      });
  }

  const searchInputHandler = (e) => {
    const lowerCaseVal = e.target.value.toLowerCase();
    setSearchString(lowerCaseVal);
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
        </tr>
      ));
    } else {
      return (
        <tr>
          <td colSpan={4}>Keine Einträge gefunden</td>
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
        <div
          style={{
            display: "flex",
            justifyContent: "between",
            marginBottom: "30px",
          }}
        >
          <InputGroup className="mb-3">
            <InputGroup.Text>Search</InputGroup.Text>
            <Form.Control
              value={searchString}
              onChange={searchInputHandler}
              placeholder="Search for a last name"
            />
          </InputGroup>
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Add New Customer
          </Button>
        </div>

        <Table striped bordered style={{ margin: "10px" }}>
          <thead>
            <tr>
              <th>TSS_ID</th>
              <th>Firstname</th>
              <th>Lastname</th>
              <th>Mail</th>
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
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>Create A New Customer</Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group>
              <Form.Label>First Name</Form.Label>
              <Form.Control
                type="text"
                name="first_name"
                required
                placeholder="First Name"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                type="text"
                name="last_name"
                required
                placeholder="Last Name"
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                required
                placeholder="Email"
              />
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