import * as React from "react";
// import {useNavigate} from "react-router-dom";
// import { NewLoader } from "../../../../Global/NewLoader";
// import ClientButton from "../../../../Global/ClientButton";

require("dashboard");

export default class Dashboard extends React.Component<{}, {}> {
  public render(): React.ReactElement {
    return (
        <div className="AdrPage">
            <section className="AdrHero">
                <div>
                    <span className="AdrEyebrow">Request workspace</span>
                    <h2>Application Development Requests</h2>
                    <p>Submit new automation requests and follow them through approval, requirement gathering, development, and sign-off.</p>
                </div>
                {/* <button className="AdrPrimaryButton" type="button">+ New Request</button> */}
            </section>

            <section className="AdrStatsGrid">
                <article>
                    <span>Total Requests</span>
                    <strong id="totalRequest"></strong>
                    <p>All saved and submitted requests</p>
                </article>
                <article>
                    <span>Pending Approval</span>
                    <strong id="pendingRequest"></strong>
                    <p>Awaiting a Division Head, Business Sustainability, or App Dev Team decision</p>
                </article>
                <article>
                    <span>Closed</span>
                    <strong id="completedRequest"></strong>
                    <p>Fully signed off and deployed</p>
                </article>
            </section>

            <section className="AdrPanel">
                <div className="AdrPanelHeader">
                    <div>
                        <h3>Recent Requests</h3>
                        <p>Most recently submitted requests across all divisions</p>
                    </div>
                </div>
                <div className="AdrTableShell">
                    <table className="AdrTable">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Process Name</th>
                                <th>Requestor</th>
                                <th>Division</th>
                                <th>Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
  }

  public componentDidMount(): void {
    window.loadDashboardComponent();
  }
}
