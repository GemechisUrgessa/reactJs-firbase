import './App.css';
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { Table, Button, Modal, } from 'react-bootstrap';
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, update, remove, push } from "firebase/database";
import { Formik, Form, Field, ErrorMessage } from 'formik';


const firebaseConfig = {
  apiKey: "AIzaSyBV72s5DdMJFqkGuTUdDMU78q1PUgt6zZk",
  authDomain: "fir-dc4ad.firebaseapp.com",
  projectId: "fir-dc4ad",
  storageBucket: "fir-dc4ad.appspot.com",
  messagingSenderId: "766735079461",
  appId: "1:766735079461:web:4c74595f40f26911ae47cc",
  measurementId: "G-CCH5Y7GVXC"
};


const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

class User extends React.Component {
  constructor(props) {
    super(props);
    this.state = { users: [], edit: false, selectedUser: {}, delete: false, add: false };
  }


  componentDidMount() {
    let temp = [];
    const db = getDatabase(app);
    const dbData = ref(db, '/users');
    onValue(dbData, (snapshot) => {
      snapshot.forEach(data => {
        let user = data.val();
        user["key"] = data.key;
        temp.push(user);
      });
      this.setState({ users: temp });
      temp = [];
    });

  }

  handleEdit(user) {
    this.setState({ edit: true, selectedUser: user });
  }
  handleDelete(user) {
    this.setState({ delete: true, selectedUser: user });
  }
  hideDelete = () => {
    this.setState({ delete: false });
  }
  hideEdit = () => {
    this.setState({ edit: false });
  }
  hideAdd = () => {
    this.setState({ add: false });
  }
  handleAdd = () => {
    this.setState({ add: true });
  }

