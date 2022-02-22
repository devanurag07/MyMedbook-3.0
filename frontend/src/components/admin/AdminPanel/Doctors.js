import React, { useRef } from "react";
import SmartTable from "../../../ui/smart-table";

const Doctors = (props) => {
  const recordPerPage = 15;
  const defaultParam = {
    status: 1,
  };

  const actionHandler = (param) => {
    console.log(param);
    if (param.label === "View") {
      props.history.push(`/app/doctor/${param.rowData.id}`);
    } else if (param.label === "Delete") {
      this.setState((state) => ({
        isDeleteModalOpen: !state.isDeleteModalOpen,
        formValues: param.rowData,
      }));
    } else {
      this.setState((state) => ({
        isModalOpen: !state.isModalOpen,
        formValues: param.rowData,
      }));
    }
  };
  const columns = [
    {
      dataField: "full_name",
      label: "Doctor Name",
      type: "text",
      styles: {
        width: "20%",
      },
    },
    {
      dataField: "clinic_name",
      label: "Clinic Name",
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
        width: "10%",
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
      dataField: "subCategory",
      styles: {
        width: "9%",
      },
      label: "View All Details",
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
      <SmartTable
        ref={smartTable}
        fetchUrl="api/users/get-doctors/"
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

export default Doctors;
