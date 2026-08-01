import * as React from "react";
import ClientButton from "../../../../Global/ClientButton";
import { NewLoader } from "../../../../Global/NewLoader";
// import CustomPeoplePicker from "../../../../Global/CustomPeoplePicker";

require("approverequest");

export default class ApproveRequest extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
      <>
      <NewLoader />
      <div className="form-card hidden" id="approverequest-page">
        <h1 className="form-card-title">Violation Notice Approval</h1>

        <div className="form-card">
          <div id="create-menu-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="cm-date">
                  Employee
                </label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="Title"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="WarningNotice"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Date of Warning</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="DateOfWarning"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date Of Violation</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="DateOfViolation"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Time Of Violation</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="TimeOfViolation"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="Location"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Severity</label>
                <input
                  className="form-input"
                  type="text"
                  speed-bind="Severity"
                  speed-bind-class="MetaData"
                  readOnly
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Violation Explained</label>
                <textarea
                  className="form-input"
                  speed-bind="ViolationExplained"
                  speed-bind-class="MetaData"
                  readOnly
                ></textarea>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="fh-comments">
                  Comment
                </label>
                <textarea
                  className="form-input"
                  id="fh-comments"
                  placeholder="Add any comments or recommendations from the inspection..."
                  speed-bind="Comment"
                  readOnly
                />
              </div>
            </div>
          </div>
        </div>

        <div id="actor-section" style={{ marginTop: "20px" }} />
        {/* <p className="form-card-title"><i className="fa-solid fa-plus" aria-hidden="true"></i> Add single item</p> */}

        <div className="form-actions">
          <ClientButton
            func="ApproveRequestComponent.confirmSubmit"
            clax="btn btn-primary"
            prop="Approved"
          >
            <i className="fa-solid fa-check" aria-hidden="true" /> Submit
          </ClientButton>
          <a href="#/" className="btn btn-ghost">
            Back
          </a>
        </div>
      </div>
      </>
    );
  }

  public componentDidMount(): void {
    window.loadApproveRequestComponent();
  }
}
