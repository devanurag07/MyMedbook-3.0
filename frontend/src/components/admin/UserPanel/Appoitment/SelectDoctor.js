import { Button, Grid } from "@mui/material";
import React, { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import { getCall, postCall } from "../../../../helpers/axiosUtils";
import { BASE_URL } from "../../../../helpers/constants";
import { useEffect } from "react";
import { makeStyles } from "@material-ui/styles";

import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import TimePicker from "@mui/lab/TimePicker";
import DateTimePicker from "@mui/lab/DateTimePicker";
import DesktopDatePicker from "@mui/lab/DesktopDatePicker";
import MobileDatePicker from "@mui/lab/MobileDatePicker";

import Box from "@mui/material/Box";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .sidebar": {
      padding: "1em",
      boxShadow: "1px 1px 2px 0px grey",
    },

    "& .font-bold": {
      // fontWeight: "505",
    },
    "& .filter-heading": {
      padding: "0.7em",
      boxShadow: "1px 1px 3px 0px grey",
      fontSize: "1.1em",
      fontWeight: "405",
    },

    "& .filter-date": {
      marginTop: "1em",
      border: "none",
      boxShadow: "1px 1px 2px 0px grey",
      borderRadius: "0.1em",
      padding: "0.7em 1em",
      /* font-weight: 505; */
    },
    "& #gender": {
      border: "none",
      boxShadow: "1px 1px 2px 0px grey",
      borderRadius: "0.1em",
      /* font-weight: 505; */
      fontWeight: "405",
    },

    "& .apply-btn button": {
      width: "100%",
      padding: "0.6em",
      fontFamily: "Poppins",
      fontSize: "0.9em",
    },
  },
  card: {
    padding: "2em",
    boxShadow: "1px 1px 4px 0px grey",
    "& .doctor-img img": {
      width: "100%",
    },
  },
}));

const SelectDoctor = () => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [tags, setTags] = useState([]);

  const classes = useStyles();

  // For Doctor TAG mechanism
  const getTags = () => {
    getCall(BASE_URL + "api/userpanel/get-tags")
      .then((resp) => {
        if (resp.status === 200) {
          let data = resp.data;
          setTags(data.tags);
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  const filterDoctors = () => {
    postCall(BASE_URL + "api/userpanel/filter-doctors/", {
      tags: selectedTags,
    })
      .then((resp) => {
        if (resp.status === 200) {
          let data = resp.data;
          console.log(data);
        }
      })
      .catch((err) => {
        console.log(err.response);
      });
  };

  useEffect(() => {
    getTags();
  }, ["E"]);

  useEffect(() => {
    filterDoctors();
  }, [selectedTags]);

  return (
    <div className={classes.root}>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <h6 className="font-bold filter-heading">Search Filter</h6>

          <div className="sidebar">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DesktopDatePicker
                label="Choose Date"
                inputFormat="MM/dd/yyyy"
                renderInput={(params) => <TextField {...params} size="small" />}
                value={new Date()}
              />
            </LocalizationProvider>

            <div className="gender-select" style={{ marginTop: "2em" }}>
              <h5>Gender</h5>

              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Age"
                size="small"
                value={"male"}
              >
                <MenuItem value={"male"}>Male</MenuItem>
                <MenuItem value={"female"}>Female</MenuItem>
              </Select>
              {/* <select name="gender" id="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select> */}
            </div>

            <div className="select-specialist" style={{ marginTop: "2em" }}>
              <h5>Select Specialist</h5>
              <FormControl component="div">
                <FormGroup aria-label="position">
                  {tags.map((tag_data) => {
                    return (
                      <div className="filter-tag" key={tag_data.id}>
                        <FormControlLabel
                          value={tag_data.tag}
                          control={<Checkbox key={tag_data.id} />}
                          label={tag_data.tag}
                          labelPlacement="end"
                          key={tag_data.id}
                          onChange={(e, checked) => {
                            if (checked) {
                              setSelectedTags([...selectedTags, tag_data]);
                            } else {
                              const newTags = selectedTags.filter(
                                (tag_data_) => tag_data_.id !== tag_data.id
                              );
                              setSelectedTags([...newTags]);
                            }
                            console.log(selectedTags);
                          }}
                        />
                      </div>
                    );
                  })}
                </FormGroup>
              </FormControl>
            </div>

            <div
              className="apply-btn"
              style={{ marginTop: "1em", marginBottom: "1em" }}
            >
              <Button variant="contained" color="primary" size="small">
                Apply Filters
              </Button>
            </div>
          </div>
        </Grid>
        <Grid item xs={9}>
          <div className={classes.card}>
            <Grid container spacing={4}>
              <Grid item sm={3}>
                <div className="doctor-img">
                  <img
                    src="https://familydoctor.org/wp-content/uploads/2018/02/41808433_l.jpg"
                    alt=""
                  />
                </div>
              </Grid>
              <Grid item sm={5}>
                <div className="doctor-desc">
                  <h5>Dr. Anurag Shakya</h5>
                  <p style={{ fontSize: "0.8em", margin: "0" }}>
                    BDS, MDS - Oral & Maxillofacial Surgery
                  </p>
                  <p
                    style={{
                      fontSize: "0.9em",
                      color: "#1360ef",
                      fontWeight: "505",
                    }}
                  >
                    Dentist
                  </p>
                  <div className="address " style={{ display: "flex" }}>
                    <LocationOnIcon style={{ color: "grey" }} />

                    <p
                      style={{ fontSize: "0.8em", margin: "0", color: "grey" }}
                    >
                      ASV Healthcare, Kuvempu Nagar, Mysore
                    </p>
                  </div>
                </div>
              </Grid>
              <Grid
                item
                sm={4}
                style={{
                  display: "flex",
                  padding: "1em",
                  justifyContent: "flex-end",
                  alignItems: "end",
                  flexDirection: "column",
                }}
              >
                <div className="action-btn">
                  <Button variant="contained" color="primary">
                    Book Appoitment
                  </Button>
                </div>
              </Grid>
            </Grid>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default SelectDoctor;
