import React, { useState } from "react";
import { Paper, Grid, Typography, Checkbox, IconButton } from "@mui/material";
import { makeStyles } from "@material-ui/styles";

import { postCall } from "../../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../../helpers/constants";
import { toast } from "react-toastify";

import AddCircleIcon from "@mui/icons-material/AddCircle";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2em",
    "& .day": {
      border: "1px solid black",
      padding: "0.5em 1.4em",
      fontSize: "0.7em",
      fontWeight: "500",
      borderRadius: "0.2em",
    },
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
    "& .selected": {
      color: "white",
      background: "#23cb11",
      border: "1px solid #23cb11",
    },

    "& .primary-color": {
      color: "#0070ff",
    },
  },
  daysContainer: {
    display: "flex",
    justifyContent: "space-between",
  },

  addTimeSlotsForm: {
    padding: "3em",
  },
  timeSlotRow: {
    display: "flex",
  },
  RemBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "end",
  },
}));

const ScheduleDayWiseForm = () => {
  const classes = useStyles();
  let idx = 1;
  const [timeslotsData, setTimeSlotRows] = useState([
    {
      startTime: "",
      endTime: "",
      idx: 0,
    },
  ]);

  const [daysSelected, setDaysSelected] = useState({});
  const [deletePrev, setDeletePrev] = useState(false);
  const [counter, setCounter] = useState(1);

  const addRow = () => {
    setCounter(counter + 1);

    setTimeSlotRows([
      ...timeslotsData,
      {
        startTime: "",
        endTime: "",
        idx: counter,
      },
    ]);
  };

  const remRow = (idx) => {
    const newState = [];
    console.log(idx);

    for (let timedata of timeslotsData) {
      if (timedata.idx === idx) {
        continue;
      }
      newState.push(timedata);
    }
    setTimeSlotRows([...newState]);
    console.log(newState);
    console.log(timeslotsData);
  };

  const inputHandler = (e, idx) => {
    const newState = [];
    for (let timedata of timeslotsData) {
      if (timedata.idx == idx) {
        const inputName = e.target.name;
        const inputValue = e.target.value;

        newState.push({
          ...timedata,
          [inputName]: inputValue,
        });
        continue;
      }

      newState.push(timedata);
    }
    setTimeSlotRows([...newState]);
  };

  const selectDay = (dayName) => {
    const daySelected = daysSelected[dayName];
    if (daysSelected === undefined) {
      setDaysSelected({ ...daysSelected, [dayName]: true });
    } else {
      setDaysSelected({ ...daysSelected, [dayName]: !daySelected });
    }
  };

  const submitHandler = () => {
    const days = [];
    for (let day in daysSelected) {
      if (daysSelected[day] == true) {
        days.push(day);
      }
    }

    for (let timeslot of timeslotsData) {
      const endTime = timeslot.endTime;
      const startTime = timeslot.startTime;

      if (endTime == "" || startTime == "") {
        toast.error("Please fill all timeslots");
        return;
      }
    }

    const formData = {
      timeslots: timeslotsData,
      days: days,
      deletePrev: deletePrev,
    };
    console.log(formData);
    postCall(`${BASE_URL}api/appointment/daytimeslots/`, formData)
      .then((resp) => {
        if (resp.status == 200) {
          toast.success(resp.data.msg);
        }
        console.log(resp.data);
      })
      .catch((err) => {
        console.log(err.response.data);
      });
  };

  return (
    <div>
      <Paper className={classes.root}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2em",
          }}
        >
          <h6 className="primary-color mt-3 mb-3">
            Add Schedule Timings - Day Wise
          </h6>
          <div className="edit-btn">
            <a
              className="btn btn-primary btn-sm"
              href="/app/schedules/daytimeslots/"
            >
              TimeSlots
            </a>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2em",
          }}
        >
          <h6 className="primary-color mt-3 mb-3">Select Days</h6>
          <h6>
            Delete Previous{" "}
            <Checkbox
              checked={deletePrev}
              onChange={(e) => setDeletePrev(e.target.checked)}
            />
          </h6>
        </div>

        <Grid container className={classes.daysContainer}>
          <div
            className={`day ${
              daysSelected["Monday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Monday")}
          >
            Monday
          </div>
          <div
            className={`day ${
              daysSelected["Tuesday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Tuesday")}
          >
            Tuesday
          </div>
          <div
            className={`day ${
              daysSelected["Wednesday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Wednesday")}
          >
            Wednesday
          </div>
          <div
            className={`day ${
              daysSelected["Thursday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Thursday")}
          >
            Thursday
          </div>
          <div
            className={`day ${
              daysSelected["Friday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Friday")}
          >
            Friday
          </div>
          <div
            className={`day ${
              daysSelected["Saturday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Saturday")}
          >
            Saturday
          </div>
          <div
            className={`day ${
              daysSelected["Sunday"] == true ? "selected" : ""
            }`}
            onClick={(e) => selectDay("Sunday")}
          >
            Sunday
          </div>
        </Grid>

        <div className={classes.addTimeSlotsForm}>
          <h6 className="primary-color">Add Time Slots</h6>

          {timeslotsData.map((timeslot) => {
            return (
              <div className={classes.timeSlotRow}>
                <div className="start-time" style={{ width: "50%" }}>
                  <label htmlFor="start-time">Start Time</label>
                  <br />
                  <input
                    type="time"
                    id="start-time"
                    name="startTime"
                    style={{ width: "70%" }}
                    value={timeslot.startTime}
                    onChange={(e) => {
                      return inputHandler(e, timeslot.idx);
                    }}
                  />
                </div>
                <div className="end-time" style={{ width: "50%" }}>
                  <label htmlFor="end-time">End Time</label>
                  <br />

                  <input
                    type="time"
                    id="end-time"
                    style={{ width: "70%" }}
                    name="endTime"
                    value={timeslot.endTime}
                    onChange={(e) => {
                      return inputHandler(e, timeslot.idx);
                    }}
                  />
                </div>
                <div className={classes.RemBtnContainer}>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remRow(timeslot.idx)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <div className="btnContainer">
            {/* <button className="btn btn-primary btn-sm mt-3" onClick={addRow}>
              Add row
            </button> */}

            <IconButton onClick={addRow} style={{ padding: "10px 0px" }}>
              <AddCircleIcon color="primary" fontSize="large" />
              <div
                className="label"
                style={{ fontSize: "16px", fontWeight: "505" }}
              >
                Add Row
              </div>
            </IconButton>
          </div>

          <div className="btnContainer" style={{ marginTop: "3em" }}>
            <button
              className="btn btn-primary btn-sm mt-7"
              onClick={submitHandler}
            >
              Submit
            </button>
          </div>
        </div>
      </Paper>
    </div>
  );
};

export default ScheduleDayWiseForm;
