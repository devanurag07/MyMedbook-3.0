import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@material-ui/core";
import axios from "axios";
import { BASE_URL } from "../../../helpers/constants";
import { postCall } from "../../../helpers/axiosUtils";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiGrid-item": {
      marginBottom: "1em",
    },
    "& .infoTitle": {
      fontWeight: "505",
    },

    "& .document-row p": {
      color: "black !important",
    },

    "& .document-row ": {
      display: "flex",
    },

    "& .download-btn": {
      padding: "0.3em 1em",
      fontWeight: "505",
      fontSize: "1rem",
      borderRadius: "1.3em",
      marginLeft: ".6em",
    },
    "& .red-status": {
      padding: "0.3em 0.3em",
      marginLeft: "1em",
      color: "red",
    },
    "& .reject-label": {
      background: "red",
      color: "white",
      borderRadius: "1em",
      fontWeight: "505",
    },
    "& .approved-label": {
      background: "green",
      padding: "0.4em 0.8em",
      color: "white",
      borderRadius: "1em",
      fontWeight: "505",
    },
  },
  infoValue: {
    marginTop: "0.4em",
  },
}));

const Doctor = (props) => {
  const classes = useStyles();
  const doctor_id = props.match.params.id;

  const [doctorData, setDoctorData] = useState({});
  const getDoctorInfo = () => {
    const url_path = `${BASE_URL}api/admin_m/${props.match.params.id}/get-doctor/`;
    axios.get(url_path).then((resp) => {
      setDoctorData(resp.data);
      console.log(resp.data);
    });
  };

  useEffect(() => {
    getDoctorInfo();
  }, ["inpt"]);

  const approveDocument = () => {
    postCall(BASE_URL + `api/users/activate-customer/`, {
      id: doctor_id,
    })
      .then((r) => {
        toast("Doctor's document approved !");
        getDoctorInfo();
      })
      .catch((er) => {});
  };

  const rejectDocument = () => {
    postCall(BASE_URL + `api/users/reject-customer/`, {
      id: doctor_id,
    })
      .then((r) => {
        toast("Doctor's document rejected !");
        getDoctorInfo();
      })
      .catch((er) => {});
  };

  return (
    <div>
      <Grid container className={classes.root}>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Doctor Name
          </Typography>
          <Typography className={classes.infoValue}>
            {doctorData.full_name}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Mobile
          </Typography>
          <Typography className={classes.infoValue}>
            {doctorData.mobile}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Doctor Registration No.
          </Typography>
          <Typography className={classes.infoValue}>A2D23XD3D</Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Email ID
          </Typography>
          <Typography className={classes.infoValue}>
            {doctorData.email}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Doctor Qualifications
          </Typography>
          <Typography className={classes.infoValue}>MBBS</Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Clinic Address
          </Typography>
          <Typography className={classes.infoValue}>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Labore,
            deleniti.
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Clinic Name
          </Typography>
          <Typography className={classes.infoValue}>
            {doctorData.clinic_name}
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="subheading2" className="infoTitle">
            Clinic Registration Number
          </Typography>
          <Typography className={classes.infoValue}>Clinic A3DAD</Typography>
        </Grid>

        <Grid container>
          <Grid item sm={6}>
            <h5>Support Documents</h5>
            <div className="document-row">
              <p>Address proof of clinic regetration</p>
              {doctorData.clinic_address_proof ? (
                <div className="container3">
                  <a
                    href={doctorData.clinic_address_proof}
                    className="btn-success download-btn"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="containe3r">
                  <h6 className="red-status">Not uploaded</h6>
                </div>
              )}
            </div>
            <div className="document-row">
              <p>Degree certificate</p>
              {doctorData.degree_certificate ? (
                <div className="container3">
                  <a
                    href={doctorData.degree_certificate}
                    className="btn-success download-btn"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="containe3r">
                  <h6 className="red-status">Not uploaded</h6>
                </div>
              )}
            </div>
            <div className="document-row">
              <p>Doctor regestration no proof</p>
              {doctorData.doctor_registration ? (
                <div className="container3">
                  <a
                    href={doctorData.doctor_registration}
                    className="btn-success download-btn"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="containe3r">
                  <h6 className="red-status">Not uploaded</h6>
                </div>
              )}
            </div>
            <div className="document-row">
              <p>Clinic regestration certificate</p>
              {doctorData.agreement_file ? (
                <div className="container3">
                  <a
                    href={doctorData.agreement_file}
                    className="btn-success download-btn"
                  >
                    Download
                  </a>
                </div>
              ) : (
                <div className="containe3r">
                  <h6 className="red-status">Not uploaded</h6>
                </div>
              )}
            </div>
          </Grid>
        </Grid>

        <Grid item sm={6}>
          <Grid container>
            <Grid item sm={3}>
              <div className="status">
                <h5>Status</h5>
                <div className="status-text">
                  {doctorData.document_rejected ? (
                    <span className="reject-label red-status">Rejected</span>
                  ) : (
                    ""
                  )}
                  {doctorData.document_verified ? (
                    <span className="approved-label">Approved</span>
                  ) : (
                    ""
                  )}
                </div>
              </div>
            </Grid>
            <Grid item sm={3}>
              <div className="alter-status">
                <h5>Alter Status</h5>
                <div className="alter-btns" style={{ display: "flex" }}>
                  <div className="approve">
                    <button
                      className="btn-success btn-sm"
                      onClick={approveDocument}
                    >
                      Approve
                    </button>
                  </div>
                  <div className="reject" style={{ marginLeft: "0.3em" }}>
                    <button
                      className="btn-danger btn-sm"
                      onClick={rejectDocument}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Doctor;
