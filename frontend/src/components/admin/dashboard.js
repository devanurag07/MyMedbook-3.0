import React, { Component } from "react";
import "../../assets/scss/dashboard.scss";
import { setBData } from "../../redux/actions";
import { connect } from "react-redux";
import SmartTable from "../../ui/smart-table";

import {
  getCall,
  postCall,
  deleteCall,
  putCall,
} from "../../helpers/axiosUtils";
import { BASE_URL } from "../../helpers/constants";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormFeedback,
} from "reactstrap";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { toast } from "react-toastify";
import { NavLink } from "react-router-dom";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { AutoComplete } from "primereact/autocomplete";
import axios from "axios";

import NewUserDashboard from "./UserPanel/NewUserDashboard";
import { Grid, Paper } from "@mui/material";

class Dashboard extends Component {
  recordPerPage = 15;
  defaultParam = {
    status: 0,
  };
  paymentParam = {
    status: 1,
  };
  constructor(props) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.queueModalToggle = this.queueModalToggle.bind(this);
    this.searchCustomer = this.searchCustomer.bind(this);
    this.deleteToggle = this.deleteToggle.bind(this);
    this.props.setBData([
      {
        label: "App",
        link: "",
        active: false,
      },
      {
        label: "Dashboard",
        link: "",
        active: true,
      },
    ]);
    this.state = {
      isQueueModalOpen: false,
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
      columns: [
        {
          dataField: "customer_name",
          label: "Cus. Name",
          type: "text",
          styles: {
            width: "20%",
          },
        },
        {
          dataField: "email",
          label: "Email",
          type: "text",
          styles: {
            width: "20%",
          },
        },
        {
          dataField: "mobile",
          label: "Mobile",
          type: "text",
          styles: {
            width: "10%",
          },
        },
        {
          dataField: "note",
          label: "Note",
          type: "text",
          styles: {
            width: "41%",
          },
        },
        {
          dataField: "subCategory",
          styles: {
            width: "9%",
          },
          label: "Actions",
          actions: [
            {
              label: "View",
              className: "btn btn-success btn-sm me-2",
              icon: true,
              iconClass: "fa fa-eye",
            },
            {
              label: "Send Message",
              className: "btn btn-success btn-sm me-2",
              icon: true,
              iconClass: "fa fa-paper-plane",
            },
            /* { label: 'Edit', className: "btn btn-primary btn-sm me-2", icon: true, iconClass: "fa fa-pencil-square-o" }, */
            {
              label: "Delete",
              className: "btn btn-danger btn-sm ",
              icon: true,
              iconClass: "fa fa-trash",
            },
          ],
          type: "action",
        },
      ],
      preColumns: [
        {
          dataField: "clinic_name",
          label: "Clinic name",
          type: "text",
          styles: {
            width: "20%",
          },
        },
        {
          dataField: "prescription_name",
          label: "Prescription",
          type: "text",
          styles: {
            width: "30%",
          },
        },
        {
          dataField: "prescription_drug_to_taken",
          label: "Amount of drug to be taken",
          type: "text",
          styles: {
            width: "30%",
          },
        },
        {
          dataField: "created_at",
          label: "Visited date",
          type: "date",
          styles: {
            width: "20%",
          },
        },
      ],
      chartOptions: {
        title: {
          text: "",
        },
        credits: {
          enabled: false,
        },
        chart: {
          type: "column",
        },
        xAxis: {
          categories: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"],
          crosshair: true,
        },
        yAxis: {
          min: 0,
          title: {
            text: "",
          },
        },
        tooltip: {
          headerFormat:
            '<span style="font-size:10px">{point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.1f} mm</b></td></tr>',
          footerFormat: "</table>",
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
          },
        },
        series: [
          {
            name: "",
            color: "#0A58CA",
            data: [49.9, 71.5, 106.4, 129.2, 144.0, 176.0, 135.6],
          },
        ],
      },
      hoverData: null,
      reportData: {
        total_payment: undefined,
      },
    };
  }
  deleteToggle(event) {
    event.preventDefault();
    this.setState((state) => ({
      isDeleteModalOpen: !state.isDeleteModalOpen,
    }));
  }
  deleteHandler = (event, values) => {
    event.preventDefault();
    let selectedId = this.state.formValues.id;
    if (selectedId) {
      deleteCall(BASE_URL + `api/queue/${selectedId}/`)
        .then((r) => {
          this.setState((state) => ({
            isDeleteModalOpen: !state.isDeleteModalOpen,
          }));
          this.smartTable.fetchRecords(0, this.recordPerPage);
        })
        .catch((er) => {});
    }
  };

  getReportDetails() {
    getCall(BASE_URL + "api/queue/reports/").then((r) => {
      console.log(r.data);
      this.setState({
        reportData: r.data,
      });
    });
  }

  getChartDetails() {
    getCall(BASE_URL + "api/queue/high-charts/").then((r) => {
      let responseData = r.data;
      this.setState({
        highcharts: responseData,
        chartOptions: {
          title: {},
          credits: {
            enabled: false,
          },
          chart: {
            type: "area",
            height: "180cd dpx",
          },
          xAxis: {
            categories: responseData.day_choices,
            crosshair: true,
          },
          yAxis: {
            min: 0,
            title: {
              text: "",
            },
          },
          tooltip: {
            headerFormat:
              '<span style="font-size:10px">{point.key}</span><table>',
            pointFormat:
              '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
              '<td style="padding:0"><b>{point.y}</b></td></tr>',
            footerFormat: "</table>",
            shared: true,
            useHTML: true,
          },
          plotOptions: {
            column: {
              pointPadding: 0.2,
              borderWidth: 0,
              borderRadius: 10,
            },
            series: {
              pointWidth: 15,
            },
          },
          series: [
            {
              color: "#0A58CA",
              data: responseData.days_data,
            },
          ],
        },
      });
    });
  }

  setHoverData = (e) => {
    // The chart is not updated because `chartOptions` has not changed.
    this.setState({ hoverData: e.target.category });
  };
  UNSAFE_componentWillMount() {
    this.getReportDetails();
    this.getChartDetails();
    //this.props.fetchCategoryData();
    //this.props.fetchParentCategoryData();
  }
  actionHandler = (param) => {
    if (param.label === "View") {
      this.props.history.push(
        `/app/send-prescription-updated/${param.rowData.id}`
      );
    } else if (param.label === "Delete") {
      this.setState((state) => ({
        isDeleteModalOpen: !state.isDeleteModalOpen,
        formValues: param.rowData,
      }));
    } else {
      this.setState((state) => ({
        isModalOpen: !state.isModalOpen,
        formValues: param.rowData,
      }));
    }
  };
  queueModalToggle(event) {
    this.setState((state) => ({
      isQueueModalOpen: !state.isQueueModalOpen,
      isEditAction: false,
      formValues: {
        customer: "",
        note: "",
        id: null,
      },
    }));
  }
  queueSubmitHandler = (event, values) => {
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
            isQueueModalOpen: !state.isQueueModalOpen,
          }));
          this.smartTable.fetchRecords(0, this.recordPerPage);
        })
        .catch((er) => {});
    } else {
      postCall(BASE_URL + "api/queue/", values)
        .then((r) => {
          this.setState((state) => ({
            isQueueModalOpen: !state.isQueueModalOpen,
          }));
          this.getChartDetails();
          this.smartTable.fetchRecords(0, this.recordPerPage);
        })
        .catch((err) => {
          if (err.response.status == 401) {
            if (err.response.data.mobileExists) {
              this.setState({ mobileExist: true });
            }
          }
        });
    }
  };
  autoCompleteChange(e) {
    this.setState({
      customer: e.value,
    });
  }
  // inputChangedHandler = (controlName, event) => {
  //   if (controlName === "mobile") {
  //     postCall(BASE_URL + `api/common/check-customer-mobile-exist/`, {
  //       email: event.target.value,
  //     })
  //       .then((r) => {
  //         if (r.data["exist"]) {
  //           this.setState({ customerExist: true, mobileExist: false });
  //         } else {
  //           this.setState({ mobileExist: false, customerExist: false });
  //         }
  //       })
  //       .catch((er) => {
  //         this.setState({ mobileExist: true, customerExist: false });
  //       });
  //   } else {
  //     if (this.source) {
  //       this.source.cancel("Operation canceled due to new request.");
  //     }
  //     this.source = axios.CancelToken.source();
  //     postCall(
  //       BASE_URL + `api/common/check-customer-email-exist/`,
  //       { email: event.target.value },
  //       { cancelToken: this.source.token }
  //     )
  //       .then((r) => {
  //         if (r.data["exist"]) {
  //           this.setState({ customerExist: true, emailExist: false });
  //         } else {
  //           this.setState({ emailExist: false, customerExist: false });
  //         }
  //       })
  //       .catch((er) => {
  //         this.setState({ emailExist: true, customerExist: false });
  //       });
  //   }
  // };
  inputChangedHandler = (controlName, event) => {
    const userEmail = this.props.user ? this.props.user.email : "";
    const userMobile = this.props.user ? this.props.user.mobile : "";

    if (controlName === "mobile") {
      this.setState({ mobile: event.target.value });
      if (userMobile == event.target.value) {
        this.setState({ mobileExist: false });
        return;
      }

      postCall(BASE_URL + `api/common/check-mobile-exist/`, {
        email: event.target.value,
      })
        .then((r) => {
          this.setState({ mobileExist: false });
          this.setState({ invalidMobile: false });
        })
        .catch((err) => {
          if (err.response.status == 400) {
            this.setState({ mobileExist: true });
            this.setState({ invalidMobile: false });
          }
          if (err.response.status == 500) {
            this.setState({ invalidMobile: true });
          }
        });
    } else {
      // if (userEmail == event.target.value) {
      //   this.setState({ emailExist: false });
      //   return;
      // }

      postCall(BASE_URL + `api/common/check-email-exist/`, {
        email: event.target.value,
      })
        .then((r) => {
          this.setState({ emailExist: false });
        })
        .catch((er) => {
          this.setState({ emailExist: true });
        });
    }
  };
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
  toggle(event) {
    event.preventDefault();
    this.setState((state) => ({
      isModalOpen: !state.isModalOpen,
      formValues: null,
    }));
  }

  submitHandler = (event, values) => {
    event.preventDefault();
    values["id"] = this.state.formValues.id;
    postCall(BASE_URL + "api/queue/send-message/", values)
      .then((r) => {
        this.setState((state) => ({
          isModalOpen: !state.isModalOpen,
        }));
        this.notify();
      })
      .catch((er) => {});
  };

  notify = () => toast("Message sent to customer!");
  render() {
    return (
      <React.Fragment>
        {this.props.user && this.props.user.is_superuser && (
          <div className="row d-card">
            {this.props.user && this.props.user.is_superuser && (
              <div className="col-md-3 col-xl-3 mb-2">
                <div className="widget-rounded-circle card">
                  <div className="card-body">
                    <div className="row">
                      <div className="col-4">
                        <div className="avatar-lg rounded-circle bg-primary">
                          <i className="fa fa-inr font-22 avatar-title text-white"></i>
                        </div>
                      </div>
                      <div className="col-8">
                        <div className="text-center">
                          <h6 className="text-muted mb-1 text-truncate">
                            Total Payment
                          </h6>
                          <h3
                            className="text-dark mt-1"
                            data-plugin="counterup"
                            style={{ fontWeight: "505" }}
                          >
                            {this.state.reportData.total_payment
                              ? this.state.reportData.total_payment
                              : 0}
                          </h3>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="col-md-6 col-xl-3 mb-2">
              <div className="widget-rounded-circle card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-4">
                      <div className="avatar-lg rounded-circle cbg-light">
                        <img
                          className="icon-circle avatar-title"
                          src="/img/total.svg"
                          height="52"
                          width="52"
                        ></img>
                      </div>
                    </div>
                    <div className="col-8">
                      <div className="text-center">
                        <h6 className="text-muted mb-1 text-truncate">
                          Total Doctors
                        </h6>
                        <h3
                          className="text-dark mt-1"
                          data-plugin="counterup"
                          style={{ fontWeight: "505" }}
                        >
                          {this.state.reportData
                            ? this.state.reportData.total_doctors
                            : 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-xl-3 mb-2">
              <div className="widget-rounded-circle card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-4">
                      <div className="avatar-lg rounded-circle cbg-warning">
                        <img
                          className="icon-circle avatar-title"
                          src="/img/schedule.svg"
                          height="52"
                          width="52"
                        ></img>
                      </div>
                    </div>
                    <div className="col-8">
                      <div className="text-center">
                        <h6 className="text-muted mb-1 text-truncate">
                          Total Customers
                        </h6>
                        <h3
                          className="text-dark mt-1"
                          data-plugin="counterup"
                          style={{ fontWeight: "505" }}
                        >
                          {this.state.reportData
                            ? this.state.reportData.total_customers
                            : 0}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row">
              <h5
                className="primary-font-color"
                style={{ fontWeight: "606", marginTop: "2em" }}
              >
                This Week Customer Visit
              </h5>
              <div className="col-6">
                <HighchartsReact
                  highcharts={Highcharts}
                  options={this.state.chartOptions}
                />
              </div>
            </div>
          </div>
        )}

        {this.props.user && this.props.user.role_name == "Doctors" && (
          <React.Fragment>
            {this.props.user.document_verified && (
              <React.Fragment>
                <Paper elevation={1} className="header-paper">
                  <div className="row header-card-row">
                    <div className="card card-new">
                      <Grid container>
                        <Grid item xs={4}>
                          <div className="avatar-lg rounded-circle cbg-dark">
                            <img
                              className="icon-circle avatar-title"
                              src="/img/total.svg"
                              height="52"
                              width="52"
                            ></img>
                          </div>
                        </Grid>
                        <Grid item xs={8}>
                          <div className="card-body">
                            <div className="card-text-normal">
                              Total Patients
                            </div>
                            <div className="card-text-bold">80</div>
                            <div className="card-text-date">9 jan 2022</div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                    <div className="card card-new">
                      <Grid container>
                        <Grid item xs={4}>
                          <div className="avatar-lg rounded-circle cbg-warning">
                            <img
                              className="icon-circle avatar-title"
                              src="/img/schedule.svg"
                              height="52"
                              width="52"
                            ></img>
                          </div>
                        </Grid>
                        <Grid item xs={8}>
                          <div className="card-body">
                            <div className="card-text-normal">
                              Today Patients
                            </div>
                            <div className="card-text-bold">20</div>
                            <div className="card-text-date">9 jan 2022</div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                    <div className="card card-new" style={{ border: "none" }}>
                      <Grid container>
                        <Grid item xs={4}>
                          <div className="avatar-lg rounded-circle cbg-success">
                            <img
                              className="icon-circle avatar-title"
                              src="/img/checked-dash.svg"
                              height="52"
                              width="52"
                            ></img>
                          </div>
                        </Grid>
                        <Grid item xs={8}>
                          <div className="card-body">
                            <div className="card-text-normal">Appoiments</div>
                            <div className="card-text-bold">80</div>
                            <div className="card-text-date">9 jan 2022</div>
                          </div>
                        </Grid>
                      </Grid>
                    </div>
                  </div>
                </Paper>
                {/* <div className="row d-card">

                  <div className="col ms-2 me-2 mb-2">
                    <div className="widget-rounded-circle card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-4">
                            <div className="avatar-lg rounded-circle cbg-dark">
                              <img
                                className="icon-circle avatar-title"
                                src="/img/total.svg"
                                height="52"
                                width="52"
                              ></img>
                            </div>
                          </div>
                          <div className="col-8">
                            <div className="text-center">
                              <p className="fw-500 mt-1 text-truncate d-blue">
                                Total
                              </p>
                              <h3 className="text-dark mb-1 d-blue fw-500">
                                <span data-plugin="counterup">
                                  {this.state.reportData
                                    ? this.state.reportData.total
                                    : 0}
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col me-2 mb-2">
                    <div className="widget-rounded-circle card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-4">
                            <div className="avatar-lg rounded-circle cbg-warning">
                              <img
                                className="icon-circle avatar-title"
                                src="/img/schedule.svg"
                                height="52"
                                width="52"
                              ></img>
                            </div>
                          </div>
                          <div className="col-8">
                            <div className="text-center">
                              <p className="fw-500 mt-1 text-truncate d-pending text-uppercase">
                                Pending
                              </p>
                              <h3 className="text-dark mb-1 d-pending fw-500">
                                <span data-plugin="counterup">
                                  {this.state.reportData
                                    ? this.state.reportData.pending
                                    : 0}
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col me-2 mb-2">
                    <div className="widget-rounded-circle card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-4">
                            <div className="avatar-lg rounded-circle cbg-success">
                              <img
                                className="icon-circle avatar-title"
                                src="/img/checked-dash.svg"
                                height="52"
                                width="52"
                              ></img>
                            </div>
                          </div>
                          <div className="col-8">
                            <div className="text-center">
                              <p className="fw-500 mt-1 text-truncate d-green text-uppercase">
                                Closed
                              </p>
                              <h3 className="text-dark mb-1 d-green fw-500">
                                <span data-plugin="counterup">
                                  {this.state.reportData
                                    ? this.state.reportData.closed
                                    : 0}
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col me-4 mb-2">
                    <div className="widget-rounded-circle card">
                      <div className="card-body">
                        <div className="row">
                          <div className="col-4">
                            <div className="avatar-lg rounded-circle cbg-danger">
                              <img
                                className="icon-circle avatar-title"
                                src="/img/bin.svg"
                              ></img>
                            </div>
                          </div>
                          <div className="col-8">
                            <div className="text-center">
                              <p className="fw-500 mt-1 text-truncate d-delete text-uppercase">
                                Deleted
                              </p>
                              <h3 className="text-dark mb-1 d-delete fw-500">
                                <span data-plugin="counterup">
                                  {this.state.reportData
                                    ? this.state.reportData.deleted
                                    : 0}
                                </span>
                              </h3>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div> */}
              </React.Fragment>
            )}

            <div className="row mt-3 d-card" style={{ margin: "1em" }}>
              <div className="col-12" style={{ padding: 0 }}>
                {!this.props.user.document_verified && (
                  <React.Fragment>
                    {!this.props.user.agreement_file && (
                      <React.Fragment>
                        <p>
                          Please complete your document verification to see your
                          prescriptions
                        </p>
                        <NavLink
                          to="/app/profile"
                          className="btn btn-primary ms-8 "
                        >
                          Verify
                        </NavLink>
                      </React.Fragment>
                    )}
                    {this.props.user.agreement_file &&
                      !this.props.user.document_rejected && (
                        <React.Fragment>
                          <div className="verification-pending">
                            <h2 className="primary-font-color heading-2">
                              SUBMITED FOR VERIFICATION
                            </h2>
                            <div className="status">
                              <span>STATUS : PENDING</span>
                            </div>
                            <h4 className="primary-font-color para-info">
                              Your application is <b>pending</b> with us We will
                              let you know if <br />
                              <div style={{ marginTop: "1em" }}></div>
                              we need any documents We are commited to <br />
                              processing your application as soon as possible
                            </h4>
                          </div>
                        </React.Fragment>
                      )}
                    {this.props.user.agreement_file &&
                      this.props.user.document_rejected && (
                        <React.Fragment>
                          <div className="document-rejected">
                            <div className="status">
                              <h5>Status : REJECTED</h5>
                            </div>
                            <h4
                              className="primary-font-color"
                              style={{ marginTop: "2em" }}
                            >
                              Comment added in the admin panel by <br />
                              the verifier should appear here
                            </h4>
                          </div>
                        </React.Fragment>
                      )}
                  </React.Fragment>
                )}
                {this.props.user.document_verified && (
                  <React.Fragment>
                    <div
                      className="row"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="col-8">
                        <Paper elevation={2} style={{ padding: "1em" }}>
                          <h5>Statistics</h5>

                          <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.chartOptions}
                          />
                        </Paper>
                      </div>

                      <div className="col-4">
                        <div className="row">
                          <div className="col-12 ">
                            <h5 className="previous">Previous Months</h5>
                            <div className="card previous-month-card">
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-6">
                                    <div className="text-start">
                                      <p
                                        className="text-muted mb-1 text-truncate previous text-gray"
                                        style={{ color: "grey !important" }}
                                      >
                                        {this.state.highcharts
                                          ? this.state.highcharts
                                              .month_choices[0]
                                          : ""}
                                      </p>
                                      <div className="col-12 text-start">
                                        <p className="text-muted fs-07 mb-0 text-truncate">
                                          Total Patients
                                        </p>
                                      </div>
                                      <h3 className="text-dark previous fw-500 text-black">
                                        <span data-plugin="counterup">
                                          {this.state.highcharts
                                            ? this.state.highcharts
                                                .previous_month_data[0]
                                            : ""}
                                        </span>
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="col-6 avatar-container">
                                    <div className="avatar-lg rounded-circle cbg-light">
                                      <img
                                        className="icon-circle avatar-title"
                                        src="/img/patient-_1_.svg"
                                        height="52"
                                        width="52"
                                      ></img>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="col-12  mt-2">
                            <div className="card previous-month-card">
                              <div className="card-body">
                                <div className="row">
                                  <div className="col-6">
                                    <div className="text-start">
                                      <p
                                        className="text-muted mb-1 text-truncate previous text-gray"
                                        style={{ color: "grey !important" }}
                                      >
                                        {this.state.highcharts
                                          ? this.state.highcharts
                                              .month_choices[1]
                                          : ""}
                                      </p>
                                      <div className="col-12 text-start">
                                        <p className="text-muted fs-07 mb-0 text-truncate">
                                          Total Patients
                                        </p>
                                      </div>
                                      <h3 className="text-dark previous fw-500 text-black">
                                        <span data-plugin="counterup">
                                          {this.state.highcharts
                                            ? this.state.highcharts
                                                .previous_month_data[1]
                                            : ""}
                                        </span>
                                      </h3>
                                    </div>
                                  </div>
                                  <div className="col-6 avatar-container">
                                    <div className="avatar-lg rounded-circle cbg-light">
                                      <img
                                        className="icon-circle avatar-title"
                                        src="/img/patient-_1_.svg"
                                        height="52"
                                        width="52"
                                      ></img>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <h4 className="header-title mb-2 mt-2 dark-title">
                      Open Queue
                      <button
                        onClick={this.queueModalToggle}
                        className="btn btn-primary btn-sm float-end me-4"
                        type="button"
                      >
                        Add
                      </button>
                    </h4>
                    <SmartTable
                      ref={(instance) => {
                        this.smartTable = instance;
                      }}
                      fetchUrl="api/queue/"
                      defaultParam={this.defaultParam}
                      actionHandler={this.actionHandler}
                      recordPerPage={this.recordPerPage}
                      cols={this.state.columns}
                      // By -ANurag
                      rowPreCls="queue"
                    />
                  </React.Fragment>
                )}
              </div>
            </div>
          </React.Fragment>
        )}
        {this.props.user && this.props.user.role_name == "Customers" && (
          // <div className="row mt-3">
          //   <div className="col-12">
          //     <h4 className="header-title mb-4 primary-font-color">
          //       Prescription{" "}
          //     </h4>
          //     <SmartTable
          //       ref={(instance) => {
          //         this.prescriptionSmartTable = instance;
          //       }}
          //       fetchUrl="api/prescription/"
          //       defaultParam={this.paymentParam}
          //       actionHandler={this.actionHandler}
          //       recordPerPage={this.recordPerPage}
          //       cols={this.state.preColumns}
          //       rowPreCls="queue"
          //     />
          //   </div>
          // </div>
          // <Home />
          <NewUserDashboard />
        )}
        <Modal isOpen={this.state.isModalOpen} size="lg" toggle={this.toggle}>
          <AvForm
            onValidSubmit={this.submitHandler}
            model={this.state.formValues}
          >
            <ModalHeader toggle={this.toggle}>Send Message</ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-lg-12">
                  <div className="form-group">
                    <label className="required">Customer</label>
                    <div className="input-group mb-3">
                      <strong>
                        {this.state.formValues
                          ? this.state.formValues.customer_name
                          : ""}
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="col-lg-12">
                  <div className="form-group">
                    <label>Message</label>
                    <AvInput
                      bsSize="sm"
                      type="textarea"
                      name="message"
                      className="form-control"
                      placeholder="Please enter message"
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.toggle}>
                Close
              </Button>
              <Button color="primary" type="submit">
                Send
              </Button>
            </ModalFooter>
          </AvForm>
        </Modal>
        <Modal isOpen={this.state.isDeleteModalOpen} toggle={this.deleteToggle}>
          <AvForm
            onValidSubmit={this.deleteHandler}
            model={this.state.formValues}
          >
            <ModalHeader toggle={this.deleteToggle}>Delete Queue</ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-12">
                  <h3 className="text-center">
                    Are you sure?
                    <br />
                    You want to delete this queue!
                  </h3>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.deleteToggle}>
                Close
              </Button>
              <Button color="danger" type="submit">
                Delete
              </Button>
            </ModalFooter>
          </AvForm>
        </Modal>
        <Modal
          isOpen={this.state.isQueueModalOpen}
          size="lg"
          toggle={this.queueModalToggle}
        >
          <AvForm
            onValidSubmit={this.queueSubmitHandler}
            model={this.state.formValues}
          >
            <ModalHeader toggle={this.queueModalToggle}>
              {this.state.formValues && this.state.formValues.id
                ? "Edit Queue"
                : "Add Queue"}
            </ModalHeader>
            <ModalBody>
              <div className="row">
                <div className="col-lg-12">
                  <p>Customer Details</p>
                  <div className="form-group">
                    <AutoComplete
                      placeholder="Search Customer"
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
                    <div className="separator">OR</div>
                    {this.state.customerExist && (
                      <div className="col-lg-12 mt-1">
                        <p>
                          Customer Already exist with below mobile/email, Please
                          use above search
                        </p>
                      </div>
                    )}
                    <div className="col-lg-6 mt-3">
                      <div className="form-group">
                        <AvInput
                          bsSize="sm"
                          type="text"
                          name="first_name"
                          className="form-control sm bs"
                          placeholder="Please enter the name"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6 mt-3">
                      <div className="form-group">
                        <AvInput
                          bsSize="sm"
                          type="text"
                          onChange={this.inputChangedHandler.bind(
                            this,
                            "email"
                          )}
                          name="email"
                          className="form-control sm bs"
                          placeholder="Please enter the email"
                        />
                        {this.state.emailExist && (
                          <p className="text-danger">
                            {" "}
                            Email exists, Please search with email to find the
                            Customer
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <AvInput
                          bsSize="sm"
                          type="text"
                          name="mobile"
                          onChange={this.inputChangedHandler.bind(
                            this,
                            "mobile"
                          )}
                          validate={{ pattern: { value: /^\d{10}$/ } }}
                          className="form-control sm bs"
                          placeholder="Please enter the mobile"
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
                    <div className="col-lg-6">
                      <div className="form-group">
                        <AvInput
                          bsSize="sm"
                          type="textarea"
                          name="address_line1"
                          className="form-control"
                          placeholder="Please enter the address"
                        />
                      </div>
                    </div>
                    <hr />
                  </React.Fragment>
                )}
                <p>Queue Details</p>
                <div className="col-lg-12">
                  <div className="form-group">
                    <AvInput
                      bsSize="sm"
                      type="textarea"
                      name="note"
                      className="form-control"
                      placeholder="Please enter note"
                    />
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={this.queueModalToggle}>
                Close
              </Button>
              <Button
                color="primary"
                type="submit"
                disabled={this.state.mobileExist || this.state.emailExist}
              >
                Save
              </Button>
            </ModalFooter>
          </AvForm>
        </Modal>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  const { user } = state.Auth;
  return { user };
};
export default connect(mapStateToProps, { setBData })(Dashboard);
