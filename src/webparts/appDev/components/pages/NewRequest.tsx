import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";
// import { NewLoader } from "../../../../Global/NewLoader";

require("newrequest");

export default class NewRequest extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
        {/* <NewLoader /> */}
        <section className="AdrPageContent">
          <div className="AdrPage">
            <section className="AdrCompactHero">
              <div>
                <span className="AdrEyebrow">New Request</span>
                <h3>SUBMISSION GUIDANCE</h3>
                <ul>
                  <li>
                    Complete this form - Fill in all sections marked with * at
                    minimum. The more detail you provide, the faster and more
                    accurate the system build will be.
                  </li>
                  <li>
                    Submit Application Development Request – Complete the Data
                    Requirement Gathering section of the Application Development
                    Request Form.
                  </li>
                  <li>
                    Await confirmation- The Process Automation Team will
                    acknowledge receipt and schedule requirements review meeting
                    with you within 5 working days.
                  </li>
                </ul>
              </div>
            </section>
            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>1</span>
                <div>
                  <h3>Process Overview</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>
              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    What is the name of the process you want to automate?
                  </span>
                  <input placeholder="Enter text" speed-bind-validate="ProcessName" />
                </label>
                <label className="AdrField">
                  <span>How often does this process happen?</span>
                  <select name="period" id="period">
                    <option>Select a value</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Annually">Annually</option>
                    <option value="On Demand/Ad Hoc">On Demand / Ad Hoc</option>
                    <option value="Other">Other</option>
                  </select>
                  <div id="otherPeriodContainer" />
                </label>
                <label className="AdrField">
                  <span>
                    Which divisions/units/teams are involved in this process?
                  </span>
                  <select
                    id="divisionsInvolved"
                    className="js-select2"
                    multiple
                    speed-bind-validate="DivisionsInvolved"
                    speed-bind-class="MainRequest"
                    speed-list-repeat="DivisionsInvolved"
                    speed-no-default="true"
                  >
                    <option value="{{Title}}">
                      {"{{"}Title{"}}"}
                    </option>
                  </select>
                </label>

                <label className="AdrField">
                  <span>Why do you need to automate this process?</span>
                  <textarea placeholder="Enter text" speed-bind-validate="ProcessName" />
                </label>
              </div>

              <div className="table-wrapper">
                <div className="tableLabel">
                <span>Step-by-step description of the process</span>
                <button className="AdrAddButton" id="stepByStepButton" type="button">+ Add New Row</button>
              </div>
              <div className="AdrTableShell">
                <table className="AdrTable" id="stepByStepTable" speed-bind-class="StepByStepProcess" speed-json="false" speed-validate-mode="true" speed-bind-table="StepByStepProcess" speed-bind-auto="false">
                  <thead>
                    <tr>
                      <th>Stage</th>
                      <th speed-array-prop="description">What Happens (describe clearly)</th>
                      <th speed-array-prop="actors">Who Does It / Who Is Involved</th>
                      <th speed-array-prop="action" speed-exclude-result="true">Action</th>
                    </tr>
                  </thead>
                  <tbody id="stepByStepDescription" />
                </table>
              </div>
              </div>
              

              <div className="AdrFormGrid">

                <label className="AdrField">
                  <span>
                    Are there any existing automated systems already handling part of this process? 
                  </span>
                  <textarea placeholder="Enter text" speed-bind-validate="ExistingLink" />
                </label>

                <label className="AdrField">
                  <span>
                    What are the biggest pain points or challenges with the current process?
                  </span>
                  <textarea placeholder="Enter text" speed-bind-validate="PainPoints" />
                </label>

                <label className="AdrField">
                  <span>
                    What marks the process as complete?
                  </span>
                  <textarea placeholder="Enter text" speed-bind-validate="CriteriaForCompletion" />
                </label>

                <label className="AdrField">
                  <span>
                    Are there any related processes that connect to this one?
                  </span>
                  <select id="isProcessRelated" speed-bind-validate="IsProcessRelated">
                    <option>Select a value</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label className="AdrField">
                  <span>
                    What forms or documents are used in this process currently? 
                  </span>
                  <input placeholder="Enter text" type="file" speed-file-bind="SupportingDocuments" />
                  <div speed-file-bind="SupportingDocuments"></div>
                </label>
              </div>

              <div id="relatedProcessContainer" />
            </section>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>2</span>
                <div>
                  <h3>Data & Information Requirements</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>

              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    Do you require any information to be automatically pulled from another system?
                  </span>
                  <select speed-bind-validate="PullDataFromAnotherSystem">
                    <option>Select a value</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>

                 <label className="AdrField">
                  <span>
                    How long should records be kept in the system?
                  </span>
                  <select id="retentionPeriod" speed-bind-validate="RetentionPeriod">
                    <option>Select a value</option>
                    <option value="1 year">1 year</option>
                    <option value="3 years">3 years</option>
                    <option value="5 years">5 years</option>
                    <option value="Permanently">Permanently</option>
                    <option value="Other">Other(specify)</option>
                  </select>

                  <div id="retentionContainer" />
                </label>
              </div>
            </section>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>3</span>
                <div>
                  <h3>Approvals, Reviews & Workflow Routing</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>

              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    Does this process require any approvals or sign-offs?
                  </span>
                  <select id="isApprovalsNeeded" speed-bind-validate="RetentionPeriod">
                    <option>Select a value</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>

                  <div id="approvalsContainer" />
                </label>
                
              </div>

              <div className="table-wrapper">
                <div className="tableLabel">
                  <span>List all approval stages in order</span>
                  <button className="AdrAddButton" id="addApproverButton" type="button">+ Add New Row</button>
                </div>
                <div className="AdrTableShell">
                  <table className="AdrTable" id="approvalTable" speed-bind-class="Approvers" speed-json="false" speed-validate-mode="true" speed-bind-table="Approvers" speed-bind-auto="false">
                    <thead>
                      <tr>
                        <th>Stage</th>
                        <th speed-array-prop="approver">Approver (Job Title)</th>
                        <th speed-array-prop="reason">What Triggers This Approval?</th>
                        <th speed-array-prop="approved">What Happens If Approved?</th>
                        <th speed-array-prop="declined">What Happens If Declined?</th>
                        <th speed-array-prop="action" speed-exclude-result="true">Action</th>
                      </tr>
                    </thead>
                    <tbody id="approvalStages" />
                  </table>
                </div>
              </div>
              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    Are there any conditions that change the approval path?
                  </span>
                  <select id="isApprovalsNeeded" speed-bind-validate="RetentionPeriod">
                    <option>Select a value</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>

                  <div id="approvalsContainer" />
                </label>

                <label className="AdrField">
                  <span>
                    What is the maximum time allowed at each approval stage
                  </span>
                  <input placeholder="Enter number in hours" type="number"  speed-bind-validate="MaxApprovalTime"/>

                </label>

                <label className="AdrField">
                  <span>
                    Who can delegate or act on behalf of an approver when they are unavailable?
                  </span>
                  <input placeholder="Enter text" type="text"  speed-bind="Delegate"/>

                </label>
                
              </div>
            </section>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>4</span>
                <div>
                  <h3>Notifications & Communications</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>

              <div className="table-wrapper">
                <div className="tableLabel">
                  <span>Who should be notified and at what points in the process?</span>
                  <button className="AdrAddButton" id="addNotificationButton" type="button">+ Add New Row</button>
                </div>
                <div className="AdrTableShell">
                  <table className="AdrTable" id="notifications" speed-bind-class="Notifications" speed-json="false" speed-validate-mode="true" speed-bind-table="Notifications" speed-bind-auto="false">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th speed-array-prop="event">Event/Trigger (e.g Request is submitted)</th>
                        <th speed-array-prop="users">Who Should Be Notified? (Requestor, Line Manager)</th>
                        <th speed-array-prop="template">Email Template</th>
                        <th speed-array-prop="action" speed-exclude-result="true">Action</th>
                      </tr>
                    </thead>
                    <tbody id="notificationsBody" />
                  </table>
                </div>
              </div>
            </section>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>5</span>
                <div>
                  <h3>User Roles & Access Control</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>

              <div className="table-wrapper">
                <div className="tableLabel">
                  <span>Who are the different types of users of this system?</span>
                  <button className="AdrAddButton" id="addUserAccessButton" type="button">+ Add New Row</button>
                </div>
                <div className="AdrTableShell">
                  <table className="AdrTable" id="userAccess" speed-bind-class="UserAccess" speed-json="false" speed-validate-mode="true" speed-bind-table="UserAccess" speed-bind-auto="false">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th speed-array-prop="role">User Type / Role (e.g Requestor)</th>
                        <th speed-array-prop="feature">What Can They Do in the System? (e.g. Submit new requests, view own submissions, edit before submission)</th>
                        <th speed-array-prop="user">Who Belongs to This Group? (e.g. All Staff)</th>
                        <th speed-array-prop="action" speed-exclude-result="true">Action</th>
                      </tr>
                    </thead>
                    <tbody id="userAccessBody" />
                  </table>
                </div>
              </div>

              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    Are there records that some users should NOT be able to see?
                  </span>
                  <textarea placeholder="Enter text" name="revokeUser" id="revokeUser" speed-bind-validate="RevokeUser"></textarea>
                </label>

                <label className="AdrField">
                  <span>
                    Who should be the Process Owner (main overseer) of this system?
                  </span>
                  <input placeholder="Enter text" type="text"  speed-bind-validate="ProcessOwner"/>

                </label>
                
              </div>
            </section>

            <section className="AdrFormSection">
              <div className="AdrSectionHeader">
                <span>6</span>
                <div>
                  <h3>Other Features</h3>
                  {/* <p>Request owner and submission date.</p> */}
                </div>
              </div>

               <div className="AdrTableShell">
                <table className="AdrTable" id="extraFeaturesTable">
                  <thead>
                    <tr>
                      <th>Check box if needed</th>
                      <th>Feature</th>
                      <th>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Save as Draft - Ability to save an incomplete form and return to it later</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Edit After Submission - Ability to edit a submitted record before approval</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Export to Excel / CSV - Download records as a spreadsheet</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Print / Download as PDF - Print or save records as PDF documents</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Dashboard / Summary View - A visual overview of process status and statistics</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Bulk Actions - Approve, decline, or export multiple records at once</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                    <tr>
                      <td><input placeholder="Enter text" type="checkbox" name="" id="" /></td>
                      <td>Attachment Upload - Ability to attach files (documents, images, etc.) to records</td>
                      <td><textarea placeholder="Enter text" name="" id=""></textarea></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="AdrFormGrid">
                <label className="AdrField">
                  <span>
                    Are there any features not listed above that you think the system should have?
                  </span>
                  <textarea placeholder="Enter text" name="otherFeatures" id="otherFeatures" speed-bind-validate="OtherFeatures"></textarea>
                </label>
                
              </div>

              <div className="table-wrapper">
                <div className="tableLabel">
                  <span>What reports/summaries/analytics do you need from this system?</span>
                  <button className="AdrAddButton" id="addReportButton" type="button">+ Add New Row</button>
                </div>
                <div className="AdrTableShell">
                  <table className="AdrTable" id="reportTable" speed-bind-class="Reports" speed-json="false" speed-validate-mode="true" speed-bind-table="Reports" speed-bind-auto="false">
                    <thead>
                      <tr>
                        <th>S/N</th>
                        <th speed-array-prop="name">Report Name / Description</th>
                        <th speed-array-prop="users">Who needs it?</th>
                        <th speed-array-prop="interval">How often? (Daily/Weekly/Monthly/On Demand)</th>
                        <th speed-array-prop="action" speed-exclude-result="true">Action</th>
                      </tr>
                    </thead>
                    <tbody id="reportsBody" />
                  </table>
                </div>
              </div>
            </section>
            <div className="AdrFormActions">
              <a href="#/" className="AdrSecondaryButton" type="button">
                Cancel
              </a>
              <ClientButton
                func="NewRequestComponent.confirmSubmit"
                clax="AdrSecondaryButton"
                prop="save"
              >
                Save Draft
              </ClientButton>

              <ClientButton
                func="NewRequestComponent.confirmSubmit"
                clax="AdrPrimaryButton"
                prop="submit"
              >
                Submit
              </ClientButton>
            </div>
          </div>
        </section>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadNewRequestComponent();
  }
}
