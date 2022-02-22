import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../../../helpers/constants";
import { makeStyles } from "@material-ui/styles";

const MyRecords = () => {
  const [records, setRecords] = useState([]);

  const getPatientData = () => {
    const url = `${BASE_URL}api/userpanel/get-myrecords/`;
    axios.get(url).then((resp) => {
      setRecords(resp.data);
      console.log(resp.data);
    });
  };

  useEffect(() => {
    getPatientData();
  }, ["input"]);

  return (
    <div>
      <h4
        className="primary-font-color"
        style={{ marginBottom: "1em", marginTop: "2em" }}
      >
        MyRecords
      </h4>
      {records.map((prescription) => {
        return <PrevRecordItem prescription={prescription} />;
      })}

      {records.length == 0 && (
        <div
          style={{
            padding: "1em",
            textAlign: "center",

            fontWeight: "505",
            fontSize: "1.4rem",
          }}
        >
          No Records
        </div>
      )}
    </div>
  );
};

export default MyRecords;

const useStyles2 = makeStyles((theme) => ({
  root: {
    padding: "1em",
    boxShadow: "1px 1px 5px grey",

    "& .MuiGrid-item": {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    [theme.breakpoints.down("sm")]: {
      "& .MuiGrid-item": {
        fontSize: "0.8em",
        fontWeight: "505",
      },
    },

    [theme.breakpoints.down("xs")]: {
      "& .MuiGrid-item": {
        fontSize: "0.5em",
        fontWeight: "505",
      },
    },
  },
}));

export const PrevRecordItem = ({ prescription }) => {
  const date = prescription.created_at.split("T")[0];

  const classes = useStyles2();

  return (
    <div>
      <Grid container className={classes.root} spacing={1}>
        <Grid item xs={2}>
          Date : - {date}
        </Grid>
        <Grid item xs={2}>
          Age - ......
        </Grid>
        <Grid item xs={3}>
          Note - {prescription.note}
        </Grid>
        <Grid item xs={3}>
          Doctor - {prescription.doctor_name}
        </Grid>

        <Grid item xs={2}>
          <Link to={`/app/patient/presc/${prescription.id}`}>
            <button className="btn btn-success btn-sm me-2">View</button>
          </Link>
        </Grid>
      </Grid>
    </div>
  );
};
