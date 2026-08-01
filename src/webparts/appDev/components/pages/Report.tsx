import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
// import { FilterBox } from "../../../../Global/FilterBox";
require("report");

export default class Report extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
      <NewLoader />
      <section
        className="view"
        id="report-page"
        aria-labelledby="staff-title"
      >
        <div className="section-header" style={{ marginBottom: 14 }}>
          <h2 className="section-title" id="staff-title">
            Report
          </h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card accent">
            <div className="stat-label">Total Notice</div>
            <div className="stat-value" id="total-notice"></div>
            <div className="stat-sub">All time</div>
          </div>

          <div className="stat-card accent">
            <div className="stat-label">This Month</div>
            <div className="stat-value" id="this-month"></div>
            <div className="stat-sub">New Notices</div>
          </div>

          <div className="stat-card accent">
            <div className="stat-label">Employees Involved</div>
            <div className="stat-value" id="employees-involved"></div>
            <div className="stat-sub">Unique Employees</div>
          </div>

          <div className="stat-card accent">
            <div className="stat-label">Repeat Offenders</div>
            <div className="stat-value" id="repeat-offenders"></div>
            <div className="stat-sub">2+ Notices</div>
          </div>
        </div>
        <div className="filter-row" role="toolbar">
          {/* Division */}
          <select className="filter-select" id="division-filter" speed-bind-query="Division" speed-operator="Eq">
            <option value="">All Divisions</option>
            <option>Administration</option>
            <option>Finance</option>
            <option>Human Resources</option>
            <option>Operations</option>
            <option>ICT</option>
          </select>

          {/* Severity */}
          <select className="filter-select" id="severity-filter" speed-bind-query="Severity" speed-operator="Eq">
            <option value="">All Severity</option>
            <option value="Extremely Serious">Extremely Serious</option>
            <option value="Serious">Serious</option>
            <option value="Minor">Minor</option>
            <option value="Other">Other</option>
          </select>

          {/* Warning Level */}
          <select className="filter-select" id="warning-level-filter" speed-bind-query="WarningNotice" speed-operator="Eq">
            <option value="">All Warning Levels</option>
            <option value="First">1st Warning</option>
            <option value="Second">2nd Warning</option>
            <option value="Third">3rd Warning</option>
            <option value="Fourth">4th Warning</option>
          </select>

          {/* Status */}
          {/* <select className="filter-select">
            <option value="">All Status</option>
            <option>Pending Review</option>
            <option>Reviewed</option>
            <option>Closed</option>
          </select> */}

          {/* Month */}
          <select className="filter-select" id="month-filter" speed-bind-query="Month" speed-type="Number" speed-operator="Eq">
            <option value="">All Months</option>
            <option value={1}>January</option>
            <option value={2}>February</option>
            <option value={3}>March</option>
            <option value={4}>April</option>
            <option value={5}>May</option>
            <option value={6}>June</option>
            <option value={7}>July</option>
            <option value={8}>August</option>
            <option value={9}>September</option>
            <option value={10}>October</option>
            <option value={11}>November</option>
            <option value={12}>December</option>
          </select>

          {/* <button className="btn btn-sm btn-ghost" id="reset-filters">
            <i className="fa-solid fa-rotate-left"></i>
            Reset
          </button> */}

          <button
            id="exportbtn"
            className="btn btn-sm btn-copper"
            style={{ marginLeft: "auto" }}
          >
            <i className="fa-solid fa-download"></i>
            Export CSV
          </button>
        </div>
        <div className="table-wrap">
          <table aria-label="Speed data">
            <thead>
              <tr>
                <th scope="col">S/N</th>
                <th speed-table-data="Employee" scope="col">
                  Employee
                </th>
                <th speed-table-data="Division" scope="col">
                  Divison
                </th>
                <th speed-table-data="WarningNotice" scope="col">
                  Warning
                </th>
                <th speed-table-data="DateOfViolation" scope="col">
                  Date
                </th>
                <th speed-table-data="Severity" scope="col">
                  Severity
                </th>
                <th speed-table-data="Location" scope="col">
                  Location
                </th>
                {/* <th speed-table-data="ReportedBy" scope="col">
                  Reporter
                </th> */}
                <th speed-table-data="Modified" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody id="speed-data-table" />
          </table>
          
        </div>
        <div style={ {marginTop: "10px"} } id="myrequestpagination" className="pagination" />
      </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadReportComponent();
  }
}
