import React, { Component } from "react";
import { Route, useLocation, Redirect } from "react-router-dom";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import SmartTable from "../../ui/smart-table";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { setBData } from "../../redux/actions";
import { connect } from "react-redux";
import "../../assets/scss/style.scss";
import { postCall, putCall, getCall } from "../../helpers/axiosUtils";
import { BASE_URL } from "../../helpers/constants";
import { toast } from "react-toastify";
import { loginUserSuccess } from "../../redux/actions";

import { Input } from "@mui/material";

/*
 customer name, address, contact no, email, a field to enter prescription, extra note if necessary
*/

class Profile extends Component {
  recordPerPage = 5;
  constructor(props) {
    super(props);
    this.onFileChange = this.onFileChange.bind(this);
    this.state = {
      formValues: this.props.user,
      errors: {},
      invalidFields: {},
      errorValues: {},
      fileDataList: {},
    };

    this.props.setBData([
      {
        label: "App",
        link: "",
        active: false,
      },
      {
        label: "Profile",
        link: "",
        active: true,
      },
    ]);
  }

  onFileChange = (event) => {
    this.setState({
      fileDataList: {
        [event.target.id]: event.target.files ? event.target.files[0] : "null",
        ...this.state.fileDataList,
      },
    });
  };
  notify = () => toast("Profile updated !");
  UNSAFE_componentWillMount() {
    //this.props.fetchCategoryData();
    //this.props.fetchParentCategoryData();
    /* if (this.props.match && this.props.match.params && this.props.match.params.id) {
            this.getQueueDetails(this.props.match.params.id)
        } */
  }
  submitHandler = (event, errors, values) => {
    event.preventDefault();
    if (this.state.emailExist) {
      errors.push("email");
    }
    if (this.state.mobileExists) {
      errors.push("mobile");
    }
    if (this.state.invalidMobile) {
      errors.push("mobile");
    }

    if (errors.length > 0) {
      toast.error("Please fill all the fields above correctly.", {});
      return;
    }

    let formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });
    if (this.state.fileDataList) {
      for (let filename in this.state.fileDataList) {
        formData.append(
          filename,
          this.state.fileDataList[filename],
          this.state.fileDataList[filename].name
        );
      }
    }
    postCall(BASE_URL + `api/users/update-profile/`, formData).then((r) => {
      this.props.loginUserSuccess(r.data);

      if (
        this.props.user.document_verified == false &&
        this.props.user.document_rejected == false
      ) {
        this.props.history.push("/app/dashboard");
      }

      this.notify();
    });
  };

  inputChangedHandler = (controlName, event) => {
    const userEmail = this.props.user ? this.props.user.email : "";
    const userMobile = this.props.user ? this.props.user.mobile : "";

    if (controlName === "mobile") {
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
      if (userEmail == event.target.value) {
        this.setState({ emailExist: false });
        return;
      }

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

  render() {
    const email = this.props.user ? this.props.user.email : "";
    return (
      <React.Fragment>
        <div className="row mt-2 p-3">
          <div className="col">
            <h4 className="">Profile</h4>
            <AvForm onSubmit={this.submitHandler}>
              <div className="row">
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="required">Name</label>
                    <AvInput
                      bsSize="sm"
                      type="text"
                      name="first_name"
                      className="form-control"
                      value={this.props.user ? this.props.user.first_name : ""}
                      required
                      placeholder="Please enter name"
                    />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="required">Email</label>
                    <AvInput
                      readOnly={email == "" ? false : true}
                      bsSize="sm"
                      type="text"
                      name="email"
                      className="form-control"
                      value={email}
                      required
                      placeholder="Please enter email"
                      onChange={this.inputChangedHandler.bind(this, "email")}
                    />

                    {this.state.emailExist && (
                      <p className="text-danger">Email already exist</p>
                    )}
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="form-group">
                    <label className="required">Mobile</label>
                    <AvInput
                      bsSize="sm"
                      type="text"
                      value={this.props.user ? this.props.user.mobile : ""}
                      name="mobile"
                      className="form-control"
                      required
                      placeholder="Please enter mobile"
                      onChange={this.inputChangedHandler.bind(this, "mobile")}
                    />

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
                    <label>Clinic Address</label>
                    <AvInput
                      type="textarea"
                      name="address_line1"
                      value={
                        this.props.user ? this.props.user.address_line1 : ""
                      }
                      className="form-control"
                      placeholder="Please enter comment"
                    />
                  </div>
                </div>
                {this.props.user && this.props.user.role_name == "Doctors" && (
                  <React.Fragment>
                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="required">
                          Doctor Registration No.
                        </label>
                        <AvInput
                          bsSize="sm"
                          type="text"
                          value={
                            this.props.user
                              ? this.props.user.doctor_registeration_no
                              : ""
                          }
                          name="doctor_registeration_no"
                          className="form-control"
                          required
                          placeholder="Please enter your qualifications no"
                        />
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <label className="required">
                          Clinic Registration No.
                        </label>
                        <AvInput
                          bsSize="sm"
                          type="text"
                          value={
                            this.props.user
                              ? this.props.user.clinic_registeration_no
                              : ""
                          }
                          name="clinic_registeration_no"
                          className="form-control"
                          required
                          placeholder="Please enter clinic registration no"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="col-sm-8">
                        <div className="form-group">
                          {/* <input type="file" id="agreement_file" /> */}
                          {/* <input
                          type="file"
                          id="degree_certificate"
                          onChange={this.onFileChange}
                          style={{ fontSize: "13px" }}
                          required
                        /> */}

                          <div className="row">
                            <div className="col-sm-6">
                              <AvInput
                                type="file"
                                bsSize="sm"
                                name="agreement_file"
                                id="agreement_file"
                                onChange={this.onFileChange}
                                required={
                                  this.props.user.agreement_file ? false : true
                                }
                                className="form-control"
                                style={{ height: "auto" }}
                              />
                            </div>
                            <div className="col-sm-6">
                              <a href={this.props.user.agreement_file}>
                                Agreement File
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-sm-6">
                              <AvInput
                                type="file"
                                bsSize="sm"
                                name="degree_certificate"
                                id="degree_certificate"
                                onChange={this.onFileChange}
                                style={{ fontSize: "13px" }}
                                required={
                                  this.props.user.degree_certificate
                                    ? false
                                    : true
                                }
                                className="form-control"
                                placeholder="Degree"
                                style={{ height: "auto" }}
                              />
                            </div>
                            <div className="col-sm-6">
                              <a href={this.props.user.degree_certificate}>
                                Degree Certificate
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-sm-6">
                              <AvInput
                                type="file"
                                bsSize="sm"
                                name="doctor_registration"
                                id="doctor_registration"
                                onChange={this.onFileChange}
                                style={{ fontSize: "13px" }}
                                style={{ height: "auto" }}
                                required={
                                  this.props.user.doctor_registration
                                    ? false
                                    : true
                                }
                                className="form-control"
                              />
                            </div>
                            <div className="col-sm-6">
                              <a href={this.props.user.doctor_registration}>
                                Doctor Registration
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-sm-6">
                              <AvInput
                                type="file"
                                bsSize="sm"
                                name="clinic_address_proof"
                                id="clinic_address_proof"
                                onChange={this.onFileChange}
                                style={{ fontSize: "13px" }}
                                style={{ height: "auto" }}
                                required={
                                  this.props.user.clinic_address_proof
                                    ? false
                                    : true
                                }
                                className="form-control"
                              />
                            </div>
                            <div className="col-sm-6">
                              <a href={this.props.user.clinic_address_proof}>
                                Clinic Address Proof
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-lg-6">
                      <div className="form-group">
                        <label>Clinic name</label>
                        <AvInput
                          type="text"
                          bsSize="sm"
                          name="clinic_name"
                          value={
                            this.props.user ? this.props.user.clinic_name : ""
                          }
                          className="form-control"
                          placeholder="Please enter clinic_name"
                          required
                        />
                      </div>
                    </div>

                    <div className="row">
                      <div className="col-sm-6">
                        <AvInput
                          type="file"
                          accept=".*svg"
                          bsSize="sm"
                          name="your_sign"
                          id="your_sign"
                          onChange={this.onFileChange}
                          required={this.props.user.your_sign ? false : true}
                          className="form-control"
                          style={{ height: "auto" }}
                        />
                      </div>
                      <div className="col-sm-6">
                        <a href={this.props.user.your_sign}>Your Sign</a>
                      </div>
                    </div>
                  </React.Fragment>
                )}
                <div className="col-lg-12">
                  <Button color="primary" className="float-end" type="submit">
                    Update
                  </Button>
                </div>
              </div>
            </AvForm>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  const { user } = state.Auth;
  return { user };
};
export default connect(mapStateToProps, { setBData, loginUserSuccess })(
  Profile
);
