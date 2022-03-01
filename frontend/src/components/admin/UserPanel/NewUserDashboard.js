import React from "react";
import { Paper, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
const useStyles = makeStyles((theme) => ({
  root: {},
  card: {
    padding: "0.5em 2em",
    boxShadow:
      "0px 3px 4px 2px rgb(0 0 0 / 20%), 0px 1px 1px 0px rgb(0 0 0 / 14%), 0px 1px 3px 0px rgb(0 0 0 / 12%)",
  },
}));

const NewUserDashboard = () => {
  const classes = useStyles();
  return (
    <div>
      <div className="main" style={{ marginTop: "2em" }}>
        <div className="patient-info row">
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Paper className={classes.card}>
                <h2>Img</h2>
                <p>Body Temperature</p>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper className={classes.card}>
                <h2>Img</h2>
                <p>Heart Rate</p>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper className={classes.card}>
                <h2>Img</h2>
                <p>Glucose Level</p>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper className={classes.card}>
                <h2>Img</h2>
                <p>Blood Pressure</p>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
};

export default NewUserDashboard;
