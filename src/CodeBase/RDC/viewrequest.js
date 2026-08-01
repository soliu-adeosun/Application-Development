loadViewRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenViewRequestDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadViewRequestComponent;
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ViewRequestComponent.ApplicationDetails = function () {
  this.url = window.location.href;
	this.itemId = null;
	this.requestDetails = {};
	this.Attachments = [];
	this.FileUrls = {};
	this.FolderUrl = "";
	this.AttachmentLoader = {};
	this.messageTemplate = {};
	this.feedback = false;
	this.approverComment = "";
	this.transactionHistory = [];
	this.defaultStage = "AA1";
	this.returned = false;
	this.messageType = "standard";
	this.documentsToUpdate = {};
	this.mode = null;
};

whenViewRequestDependeciesLoaded = function () {
  globalDefinitions.callLoader();
  // globalDefinitions.extendStages();
  $spcontext.assignAttributes();

  $spcontext.filesDictionary = {};

  AppRequest = new MainApplication.ViewRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );


  $spcontext.applyValidationEvents();
  MainApplication.ViewRequestComponent.recoverListData();
  // setTimeout(function () {
  //   globalDefinitions.closeLoader();
  // }, 2000);
};

MainApplication.ViewRequestComponent.recoverListData = function () {
  if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
    var query = vnContext.camlBuilder([
      {
        rowlimit: 1,
      },

      {
        operator: "Eq",
        field: "WorkflowRequestID",
        type: "Text",
        val: AppRequest.itemId,
      },
    ]);

    var extraProperties = [
      "ID",
      "Title",
      "WorkflowRequestID",
      "Current_Approver",
      "Current_Approver_Code",
      "Approval_Status",

      "RequestCreated",
      "InitiatorEmailAddress",
      "InitiatorLogin",
      "Transaction_History",
      "ReturnForCorrection",

      "Modified",
      "PendingUserEmail",
      "PendingUserLogin",
      "Attachment_Folder",
      "AttachmentURL",
      "Author",

      "Title",
      "Employee",
      "WarningNotice",
      "DateOfWarning",
      "DateOfViolation",
      "TimeOfViolation",
      "Location",
      "ViolationExplained",
      "Severity",
      "Witness",
      "ReportedBy",
      "Comment",
      "HODComment",
      "HOD",
      "EmployeeComment",
	    "Correction"
    ];

    vnContext.getListToControl(
      globalDefinitions.stageDefinitions.listname,
      query,
      extraProperties,
      function (listProperties) {
        if ($.isEmptyObject(listProperties)) {
          MainApplication.notyf.error("Process does not exist...");
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
        } else {
          customWorkflowEngine
            .routeEngine(customWorkflowEngine)
            .updateRoutesinFlow(listProperties, function (resolved) {
              customWorkflowEngine
                .routeEngine(customWorkflowEngine)
                .PageSecurity(
                  customWorkflowEngine.stages.securityModeView,
                  listProperties.Current_Approver,
                  listProperties.Approval_Status,
                  function (error) {
                    // if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {

                    if (typeof error === "undefined") {
                      listProperties.DateOfWarning = $spcontext.stringnifyDate({
                        value: listProperties.DateOfWarning,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      listProperties.DateOfViolation =
                        $spcontext.stringnifyDate({
                          value: listProperties.DateOfViolation,
                          includeTime: false,
                          format: "dd/mm/yy",
                        });

                      listProperties.Transaction_History =
                        $spcontext.JSONToObject(
                          listProperties.Transaction_History,
                        );
                      listProperties.AttachmentURL = $spcontext.JSONToObject(
                        listProperties.AttachmentURL,
                        "object",
                      );

                      AppRequest.FolderUrl = listProperties.Attachment_Folder;
                      AppRequest.FileUrls = $spcontext.deferenceObject(
                        listProperties.AttachmentURL,
                      );

                      for (var file in AppRequest.FileUrls) {
                        $spcontext.filesDictionary[file] = {
                          files: AppRequest.FileUrls[file],
                        };
                      }

                      // AppRequest.FileUrls = $spcontext.deferenceObject(listProperties.AttachmentURL);

                      if (listProperties.Transaction_History.length !== 0) {
                        $("#transaction-history").show();
                        globalDefinitions.displayHistory(
                          listProperties.Transaction_History,
                        );
                      }

                      // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                      // 	listProperties.Comment = "";
                      // }

                      if (listProperties.Current_Approver === "Employee") {
                        $("#actor-section").append(`
										<h1 class="form-card-title">
											Employee SECTION
										</h1>
										
											<div class="form-group">
												<label class="form-label">
													Employee Comment
													<span class="req" aria-hidden="true">
														*
													</span>
												</label>
												<textarea speed-bind="EmployeeComment" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>
										
									`);
                        // display Employee Section
                        // display HOD Section
                      } else if (listProperties.Current_Approver === "HOD") {
                        $("#actor-section").append(`
										<h1 class="form-card-title">
											Employee SECTION
										</h1>
										
											<div class="form-group">
												<label class="form-label">
													Employee Comment
												</label>
												<textarea speed-bind="EmployeeComment" readOnly class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>
									

										<h1 class="form-card-title">
											HOD SECTION
										</h1>


											<div class="form-group">
												<label class="form-label">
													HOD Comment
													<span class="req" aria-hidden="true">
														*
													</span>
												</label>
												<textarea speed-bind="HODComment" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>
									`);
                      } else if (
                        listProperties.Current_Approver === "Management Rep"
                      ) {
                        $("#actor-section").append(`
										<h1 class="form-card-title">
											Employee SECTION
										</h1>
											<div class="form-group">
												<label class="form-label">
													Employee Comment
												</label>
												<textarea speed-bind="EmployeeComment" readOnly class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>

										<h1 class="form-card-title">
											HOD SECTION
										</h1>

											<div class="form-group">
												<label class="form-label">
													HOD Comment
												</label>
												<textarea readOnly speed-bind="HODComment" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>

										<h1 class="form-card-title">
											QHSE SECTION
											<span class="req" aria-hidden="true">
												*
											</span>
										</h1>

											<div class="form-group">
												<label class="form-label">
													Correction Comment
												</label>
												<textarea speed-bind="Correction" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
											</div>
									`);
                      }

                      AppRequest.requestDetails = listProperties;

                      $spcontext.htmlBind(listProperties);

                      // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                      $spcontext.attachmentLinkBind(
                        listProperties.AttachmentURL,
                      );
                      // }
                      // $spcontext.assignAttributes();
                      // setTimeout(function () {
                        
                        $("#viewrequest-page").removeClass("hidden");
                        globalDefinitions.closeLoader();
                      // }, 2000);
                    } else {
                      globalDefinitions.HandlerError(
                        "You are not allowed to access this request",
                      );
                      globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Unauthorized action on ${listProperties.WorkflowRequestID}`,
                        Message: "User is not allowed to act on this request",
                      });
                      // setTimeout(function () {
                        globalDefinitions.closeLoader();
                      // }, 1000);
                      $spcontext.redirect("#/", false);
                    }

                    // }
                  },
                ); //commented here
            }); //commented here
        }
      },
    );
  } else {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("Invalid Request...");
    $spcontext.redirect("#/", false);
  }
};

// MainApplication.ViewRequestComponent.buildViewOnlyInspectionTable = function () {
//     const data = AppRequest.retrievedtableData;
//     if (!data || !data.Monday || !data.Tuesday) {
//         console.warn("No inspection data available");
//         return;
//     }

//     // Get all unique items from Monday (assuming all days have same items)
//     const sampleDay = data.Monday;
//     const items = sampleDay.map(entry => {
//         return Object.keys(entry).find(key => key !== "Defect");
//     }).filter(Boolean);

//     let html = `
//             <thead>
//                 <tr>
//                     <th>S/N</th>
//                     <th>Inspection Items</th>
//                     <th>Monday</th>
//                     <th>Tuesday</th>
//                     <th>Wednesday</th>
//                     <th>Thursday</th>
//                     <th>Friday</th>
//                     <th>Defect / Notes</th>
//                 </tr>
//             </thead>
//             <tbody>
//     `;

//     items.forEach((item, index) => {
//         const defect = data.Monday.find(entry => entry[item])?.Defect || "Nil";

//         html += `
//             <tr>
//                 <td>${index + 1}</td>
//                 <td style="border:1px solid #ccc; padding:10px; text-align:left;">${item}</td>
//                 <td>${data.Monday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Tuesday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Wednesday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Thursday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${data.Friday.find(e => e[item])?.[item] === "Yes" ? "✔" : "✘"}</td>
//                 <td>${defect}</td>
//             </tr>
//         `;
//     });

//     html += `</tbody>`;

//     // Insert into your page - CHANGE THIS SELECTOR to match your container
//     const container = document.getElementById("view-table");

//     if (container) {
//         container.innerHTML = html;
//     } else {
//         console.error("Could not find container to append table");
//         document.body.insertAdjacentHTML('beforeend', `<table>${html}</table>`);
//     }
// };