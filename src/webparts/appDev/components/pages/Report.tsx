import * as React from "react";
import { NewLoader } from "../../../../Global/NewLoader";
// import { NewLoader } from "../../../../Global/NewLoader";
// import { FilterBox } from "../../../../Global/FilterBox";
require("report");

export default class Report extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <div className="hidden" id="report-page">
          <div className="AdrPage">
            <section className="AdrStatsGrid four-column-grid">
              <article>
                <span>Total Requests</span>
                <strong id="totalRequest"></strong>
                <p>All saved and submitted requests</p>
              </article>
              <article>
                <span>Pending Approval</span>
                <strong id="pendingRequest"></strong>
                <p>Awaiting approvals</p>
              </article>
              <article>
                <span>Closed</span>
                <strong id="completedRequest"></strong>
                <p>Fully signed off / Closed</p>
              </article>
              <article>
                <span>Overdue</span>
                <strong id="overdueRequest"></strong>
                <p>Requests past their due date</p>
              </article>
            </section>

            <section className="AdrPanel">
              <div className="AdrPanelHeader">
                <div>
                  <h3>Recent Requests</h3>
                  <p>Most recently submitted requests across all divisions</p>
                </div>
                {/* Live filtered count – always visible */}
                <div className="AdrFilterCount" id="filterResultCount">
                  Showing <strong id="filteredCount">0</strong> of{" "}
                  <strong id="totalCount">0</strong>
                </div>
              </div>

              <div className="export-button-container">
                <button
                  className="AdrPrimaryButton compact-export"
                  type="button"
                  id="exportToExcel"
                >
                  <span>⇩</span> Export
                </button>
              </div>

              <div
                className="AdrReportControls filter-container"
                role="tabpanel"
              >
                <div className="AdrFilterBar">
                  {/* Row 1 – selects */}
                  <label className="AdrField compact">
                    <span>Workflow</span>
                    <select id="status-filter">
                      <option value="">All</option>
                      <option value="Application Submitted">
                        Application Submitted
                      </option>
                      <option value="HOD Approved">HOD Approved</option>
                      <option value="QHSE Reviewed">QHSE Reviewed</option>
                      <option value="Developer assigned">
                        Developer assigned
                      </option>
                      <option value="Development In Progress">
                        Development In Progress
                      </option>
                      <option value="Development Completed">
                        Development Completed
                      </option>
                      <option value="UAT Pending">UAT Assigned</option>
                      <option value="UAT In Progress">UAT In Progress</option>
                      <option value="UAT Completed">UAT Completed</option>
                      <option value="Signed Off">Signed Off</option>
                    </select>
                  </label>

                  <label className="AdrField compact">
                    <span>Division / Unit</span>
                    <select id="division-filter">
                      <option value="">All</option>
                      {/* populated dynamically in JS */}
                    </select>
                  </label>

                  <label className="AdrField compact">
                    <span>Overdue</span>
                    <select id="overdue-filter">
                      <option value="">All</option>
                      <option value="On Track">On Track</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </label>

                  {/* Date range – two compact inputs */}
                  <label className="AdrField compact date-range">
                    <span>From</span>
                    <input type="date" id="requeststrDate" />
                  </label>
                  <label className="AdrField compact date-range">
                    <span>To</span>
                    <input type="date" id="requestendDate" />
                  </label>

                  <label className="AdrField compact search-field">
                    <span>Requestor / Ref ID</span>
                    <input type="text" placeholder="Search…" id="searchInput" />
                  </label>
                </div>
              </div>

              <div className="table-wrap">
                <div className="norequest hidden text-center py-6 text-gray-500 text-sm sm:text-base">
                  No entries at the moment…
                </div>
                <div className="AdrTableShell hidden" id="tasktable">
                  <table className="AdrTable">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th speed-table-data="WorkflowRequestID">Ref ID</th>
                        <th speed-table-data="ProcessName">Process Name</th>
                        <th speed-table-data="Title">Requestor</th>
                        <th speed-table-data="ModificationType">Type</th>
                        <th speed-table-data="DetailedStatus">Workflow</th>
                        <th speed-table-data="Due_Overdue">Overdue Status</th>
                        <th speed-table-data="Modified">Action</th>
                      </tr>
                    </thead>
                    <tbody id="speed-data-table"></tbody>
                  </table>
                </div>
                <div id="myrequestpagination" className="pagination hidden" />
              </div>
            </section>
          </div>
        </div>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadReportComponent();
  }
}
