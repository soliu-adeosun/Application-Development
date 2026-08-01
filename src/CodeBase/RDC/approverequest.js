loadApproveRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenApproveRequestDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadApproveRequestComponent;
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.ApproveRequestComponent.ApplicationDetails = function () {
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

whenApproveRequestDependeciesLoaded = function () {
  globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  $spcontext.assignAttributes();

  $spcontext.filesDictionary = {};

  AppRequest = new MainApplication.ApproveRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  $spcontext.filesDictionary = {};

  $spcontext.validationProperties.text.extend["Comment"] = function (field) {
    var passed = false;
    if (
      (field.trim() !== "" &&
        (AppRequest.actionTaken ===
          globalDefinitions.stageDefinitions.decline ||
          AppRequest.actionTaken ===
            globalDefinitions.stageDefinitions.correction ||
          AppRequest.actionTaken === "Revise")) ||
      AppRequest.actionTaken === globalDefinitions.stageDefinitions.approve
    )
      passed = true;
    return passed;
  };

  $spcontext.applyValidationEvents();
  MainApplication.ApproveRequestComponent.recoverListData();
  // setTimeout(function () {
  // 	globalDefinitions.closeLoader();
  // }, 2000);
};

MainApplication.ApproveRequestComponent.recoverListData = function () {
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
      {
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: globalDefinitions.stageDefinitions.pending,
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
          MainApplication.notyf.error(
            "This process is not pending approval...",
          );
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
        } else {
          customWorkflowEngine
            .routeEngine(customWorkflowEngine)
            .updateRoutesinFlow(listProperties, function (resolved) {
              customWorkflowEngine
                .routeEngine(customWorkflowEngine)
                .PageSecurity(
                  customWorkflowEngine.stages.securityModeTask,
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
												<textarea speed-bind-validate="EmployeeComment" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
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
												<textarea speed-bind-validate="HODComment" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
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
												<textarea speed-bind-validate="Correction" speed-bind-class="ApprovalData" class="form-input" rows="4" placeholder="Enter text here..."></textarea>
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
                      setTimeout(function () {
                        globalDefinitions.closeLoader();
						$("#approverequest-page").removeClass("hidden");
                      }, 2000);
                    } else {
                      globalDefinitions.HandlerError(
                        "You are not allowed to access this request",
                      );
                      globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Unauthorized action on ${listProperties.WorkflowRequestID}`,
                        Message: "User is not allowed to act on this request",
                      });
                      setTimeout(function () {
                        globalDefinitions.closeLoader();
                      }, 1000);
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

MainApplication.ApproveRequestComponent.confirmSubmit = function (actionTaken) {
  $("#confirmModal").modal("show");
  AppRequest.actionTaken = actionTaken;
  MainApplication.confirmAction =
    MainApplication.ApproveRequestComponent.actionConfirmed;
};

MainApplication.ApproveRequestComponent.actionConfirmed = function () {
  $("#confirmModal").modal("hide");
  MainApplication.ApproveRequestComponent.saveDataToList(
    AppRequest.actionTaken,
  );
};

MainApplication.ApproveRequestComponent.saveDataToList = function (
  actionTaken,
) {
  globalDefinitions.onActionClicked();

  var formData = $spcontext.bind({}, "ApprovalData");

  if ($spcontext.checkPassedValidation()) {
    // if (CurrentUserProperties.title === AppRequest.requestDetails.EmployeeName) {
    // var formData = $spcontext.bind({});
    // } else {
    // var formData = {};
    // }

    // Build custom message for history action	
    let historyActionMessage = "";

    // if (actionTaken === "Approved") {
		console.log("Action: ", actionTaken);
      if (
        AppRequest.requestDetails.Current_Approver === "Employee" &&
        AppRequest.requestDetails.PendingUserEmail ===
          CurrentUserProperties.email
      ) {
        historyActionMessage = "Employee acknowledged";
      } else if (AppRequest.requestDetails.Current_Approver === "HOD") {
        historyActionMessage = "HOD Reviewed";
      } else if (
        AppRequest.requestDetails.Current_Approver === "Management Rep" &&
        MainApplication.configuredTaskMembers[
          globalDefinitions.stageDefinitions.management
        ].belongs
      ) {
        historyActionMessage = "Management Rep has Reviewed";
      } else {
        // historyActionMessage = "RDC Submitted";
        MainApplication.notyf.error("You can't act on this request :(...");
        $spcontext.redirect("#/", false);
		return;
      }
    // } else if (actionTaken === "Declined") {
    //   if (
    //     AppRequest.requestDetails.Current_Approver === "HOD" &&
    //     AppRequest.requestDetails.PendingUserEmail ===
    //       CurrentUserProperties.email
    //   ) {
    //     historyActionMessage = "HOD declined";
    //   } else if (
    //     AppRequest.requestDetails.Current_Approver === "Management Rep" &&
    //     MainApplication.configuredTaskMembers[
    //       globalDefinitions.stageDefinitions.management
    //     ].belongs
    //   ) {
    //     historyActionMessage = "Management Rep declined";
    //   } else if (
    //     AppRequest.requestDetails.Current_Approver === "CEO" &&
    //     MainApplication.configuredTaskMembers[
    //       globalDefinitions.stageDefinitions.ceo
    //     ].belongs
    //   ) {
    //     historyActionMessage = "Executive management has Declined";
    //   } else {
    //     // historyActionMessage = "RDC Submitted";
    //     MainApplication.notyf.error("You can't act on this process...");
    //     $spcontext.redirect("#/", false);
    //   }
    // }

    var historyProp = {
      stage: AppRequest.requestDetails.Current_Approver,
      comment: AppRequest.comment,
      action: historyActionMessage,
    };

    formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.requestDetails.Transaction_History, historyProp,
      );
	formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, actionTaken);

    // console.log("Form Data to be submitted:", formData);
    globalDefinitions.onActionCompleted();
    MainApplication.ApproveRequestComponent.proceedToList(formData);
  } else {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
  }
};

MainApplication.ApproveRequestComponent.proceedToList = function (formData) {
  globalDefinitions.callLoader();

  formData.ID = AppRequest.requestDetails.ID;

  vnContext.updateItems(
    [formData],
    globalDefinitions.stageDefinitions.listname,
    function () {
      // AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
      globalDefinitions.closeLoader();
      globalDefinitions.HandlerSuccess(
        `You have successfully taken action on this process`,
      );
      globalDefinitions.AuditLogManager_SaveLog({
        Action: `took action on Violation Notice ${AppRequest.requestDetails.WorkflowRequestID}`,
      });
      $spcontext.redirect("#/", false);
    },
  );
  globalDefinitions.closeLoader();
};
