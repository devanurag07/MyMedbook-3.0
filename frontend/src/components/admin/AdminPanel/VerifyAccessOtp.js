import React, { useEffect, useState } from "react";
import { Paper, Grid, Typography, Button, TextField } from "@material-ui/core";
import { toast } from "react-toastify";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getCall, postCall } from "../../../helpers/axiosUtils";
import { BASE_URL } from "../../../helpers/constants";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .text-align-center": {
      textAlign: "center",
    },

    "& .bold-text": {
      fontWeight: "606",
    },
    "& .content-center": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
  },
}));

const VerifyAccessOtp = (props) => {
  let patient_id = props.match.params.id;
  patient_id = patient_id ? patient_id : 0;

  const [otpValue, setOtpValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const verifyOtp = () => {
    postCall(BASE_URL + `api/doctors_m/${patient_id}/verify-otp/`, {
      otp: otpValue,
    })
      .then((resp) => {
        if (resp.status == 200) {
          if (resp.data.verified) {
            props.history.push(`/app/patient/${patient_id}`);
          }
        }
      })
      .catch((err) => {
        if (err.response.status == 401) {
          setIsValid(false);
        }
        if (err.response.status == 404) {
          props.history.push(`/app/askaccess/${patient_id}`);
        }
      });
  };

  const onOtpChange = (e) => {
    setOtpValue(e.target.value);
  };

  const askPermission = (customerID) => {
    postCall(BASE_URL + `api/doctors_m/${customerID}/send-accessrequest/`).then(
      (resp) => {
        // this.setState({ accessData: resp.data });\
        toast("Otp sents");
      }
    );
  };

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <h4 className="primary-font-color">Patient Details</h4> Verify Access{" "}
      {patient_id}
      <Paper>
        <Typography
          variant="h6"
          className="text-align-center"
          color="primary"
          style={{
            marginTop: "1em",
            paddingTop: "2em",
            color: "#0A58CA",
            fontWeight: "505",
            textAlign: "center",
          }}
        >
          You will be able to access patients data as soon as patient give
          access to you
        </Typography>

        <div
          className="bold-text"
          style={{ fontWeight: "505", textAlign: "center" }}
        >
          in just 2 simple ways
        </div>
        <h4
          className="primary-font-color text-align-center bold-text"
          style={{ marginTop: "1em" }}
        >
          Application Access
        </h4>

        <div className="info text-align-center">
          Ask your patient to login into <br />
          the app and click on the{" "}
          <span className="bold-text">provide access button</span>
        </div>

        <div
          className="text-align-center bold-text"
          style={{ marginTop: "1em" }}
        >
          OR
        </div>
        <h4
          className="primary-font-color text-align-center bold-text"
          style={{ marginTop: "1em" }}
        >
          OTP
        </h4>
        <div className="text-align-center">
          <span className="bold-text"> Enter OTP </span>sent to patients phone
          number
        </div>
        <Grid container style={{ marginTop: "1em" }}>
          <Grid
            item
            sm={12}
            className="content-center"
            style={{ display: "flex", flexDirection: "row" }}
          >
            <TextField
              placeholder="Enter OTP..."
              onChange={onOtpChange}
              value={otpValue}
              variant="outlined"
              size="small"
              type="number"
              error={!isValid}
              helperText={!isValid ? "The otp you have entered is invalid" : ""}
            />
            <a
              className="primary-font-color"
              href={`#`}
              style={{
                borderBottom: "2px solid ",
                marginTop: "1em",
                marginLeft: "1em",
              }}
              onClick={() => askPermission(patient_id)}
            >
              <h6>Send Otp</h6>
            </a>
          </Grid>

          <Grid item sm={4}></Grid>
        </Grid>
        <div
          className="btn-container content-center"
          style={{ marginTop: "1em" }}
        >
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={verifyOtp}
          >
            Submit
          </Button>
        </div>
      </Paper>
    </div>
  );
};

export default VerifyAccessOtp;
