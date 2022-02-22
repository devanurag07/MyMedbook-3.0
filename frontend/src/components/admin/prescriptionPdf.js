import React from "react";
import "../../assets/scss/prescriptionPdf.scss";
import { Preview, print } from "react-html2pdf";
import ReactToPdf from "react-to-pdf";
import { useSelector } from "react-redux";
import { Grid } from "@material-ui/core";
import { jsPDF } from "jspdf";
import { Button } from "reactstrap";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

const PrescriptionPdf = ({ medicine_list_, data, doctor_info, callBack }) => {
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

  console.log(doctorInfo.your_sign);

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
    htmlToImage
      .toBlob(document.getElementById("pdf-doc"))
      .then(function (blob) {
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
  return (
    <Grid
      className="prescription-pdf"
      id="pdf-doc"
      ref={ref}
      style={{ background: "white", padding: "1em" }}
    >
      <Grid item xs={12} className="mymedbook">
        <Grid container>
          <Grid item xs={4}>
            <h5>
              <span className="primary-font-color">www.</span>mymedbook.in
            </h5>
          </Grid>
          <Grid item xs></Grid>
          <Grid
            item
            xs={4}
            style={{
              display: "flex",
              justifyContent: "end",
              flexDirection: "column",
            }}
          >
            <h5 style={{ textAlign: "end" }}>
              <span className="primary-font-color">Time - </span>
              {formatAMPM(new Date())}{" "}
            </h5>
            <h6 style={{ textAlign: "end" }}>
              <span className="primary-font-color">Date - </span>
              {new Date().toLocaleDateString()}
            </h6>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} className="pdf-header" id={"pdf-header"}>
        <div className="clinic-name" id="clinic-name">
          {clinic_name}
        </div>
        <div className="doctor-name">{doctor_name}</div>
        <div className="registration-no">13232442</div>
      </Grid>

      <Grid item xs={12} className="patient-details">
        <h6>TO</h6>
        <h5>{patient_name}</h5>
        <div className="personal-info col-sm-12 row">
          {/* <div className="dob col-sm-6">
            <span>DOB :</span> x.x.2005
          </div>
          <div className="age col-sm-6">
            <span>Age :</span> 34
          </div> */}
          <div className="mobile-no">
            <span>Mobile no :</span> {patient_mobile}
          </div>
        </div>
      </Grid>

      <Grid item xs={12} className="medicine-list-cards">
        <Grid item xs={12}>
          {medicine_list.map((prescription) => {
            const prescription_name = prescription.name
              ? prescription.name
              : prescription.medicine_name;

            const drug_to_taken = prescription.drug_to_taken;
            return (
              <Grid
                item
                sm={12}
                className="row col-sm-12"
                style={{ justifyContent: "space-between", marginTop: "0.8em" }}
              >
                {" "}
                <div className="medicine-name col-sm-5">
                  <span> Medicine NAME</span> : <p>{prescription_name}</p>
                </div>
                <div className="directions_of_intake col-sm-5">
                  <span>Directions of Intake </span> :<p>{drug_to_taken}</p>
                </div>
              </Grid>
            );
          })}
        </Grid>
      </Grid>

      <Grid
        container
        style={{
          marginTop: "2em",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Grid item sm></Grid>
        <Grid item sm style={{ display: "flex", justifyContent: "end" }}>
          <img src={doctorInfo.your_sign} alt="" style={{ width: "200px" }} />
        </Grid>
      </Grid>
      <footer style={{ marginTop: "1em" }}>
        <div className="pdf-footer">{fullAdress}</div>
      </footer>

      <Button
        onClick={printDoc}
        className="btn btn-primary btn-sm"
        style={{ marginTop: "3em" }}
      >
        download
      </Button>
    </Grid>
  );
};

export default PrescriptionPdf;
