import { makeStyles } from "@material-ui/styles";
import { Autocomplete, Grid, Paper, TextField, Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { getCall, postCall } from "../../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../../helpers/constants";

import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";

import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "3em",

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
}));

const Billing = () => {
  const classes = useStyles();
  const [customer, setCustomer] = useState(""); //uSED to hold input value only
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [formData, setFormData] = useState({
    appointmentDate: "2-2-2022",
    consultationCharges: 0,
  });

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
  return (
    <div>
      Billing
      {/* Form */}
      <Paper className={classes.root}>
        <Grid container>
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
                  <Button color="secondary" size="small" variant="contained">
                    Reset
                  </Button>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};

export default Billing;
