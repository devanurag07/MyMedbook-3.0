import React from "react";
import { useSelector } from "react-redux";
import { Grid, Button, Typography, Paper } from "@mui/material";
import { makeStyles } from "@material-ui/styles";

import { display } from "@mui/system";
import { jsPDF } from "jspdf";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",

    flexDirection: "column",
    minHeight: "110vh",

    maxWidth: "900px",
    width: "100%",
    "& .upper-section": {
      //   background: "red",
      flex: 2,
    },

    "& .middle-section": {
      flex: 1,
    },

    "& .footer-section": {
      flex: 1,
    },

    "& .bold": {
      fontWeight: "600",
    },

    "& .gray": {
      color: "gray",
    },
  },
}));

const PrescriptionPage = ({ medicine_list_, data, doctor_info, callBack }) => {
  let medicine_list = medicine_list_ ? medicine_list_ : [];
  let callbackFunc = callBack ? callBack : () => {};

  const options = {
    orientation: "landscape",
    unit: "in",
    // format: [4, 2],
    x: 100,
  };

  const ref = React.createRef();

  const patient_name = data.customer_name ? data.customer_name : "Undefined";
  const patient_mobile = data.mobile ? data.mobile : "xxxx.xxxx.xx";

  let doctorInfo = undefined;
  const currentUser = useSelector((state) => state.Auth.user);

  if (doctor_info == undefined) {
    doctorInfo = currentUser;
  } else {
    doctorInfo = doctor_info;
  }

  const clinic_name = doctorInfo.clinic_name;
  const doctor_name = doctorInfo.full_name;

  const address1 = doctorInfo.address_line1 ? doctorInfo.address_line1 : "";
  const address2 = doctorInfo.address_line2 ? doctorInfo.address_line2 : "";

  const fullAdress = address1 + "\n" + address2;

  const formatAMPM = (date) => {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var strTime = hours + ":" + minutes + " " + ampm;
    return strTime;
  };
  const printDoc = () => {
    htmlToImage.toBlob(document.getElementById("page")).then(function (blob) {
      // saveAs(blob, "my-node.pdf");
      const doc = new jsPDF("p", "px", "a4");
      doc.internal.scaleFactor = 10;

      const image = new Image();
      image.src = URL.createObjectURL(blob, { type: "image/png" });
      console.log(URL.createObjectURL(blob, { type: "image/png" }));

      image.onload = (res) => {
        const width = image.width;
        const height = image.height;
        doc.internal.pageSize.width = 2 * width;
        doc.internal.pageSize.height = 2 * height;

        blob.arrayBuffer().then((resp) => {
          const uintbuffer = new Uint8Array(resp);
          doc.addImage(
            uintbuffer,
            "jpeg",
            0,
            0,
            2 * width,
            2 * height,
            "afs",
            "NONE"
          );
          doc.save(`prescription-${patient_name}.pdf`);
          callbackFunc();
        });
      };

      // saveAs(blob, "image.png");
    });

    // htmlToImage.toCanvas(document.getElementById("pdf-doc")).then((canvas) => {
    //   var imgData = canvas.toDataURL("image/jpeg", 1.0);
    //   var pdf = new jsPDF();

    //   pdf.addImage(imgData, "JPEG", -5, 0);
    //   pdf.save("download.pdf");
    // });
  };

  console.log(medicine_list);
  console.log(doctorInfo);
  console.log(data);
  const classes = useStyles();
  return (
    <div
      style={{ display: "flex", justifyContent: "center", padding: "3em" }}
      className="m-10"
      id="page"
    >
      <div className={classes.root}>
        <div className="upper-section">
          <Grid container>
            {/* Patient Section */}
            <Grid item xs={6}>
              <div className="logo">
                <img src="/img/logo.png" alt="" />
                <div className="logo-text">
                  <h3>
                    <span className="fw-thin" style={{ color: "#3b51a9" }}>
                      My
                    </span>
                    <span className="fw-bold " style={{ color: "#27b1ff" }}>
                      Medbook
                    </span>
                  </h3>
                </div>
              </div>

              <div className="patient-details mt-9">
                <h5 className="fw-thin text-uppercase">Patient Details</h5>
                <div className="patient-name mt-2">{patient_name}</div>
                {/* <div className="patient-addr" style={{ color: "gray" }}>
                  #20, 8th Main, 5th Cross, 7425631 Hanumantha Nagara, Bangalore
                  - 541102.
                </div> */}
                <div className="email gray mt-1">{data.username}</div>
                <div className="mobile gray mt-1">{patient_mobile}</div>
              </div>
            </Grid>
            {/* Doctor Section */}
            <Grid
              item
              xs={6}
              style={{
                textAlign: "end",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Grid item sm={8}>
                <div className="clinic-name bold">{clinic_name}</div>
                <div className="doctor-name ">{doctor_name}</div>
                <div className="doctor-addr gray">{fullAdress}</div>
                {/* Contact links */}
                <div className="doctor-email gray" style={{ marginTop: "1em" }}>
                  {doctorInfo.email}
                </div>
                <div className="doctor-mobile gray">{doctorInfo.mobile}</div>
                {/* Invoice Details */}
                <h3 style={{ fontWeight: 500 }} className="mt-4">
                  Prescription
                </h3>
                <div className="date-div">
                  <h6 className="bold">Date</h6>
                  <div className="date">01-01-2022</div>
                </div>
              </Grid>
            </Grid>
          </Grid>
        </div>
        <div className="middle-section">
          <Grid container>
            <Grid item sm={5}>
              <h6 style={{ color: "#27b1ff" }}>Description</h6>
            </Grid>

            <Grid item sm={2}>
              <h6 style={{ color: "#27b1ff" }}>Quantity</h6>
            </Grid>

            <Grid item sm={5}>
              <h6 style={{ textAlign: "end", color: "#27b1ff" }}>
                Direction Of Intake
              </h6>
            </Grid>
          </Grid>

          {medicine_list.map((medicine) => {
            return (
              <Grid container>
                <Grid item sm={5}>
                  <div style={{ fontSize: "1rem" }}>
                    {medicine.medicine_name}
                  </div>
                </Grid>
                <Grid item sm={2}>
                  <div style={{ textAlign: "center", fontSize: "1rem" }}>
                    {medicine.drug_to_taken}
                  </div>
                </Grid>
                <Grid item sm={5}>
                  <div style={{ textAlign: "end", fontSize: "1rem" }}>
                    {medicine.note}
                  </div>
                </Grid>
              </Grid>
            );
          })}
        </div>
        <div className="footer-section mt-3">
          <h6>OTHER INFORMATION</h6>
          <div className="clinic-addr mt-2 gray">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusantium
            vero corrupti odit eaque aspernatur, enim ratione tenetur illum
            inventore nam aliquam possimus necessitatibus quas fugiat
            consequuntur nisi soluta nihil recusandae dignissimos. Eligendi
            maiores voluptates perferendis quia minus odio totam. Voluptatem.
          </div>
          <Grid container className="mt-8" style={{ marginTop: "3em" }}>
            <Grid
              item
              xs={6}
              style={{
                display: "flex",
                // justifyContent: "center",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <h5 className="gray bold">Thank You for Trusting Us</h5>
            </Grid>
            <Grid item xs={6}>
              {" "}
              <Grid item sm style={{ display: "flex", justifyContent: "end" }}>
                <div className="signature">
                  <img
                    src={doctorInfo.your_sign}
                    alt=""
                    style={{ width: "200px" }}
                  />
                  <p className="gray" style={{ textAlign: "center" }}>
                    Dr. {doctor_name}
                  </p>
                </div>
              </Grid>
            </Grid>
          </Grid>

          <Button
            onClick={printDoc}
            className="btn btn-primary btn-sm"
            style={{ marginTop: "3em" }}
          >
            download
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionPage;
