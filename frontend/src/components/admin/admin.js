import React, { Component, Suspense } from "react";
import { connect } from "react-redux";
import { Route, Switch, Redirect } from "react-router-dom";
import Queue from "./queue";
import Dashboard from "./dashboard";
import SendPrescription from "./sendprescription";
import Subscription from "./subscription";
import Profile from "./profile";
import Users from "./users";
import Prescription from "./prescription";
import DocumentVerifications from "./document-verifications";
import Support from "./support";
import Membership from "./membership";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";

import addQueue from "./addQueue";
import SendPrescriptionUpdated from "./sendPrescriptionUpdated";
import PrescriptionPdf from "./prescriptionPdf";
import Doctors from "./AdminPanel/Doctors";
import Customers from "./customers";
import Doctor from "./AdminPanel/Doctor";
import PatientDetails from "./AdminPanel/PatientDetails";
import PatientPrescDetail from "./AdminPanel/PatientPrescDetail";
import MyRecords from "./UserPanel/MyRecords";
import GlobalCustomers from "./AdminPanel/GlobalCustomers";
import Access from "./UserPanel/Access";
import Review from "./UserPanel/Review";
import Home from "./UserPanel/Home";
import AskAccessPermission from "./AdminPanel/AskAccessPermission";
import VerifyAccessOtp from "./AdminPanel/VerifyAccessOtp";
import InvoicePage from "./DoctorPanel/BillingPages/InvoicePage";
import ScheduleDayWiseForm from "./DoctorPanel/Appoitment/Schedules/ScheduleDayWiseForm";
import ScheduleDateWiseForm from "./DoctorPanel/Appoitment/Schedules/ScheduleDateWiseForm";
import ScheduleRouter from "./DoctorPanel/Appoitment/Schedules/ScheduleRouter";
import DayTimeSlots from "./DoctorPanel/Appoitment/Schedules/DayTimeSlots";
import DateTimeSlots from "./DoctorPanel/Appoitment/Schedules/DateTimeSlots";
import Billing from "./DoctorPanel/Appoitment/Billing/Billing";
import SelectDoctor from "./UserPanel/Appoitment/SelectDoctor";
import BookAppoinment from "./UserPanel/Appoitment/BookAppoinment";

const loading = () => <div></div>;
class Admin extends Component {
  /**
   * Returns the layout component based on different properties
   * @param {*} props
   */
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <React.Fragment>
        {/* <Breadcrumb>
                    {this.props.bdata.map((bItem, i) =>
                        <BreadcrumbItem  key={i} active={(this.props.bdata.length -1) == i ? true : false}><a href="#" className="active">{bItem.label}</a></BreadcrumbItem>
                    )}
                </Breadcrumb> */}
        <Switch>
          <Route exact path="/pdf" component={PrescriptionPdf} />

          <Route
            exact
            path="/app"
            render={() => <Redirect to="/app/dashboard" />}
          />
          <Route exact path="/app/dashboard" component={Dashboard} />
          <Route
            exact
            path="/app/send-prescription/:id"
            component={SendPrescription}
          />
          <Route
            exact
            path="/app/send-prescription-updated/:id"
            component={SendPrescriptionUpdated}
          />
          <Route exact path="/app/queue" component={Queue} />
          <Route exact path="/app/addQueue" component={addQueue} />
          <Route exact path="/app/profile" component={Profile} />
          <Route exact path="/app/customer" component={Customers} />
          <Route exact path="/app/users" component={Users} />
          <Route exact path="/app/prescriptions" component={Prescription} />
          <Route exact path="/app/subscription" component={Subscription} />
          <Route exact path="/app/support" component={Support} />
          <Route exact path="/app/membership" component={Membership} />

          {/* New Admin Pages */}
          <Route exact path="/app/doctors" component={Doctors} />
          <Route exact path="/app/customers" component={GlobalCustomers} />
          <Route exact path="/app/doctor/:id" component={Doctor} />
          <Route exact path="/app/patient/:id" component={PatientDetails} />
          <Route
            exact
            path="/app/patient/presc/:id"
            component={PatientPrescDetail}
          />

          {/*New User Panel Pages*/}
          <Route exact path="/app/myrecords" component={MyRecords} />
          <Route exact path="/app/access" component={Access} />
          <Route
            exact
            path="/app/askaccess/:id"
            component={AskAccessPermission}
          />
          <Route
            exact
            path="/app/verifyaccess/:id"
            component={VerifyAccessOtp}
          />
          <Route exact path="/app/review/:id" component={Review} />
          <Route exact path="/app/home/" component={Home} />

          <Route
            exact
            path="/app/document-verification"
            component={DocumentVerifications}
          />

          {/* Appoitment */}

          {/* <Route exact path="/app/schedules" component={ScheduleDayWiseForm} /> */}
          <Route exact path="/app/schedules" component={DayTimeSlots} />
          <Route
            exact
            path="/app/schedules/daywiseform"
            component={ScheduleDayWiseForm}
          />

          <Route
            exact
            path="/app/schedules/datewiseform/"
            component={ScheduleDateWiseForm}
          />

          <Route
            exact
            path="/app/schedules/daytimeslots/"
            component={DayTimeSlots}
          />

          <Route
            exact
            path="/app/schedules/datetimeslots/"
            component={DateTimeSlots}
          />

          <Route exact path="/app/billing/" component={Billing} />

          {/* Appoitment  User */}
          <Route
            exact
            path="/app/appointment/doctors/"
            component={SelectDoctor}
          />

          <Route
            exact
            path="/app/bookappointment/"
            component={BookAppoinment}
          />
        </Switch>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.Auth.user,
    bdata: state.Auth.bdata,
  };
};
//export default Admin;
export default connect(mapStateToProps)(Admin);
