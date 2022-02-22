import React, { Component, useState } from "react";
import { Route, useLocation, Redirect, Link } from "react-router-dom";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";
import SmartTable from "../../ui/smart-table";
import { AvForm, AvInput } from "availity-reactstrap-validation";
import { setBData } from "../../redux/actions";
import { createQueue } from "../../redux/actions";
import { connect } from "react-redux";
import "../../assets/scss/style.scss";
import "../../assets/scss/send_prescription.scss";
import { postCall, putCall, getCall } from "../../helpers/axiosUtils";
import { BASE_URL } from "../../helpers/constants";
import { toast } from "react-toastify";
import { AutoComplete } from "primereact/autocomplete";
import { FaCaretDown } from "react-icons/fa";
import { AiOutlineCloseCircle } from "react-icons/ai";
import PrescriptionPdf from "./prescriptionPdf";
import { jsPDF } from "jspdf";
import axios from "axios";

import { Checkbox, FormControlLabel, FormGroup, Grid } from "@material-ui/core";

import { PrescriptionListItem } from "./AdminPanel/PatientDetails";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiGrid-item": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
  },
}));

class SendPrescriptionUpdated extends Component {
  recordPerPage = 5;
  constructor(props) {
    super(props);
    this.submit_ref = React.createRef();

    this.medindex = 0;

    this.getMedIndex = this.getMedIndex.bind(this);
    this.getMedicinesList = this.getMedicinesList.bind(this);
    this.removeItem = this.removeItem.bind(this);
    this.tooglePrintPdf = this.tooglePrintPdf.bind(this);
    this.cancelBtn = this.cancelBtn.bind(this);

    this.searchCustomer = this.searchCustomer.bind(this);
    this.state = {
      drug_to_taken: "",
      medicine_name: "",
      formValues: {
        customer_name: "",
        mobile: "",
        prescription: "",
        note: "",
        clinic_name: "",
        id: null,
      },
      prescriptionLookup: [],
      prescription: null,
      prescriptionsData: [],
      customPrescriptionForm: {
        note: "",
        medicine_name: "",
        drug_to_taken: 1,
      },

      printPdfModal: false,
      queueData: {},
      accessData: {
        patientData: {
          prev_prescs: [],
        },
      },
      saved: false,
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
        label: "Send Prescription",
        link: "",
        active: true,
      },
    ]);
  }

  autoCompleteChange(e) {
    this.setState({
      prescription: e.value,
    });
  }

  searchCustomer(event) {
    if (!event.query.trim().length) {
      this.setState((state) => ({
        filteredCustomers: [],
      }));
    } else {
      getCall(
        BASE_URL +
          `api/prescription-info/get-prescriptions/?searchText=${event.query}`
      )
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
  UNSAFE_componentWillMount() {
    //this.props.fetchCategoryData();
    //this.props.fetchParentCategoryData();
    if (
      this.props.match &&
      this.props.match.params &&
      this.props.match.params.id
    ) {
      this.getQueueDetails(this.props.match.params.id);
    }
    //this.getPrescriptionLookup();
  }

  getQueueDetails(queueId) {
    getCall(BASE_URL + `api/queue/${queueId}/`).then((r) => {
      let response = r.data;

      if (response.status != 0) {
        this.props.history.push(`/app/dashboard`);
      }
      this.setState({
        queueData: response,
      });

      const customerID = response.customer;
      axios
        .get(`${BASE_URL}api/doctors_m/${customerID}/get-customer-detail/`)
        .then((resp) => {
          this.setState({ accessData: resp.data });
          console.log(resp.data);
        });
    });
  }

  askPermission(customerID) {
    postCall(BASE_URL + `api/doctors_m/${customerID}/send-accessrequest/`).then(
      (resp) => {
        console.log("Asked");
        console.log(resp.data);
        this.setState({ accessData: resp.data });
      }
    );
  }

  notify = (msg) => toast(msg);
  submitHandler = (event, values) => {
    event.preventDefault();
    values["queue_id"] = this.state.queueData.id;
    values["prescription"] = this.state.prescription
      ? this.state.prescription
      : null;
    values["prescriptionsData"] = this.state.prescriptionsData;

    // if (this.state.saved) {
    //   this.setState({ printPdfModal: !this.state.printPdfModal });
    // }

    if (this.getMedicinesList().length == 0) {
      this.notify("Please add the medicines...");
      return;
    }

    // return;
    postCall(BASE_URL + `api/prescription/`, values)
      .then((r) => {
        this.notify("Prescription Saved!");

        // this.setState({ printPdfModal: !this.state.printPdfModal });
        // this.setState({ saved: true });
        this.props.history.push(`/app/dashboard`);
      })
      .catch((er) => {
        this.notify("Failed to sent prescription");
      });
  };

  /// gETTING THE INDEX OF MEDICINE
  getMedIndex() {
    this.medindex += 1;
    return this.medindex;
  }

  addNewPrescription() {
    let data = this.state.prescriptionsData;
    let customFormData = this.state.customPrescriptionForm;

    if (customFormData.note === "" || customFormData.medicine_name === "") {
      this.notify("Please fill all required values");
    } else {
      const medicine_name = customFormData.medicine_name;
      const note = customFormData.note;
      const drug_to_taken = customFormData.drug_to_taken;

      const index = this.getMedIndex();

      data.push({
        idx: index,
        note: note,
        medicine_name: medicine_name,
        drug_to_taken: drug_to_taken,
        exists: false,
      });

      this.setState({
        customPrescriptionForm: {
          note: "",
          medicine_name: "",
          drug_to_taken: 1,
        },
      });

      this.setState({ prescriptionsData: data });
      console.log(this.state.prescriptionsData);
    }
  }

  handleChange(event) {
    let customFormData = this.state.customPrescriptionForm;
    customFormData[event.target.name] = event.target.value;
    this.setState(customFormData);
    console.log(customFormData);
  }

  getMedicinesList() {
    const prescriptions = this.state.prescription
      ? this.state.prescription
      : [];
    const allPrescriptions = this.state.prescriptionsData.concat(prescriptions);

    allPrescriptions.sort((a, b) => a.idx - b.idx);

    return allPrescriptions;
  }

  // Search Prescription Remove
  removeItem(index) {
    const idx = index;

    let prescriptionList = this.state.prescription;
    prescriptionList = prescriptionList ? prescriptionList : [];

    const newPrescriptionList = prescriptionList.filter(
      (prescription) => prescription.idx !== idx
    );

    const prescriptionsDataList = this.state.prescriptionsData;

    const newPrescriptionsData = prescriptionsDataList.filter(
      (prescription) => prescription.idx !== idx
    );

    this.setState({
      prescription: newPrescriptionList,
      prescriptionsData: newPrescriptionsData,
    });
  }

  tooglePrintPdf(e) {
    // e.preventDefault();
    // this.submit_ref.click();
  }

  cancelBtn(e) {
    this.setState({ printPdfModal: false });
  }

  render() {
    return (
      <React.Fragment>
        <div className="row mt-2 p-3">
          <h4 className="primary-font-color">Patient Details</h4>
          <div className="col">
            <AvForm onValidSubmit={this.submitHandler}>
              <div className="row">
                <div className="col-lg-4">
                  <div className="form-group">
                    <label className="required">Patient name</label>
                    <AvInput
                      bsSize="sm"
                      type="text"
                      value={
                        this.state.queueData
                          ? this.state.queueData.customer_name
                          : ""
                      }
                      name="customer_name"
                      className="form-control bs"
                      required
                      placeholder="Please enter customer name"
                    />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="form-group">
                    <label className="required">Mobile</label>
                    <AvInput
                      bsSize="sm"
                      type="text"
                      value={
                        this.state.queueData ? this.state.queueData.mobile : ""
                      }
                      name="mobile"
                      className="form-control bs"
                      required
                      placeholder="Please enter mobile"
                    />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="form-group">
                    <label className="required">Clinic name</label>
                    <AvInput
                      bsSize="sm"
                      readOnly
                      type="text"
                      name="clinic_name"
                      className="form-control bs"
                      value={
                        this.props.user &&
                        this.props.user.user &&
                        this.props.user.user.clinic_name
                          ? this.props.user.user.clinic_name
                          : ""
                      }
                      required
                      placeholder="Please enter clinic name"
                    />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="form-group">
                    <label className="required">Date</label>
                    <AvInput
                      bsSize="sm"
                      type="date"
                      name="dateTime"
                      className="form-control bs"
                      required
                      placeholder="Please enter mobile"
                    />
                  </div>
                </div>

                <Grid className="access_box" container>
                  {this.state.accessData.status == "no access" ? (
                    <Grid
                      className="no-access .bg-light-blue"
                      container
                      style={{ background: "#e0f7fb", padding: "1.4em" }}
                    >
                      <Grid item sm={3}></Grid>
                      <Grid item sm={6}>
                        <h6
                          className="primary-font-color"
                          style={{ fontSize: "1.2rem" }}
                        >
                          You will be able to access patients data only when the
                          patients gives you access
                        </h6>
                      </Grid>
                      <Grid item sm={3}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            this.props.history.push(
                              `/app/askaccess/${this.state.queueData.customer}`
                            )
                          }
                          style={{
                            padding: "0.4em 0.6em",
                            borderRadius: "3em",
                            fontWeight: "505",
                            fontSize: "1rem",
                          }}
                        >
                          Ask permission
                        </button>
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}

                  {this.state.accessData.status == "pending" ? (
                    <Grid
                      className="no-access"
                      container
                      style={{ background: "#e0f7fb", padding: "1.4em" }}
                    >
                      <Grid item sm={3}></Grid>
                      <Grid item sm={6}>
                        <h6
                          className="primary-font-color"
                          style={{ fontSize: "1.2rem" }}
                        >
                          You have asked for the permission but user did'nt
                          accepeted your request (Pending)
                        </h6>
                      </Grid>
                      <Grid item sm={3}>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() =>
                            this.props.history.push(
                              `/app/askaccess/${this.state.queueData.customer}`
                            )
                          }
                          style={{
                            padding: "0.4em 0.6em",
                            borderRadius: "3em",
                            fontWeight: "505",
                            fontSize: "1rem",
                          }}
                        >
                          Ask permission Again
                        </button>
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}

                  {this.state.accessData.status == "rejected" ? (
                    <Grid
                      className="no-access"
                      container
                      style={{ background: "#e0f7fb", padding: "1.4em" }}
                    >
                      <Grid item sm={3}></Grid>
                      <Grid item sm={6}>
                        <h6
                          className="primary-font-color"
                          style={{ fontSize: "1.2rem", color: "red" }}
                        >
                          Rejected
                        </h6>
                      </Grid>
                      <Grid item sm={3}></Grid>
                    </Grid>
                  ) : (
                    ""
                  )}

                  {this.state.accessData.status == "has_access" ? (
                    <Grid className="has-access" container>
                      <h5 style={{ color: "#0A58CA" }}>
                        Previous Prescriptions
                      </h5>
                      <Grid
                        item
                        sm={12}
                        style={{
                          flexDirection: "column",
                          alignItems: "unset",
                        }}
                      >
                        {this.state.accessData.patientData.prev_prescs
                          .reverse()
                          .slice(0, 3)
                          .map((prescription) => {
                            return (
                              <PrescriptionListItem
                                prescription={prescription}
                              />
                            );
                          })}
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}
                </Grid>

                <h5 className="primary-font-color" style={{ marginTop: "1em" }}>
                  Current Visit Details & prescription
                </h5>

                <div className="row">
                  <div className="col-lg-12">
                    <div className="form-group">
                      <label>Purpose Of Visit</label>
                      <AvInput
                        type="textarea"
                        rows={5}
                        name="purpose_of_visit"
                        className="form-control bs"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Symptoms</label>
                      <AvInput
                        type="textarea"
                        rows={5}
                        name="symptoms"
                        className="form-control bs"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="form-group">
                      <label>Note</label>
                      <AvInput
                        type="textarea"
                        name="note"
                        rows={5}
                        className="form-control bs"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* {this.state.prescriptionsData.map((column, rowIndex) => (
                  <React.Fragment key={rowIndex}>
                    <div className="col-lg-6">
                      <div className="form-group">
                        {rowIndex == 0 && (
                          <label className="required">Medicine name</label>
                        )}
                        <AvInput
                          bsSize="sm"
                          type="text"
                          name="name"
                          value={
                            this.state.prescriptionsData[rowIndex].medicine_name
                          }
                          onChange={this.handleChange.bind(
                            this,
                            "medicine_name",
                            rowIndex
                          )}
                          className="form-control sm bs"
                          placeholder="Medicine name"
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-group">
                        {rowIndex == 0 && (
                          <label className="required">Quantity per day</label>
                        )}
                        <AvInput
                          bsSize="sm"
                          type="text"
                          name="drug_to_taken"
                          value={
                            this.state.prescriptionsData[rowIndex].drug_to_taken
                          }
                          onChange={this.handleChange.bind(
                            this,
                            "drug_to_taken",
                            rowIndex
                          )}
                          className="form-control sm bs"
                          placeholder="Quantity per day"
                        />
                      </div>
                    </div>
                  </React.Fragment>
                ))} */}

                <div className="row">
                  <div className="custom-prescription col-sm-6">
                    <div className="col-sm-12">
                      <div className="col-sm-8">
                        <div className="form-group">
                          <AutoComplete
                            multiple
                            placeholder="Search Medicine"
                            value={this.state.prescription}
                            appendTo="self"
                            inputClassName="autocomplete"
                            suggestions={this.state.filteredCustomers}
                            completeMethod={this.searchCustomer}
                            field="name"
                            onChange={(e) => {
                              const prescriptionList = e.value;

                              this.getMedicinesList();
                              const prevPrescription = this.state.prescription
                                ? this.state.prescription
                                : [];

                              // if person removes the medicine
                              if (
                                prevPrescription.length >
                                prescriptionList.length
                              ) {
                                // filtering by comparing two lists [a,b] [a,b,c] c will be eliminated
                                const newList = prevPrescription.filter(
                                  (prevPresc) => {
                                    // for (let currentPresc of prescriptionList) {
                                    //   if (currentPresc.id == prevPresc.id) {
                                    //     return true;
                                    //   }
                                    // }
                                    // return false;
                                    const prescriptionIdx =
                                      prescriptionList.map(
                                        (presc) => presc.idx
                                      );

                                    return prescriptionIdx.includes(
                                      prevPresc.idx
                                    );
                                  }
                                );

                                this.setState({ prescription: newList });
                              } else if (
                                // if person adds the medicine

                                prevPrescription.length <
                                prescriptionList.length
                              ) {
                                const newPresc =
                                  prescriptionList[prescriptionList.length - 1];

                                newPresc.idx = this.getMedIndex();
                                this.setState({
                                  prescription: [...prevPrescription, newPresc],
                                });
                              }
                            }}
                          />
                        </div>
                      </div>
                      <h5>OR</h5>
                      <h6 className="primary-font-color">Add New</h6>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <label htmlFor="medicine_name" className="required">
                            Medicine Name
                          </label>
                          <AvInput
                            bsSize="sm"
                            type="text"
                            name="medicine_name"
                            value={
                              this.state.customPrescriptionForm.medicine_name
                            }
                            onChange={this.handleChange.bind(this)}
                          ></AvInput>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <label htmlFor="quantity" className="required">
                            Quantity per day
                          </label>
                          <AvInput
                            bsSize="sm"
                            type="number"
                            name="drug_to_taken"
                            value={
                              this.state.customPrescriptionForm.drug_to_taken
                            }
                            onChange={this.handleChange.bind(this)}
                          ></AvInput>
                        </div>
                      </div>
                      <div className="col-sm-8">
                        <div className="form-group">
                          <label htmlFor="note" className="required">
                            Directions of Intake
                          </label>
                          <AvInput
                            bsSize="sm"
                            type="textarea"
                            name="note"
                            rows={50}
                            value={this.state.customPrescriptionForm.note}
                            onChange={this.handleChange.bind(this)}
                            style={{ marginBottom: "0px", height: "138px" }}
                          ></AvInput>
                        </div>
                      </div>

                      <div className="col-sm-12">
                        <Button
                          color="primary"
                          // className="float-end"
                          type="button"
                          size="sm"
                          onClick={this.addNewPrescription.bind(this)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <div className="col-sm-12">
                      <h6 className="primary" style={{ color: "#0A58CA" }}>
                        Prescription
                      </h6>
                      <p>
                        Please verify the medications prescribed twice before
                        sending it to the patient
                      </p>
                      <div className="medicine-list">
                        {this.getMedicinesList().map((prescription, idx) => {
                          return (
                            <MedicineListItem
                              prescription={prescription}
                              idx={idx}
                              removeItem={() =>
                                this.removeItem(prescription.idx)
                              }
                            />
                          );
                        })}
                      </div>
                      <div className="action-btns mt-5">
                        <Button
                          size="sm"
                          color="secondary"
                          onClick={() =>
                            this.props.history.push("/app/dashboard")
                          }
                        >
                          Cancel
                        </Button>
                        <input
                          size="sm"
                          color="primary"
                          type="submit"
                          ref={(inp) => (this.submit_ref = inp)}
                          style={{ display: "none" }}
                          // style={{ display: "none" }}
                        />
                        {/*  */}

                        {/* <FormGroup>
                          <FormControlLabel
                            control={
                              <Checkbox
                                defaultChecked={false}
                                checked={this.state.saved}
                              />
                            }
                            labelPlacement="start"
                            label="Save"
                            disabled={this.state.saved}
                            onChange={() => {
                              console.log(this.submit_ref.click());
                            }}
                          />
                        </FormGroup> */}

                        <Button
                          size="sm"
                          color="primary"
                          className="float-end"
                          type="submit"
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Medicine List Box */}
              </div>
            </AvForm>
          </div>
          <div className="modal-col">
            <Modal
              isOpen={this.state.printPdfModal}
              toggle={this.tooglePrintPdf}
              // className={className}
            >
              <ModalHeader toggle={this.tooglePrintPdf}>
                Print Prescription
              </ModalHeader>
              <ModalBody>
                <PrescriptionPdf
                  medicine_list_={this.getMedicinesList()}
                  data={this.state.queueData}
                  callBack={() => {
                    this.tooglePrintPdf();
                    this.props.history.push("/app/dashboard");
                  }}
                />
              </ModalBody>
              <ModalFooter>
                <Button color="secondary" onClick={this.cancelBtn} size="sm">
                  Cancel
                </Button>
              </ModalFooter>
            </Modal>
          </div>
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => {
  return {
    category: state.Queue.queue,
    user: state.Auth,
  };
};
export default connect(mapStateToProps, { setBData })(SendPrescriptionUpdated);

const MedicineListItem = ({ prescription, idx, removeItem }) => {
  const prescription_name = prescription.name
    ? prescription.name
    : prescription.medicine_name;

  const note = prescription.note;
  const [showDetails, setShowDetails] = useState(false);

  const prescriptionInfoStyle = showDetails
    ? { display: "flex", background: "white" }
    : { display: "none", background: "white" };

  return (
    <div className="medicine">
      <div className="col-sm-12 row">
        <div className="col-sm-4">Medicine - {idx}</div>{" "}
        <div className="col-sm-5">Directions of Intake</div>
        <div className="icon-container col-sm-1">
          <FaCaretDown size={30} onClick={() => setShowDetails(!showDetails)} />
        </div>
        <div
          className="icon-container col-sm-2"
          style={{ justifyContent: "flex-end" }}
        >
          <AiOutlineCloseCircle size={30} onClick={removeItem} />
        </div>
      </div>

      <div className="col-sm-12 row" style={prescriptionInfoStyle}>
        <div className="col-sm-12">
          <div className="col-sm-6"> Medicine Name :</div>
          <div className="col-sm-6"> {prescription_name}</div>
        </div>

        <div className="col-sm-12">
          <div className="col-sm-6"> Direction OF Intake :</div>
          <div className="col-sm-6"> {note}</div>
        </div>
      </div>
    </div>
  );
};
