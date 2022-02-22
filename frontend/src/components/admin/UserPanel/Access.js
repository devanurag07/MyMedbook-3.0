import React, { useRef, useState } from "react";
import SmartTable from "../../../ui/smart-table";
import axios from "axios";
import { BASE_URL } from "../../../helpers/constants";

const Access = (props) => {
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
        justifyContent: "center",
      },
      label: "Report",
      actions: [
        {
          label: "Report",
          className: "btn btn-outline btn-sm me-2",
          icon: true,
          iconClass: "fa fa-envelope-o",
        },
      ],
      type: "action",
    },

    {
      dataField: "subCategory",
      styles: {
        width: "10%",
        // display: "flex",
        justifyContent: "center",
      },
      label: "Review",
      actions: [
        {
          label: "Review",
          className: "btn btn-primary btn-sm me-2",
          icon: true,
          iconClass: "fa fa-pencil-square-o",
        },
      ],
      type: "action",
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
    <div>
      {" "}
      <h5 style={{ fontWeight: "505" }} className="primary-font-color">
        Access
      </h5>
      <p className="primary-font-color">
        Here are the list of doctors who have access to your medical data{" "}
      </p>
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
      />
    </div>
  );
};

export default Access;
