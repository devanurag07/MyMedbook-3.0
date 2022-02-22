import { Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Grid } from "@mui/material";
import { wrap } from "highcharts";
import React, { useEffect, useState } from "react";
import { getCall } from "../../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../../helpers/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2em",
    "& .edit-btn": {
      display: "flex",
      justifyContent: "end",
      flexDirection: "column",
    },
    "& .edit-btn a": {
      background: "#a6d5faa6",
      color: "#00a0df",
      fontWeight: "505",
      border: "none",
    },
  },

  datesSelector: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: wrap,
    "& .day": {
      padding: "1em",
      minWidth: "150px",
      textAlign: "center",
      fontWeight: "505",
    },
    overflowX: "auto",
  },

  timeslots: {
    display: "flex",
    "& .timeslot": {
      padding: "0.4em 1.3em",
      background: "#add8e6a1",
      color: "#2387c3",
      marginRight: "1em",
      fontWeight: "405",
      fontSize: "0.9em",
      flex: "1 1 0px",
      marginTop: "1em",
      textAlign: "center",
    },
  },
}));

const DateTimeSlots = () => {
  const classes = useStyles();
  const [dates, setDates] = useState([]);

  const [selectedDate, setSelectedDate] = useState("");
  const [timeslots, setTimeSlots] = useState([]);

  const getDates = () => {
    getCall(BASE_URL + "api/appointment/datetimeslots/").then((resp) => {
      if (resp.status == 200) {
        if (resp.data) {
          const dates = resp.data.dates;
          setDates(dates);
        }
      }
    });
  };

  const getDayTimeSlots = () => {
    getCall(BASE_URL + "api/appointment/datetimeslots/", {
      params: {
        date: selectedDate,
      },
    }).then((resp) => {
      if (resp.status == 200) {
        if (resp.data) {
          let timeslots = resp.data.timeslots;
          timeslots = timeslots ? timeslots : [];
          setTimeSlots(timeslots);
          console.log(timeslots);
        }
      }
    });
  };

  useEffect(() => {
    if (selectedDate !== "") {
      getDayTimeSlots();
    }
  }, [selectedDate]);

  useEffect(() => {
    getDates();
  }, [""]);

  return (
    <div>
      <Paper className={classes.root}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h6 className="primary-font-color mt-3 mb-3">Date Wise TimeSlots</h6>
          <div className="edit-btn">
            <a
              className="btn btn-primary btn-sm"
              href="/app/schedules/daytimeslots/"
            >
              DayWise
            </a>
          </div>
        </div>

        <div className={classes.datesSelector}>
          {dates.map((date) => {
            return (
              <div
                className="day"
                style={
                  selectedDate == date
                    ? { background: "#0d6efd", color: "white" }
                    : {}
                }
                onClick={() => setSelectedDate(date)}
              >
                {date}
              </div>
            );
          })}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1em",
          }}
        >
          <h6 className="primary-font-color mt-3 mb-3">TimeSlots</h6>
          <div className="edit-btn">
            <a
              className="btn btn-primary btn-sm"
              href="/app/schedules/datewiseform/"
            >
              Edit
            </a>
          </div>
        </div>
        <div className={classes.timeslots}>
          {timeslots.map((timeslot, index) => {
            return <div className="timeslot">{timeslot.start_time}</div>;
          })}
        </div>
      </Paper>
    </div>
  );
};

export default DateTimeSlots;
