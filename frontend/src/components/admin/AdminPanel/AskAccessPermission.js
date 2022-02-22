import React, { useEffect, useState } from "react";
import { Paper, Grid, Typography, Button } from "@material-ui/core";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { getCall, postCall } from "../../../helpers/axiosUtils";
import { BASE_URL } from "../../../helpers/constants";
import { Link } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#0A58CA",
    },
  },
});

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

  askPermissionBtn: {
    background: "#0A58CA",
    fontWeight: "606",
  },
  mainPaper: {
    minHeight: "63vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
  },

  pendingStatus: {
    background: "red",
    padding: "0.2em 1em",
    borderRadius: "12.3em",
    color: "white",
    fontWeight: "606",
    fontSize: "1.3em",
    padding: "0.3em 1em",
  },
}));

const AskAccessPermission = (props) => {
  let patient_id = props.match.params.id;
  patient_id = patient_id ? patient_id : 0;

  const [patientData, setPatientData] = useState({});
  const [accessData, setAccessData] = useState({});

  const classes = useStyles();

  const getPatientData = () => {
    getCall(BASE_URL + `api/doctors_m/${patient_id}/get-customer-info/`).then(
      (resp) => {
        setPatientData(resp.data);
        console.log(resp.data);
      }
    );
  };

  const getPatientAccessData = () => {
    getCall(BASE_URL + `api/doctors_m/${patient_id}/get-customer-detail/`).then(
      (resp) => {
        if (resp.status == 200) {
          setAccessData(resp.data);
          console.log(resp.data);
        }
      }
    );
  };

  const askPermission = (customerID) => {
    postCall(BASE_URL + `api/doctors_m/${customerID}/send-accessrequest/`)
      .then((resp) => {
        // this.setState({ accessData: resp.data });\
        props.history.push(`/app/verifyaccess/${customerID}`);
      })
      .catch((err) => {
        console.log(err);
        console.log(err.response);
      });
  };
  useEffect(() => {
    getPatientData();
    getPatientAccessData();
  }, ["inp"]);

  return (
    <div className={classes.root}>
      <ThemeProvider theme={theme}>
        <h2 className="primary-font-color" style={{ fontWeight: "505" }}>
          Patient Details
        </h2>
        <h6>
          Patient name{" "}
          <span className="bold-text"> {patientData.full_name} </span>
        </h6>
        <Paper className={classes.mainPaper}>
          <Typography
            variant="h6"
            className="text-align-center"
            color="primary"
            style={{ marginTop: "1em", color: "#0A58CA", fontWeight: "505" }}
          >
            You do not have <span className="bold-text">access </span>to patient
            data
          </Typography>
          <div
            className="patient-info content-center"
            style={{ marginTop: "1em", color: "#0A58CA" }}
          >
            <div className="patient-name">
              Name : -{" "}
              <span className="bold-text">{patientData.full_name} </span>
            </div>
            <div className="patient-mob"> Mobile : {patientData.mobile}</div>
          </div>

          <div
            className="btn-container content-center"
            style={{ marginTop: "1em" }}
          >
            {accessData.status == "no access" && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                className={classes.askPermissionBtn}
                onClick={() => askPermission(patient_id)}
              >
                Ask Permission
              </Button>
            )}

            {accessData.status == "rejected" && (
              <div className={classes.pendingStatus}>Rejected</div>
            )}

            {accessData.status == "rejected" && (
              <Button
                variant="contained"
                color="secondary"
                size="small"
                className={classes.askPermissionBtn}
                onClick={() => askPermission(patient_id)}
                style={{ marginTop: "1em" }}
              >
                Ask Permission Again
              </Button>
            )}

            {accessData.status == "pending" && (
              <>
                <div className={classes.pendingStatus}>Pending</div>
                <a
                  className="primary-font-color"
                  href={`/app/verifyaccess/${patient_id}`}
                  style={{ borderBottom: "2px solid ", marginTop: "1em" }}
                >
                  <h6>Verify Page</h6>
                </a>
              </>
            )}
          </div>
          <Typography
            variant="h6"
            className="text-align-center"
            color="primary"
            style={{ marginTop: "1em", color: "#0A58CA", fontWeight: "505" }}
          >
            You will be able to access patients data only when the <br />
            patients gives you access
          </Typography>
        </Paper>
      </ThemeProvider>
    </div>
  );
};

export default AskAccessPermission;
