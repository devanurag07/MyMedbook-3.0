import { Grid } from "@mui/material";
import React from "react";
import { BrowserRouter as Router, Link, Route, Switch } from "react-router-dom";
import ScheduleDateWiseForm from "./ScheduleDateWiseForm";
const ScheduleRouter = () => {
  return (
    <div style={{ marginTop: "3em" }}>
      <div className="links">
        <Grid container spacing={3}>
          <Grid item sm={3}>
            <Link to="/app/schedules/daywiseform/">DayTimeSlotsAdd</Link>
          </Grid>
          <Grid item sm={3}>
            <Link to="/app/schedules/datewiseform/">DateTimeSlotsAdd</Link>
          </Grid>

          <Grid item sm={3}>
            <Link to="/app/schedules/daytimeslots/">DayTimeSlots</Link>
          </Grid>
          <Grid item sm={3}>
            <Link to="/app/schedules/datetimeslots/">DateTimeSlots</Link>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

export default ScheduleRouter;
