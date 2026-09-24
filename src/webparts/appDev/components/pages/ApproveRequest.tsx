import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
import { NewLoader } from "../../../../Global/NewLoader";

require("approverequest");
require("peoplepicker");

export default class ApproveRequest extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        <NewLoader />
        <section className="hidden" id="approval-page">
          <div className="AdrPage">
            <div className="page-heading">
              <div>
                <p className="eyebrow">Reference ID: <span speed-bind="WorkflowRequestID" /></p>
                {/* <h3>APPROVAL PAGE</h3> */}
              </div>
              <div className="request-type">
                <span className="request-type-label">Request Type</span>
                <span className="badge" speed-bind="RequestType">
                  —
                </span>
                <div id="modificationTypeContainer" />
              </div>
            </div>

            

            <div className="layout">
              <div className="main-column">
                <div id="mainRequestFormWrapper" className="hidden">
                  <section className="card">
                    <div className="card-header">
                      <span className="section-number">1</span>
                      <h3>Process Overview</h3>
                    </div>

                    <div className="fields">
                      <div className="field">
                        <span className="field-label">
                          Process Name
                        </span>
                        <div className="field-value" speed-bind="ProcessName" />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Process Frequency
                        </span>
                        <div
                          className="field-value"
                          speed-bind="Period"
                          id="period"
                        />
                      </div>
                      <div className="field">
                        <span className="field-label">Date Required</span>
                        <div
                          className="field-value"
                          speed-bind="DateRequired"
                        />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Unit/Division Involved
                        </span>
                        <select
                          id="divisionsInvolved"
                          className="js-select2"
                          multiple
                          speed-bind="DivisionsInvolved"
                          speed-bind-class="MainRequest"
                          speed-list-repeat="RSDivisions"
                          speed-no-default="true"
                          style={{ display: "none" }}
                        >
                          <option value="{{Title}}">
                            {"{{"}Title{"}}"}
                          </option>
                        </select>
                        <div className="tags" id="divisionsDisplay" />
                      </div>
                    </div>

                    <div className="subsection">
                      <div className="subsection-label">
                        Step-by-step description of the process
                      </div>
                      <div className="table-wrap">
                        <table
                          className="data-table"
                          id="stepByStepTable"
                          speed-serialno="true"
                          speed-validate-mode="false"
                          speed-bind-table="StepByStepProcess"
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 64 }}>Stage</th>
                              <th speed-array-prop="description">
                                What Happens (describe clearly)
                              </th>
                              <th speed-array-prop="actors">
                                Who Does It / Who Is Involved
                              </th>
                              <th speed-array-prop="template">
                                Email Template
                              </th>
                            </tr>
                          </thead>
                          <tbody id="stepByStepDescription" />
                        </table>
                      </div>
                    </div>

                    <div className="extra-fields">
                      <div className="field">
                        <span className="field-label">
                          Any existing automation?
                        </span>
                        <div className="field-value" speed-bind="ExistingLink" />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Completion Criteria
                        </span>
                        <div
                          className="field-value"
                          speed-bind="CriteriaForCompletion"
                        />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Any Related Process / System
                        </span>
                        <div
                          className="field-value"
                          id="isProcessRelated"
                          speed-bind="IsProcessRelated"
                        />
                        <div id="relatedProcessContainer" />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Supporting Documents / Flowcharts
                        </span>
                        <div
                          speed-file-bind="SupportingDocuments"
                          data-view-only
                        />
                      </div>
                    </div>
                  </section>

                  <section className="card card-spacing">
                    <div className="card-header">
                      <span className="section-number">2</span>
                      <h3>Data &amp; Information Requirements</h3>
                    </div>
                    <div className="fields">
                      <div className="field">
                        <span className="field-label">
                          Data required from other systems?
                        </span>
                        <div
                          className="field-value"
                          speed-bind="PullDataFromAnotherSystem"
                        />
                        <div id="pullDataContainer" />
                      </div>
                      <div className="field" style={{ display: "none" }}>
                        <span className="field-label">Retention period</span>
                        <div
                          className="field-value"
                          speed-bind="RetentionPeriod"
                        />
                        <div id="retentionContainer" />
                      </div>
                    </div>
                  </section>

                  <section className="card card-spacing">
                    <div className="card-header">
                      <span className="section-number">3</span>
                      <h3>Approvals, Reviews &amp; Workflow Routing</h3>
                    </div>
                    <div className="fields">
                      <div className="field">
                        <span className="field-label">
                          Approvals Needed?
                        </span>
                        <div
                          className="field-value"
                          speed-bind="IsApprovalsNeeded"
                        />
                      </div>
                    </div>
                    <div className="subsection" id="approvalStagesContainer">
                      <div className="subsection-label">
                        List all approval stages in order
                      </div>
                      <div className="table-wrap">
                        <table
                          className="data-table"
                          style={{ minWidth: 760 }}
                          id="approvalTable"
                          speed-serialno="true"
                          speed-validate-mode="false"
                          speed-bind-table="Approvers"
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 64 }}>Stage</th>
                              <th speed-array-prop="approver">
                                Approver (Job Title)
                              </th>
                              <th speed-array-prop="reason">
                                What Triggers This Approval?
                              </th>
                              <th speed-array-prop="approved">
                                What Happens If Approved?
                              </th>
                              <th speed-array-prop="declined">
                                What Happens If Declined?
                              </th>
                            </tr>
                          </thead>
                          <tbody id="approvalStages" />
                        </table>
                      </div>
                    </div>
                    <div className="extra-fields">
                      <div className="field">
                        <span className="field-label">
                          Conditional Approval?
                        </span>
                        <div
                          className="field-value"
                          id="retentionPeriod"
                          speed-bind="ConditionalApproval"
                        />
                        <div id="approvalsContainer" />
                      </div>
                      <div className="field" style={{ display: "none" }}>
                        <span className="field-label">Max approval time</span>
                        <div
                          className="field-value"
                          speed-bind="MaxApprovalTime"
                        />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Approval Delegate
                        </span>
                        <div className="field-value" speed-bind="Delegate" />
                      </div>
                    </div>
                  </section>

                  <section className="card card-spacing">
                    <div className="card-header">
                      <span className="section-number">4</span>
                      <h3>User Roles &amp; Access Control</h3>
                    </div>
                    <div className="fields">
                      <div className="field">
                        <span className="field-label">
                          Apart from the ones listed in Section 1, any additional users?{" "}
                          <span className="required">*</span>
                        </span>
                        <div
                          className="field-value"
                          id="isOtherUsersNeeded"
                          speed-bind="IsOtherUsersNeeded"
                        />
                      </div>
                    </div>
                    <div className="subsection" id="userAccessContainer">
                      <div className="subsection-label">
                        Who are the different types of users of this system?
                      </div>
                      <div className="table-wrap">
                        <table
                          className="data-table"
                          id="userAccess"
                          speed-serialno="true"
                          speed-validate-mode="false"
                          speed-bind-table="UserAccess"
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 56 }}>S/N</th>
                              <th speed-array-prop="role">
                                User Type / Role (e.g Requestor)
                              </th>
                              <th speed-array-prop="feature">
                                What Can They Do in the System?
                              </th>
                              <th speed-array-prop="user">
                                Who Belongs to This Group?
                              </th>
                            </tr>
                          </thead>
                          <tbody id="userAccessBody" />
                        </table>
                      </div>
                    </div>
                    <div className="extra-fields">
                      <div className="field">
                        <span className="field-label">
                          Are there records that some users should NOT be able
                          to see?
                        </span>
                        <div
                          className="field-value"
                          id="revokeUser"
                          speed-bind="RevokeUser"
                        />
                      </div>
                      <div className="field">
                        <span className="field-label">
                          Who should be the Process Owner (main overseer) of
                          this system?
                        </span>
                        <div
                          className="field-value"
                          speed-bind="ProcessOwner"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="card card-spacing">
                    <div className="card-header">
                      <span className="section-number">5</span>
                      <h3>Other Features</h3>
                    </div>
                    <div className="subsection" style={{ paddingTop: 22 }}>
                      <div className="table-wrap">
                        <table
                          className="data-table feature-table"
                          id="extraFeaturesTable"
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 160 }}>
                                Check box if needed
                              </th>
                              <th>Feature</th>
                              <th>Note</th>
                            </tr>
                          </thead>
                          <tbody />
                        </table>
                      </div>
                    </div>
                    <div className="fields">
                      <div className="field">
                        <span className="field-label">
                          Are there any features not listed above that you think
                          the system should have?
                        </span>
                        <div
                          className="field-value"
                          id="otherFeatures"
                          speed-bind="OtherFeatures"
                        />
                      </div>
                    </div>
                    <div className="subsection">
                      <div className="subsection-label">
                        What reports/summaries/analytics do you need from this
                        system?
                      </div>
                      <div className="table-wrap">
                        <table
                          className="data-table report-table"
                          id="reportTable"
                          speed-serialno="true"
                          speed-validate-mode="false"
                          speed-bind-table="Reports"
                        >
                          <thead>
                            <tr>
                              <th style={{ width: 56 }}>S/N</th>
                              <th speed-array-prop="name">
                                Report Name / Description
                              </th>
                              <th speed-array-prop="users">Who needs it?</th>
                              <th speed-array-prop="interval">How often?</th>
                            </tr>
                          </thead>
                          <tbody id="reportsBody" />
                        </table>
                      </div>
                    </div>
                  </section>
                </div>
                <div
              className="hidden"
              id="minorModificationFields"
              style={{ marginBottom: 20 }}
            >
              <section className="card card-spacing">
                <div className="card-header">
                  <span className="section-number">M</span>
                  <h3>Modification Details</h3>
                </div>
                <div className="fields">
                  <div className="field" id="modificationProcessNameField">
                    <span className="field-label">Process Name</span>
                    <div
                      className="field-value"
                      id="modificationProcessNameContainer"
                    />
                  </div>
                  <div className="field" id="modificationApplicationLinkField">
                    <span className="field-label">Link to Application</span>
                    <div
                      className="field-value"
                      id="modificationApplicationLinkContainer"
                    />
                  </div>
                  <div
                    className="field"
                    id="modificationCurrentFunctionalityField"
                  >
                    <span className="field-label">
                      Current functionality (What does the system do today?)
                    </span>
                    <div
                      className="field-value"
                      id="modificationCurrentFunctionalityContainer"
                    />
                  </div>
                  <div className="field" id="modificationWhatShouldChangeField">
                    <span className="field-label">What should change?</span>
                    <div
                      className="field-value"
                      id="modificationWhatShouldChangeContainer"
                    />
                  </div>
                  <div className="field" id="modificationReasonField">
                    <span className="field-label">
                      Reason / justification (Why is this change needed?)
                    </span>
                    <div
                      className="field-value"
                      id="modificationReasonContainer"
                    />
                  </div>
                  <div className="field" id="modificationSystemsAffectedField">
                    <span className="field-label">Systems / users affected</span>
                    <div
                      className="field-value"
                      id="modificationSystemsAffectedContainer"
                    />
                  </div>
                  <div className="field" id="modificationDateNeededField">
                    <span className="field-label">Date needed</span>
                    <div
                      className="field-value"
                      id="modificationDateNeededContainer"
                    />
                  </div>
                </div>
              </section>
            </div>

                <section className="card">
                  <div className="card-header">
                    <h3>Audit Log</h3>
                  </div>
                  <div
                    className="table-wrap"
                    style={{ border: 0, borderRadius: 0 }}
                  >
                    <table className="data-table audit-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Stage</th>
                          <th>Action</th>
                          <th>Comment</th>
                          <th>Action Time</th>
                        </tr>
                      </thead>
                      <tbody id="logs" />
                    </table>
                  </div>
                </section>
              </div>

              <aside className="decision-panel">
                <div className="decision-header">
                  <h3>Your Decision</h3>
                  <p>
                    Review the request details, then record your decision here.
                  </p>
                </div>

                <div className="decision-form">
                  {/* People picker (Developer) injected here by JS */}
                  <div id="approverSection" />
                  {/* Dates / status fields injected here by JS */}
                  <div id="devApproverSection" />

                  <label className="form-label">
                    <span>Comment</span>
                    <textarea
                      className="form-control"
                      id="approvercomment"
                      placeholder="Type here..."
                      speed-bind-validate="Comment"
                      speed-include-control="false"
                      speed-as-static="true"
                      speed-validate-type="Comment"
                      speed-event-switch="false"
                      speed-validate-msg="Please tell us why you want to decline this process!"
                    />
                  </label>
                </div>

                <div className="decision-actions">
                  <ClientButton
                    func="ApproveRequestComponent.confirmSubmit"
                    clax="AdrPrimaryButton approveBtn"
                    prop="Approved"
                  >
                    Approve
                  </ClientButton>
                  <div className="secondary-actions" id="secondaryActions">
                    <ClientButton
                      func="ApproveRequestComponent.confirmSubmit"
                      clax="AdrSecondaryButton"
                      prop="Declined"
                      attr="id='declineBtn'"
                    >
                      Decline
                    </ClientButton>
                    <ClientButton
                      func="ApproveRequestComponent.confirmSubmit"
                      clax="AdrSecondaryButton"
                      prop="Revise"
                    >
                      More Info
                    </ClientButton>
                  </div>
                  <a className="cancel" href="#/">
                    Cancel
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadApproveRequestComponent();
  }
}