  render() {
    let users = this.state.users;
    return (
      <div>
        <AddUserModal show={this.state.add} onHide={this.hideAdd} />
        <DeleteUserModal show={this.state.delete} onHide={this.hideDelete} user={this.state.selectedUser} />
        <EditUserModal show={this.state.edit} onHide={this.hideEdit} user={this.state.selectedUser} />
        <Table striped bordered hover >
          <thead>
            <tr>
              <th>NO:</th>
              <th>Name</th>
              <th>Email</th>
              <th>username</th>
              <th colSpan={2} className="col"><Button variant="primary" onClick={this.handleAdd}>Add new user</Button></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              return (
                <tr key={user.key}>
                  <td>{++index}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td><Button variant="primary" onClick={() => this.handleEdit(user)}>Edit</Button>
                  </td>
                  <td><Button variant="danger" onClick={() => this.handleDelete(user)}>Delete</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    );
  }
}


class AddUserModal extends React.Component {

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Add User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ username: '', email: '', name: '' }}
            validate={values => {
              let errors = {};
              if (!values.email) {
                errors.email = 'Required';
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
              ) {
                errors.email = 'Invalid email address';
              } else if (values.email.length < 10) {
                errors.email = 'Email address too short';
              } if (!values.username) {
                errors.username = 'Required';
              } else if (values.username.length < 3) {
                errors.username = 'username too short';
              } if (!values.name) {
                errors.name = 'Required';
              } else if (values.name.length < 3) {
                errors.name = 'name too short';
              } return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              const db = getDatabase();
              // let key = push(child(ref(db), 'posts')).key;
              push(ref(db, '/users'), {
                username: values.username,
                email: values.email,
                name: values.name,
              });
              setSubmitting(false);
              // console.log(key);
              this.props.onHide();
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3" controlId="formBasicEmail">
                  <label>Email Address</label>
                  <Field className="form-control" name="email" type="email" placeholder="Email Address" />

                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="email" component="div" />
                  </span>
                </div>
                <div className="mb-3" controlId="formBasicUserName">
                  <label>userName</label>
                  <Field className="form-control" type="text" name="username" placeholder="userName" />
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="username" component="div" />
                  </span>
                </div>
                <div className="mb-3" controlId="formBasicName">
                  <label>Name</label>
                  <Field className="form-control" type="text" name="name" placeholder="Name" />
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="name" component="div" />
                  </span>
                </div>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  Add User
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class DeleteUserModal extends React.Component {
  handleDelete = () => {
    let id = this.props.user.key;
    const db = getDatabase();
    remove(ref(db, '/users/' + id));
    this.props.onHide();
  }
  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Delete User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete user {this.props.user.name}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
          <Button variant="primary" onClick={this.handleDelete}>
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

class EditUserModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { edit: this.props.edit };
  }

  render() {
    return (

      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Edit User
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Formik
            initialValues={{ username: '', email: '', name: '' }}
            validate={values => {
              let errors = {};
              if (!values.email) {
                errors.email = 'Required';
              } else if (
                !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
              ) {
                errors.email = 'Invalid email address';
              } else if (values.email.length < 10) {
                errors.email = 'Email address too short';
              } if (!values.username) {
                errors.username = 'Required';
              } else if (values.username.length < 3) {
                errors.username = 'username too short';
              } if (!values.name) {
                errors.name = 'Required';
              } else if (values.name.length < 3) {
                errors.name = 'name too short';
              } return errors;
            }}
            onSubmit={(values, { setSubmitting }) => {
              const db = getDatabase();
              update(ref(db, '/users/' + this.props.user.key), {
                username: values.username,
                email: values.email,
                name: values.name
              });
              setSubmitting(false);
              this.props.onHide();
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="mb-3" controlId="formBasicEmail">
                  <label>Email Address</label>
                  <Field className="form-control" name="email" type="email" placeholder={this.props.user.email} />

                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="email" component="div" />
                  </span>
                </div>
                <div className="mb-3" controlId="formBasicUserName">
                  <label>userName</label>
                  <Field className="form-control" type="text" name="username" placeholder={this.props.user.username} />
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="username" component="div" />
                  </span>
                </div>
                <div className="mb-3" controlId="formBasicName">
                  <label>Name</label>
                  <Field className="form-control" type="text" name="name" placeholder={this.props.user.name} />
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    <ErrorMessage name="name" component="div" />
                  </span>
                </div>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  Edit User
                </Button>
              </Form>
            )}
          </Formik>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>

    );
  }
}

class FilterableProductTable extends React.Component {

  products;
  constructor(props) {
    super(props);
    this.state = { isStocked: false, searchedProduct: '', products: [] }
    // this.getProducts();
  }
  handleSearch = (value) => {
    this.setState({ searchedProduct: value });
  }
  handleCheckBox = (value) => {
    this.setState({ isStocked: value });
  }

  componentDidMount() {
    let temp = [];
    const db = getDatabase(app);
    const dbData = ref(db, '/products');
    onValue(dbData, (snapshot) => {
      snapshot.forEach(data => {
        let product = data.val();
        product["key"] = data.key;
        temp.push(product);
      });
      this.setState({ products: temp });
      temp = [];
    });

  }

  render() {
    return (
      <div className="container-in">
        <SearchBar handleCheckBox={this.handleCheckBox} handleSearch={this.handleSearch} />
        <ProductTable products={this.state.products} stocked={this.state.isStocked} value={this.state.searchedProduct} />
      </div>
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = { checked: false };
  }
  handleSearch = (event) => {
    this.props.handleSearch(event.target.value);
  }
  handleCheckBox = (event) => {
    this.setState(state => {
      state.checked = !state.checked;
      this.props.handleCheckBox(state.checked);
    })

  }
  render() {
    return (
      <div>
        <input style={{ maxWidth: '500px', display: 'block' }} className="form-control" onChange={this.handleSearch} type="search" placeholder="Search" />
        <label >

          <p><input onClick={this.handleCheckBox} type="checkbox" />Only search for products in stock</p>
        </label>
      </div>
    );
  }
}

class ProductTable extends React.Component {
  render() {
    const stocked = this.props.stocked;
    const entry = []
    let firstCategory = null;
    this.props.products.forEach(product => {
      if (product.category !== firstCategory) {
        entry.push(<ProductCategoryRow category={product.category} key={product.category} />);

      }
      firstCategory = product.category;
      if (product.category === firstCategory && this.props.value) {
        entry.push(stocked ? product.stocked ? product.name.includes(this.props.value) ?
          (<ProductRow product={product} key={product.key} />) :
          null
          : null
          : product.name.includes(this.props.value) ?
            (<ProductRow product={product} key={product.key} />) :
            null);
      }
      else if (product.category === firstCategory) {
        entry.push(stocked ? product.stocked ?
          (<ProductRow product={product} key={product.key} />)
          : null
          : (<ProductRow product={product} key={product.key} />));
      }

    });
    return (
      <table>
        <thead>
          <tr>
            <th>name</th>
            <th>price</th>
          </tr>
        </thead>
        <tbody>
          {entry}
        </tbody>
      </table>
    );
  }
}

class ProductCategoryRow extends React.Component {
  render() {
    return (
      <tr>
        <th colSpan={2}>{this.props.category}</th>
      </tr>
    );
  }
}

class ProductRow extends React.Component {
  render() {
    const product = this.props.product;
    const name = product.stocked ? product.name :
      <span style={{ color: 'red' }}>{product.name}</span>
    return (
      <tr>
        <td>{name}</td>
        <td>{product.price}</td>
      </tr>
    );
  }
}

class RepoNameLoader extends React.Component {
  constructor(props) {
    super(props);
    this.state = { searchTerm: "", results: [], isLoading: false };
  }

  handleSearch = (event) => {
    this.setState({ searchTerm: event.target.value, isLoading: true });
    this.getData(this.state.searchTerm);

  }
  getData = (_searchTerm) => {
    axios.get("https://api.github.com/search/users?q=" + _searchTerm)
      .then(res => {
        this.setState({
          isLoading: false,
          results: res.data.items,
        });
      }).catch(error => { console.error(error); });

  }

  render() {
    const data = this.state.results.map(item => ({ name: item.login, pic: item['avatar_url'], path: item['url'] }));

    return (
      <div>
        <input style={{ maxWidth: '500px' }} className="form-control" type="search" placeholder="search.." onChange={this.handleSearch} />
        {this.state.isLoading && <h2>Getting dates...</h2>}
        <ul>
          {data.map(item => <MediaList key={item.name} name={item.name} avatar_url={item.pic} path={item.path} />)}
        </ul>

      </div>
    );
  }
}
class MediaList extends React.Component {
  render() {
    console.log(this.props.avatar_url);
    return (
      <div className="card" style={{ color: "black" }}>
        <img style={{ width: '100%', height: '100px' }} src={this.props.avatar_url} alt={this.props.name} />
        <div className="card-content">
          <p>{this.props.name}</p>
          <a as='a' href={this.props.path} variant="primary">Go</a>
        </div>
      </div>
    );
  }
}

function App() {
  return (
    <div className="container">
      <h2>CRUD using firebase</h2>
      <User />
      <div style={{ height: '20px' }}></div>
      <h2>Query on product list</h2>
      <FilterableProductTable />
      <div style={{ height: '20px' }}></div>
      <h2>GitHub username finder</h2>
      <RepoNameLoader />
    </div>
  )
}


export default App;

