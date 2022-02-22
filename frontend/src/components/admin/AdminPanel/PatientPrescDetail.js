import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  Input,
  InputLabel,
  FormControl,
} from "@material-ui/core";

import axios from "axios";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

import IconButton from "@mui/material/IconButton";
import { BASE_URL } from "../../../helpers/constants";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import PrescriptionPdf from "../prescriptionPdf";
import { getCall } from "../../../helpers/axiosUtils";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import PrescriptionPage from "../DoctorPanel/BillingPages/PrescriptionPage";
import InvoicePage from "../DoctorPanel/BillingPages/InvoicePage2";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: "1em",

    "& .valueBox": {
      minHeight: "20vh",
      padding: "1em",

      border: "1px solid #c9c9c9",
      borderRadius: "0.2em",
    },
    "& .infoTitle": {
      color: "black",
    },
    "& .medDetails": {
      padding: "1em",
    },

    "& .mt-1": {
      marginTop: "1em !important",
    },
  },
  infoTitle: {
    [theme.breakpoints.down("xs")]: {
      fontSize: "0.9em",
      fontWeight: "600",
      fontFamily: "POPPINS",
      color: "#5a5a5a !important",
    },
  },
}));

const PatientPrescDetail = (props) => {
  const classes = useStyles();

  const presc_id = props.match.params.id;

  const [prescriptionData, setPrescriptionData] = useState({
    prescription_list: [],
  });

  const [queueData, setQueueData] = useState({});
  const currentUser = useSelector((state) => state.Auth.user);

  const [printPdfModal, setPrintPdfModal] = useState(false);

  const showDownlodBtn =
    queueData.created_by == currentUser.id ||
    prescriptionData.customer == currentUser.id;

  const getPrescriptionData = () => {
    const url = `${BASE_URL}api/admin_m/${presc_id}/get-prescription/`;
    axios.get(url).then((resp) => {
      setPrescriptionData(resp.data.data);
      getMedicinesList();
    });
  };

  const tooglePrintPdf = () => {
    setPrintPdfModal(!printPdfModal);

    // return { ...this.state, printPdfModal: !this.state.printPdfModal };
  };

  const getQueueDetails = (queueId) => {
    getCall(BASE_URL + `api/queue/${queueId}/get-queue/`).then((r) => {
      // let response = r.data;
      // if (response.status != 0) {
      //   props.history.push(`/app/dashboard`);
      // }

      if (r.status == 200) {
        let queueData = r.data;
        setQueueData(queueData);
        console.log(queueData);
      } else {
        if (r.status == 401) {
          toast("You do not have access to queue details");
        }
      }
    });
  };

  useEffect(() => {
    getPrescriptionData();
  }, ["input"]);

  useEffect(() => {
    if (prescriptionData.queue != undefined) {
      getQueueDetails(prescriptionData.queue);
    }
  }, [prescriptionData.queue]);

  const getMedicinesList = () => {
    const medicines_list = [];
    let idx = 0;
    for (let obj of prescriptionData.prescription_list) {
      medicines_list.push({
        idx,
        medicine_name: obj.name,
        drug_to_taken: obj.drug_to_taken,
        note: obj.note,
      });

      idx += 1;
    }

    return medicines_list;
  };
  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h6>Dr . {prescriptionData.doctor_name}</h6>

          <Typography
            className={`${classes.infoTitle} infoTitle`}
            style={{ marginTop: "1em" }}
          >
            Purpose Of Visit
          </Typography>
          <Typography className="valueBox mt-1">
            {prescriptionData.purpose_of_visit}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={`${classes.infoTitle} infoTitle`}>
            Symptoms
          </Typography>
          <Typography className="valueBox mt-1">
            {" "}
            {prescriptionData.symptoms}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography className={`${classes.infoTitle} infoTitle`}>
            Notes from Doctor
          </Typography>
          <Typography className="valueBox mt-1">
            {prescriptionData.note}
          </Typography>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item sm={5} style={{ marginTop: "2em" }}>
          <h6>Prescription</h6>
          <div style={{ marginTop: "1em" }}></div>
          {prescriptionData.prescription_list.map((prescription) => {
            return <MedicineListItem medicine={prescription} />;
          })}
        </Grid>
      </Grid>

      {showDownlodBtn && (
        <Grid container>
          <Grid item sm={3} style={{ marginTop: "2em" }}>
            <button
              className="btn-primary btn-sm"
              style={{ marginBottom: "2em" }}
              onClick={tooglePrintPdf}
            >
              Download Prescription
            </button>
          </Grid>
        </Grid>
      )}

      <div className="modal-col">
        <Modal
          isOpen={printPdfModal}
          toggle={tooglePrintPdf}
          // className={className}
          // className={classes.root}
        >
          <ModalHeader toggle={tooglePrintPdf}>Print Prescription</ModalHeader>
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

            <InvoicePage
              medicine_list_={getMedicinesList()}
              data={queueData}
              doctor_info={
                queueData.doctor_info ? queueData.doctor_info : undefined
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={tooglePrintPdf} size="sm">
              Cancel
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default PatientPrescDetail;

const useStyles2 = makeStyles((theme) => ({
  root: {},
  medDetails: {
    border: "1px solid gray",
    color: "black",
    padding: "1em",
  },
}));

export const MedicineListItem = ({ medicine }) => {
  const [show, setShow] = useState(false);
  const classes = useStyles2();

  console.log(medicine);
  const toogle = () => {
    setShow(!show);
  };

  const styles = {
    display: show ? "block" : "none",
    color: "black",
  };

  const boxStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#E0F7FB",
    padding: "0.2em 0.6em",
  };
  return (
    <div className="medlist" style={{ marginBottom: "0.5em" }}>
      <Grid container>
        <Grid
          item
          sm={5}
          style={{
            background: "#E0F7FB",
            alignItems: "center",
            display: "flex",
            padding: "0.2em 0.6em",
          }}
        >
          <Typography>Medicine 1 </Typography>
        </Grid>
        <Grid item sm={5} style={boxStyle}>
          <Typography> Drug To Taken </Typography>
        </Grid>
        <Grid
          item
          sm={2}
          style={{
            background: "#E0F7FB",
            alignItems: "flex-end",
            display: "flex",
            justifyContent: "flex-end",
            padding: "0.2em",
          }}
        >
          <IconButton onClick={toogle}>
            {show ? (
              <ArrowDropUpIcon fontSize="medium" />
            ) : (
              <ArrowDropDownIcon fontSize="medium" />
            )}
          </IconButton>
        </Grid>
      </Grid>
      <Grid container style={styles} className={classes.medDetails}>
        <Grid item sm={12}>
          <Typography style={styles}>
            Medicine Name : -- {medicine.name}
          </Typography>
        </Grid>
        <Grid item sm={12}>
          <Typography style={styles}>
            {" "}
            Direction To Intake -- {medicine.drug_to_taken}
          </Typography>
        </Grid>
      </Grid>
    </div>
  );
};
