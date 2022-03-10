import { makeStyles } from "@material-ui/styles";
import {
  Autocomplete,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  IconButton,
  Icon,
} from "@mui/material";

import { Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";

import React, { useEffect, useState } from "react";
import { getCall, postCall } from "../../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../../helpers/constants";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";

import { toast } from "react-toastify";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

//import Table from '@mui/material/Table';
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// Action Icons
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import EditIcon from "@mui/icons-material/Edit";
import InvoicePage from "../../BillingPages/InvoicePage2";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "3em",
    boxShadow: "none",

    "& .flex-end": {
      display: "flex",
      justifyContent: "flex-end",
    },

    "& .flex-center": {
      display: "flex",
      justifyContent: "center",
    },

    "& .flex-start": {
      display: "flex",
      justifyContent: "flex-start",
    },
  },

  billingTable: {
    "& thead": {
      background: "#0a58ca",

      "& tr th": {
        color: "white",
        fontFamily: "Poppins",
      },
    },
  },
}));

const Billing = () => {
  const classes = useStyles();
  const [customer, setCustomer] = useState(""); //uSED to hold input value only
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [invoices, setInvoices] = useState([]);

  const [formData, setFormData] = useState({
    appointmentDate: "2-2-2022",
    consultationCharges: 0,
  });

  // Invoice View Mechanism
  const [openViewModal, setOpenViewModal] = useState(false);
  const [medicinesList, setMedicinesList] = useState([]);
  const [customerData, setCustomerData] = useState([]);

  const [invoiceData, setInvoiceData] = useState({});

  const chartOptions = {
    title: {
      text: "",
    },
    credits: {
      enabled: false,
    },
    chart: {
      type: "column",
      height: "250cd dpx",
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
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
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
  };

  const searchCustomer = (value) => {
    if (!value.trim().length) {
      setFilteredCustomers([]);
    } else {
      getCall(BASE_URL + `api/users/get-customers/?searchText=${value}`)
        .then((r) => {
          setFilteredCustomers(r.data);
        })
        .catch((er) => {
          setFilteredCustomers([]);
        });
    }
  };

  const submitHandler = () => {
    if (selectedCustomer !== null) {
      const customer_id = selectedCustomer.id;
      if (customer_id !== undefined) {
        postCall(BASE_URL + "api/doctors_m/create-invoice/", {
          ...formData,
          customer: customer_id,
        })
          .then((resp) => {
            console.log(resp.data);
            let msg = resp.data.msg;
            toast(msg);
          })
          .catch((error) => {
            console.log(error.response);
          });
      }
    }
  };

  const getInvoices = () => {
    getCall(BASE_URL + "api/doctors_m/get-invoices/")
      .then((resp) => {
        console.log(resp.data);
        if (resp.data) {
          const invoices = resp.data.invoices;
          if (invoices) {
            setInvoices(invoices);
          }
        }
      })
      .catch((error) => {
        console.log(error.response);
      });
  };

  useEffect(() => {
    searchCustomer(customer);
  }, [customer]);

  useEffect(() => {
    if (selectedCustomer !== null) {
      const customer_id = selectedCustomer.id;
      if (customer_id !== undefined) {
        console.log(customer_id);
      }
    }
  }, [selectedCustomer]);

  useEffect(() => {
    getInvoices();
  }, [""]);

  return (
    <div>
      Billing
      {/* Form */}
      <Paper className={classes.root}>
        <Grid container>
          <Grid item sm={6}>
            <div className="cards">
              <div
                className="card col-12"
                style={{
                  maxWidth: "400px",
                  padding: "1em 2em",
                  borderRadius: "1em",
                }}
              >
                <Grid container>
                  <Grid item sm={10}>
                    <h6 className="text-secondary">Todays total income</h6>
                    <h5 className="text-bold">$3256</h5>
                  </Grid>
                  <Grid item sm={2}>
                    <h4>IMG</h4>
                  </Grid>
                </Grid>
              </div>

              <div
                className="card col-12 mt-3"
                style={{
                  maxWidth: "400px",
                  padding: "1em 2em",
                  borderRadius: "1em",
                }}
              >
                <Grid container>
                  <Grid item sm={10}>
                    <h6 className="text-secondary">
                      Todays Number Appointments
                    </h6>
                    <h5 className="text-bold">70</h5>
                  </Grid>
                  <Grid item sm={2}>
                    <h4>IMG</h4>
                  </Grid>
                </Grid>
              </div>
            </div>
          </Grid>
          <Grid item sm={6}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </Grid>
        </Grid>

        <Grid
          container
          className="mt-5"
          style={{
            borderTop: "3px solid blue",
            padding: "1em",
            boxShadow: "0px 0px 3px 0px grey",
          }}
        >
          <Grid container justifyContent={"space-between"} columnSpacing="60">
            <Grid xs={4} item className="flex-start">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Appointment Date"
                  value={formData.appointmentDate}
                  onChange={(newValue) => {
                    setFormData({ ...formData, appointmentDate: newValue });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      sx={{ width: "100%" }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid xs={4} item className="flex-center">
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={filteredCustomers}
                sx={{ width: "100%" }}
                size="small"
                getOptionLabel={(option) => option.first_name}
                onChange={(event, value) => {
                  setSelectedCustomer(value);
                }}
                filterOptions={() => filteredCustomers}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      label="Our Customers"
                      placeholder="Customers"
                      onChange={(e) => {
                        const value = e.target.value;
                        setCustomer(value);
                      }}
                    />
                  );
                }}
              />
            </Grid>
            <Grid xs={4} item className="flex-end">
              <TextField
                type="number"
                placeholder="xx.xx.xx.xx.xx"
                label="Customer Mobile Number"
                size="small"
                variant="outlined"
                sx={{ width: "100%" }}
              />
            </Grid>
          </Grid>

          <Grid
            container
            style={{ marginTop: "3em" }}
            justifyContent={"space-between"}
            columnSpacing="60"
          >
            <Grid xs={4} item>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Billing Date"
                  className="flex-start"
                  disabled
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="dd/mm/yyyy"
                      sx={{ width: "100%" }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid xs={4} item className="flex-center">
              <TextField
                type="text"
                placeholder="Enter"
                label="Consultation Charges"
                size="small"
                variant="outlined"
                sx={{ width: "100%" }}
                value={formData.consultationCharges}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    consultationCharges: e.target.value,
                  });
                }}
              />
            </Grid>
            <Grid xs={4} item className="flex-end">
              <div
                className="btn-rows"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                <div className="btn-container">
                  <Button
                    color="primary"
                    size="small"
                    variant="contained"
                    onClick={submitHandler}
                  >
                    Save
                  </Button>
                </div>
                <div className="btn-container">
                  <Button
                    size="small"
                    variant="contained"
                    style={{ background: "grey" }}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>

        <Grid container className="mt-4">
          <TableContainer component={Paper}>
            <Table
              sx={{ minWidth: 650 }}
              aria-label="simple table"
              className={classes.billingTable}
            >
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Invoice No.</TableCell>
                  <TableCell>Customer Name</TableCell>
                  <TableCell>Mobile No.</TableCell>
                  <TableCell>Email ID</TableCell>
                  <TableCell>Consultation Charges</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => {
                  const billing_date = invoice.billing_date.split("T")[0];
                  const customer_name = invoice.customer_data.first_name;
                  const mobile = invoice.customer_data.mobile;
                  const email = invoice.customer_data.email;
                  const consultation_charges = invoice.consultation_charges;
                  return (
                    <TableRow
                      key={invoice.id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        {billing_date}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {invoice.id}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {customer_name}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {mobile}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        {email}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {consultation_charges}
                      </TableCell>

                      <TableCell component="th" scope="row">
                        <div className="icons">
                          <IconButton
                            size="small"
                            onClick={() => {
                              // console.log(invoice);
                              setInvoiceData(invoice);
                              setOpenViewModal(true);
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton>
                            <PrintIcon
                              fontSize="small"
                              onClick={() => {
                                // console.log(invoice);
                                setInvoiceData(invoice);
                                setOpenViewModal(true);
                              }}
                            />
                          </IconButton>

                          <IconButton>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* {rows.map((row) => (
                  <TableRow
                    key={row.name}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      {row.name}
                    </TableCell>
                    <TableCell align="right">{row.calories}</TableCell>
                    <TableCell align="right">{row.fat}</TableCell>
                    <TableCell align="right">{row.carbs}</TableCell>
                    <TableCell align="right">{row.protein}</TableCell>
                  </TableRow>
                ))} */}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Paper>
      <div className="modal-col">
        <Modal
          isOpen={openViewModal}
          // className={className}
          // className={classes.root}
        >
          <ModalHeader>Print Prescription</ModalHeader>
          <ModalBody>
            {/* <PrescriptionPdf
              medicine_list_={getMedicinesList()}
              data={queueData}
              doctor_info={
                queueData.doctor_info ? queueData.doctor_info : undefined
              }
            /> */}

            {/* <PrescriptionPage
              medicine_list_={getMedicinesList()}
              data={queueData}
              doctor_info={
                queueData.doctor_info ? queueData.doctor_info : undefined
              }
            /> */}

            <InvoicePage invoiceData={invoiceData} />
          </ModalBody>
          <ModalFooter>
            <Button
              color="secondary"
              onClick={() => setOpenViewModal(false)}
              size="sm"
            >
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default Billing;
