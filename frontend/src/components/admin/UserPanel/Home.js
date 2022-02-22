import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { BASE_URL } from "../../../helpers/constants";
import MyRecords, { PrevRecordItem } from "./MyRecords";
import SmartTable from "../../../ui/smart-table";
const Home = (props) => {
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

  const recordPerPage = 15;
  const defaultParam = {
    status: 1,
  };

  const [smartTable, setSmartTable] = useState(null);

  const actionHandler = (param) => {
    const requestId = param.rowData.id;

    if (param.label === "Accept") {
      axios
        .post(BASE_URL + `api/userpanel/${requestId}/accept-request/`)
        .then((resp) => {
          smartTable.fetchRecords(0, recordPerPage);
        });
    } else if (param.label === "Delete") {
      axios
        .post(BASE_URL + `api/userpanel/${requestId}/deny-request/`)
        .then((resp) => {
          smartTable.fetchRecords(0, recordPerPage);
        });
    } else if (param.label == "Review") {
      console.log(param);
      props.history.push(`/app/review/${param.rowData.doctor_id}`);
    }
    // Report Review Action
  };
  const columns = [
    {
      dataField: "doctor_name",
      label: "Doctor Name",
      type: "text",
      styles: {
        width: "20%",
      },
    },
    {
      dataField: "status",
      label: "Status",
      type: "text",
      styles: {
        width: "20%",
      },
    },
    {
      dataField: "last_updated",
      label: "Last Updated",
      type: "text",
      styles: {
        width: "10%",
      },
    },

    {
      dataField: "subCategory",
      styles: {
        width: "10%",
      },
      label: "Actions",
      actions: [
        {
          label: "Accept",
          className: "btn btn-success btn-sm me-2",
          icon: true,
          iconClass: "fa fa-check",
        },
        {
          label: "Delete",
          className: "btn btn-danger btn-sm me-2",
          icon: true,
          iconClass: "fa fa-times-circle",
        },
      ],
      type: "action",
    },
  ];

  return (
    <>
      <div>
        <div className="row" style={{ marginBottom: "1em", marginTop: "2em" }}>
          <h5 className="primary-font-color col-sm-6">
            Details of previous visits
          </h5>

          <div
            className="col-sm-6"
            style={{ display: "flex", justifyContent: "flex-end" }}
          >
            <h6
              className="primary-font-color col-sm-6"
              style={{ textAlign: "end" }}
            >
              <a href="/app/myrecords">View All </a>{" "}
            </h6>
          </div>
        </div>
        {records
          .slice(0, 3)
          .reverse()
          .map((prescription) => {
            return <PrevRecordItem prescription={prescription} />;
          })}
      </div>
      <div className="access-container">
        <div>
          {" "}
          <h5
            style={{ fontWeight: "505", marginTop: "1em" }}
            className="primary-font-color"
          >
            Access Request
          </h5>
          <p className="primary-font-color"></p>
          <SmartTable
            // ref={smartTable}
            ref={(instance) => {
              setSmartTable(instance);
            }}
            fetchUrl="api/userpanel/get-myrequests"
            defaultParam={defaultParam}
            actionHandler={actionHandler}
            recordPerPage={recordPerPage}
            cols={columns}
            // By -ANurag
            rowPreCls="queue"
            pagination={false}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
