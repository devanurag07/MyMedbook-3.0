import React from "react";
import { Grid, Button, Typography, Paper } from "@mui/material";
import { makeStyles } from "@material-ui/styles";
import { display } from "@mui/system";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",

    flexDirection: "column",
    minHeight: "110vh",

    maxWidth: "900px",
    width: "100%",
    "& .upper-section": {
      //   background: "red",
      flex: 2,
    },

    "& .middle-section": {
      flex: 1,
    },

    "& .footer-section": {
      flex: 1,
    },

    "& .bold": {
      fontWeight: "600",
    },

    "& .gray": {
      color: "gray",
    },
  },
}));

const InvoicePage = () => {
  const classes = useStyles();
  return (
    <div style={{ display: "flex", justifyContent: "center" }} className="m-10">
      <div className={classes.root}>
        <div className="upper-section">
          <Grid container>
            {/* Patient Section */}
            <Grid item xs={6}>
              <div className="logo">
                <img src="./img/logo.png" alt="" />
                <div className="logo-text">
                  <h3>
                    <span className="fw-thin" style={{ color: "#3b51a9" }}>
                      My
                    </span>
                    <span className="fw-bold " style={{ color: "#27b1ff" }}>
                      Medbook
                    </span>
                  </h3>
                </div>
              </div>

              <div className="patient-details mt-9">
                <h5 className="fw-thin text-uppercase">Patient Details</h5>
                <div className="patient-name mt-2">CHINMAYI V S</div>
                <div className="patient-addr" style={{ color: "gray" }}>
                  #20, 8th Main, 5th Cross, 7425631 Hanumantha Nagara, Bangalore
                  - 541102.
                </div>
                <div className="email gray mt-4">chinmayi@gmail.com</div>
                <div className="mobile gray mt-1">+91 8751236547</div>
              </div>
            </Grid>
            {/* Doctor Section */}
            <Grid
              item
              xs={6}
              style={{
                textAlign: "end",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Grid item sm={8}>
                <div className="clinic-name bold">SRL CLINIC</div>
                <div className="doctor-name ">Dr. Krishnamurthy M C</div>
                <div className="doctor-addr gray">
                  #232/1, 4th Cross, 2nd Stage, Vijay Nagar, Bangalore - 570012
                </div>
                {/* Contact links */}
                <div className="doctor-email gray" style={{ marginTop: "2em" }}>
                  krishnamurtghy@gmail.com
                </div>
                <div className="doctor-mobile gray">0825 8563214</div>
                {/* Invoice Details */}
                <h3 style={{ fontWeight: 500 }} className="mt-4">
                  Invoice
                </h3>
                <div className="invoice-no mt-2">
                  <h6>Invoice No.</h6>
                  <div className="no gray">7425631</div>
                </div>
                <div className="invoice-date mt-2">
                  <h6>Invoice Date.</h6>
                  <div className="date gray">01-01-2022</div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className="middle-section">
          <Grid container>
            <Grid item sm={3}>
              <h5>Description</h5>
            </Grid>
            <Grid item sm={3}>
              <h5>Quantity</h5>
            </Grid>
            <Grid item sm={3}>
              <h5>Direction Of Intake</h5>
            </Grid>
            <Grid item sm={3}>
              <h5 style={{ textAlign: "end" }}>Amount</h5>
            </Grid>
          </Grid>
        </div>
        <div className="footer-section mt-3">
          <h6>OTHER INFORMATION</h6>
          <div className="clinic-addr mt-2 gray">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus sed
            dictum ligula, cursus blandit risus. Maecenas eget metus non tellus
            dignissim aliquam ut a ex. Maecenas sed vehicula dui, ac suscipit
            lacus. Sed finibus leo vitae lorem
          </div>
          <Grid container className="mt-8">
            <Grid item xs={6}>
              <h5 className="gray bold">Thank You for Trusting Us</h5>
            </Grid>
            <Grid item xs={6}></Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default InvoicePage;
