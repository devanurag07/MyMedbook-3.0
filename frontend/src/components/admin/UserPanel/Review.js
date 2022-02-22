import { Grid, Input, Button, TextField } from "@material-ui/core";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../helpers/constants";

const Review = (props) => {
  let doctor_pk = props.match.params.id;

  doctor_pk = doctor_pk ? doctor_pk : "0";

  const [doctorName, setDoctorName] = useState("");

  const [reviewText, setReviewText] = useState("");

  const onInputChange = (e) => {
    setReviewText(e.target.value);
  };

  const getDoctorName = () => {
    axios
      .get(BASE_URL + `api/userpanel/${doctor_pk}/doctor-name`)
      .then((resp) => {
        setDoctorName(resp.data);
      });
  };

  useEffect(() => {
    getDoctorName();
  }, ["title"]);

  const submitHandler = () => {
    axios
      .post(BASE_URL + `api/userpanel/${doctor_pk}/send-review/`, {
        review_text: reviewText,
      })
      .then((resp) => {
        // setDoctorName(resp.data);
        if (resp.status == 200) {
          toast("Review Sent");
          setReviewText("");
        }
        console.log(resp.data);
      });
  };

  return (
    <div>
      <h4 className="primary-font-color">Review</h4>
      <p>Your review will be sent directly to doctor </p>

      <Grid container>
        <Grid item sm>
          <h4> Dr. {doctorName}</h4>
        </Grid>
        <Grid item sm></Grid>
        <Grid item sm justifyContent="flex-end">
          {new Date().toJSON().split("T")[0]}
        </Grid>
      </Grid>
      <Grid container style={{ marginTop: "2em" }}>
        <Grid item sm={12}>
          <TextField
            multiline
            rows={10}
            fullWidth
            variant="outlined"
            onChange={onInputChange}
            value={reviewText}
          />
        </Grid>
      </Grid>
      <Grid container style={{ marginTop: "2em" }}>
        <Grid item sm></Grid>
        {/* <Grid item sm={4}> */}
        <Button color="primary" variant="contained" onClick={submitHandler}>
          Submit
        </Button>
        {/* </Grid> */}
      </Grid>
    </div>
  );
};

export default Review;
