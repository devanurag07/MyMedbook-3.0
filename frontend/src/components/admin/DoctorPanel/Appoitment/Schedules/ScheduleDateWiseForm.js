import React, { useState } from "react";
import { Paper, Grid, Typography, Checkbox } from "@mui/material";
import { IconButton } from "@material-ui/core";
import { postCall } from "../../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../../helpers/constants";
import { toast } from "react-toastify";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "2em",

    "& .edit-btn a": {
      background: "#a6d5faa6",
      color: "#00a0df",
      fontWeight: "505",
      border: "none",
    },
    "& .day": {
      border: "1px solid black",
      padding: "0.5em 1.4em",
      fontSize: "0.7em",
      fontWeight: "500",
      borderRadius: "0.2em",
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
    justifyContent: "space-between",
  },
  RemBtnContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "end",
  },
}));

const ScheduleDateWiseForm = () => {
  const classes = useStyles();
  let idx = 1;
  const [timeslotsData, setTimeSlotRows] = useState([
    {
      startTime: "",
      endTime: "",
      idx: 0,
    },
  ]);

  const [timespan, setTimeSpan] = useState({});

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

  const submitHandler = () => {
    const days = [];

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
      timespan: timespan,
      deletePrev: deletePrev,
    };

    console.log(formData);
    postCall(`${BASE_URL}api/appointment/datetimeslots/`, formData)
      .then((resp) => {
        if (resp.status == 200) {
          toast.success(resp.data.msg);
        }
        console.log(resp.data);
      })
      .catch((err) => {
        // console.log(err.response.data);

        if (err.response.status == 400) {
          toast.error(err.response.data.msg);
        }
        console.log(err);
        console.log(err.response);
      });
  };

  const handleTimespan = (e) => {
    const inputName = e.target.name;
    const inputValue = e.target.value;

    setTimeSpan({ ...timespan, [inputName]: inputValue });
  };

  return (
    <div>
      <Paper className={classes.root}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <h6 className="primary-color mt-3 mb-3">
            Add Schedule Timings - Day Wise
          </h6>
          <div className="edit-btn">
            <a
              className="btn btn-primary btn-sm"
              href="/app/schedules/datetimeslots/"
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
          <h6>
            Delete Previous{" "}
            <Checkbox
              checked={deletePrev}
              onChange={(e) => setDeletePrev(e.target.checked)}
            />
          </h6>
        </div>

        <div className={classes.addTimeSlotsForm}>
          <Grid container>
            <Grid item sm={11}>
              <div className={classes.timeSlotRow}>
                <div className="start-time" style={{ width: "50%" }}>
                  <label htmlFor="start-time">From Date</label>
                  <br />
                  <input
                    type="date"
                    id="from-time"
                    name="fromDate"
                    onChange={handleTimespan}
                    style={{ width: "80%" }}
                    onChange={handleTimespan}
                  />
                </div>
                <div className="to-date" style={{ width: "50%" }}>
                  <label htmlFor="to-date">To Date</label>
                  <br />

                  <input
                    type="date"
                    id="to-date"
                    style={{ width: "80%" }}
                    name="toDate"
                    onChange={handleTimespan}
                    // placeholder="dd/mm/yy"
                  />
                </div>
                <div className={classes.RemBtnContainer}></div>
              </div>
            </Grid>
          </Grid>

          <div className="spacing" style={{ margin: "3em" }}></div>
          <h6 className="primary-color">Add Time Slots</h6>

          {timeslotsData.map((timeslot) => {
            return (
              <div className="timeslotRowContainer">
                <Grid container>
                  <Grid item sm={11}>
                    <div className={classes.timeSlotRow}>
                      <div className="start-time" style={{ width: "50%" }}>
                        <label htmlFor="start-time">Start Time</label>
                        <br />
                        <input
                          type="time"
                          id="start-time"
                          name="startTime"
                          style={{ width: "80%" }}
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
                          name="endTime"
                          style={{ width: "80%" }}
                          value={timeslot.endTime}
                          onChange={(e) => {
                            return inputHandler(e, timeslot.idx);
                          }}
                        />
                      </div>
                    </div>
                  </Grid>
                  <Grid
                    item
                    sm={1}
                    style={{
                      display: "flex",
                      justifyContent: "start",
                      alignItems: "end",
                    }}
                  >
                    {/* <div className={classes.RemBtnContainer}>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => remRow(timeslot.idx)}
                      >
                        Remove
                      </button> */}

                    <div className="buttonContainer">
                      <IconButton
                        onClick={() => remRow(timeslot.idx)}
                        style={{ padding: "0" }}
                      >
                        <DeleteIcon size="larger" color="error" />
                      </IconButton>
                    </div>
                  </Grid>
                </Grid>
              </div>
            );
          })}

          <div className="btnContainer">
            {/* <button
              className="btn btn-primary btn-sm mt-3"
              onClick={addRow}
              style={{ borderRadius: "50%", height: "100px", width: "100px" }}
            >
              <AddIcon />
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

export default ScheduleDateWiseForm;
