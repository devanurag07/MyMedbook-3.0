import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormFeedback,
} from "reactstrap";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { createQueue } from "../../redux/actions";
import { connect } from "react-redux";
import {
  postCall,
  putCall,
  deleteCall,
  getCall,
} from "../../helpers/axiosUtils";
import { BASE_URL } from "../../helpers/constants";
import { QUEUE_STATUS } from "../../helpers/appUtils";

import axios from "axios";
import { AutoComplete } from "primereact/autocomplete";
import { setBData } from "../../redux/actions";

import { toast } from "react-toastify";
import { Paper, Grid } from "@material-ui/core";

export class addQueue extends Component {
  constructor(props) {
    super(props);

    this.searchCustomer = this.searchCustomer.bind(this);
    this.state = {
      formValues: {
        customer: "",
        prescription: "",
        note: "",
        id: null,
        first_name: "",
        email: "",
        mobile: "",
        address_line1: "",
      },
      customer: "",
      customerLookup: [],
      filteredCustomers: [],
      emailExist: false,
    };
    this.props.setBData([
      {
        label: "App",
        link: "",
        active: false,
      },
      {
        label: "Dashboard",
        link: "",
        active: false,
      },
      {
        label: "AddQueue",
        link: "",
        active: true,
      },
    ]);
  }

  inputChangedHandler = (controlName, event) => {
    if (controlName === "mobile") {
      this.setState({ mobile: event.target.value });

      postCall(BASE_URL + `api/common/check-customer-mobile-exist/`, {
        email: event.target.value,
      })
        .then((r) => {
          if (r.data["exist"]) {
            this.setState({
              customerExist: true,
              mobileExist: false,
              invalidMobile: false,
            });
          } else {
            this.setState({
              mobileExist: false,
              customerExist: false,
              invalidMobile: false,
            });
          }
        })
        .catch((er) => {
          if (er.response.status == 500) {
            this.setState({
              mobileExist: false,
              customerExist: false,
              invalidMobile: true,
            });
          } else {
            {
              this.state.invalidMobile && (
                <p className="text-danger">Invalid Value for Mobile No.</p>
              );
            }
            this.setState({
              mobileExist: true,
              customerExist: false,
              invalidMobile: false,
            });
          }
        });
    } else {
      // if (this.source) {
      //   this.source.cancel("Operation canceled due to new request.");
      // }
      // this.source = axios.CancelToken.source();
      postCall(
        BASE_URL + `api/common/check-customer-email-exist/`,
        { email: event.target.value }
        // { cancelToken: this.source.token }
      )
        .then((r) => {
          if (r.data["exist"]) {
            this.setState({ customerExist: true, emailExist: false });
          } else {
            this.setState({ emailExist: false, customerExist: false });
          }
        })
        .catch((er) => {
          console.log(er);
          this.setState({ emailExist: true, customerExist: false });
        });
    }
  };

  submitHandler = (event, values) => {
    console.log(values);

    event.preventDefault();
    let selectedId = this.state.formValues.id;
    values["customer"] = this.state.customer ? this.state.customer.id : null;
    if (!values["customer"]) {
      if (!values["email"] && !values["mobile"]) {
        toast.error("Please add customer details");
        return;
      }
    }
    if (selectedId) {
      putCall(BASE_URL + `api/queue/${selectedId}/`, values)
        .then((r) => {
          this.setState((state) => ({
            isModalOpen: !state.isModalOpen,
          }));
          this.smartTable.fetchRecords(0, this.recordPerPage);
        })
        .catch((er) => {});
    } else {
      postCall(BASE_URL + "api/queue/", values)
        .then((r) => {
          console.log("Queue");
          console.log(r);

          if (r.status == 200) {
            console.log("I am here");
            this.props.history.push("/app/dashboard");
          }
        })
        .catch((er) => {});
    }
  };

  actionHandler = (param) => {
    if (param.label === "Edit") {
      this.setState((state) => ({
        isModalOpen: !state.isModalOpen,
        formValues: param.rowData,
        customer: param.rowData.customer,
        isEditAction: true,
      }));
    } else {
      this.setState((state) => ({
        isDeleteModalOpen: !state.isDeleteModalOpen,
        formValues: param.rowData,
      }));
    }
  };
  autoCompleteChange(e) {
    this.setState({
      customer: e.value,
    });
  }

