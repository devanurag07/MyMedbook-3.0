import React, { useRef } from "react";
import SmartTable from "../../../ui/smart-table";

const GlobalCustomers = (props) => {
  const recordPerPage = 15;
  const defaultParam = {
    status: 1,
  };

  const actionHandler = (param) => {
    console.log(param);
    if (param.label === "View") {
      props.history.push(`/app/patient/${param.rowData.id}`);
    }
  };

  const columns = [
    {
      dataField: "full_name",
      label: "Customer Name",
      type: "text",
      styles: {
        width: "20%",
      },
    },
    {
      dataField: "email",
      label: "Email",
      type: "text",
      styles: {
        width: "20%",
      },
    },
    {
      dataField: "mobile",
      label: "Mobile",
      type: "text",
      styles: {
        width: "10%",
      },
    },

    {
      dataField: "total_visits",
      label: "Total Visits",
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
          label: "View",
          className: "btn btn-success btn-sm me-2",
          icon: false,
        },
      ],
      type: "action",
    },
  ];

  const smartTable = useRef(null);

  return (
    <div style={{ marginTop: "4em" }}>
      {" "}
      <SmartTable
        ref={smartTable}
        fetchUrl="api/admin_m/get-customers/"
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

export default GlobalCustomers;