  searchCustomer(event) {
    if (!event.query.trim().length) {
      this.setState((state) => ({
        filteredCustomers: [],
      }));
    } else {
      getCall(BASE_URL + `api/users/get-customers/?searchText=${event.query}`)
        .then((r) => {
          this.setState((state) => ({
            filteredCustomers: r.data,
          }));
        })
        .catch((er) => {
          this.setState((state) => ({
            filteredCustomers: [],
          }));
        });
    }
  }
  render() {
    return (
      <div>
        <div
          className="sub-heading primary-font-color"
          style={{ fontWeight: "505" }}
        >
          Add Patient To Queue
        </div>
        <Paper
          style={{}}
          style={{
            boxShadow:
              "0px 2px 16px -1px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%);",

            padding: "2em",
            marginTop: "1em",
          }}
        >
          <AvForm
            onValidSubmit={this.submitHandler}
            model={this.state.formValues}
          >
            <div className="addQueueBody">
              <div className="row" style={{ justifyContent: "center" }}>
                <div className="col-lg-6">
                  <h5
                    className="primary-font-color"
                    style={{ textAlign: "center", fontWeight: "506" }}
                  >
                    Search for Existing Customer
                  </h5>
                  <div className="form-group">
                    <AutoComplete
                      placeholder="Search By Phone Number / Name"
                      value={this.state.customer}
                      appendTo="self"
                      inputClassName="autocomplete"
                      suggestions={this.state.filteredCustomers}
                      completeMethod={this.searchCustomer}
                      field="first_name"
                      onSelect={this.autoCompleteChange.bind(this)}
                      onChange={(event) =>
                        this.setState({ customer: event.target.value })
                      }
                    />
                  </div>
                </div>{" "}
                {!this.state.isEditAction && (
                  <React.Fragment>
                    <h3 style={{ textAlign: "center", fontWeight: "606" }}>
                      {" "}
                      OR
                    </h3>
                    <h5
                      className="primary-font-color"
                      style={{ textAlign: "center", fontWeight: "506" }}
                    >
                      Add New Customer
                    </h5>

                    {this.state.customerExist && (
                      <div className="col-lg-12 mt-1">
                        <p>
                          Customer Already exist with below mobile/email, Please
                          use above search
                        </p>
                      </div>
                    )}
                    <div className="col-lg-6 mt-1">
                      <div className="form-group">
                        <label htmlFor="first_name">Patient Name</label>

                        <AvInput
                          id="first_name"
                          bsSize="sm"
                          type="text"
                          name="first_name"
                          className="form-control sm bs"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="mobile">MOBILE</label>

                        <AvInput
                          id="mobile"
                          bsSize="sm"
                          type="text"
                          name="mobile"
                          onChange={this.inputChangedHandler.bind(
                            this,
                            "mobile"
                          )}
                          validate={{ pattern: { value: /^\d{10}$/ } }}
                          className="form-control sm bs"
                        />
                        <FormFeedback>
                          {10 -
                            (this.state.mobile
                              ? this.state.mobile.length
                              : 0)}{" "}
                          chars left
                        </FormFeedback>
                        {this.state.mobileExist && (
                          <p className="text-danger">Mobile already exist</p>
                        )}

                        {this.state.invalidMobile && (
                          <p className="text-danger">
                            Invalid Value for Mobile No.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6 mt-1">
                      <div className="form-group">
                        <label htmlFor="email">EMAIL</label>

                        <AvInput
                          bsSize="sm"
                          type="email"
                          onChange={this.inputChangedHandler.bind(
                            this,
                            "email"
                          )}
                          name="email"
                          className="form-control sm bs"
                        />
                        {this.state.emailExist == true ? (
                          <p className="text-danger">
                            Email exists, Please search with email to find the
                            Customer
                          </p>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6 mt-1">
                      <div className="form-group">
                        <label htmlFor="dob">DOB</label>
                        <AvInput
                          id="dob"
                          bsSize="sm"
                          type="text"
                          onChange={this.inputChangedHandler.bind(this, "dob")}
                          name="dob"
                          className="form-control sm bs"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <label htmlFor="address">Address</label>

                      <div className="form-group">
                        <AvInput
                          id="address"
                          bsSize="sm"
                          type="textarea"
                          name="address_line1"
                          className="form-control"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label htmlFor="note">Note</label>
                        <AvInput
                          id="note"
                          bsSize="sm"
                          type="textarea"
                          name="note"
                          className="form-control"
                          placeholder="Please enter note"
                        />
                      </div>
                    </div>
                    <hr />
                  </React.Fragment>
                )}
              </div>
            </div>

            <Grid className="addQueueFooter" container>
              <Grid
                item
                sm={12}
                style={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  color="secondary"
                  onClick={this.toggle}
                  style={{ marginRight: "1em" }}
                  type="button"
                  onClick={(e) => {
                    this.props.history.push("/app/dashboard");
                  }}
                >
                  Close
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={this.state.mobileExist || this.state.emailExist}
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </AvForm>
        </Paper>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    category: state.Queue.queue,
  };
};
export default connect(mapStateToProps, { setBData, createQueue })(addQueue);
