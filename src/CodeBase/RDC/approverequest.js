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
  // globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  $spcontext.assignAttributes();

  $spcontext.filesDictionary = {};

  $spcontext.validationProperties.text.extend["Comments"] = function (field) {
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
    var query = speedctxRoot.camlBuilder([
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
      "Comment",
      "HOD",
      "Division",
      "ProcessName",
      "Modified",
      "IsApprovalsNeeded",
      "ConditionalApproval",
      "RetentionPeriod",
      "Period",
      "DivisionsInvolved",
      "StepByStepProcess",
      "ExistingLink",
      "PainPoints",
      "CriteriaForCompletion",
      "IsProcessRelated",
      "PullDataFromAnotherSystem",
      "Approvers",
      "MaxApprovalTime",
      "RevokeUser",
      "ProcessOwner",
      "OtherFeatures",
      "ExtraFeatures",
      "Notifications",
      "UserAccess",
      "Reports",
      "Delegate",
      "RequirementStatement",
      "JustificationStatement",
      "DateRequired",
      "RelatedProcessInformation",
      "SystemInformation",
      "ConditionalApprovalInformation",
      "RequestType",
      "ModificationType",
      "CurrentFunctionality",
      "WhatShouldChange",
      "ModificationReason",
      "SystemsAffected",
      "ProposedStartDate",
      "EndDate",
      "UATDate",
      "Status",
      "Developer"
    ];

    speedctxRoot.getListToControl(
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
                      if (listProperties.Current_Approver_Code === "AA2") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePicker(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                          },
                        );
                      }
                      if (listProperties.Current_Approver_Code === "AA3") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" speed-bind-validate="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" speed-bind-validate="EndDate" speed-bind-class="Dev" />
                                </label>

                            </div>
                        `);
                        const startEl = document.querySelector('[speed-bind-validate="ProposedStartDate"]');
                        const endEl   = document.querySelector('[speed-bind-validate="EndDate"]');
                        MainApplication.DateConstraints.linkStartAndEnd(startEl, endEl);
                      }
                      if (listProperties.Current_Approver_Code === "AA4") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        Status
                                        <span class="required">*</span>
                                    </span>
                                    <select id="projectStatus" speed-bind-validate="Status" speed-bind-class="DevStatus">
                                      <option value="Not Started">Not Started</option>
                                      <option value="In Progress">In Progress</option>
                                      <option value="Completed">Completed</option>
                                    </select>
                                </label>

                            </div>
                        `);
                      }
                      if (listProperties.Current_Approver_Code === "AA5") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        Status
                                    </span>
                                    <input type="text" readonly speed-bind="Status" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        Proposed UAT Date
                                        <span class="required">*</span>
                                    </span>
                                    <input type="date" speed-bind-validate="UATDate" speed-bind-class="UatData" />
                                </label>

                            </div>
                        `);

                        MainApplication.DateConstraints.applyBasicRules(
                          document.querySelector('[speed-bind-validate="UATDate"]')
                        );
                      }
                      if (listProperties.Current_Approver_Code === "AA6") {
                        MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly(
                          {
                            pickerId: "Developer",
                            label: "Developer",
                            placeholder: "Select a Developer",
                            defaultValue: listProperties.PendingUserLogin
                          },
                        );
                        $("#devApproverSection").html(`
                            <div class="AdrFormGrid top-space">
                                <label class="AdrField">
                                    <span>
                                        Proposed Start Date
                                    </span>
                                    <input type="text" readonly speed-bind="ProposedStartDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        End Date
                                    </span>
                                    <input type="text" readonly speed-bind="EndDate" speed-bind-class="Dev" />
                                </label>

                                <label class="AdrField">
                                    <span>
                                        Status
                                    </span>
                                    <input type="text" readonly speed-bind="Status" speed-bind-class="Dev" />
                                </label>
                                <label class="AdrField">
                                    <span>
                                        Proposed UAT Date
                                    </span>
                                    <input type="text" readonly speed-bind="UATDate" speed-bind-class="Dev" />
                                </label>
                   -         </div>
                        `);
                      }
                      listProperties.ProposedStartDate = $spcontext.stringnifyDate({
                        value: listProperties.ProposedStartDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.EndDate = $spcontext.stringnifyDate({
                        value: listProperties.EndDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.UATDate = $spcontext.stringnifyDate({
                        value: listProperties.UATDate,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.RequestCreated = $spcontext.stringnifyDate(
                        {
                          value: listProperties.RequestCreated,
                          includeTime: false,
                          format: "dd/mm/yy",
                        },
                      );
                      listProperties.DateRequired = $spcontext.stringnifyDate({
                        value: listProperties.DateRequired,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      listProperties.StepByStepProcess = $spcontext.JSONToObject(
                        listProperties.StepByStepProcess,
                      );
                      listProperties.Approvers = $spcontext.JSONToObject(
                        listProperties.Approvers,
                      );
                      listProperties.Notifications = $spcontext.JSONToObject(
                        listProperties.Notifications,
                      );
                      listProperties.UserAccess = $spcontext.JSONToObject(
                        listProperties.UserAccess,
                      );
                      listProperties.Reports = $spcontext.JSONToObject(
                        listProperties.Reports,
                      );
                      listProperties.DivisionsInvolved = $spcontext.JSONToObject(
                          listProperties.DivisionsInvolved,
                        );
                      listProperties.ExtraFeatures = $spcontext.JSONToObject(
                        listProperties.ExtraFeatures,
                      );
                      listProperties.ExtraFeatures = MainApplication.buildReadOnlyData(
                          listProperties.ExtraFeatures,
                        );

                      listProperties.Transaction_History = $spcontext.JSONToObject(
                          listProperties.Transaction_History,
                        );
                      listProperties.AttachmentURL = $spcontext.JSONToObject(
                        listProperties.AttachmentURL,
                        "object",
                      );

                      listProperties.Delegate =
                        listProperties.Delegate.value || "";

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

                      if (listProperties.PullDataFromAnotherSystem === "Yes") {
                        MainApplication.renderField({
                          containerId: "pullDataContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.SystemInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      if (listProperties.IsProcessRelated === "Yes") {
                        MainApplication.renderField({
                          containerId: "relatedProcessContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.RelatedProcessInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      if (listProperties.ConditionalApproval === "Yes") {
                        MainApplication.renderField({
                          containerId: "approvalsContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.ConditionalApprovalInformation,
                          rows: 6,
                          readonly: true,
                        });
                      }

                      // Request Type / Modification: for a Minor modification
                      // request only the description matters, so the rest of
                      // the read-only form stays hidden - same distinction the
                      // editable NewRequest form makes. Records saved before
                      // this field existed have no RequestType value - treat
                      // those as "New" so they still display the full form.
                      var savedRequestType =
                        listProperties.RequestType || "New";

                      if (savedRequestType === "Modification") {
                        MainApplication.renderField({
                          containerId: "modificationTypeContainer",
                          className: "top-space",
                          type: "textarea",
                          value: listProperties.ModificationType,
                          rows: 1,
                          readonly: true,
                        });

                        if (listProperties.ModificationType === "Minor") {
                          MainApplication.renderField({
                            containerId: "modificationProcessNameContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ProcessName,
                            rows: 1,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationApplicationLinkContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ExistingLink,
                            rows: 1,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId:
                              "modificationCurrentFunctionalityContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.CurrentFunctionality,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId:
                              "modificationWhatShouldChangeContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.WhatShouldChange,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationReasonContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.ModificationReason,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationSystemsAffectedContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.SystemsAffected,
                            rows: 4,
                            readonly: true,
                          });

                          MainApplication.renderField({
                            containerId: "modificationDateNeededContainer",
                            className: "top-space",
                            type: "textarea",
                            value: listProperties.DateRequired,
                            rows: 1,
                            readonly: true,
                          });

                          $("#mainRequestFormWrapper").addClass("hidden");
                        } else {
                          $("#mainRequestFormWrapper").removeClass("hidden");
                        }
                      } else {
                        $("#mainRequestFormWrapper").removeClass("hidden");
                      }

                      MainApplication.populateSelect2(
                        listProperties.DivisionsInvolved,
                      );
                      MainApplication.renderReadOnlyTable(
                        "extraFeaturesTable",
                        listProperties.ExtraFeatures,
                      );
                      // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                      // 	listProperties.Comment = "";
                      // }

                      AppRequest.requestDetails = listProperties;

                      $spcontext.htmlBind(listProperties);

                      // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                      $spcontext.attachmentLinkBind(
                        listProperties.AttachmentURL,
                      );
                      // }
                      // $spcontext.assignAttributes();
                      // setTimeout(function () {
                      $("#newLoader").hide();
                      $("#approval-page").removeClass("hidden");
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
  if (actionTaken === "Revise" || actionTaken === "Declined") {
    if (actionTaken === "Revise") {
      $("#approvercomment").removeAttr("speed-validate-msg");
      $("#approvercomment").attr(
        "speed-validate-msg",
        "Please tell us what information you require",
      );
    }

    if (actionTaken === "Declined") {
      $("#approvercomment").removeAttr("speed-validate-msg");
      $("#approvercomment").attr(
        "speed-validate-msg",
        "Please tell us why you want to decline this request!",
      );
    }
    // $("#targetCompletion, #implementationOwner").removeAttr("speed-bind-validate");
  }
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
  var formData;
  if (AppRequest.requestDetails.Current_Approver_Code === "AA2" ||
    AppRequest.requestDetails.Current_Approver_Code === "AA3" ||
    AppRequest.requestDetails.Current_Approver_Code === "AA4" ||
    AppRequest.requestDetails.Current_Approver_Code === "AA5"
  ) {
    formData = $spcontext.bind({});
    var pickerValues = PeoplePicker.getValue() || {};
    var people = PeoplePicker.getConfiguredValue() || {};
  // } else if (AppRequest.requestDetails.Current_Approver_Code === "AA3") {
  //   formData = $spcontext.bind({}, "Dev");
  // } else if (AppRequest.requestDetails.Current_Approver_Code === "AA4") {
  //   formData = $spcontext.bind({}, "DevStatus");
  // } else if (AppRequest.requestDetails.Current_Approver_Code === "AA5") {
  //   formData = $spcontext.bind({}, "UATData");
  } else {
    formData = {};
  }

  if ($spcontext.checkPassedValidation()) {
    // if (CurrentUserProperties.title === AppRequest.requestDetails.EmployeeName) {
    // var formData = $spcontext.bind({});
    // } else {
    // var formData = {};
    // }
    // var formData = {};
    console.log("AppRequest", AppRequest.requestDetails);
    if (AppRequest.requestDetails.Current_Approver_Code === "AA2") {
      var developer = pickerValues.Developer;
      formData.Developer = developer || null;
      var developerEmail = people.Developer;
    }

    AppRequest.comment = $("#approvercomment").val();

    formData.Comment = AppRequest.comment;
    // Build custom message for history action
    let historyActionMessage = "";

    if (actionTaken === "Approved") {
      if (AppRequest.requestDetails.Current_Approver_Code === "AA1") {
        historyActionMessage = "HOD Acknowledged";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA2") {
        historyActionMessage = "Management Reviewed";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA3") {
        historyActionMessage = "Developer proposed a timeline";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA4") {
        historyActionMessage = "Developer updated the status";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA5") {
        historyActionMessage = "Management proposed UAT";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA6") {
        historyActionMessage = "HOD acknowledged process completion";
      } else {
        // historyActionMessage = "RDC Submitted";
        MainApplication.notyf.error("You can't act on this request :(...");
        $spcontext.redirect("#/", false);
        return;
      }
    } else if (actionTaken === "Declined") {
      if (AppRequest.requestDetails.Current_Approver_Code === "AA1") {
        historyActionMessage = "HOD rejected the request";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA2") {
        historyActionMessage = "Management rejected the request";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA3") {
        historyActionMessage = "Developer rejected the request";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA4") {
        historyActionMessage = "Developer rejected the request";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA5") {
        historyActionMessage = "Management rejected the request";
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA6") {
        historyActionMessage = "HOD rejected the request";
      } else {
        // historyActionMessage = "RDC Submitted";
        MainApplication.notyf.error("You can't act on this process...");
        $spcontext.redirect("#/", false);
      }
    }

    var historyProp = {
      stage: AppRequest.requestDetails.Current_Approver,
      comment: AppRequest.comment,
      action: historyActionMessage,
    };

    formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(
        formData,
        AppRequest.requestDetails.Transaction_History,
        historyProp,
      );
    // formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.requestDetails.Current_Approver_Code, actionTaken);
    console.log("Action taken", actionTaken);
    if (actionTaken === "Approved" || actionTaken === "Declined") {
      if (AppRequest.requestDetails.Current_Approver_Code === "AA2") {
        // 1. Resolve a reliable email / login
        var developerEmail = (people && people.Developer) || null;
        if (!developerEmail) {
          MainApplication.notyf.error("Please select a Developer");
          globalDefinitions.onActionFailed();
          return;
        }

        // 2. Guard the staff lookup
        var staff = MainApplication.staffDetails[developerEmail];
        if (!staff) {
          console.error("No staffDetails entry for", developerEmail);
          MainApplication.notyf.error(
            "Selected developer not found in staff list",
          );
          globalDefinitions.onActionFailed();
          return;
        }

        // 3. Update the stage with the real person
        customWorkflowEngine.updateStageByName({
          name: globalDefinitions.stageDefinitions.assigneddev,
          username: staff.Title,
          authenticationValue: developerEmail,
          emails: [developerEmail],
        });

        // 4. Call runRouting the same way as the other stages
        //    (pass the current stage code + action so the engine knows which transition to take)
        formData = customWorkflowEngine
          .routeEngine(customWorkflowEngine)
          .runRouting(
            formData,
            AppRequest.requestDetails.Current_Approver_Code, // "AA2"
            actionTaken, // "Approved"
          );
      } else if (AppRequest.requestDetails.Current_Approver_Code === "AA4") {
        if (formData.Status === "Completed") {
          formData = customWorkflowEngine
            .routeEngine(customWorkflowEngine)
            .runRouting(
              formData,
              AppRequest.requestDetails.Current_Approver_Code,
              actionTaken,
            );
        } else {
          console.log(formData);
        }
      } else {
        // existing non-AA2 path
        formData = customWorkflowEngine
          .routeEngine(customWorkflowEngine)
          .runRouting(
            formData,
            AppRequest.requestDetails.Current_Approver_Code,
            actionTaken,
          );
      }
    }
    console.log("Form Data to be submitted:", formData);
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

  speedctxRoot.updateItems(
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

MainApplication.ApproveRequestComponent.renderModificationPeoplePicker = function ({
  pickerId = "Developer",
  label = "Developer",
  placeholder = "Select a Developer",
  multiple = false,
  defaultValue = null,
} = {}) {
  const container = document.getElementById("approverSection");

  if (!container) {
    console.error("#approverSection was not found.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "AdrFormGrid";

  wrapper.innerHTML = `
      <label
          for="${pickerId.toLowerCase()}"
          class="AdrField"
      >
      <span>
          ${label}
          <span class="required">*</span>
      </span>

      <select
          id="${pickerId.toLowerCase()}"
          class="js-select2 w-full px-3 sm:px-4 py-2 sm:py-3
                  placeholder-slate-400 focus:outline-none
                  focus:ring-2 focus:ring-primary-500
                  focus:border-transparent transition-all
                  text-sm sm:text-base"
          custom-people="${pickerId}"
          speed-bind="${pickerId}"
          speed-validate-mode="false"
          speed-include-control="true"
          speed-as-static="true"
          speed-validate-msg="Please select a Developer"
          control-value-type="people"
          disable-selection-order="false"
          placeholder="${placeholder}"
          ${multiple ? "multiple" : ""}
      ></select>
      </label>
  `;

  container.appendChild(wrapper);

  const picker = wrapper.querySelector(`[custom-people="${pickerId}"]`);

  // Set default value BEFORE initialization
  if (defaultValue) {
    PeoplePicker.setDefault(pickerId, defaultValue);
  }

  // Initialize only this picker
  // PeoplePicker.defaultValues = {};
    PeoplePicker.initializePeoplePickers(MainApplication.staffList);

  // PeoplePicker.initializePeoplePickers(
  //     MainApplication.staffList,
  //     null,
  //     "custom-people",
  //     picker
  // );
};

MainApplication.ApproveRequestComponent.renderModificationPeoplePickerReadonly = function ({
  pickerId = "Developer",
  label = "Developer",
  placeholder = "Select a Developer",
  multiple = false,
  defaultValue = null,
} = {}) {
  const container = document.getElementById("approverSection");

  if (!container) {
    console.error("#approverSection was not found.");
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "AdrFormGrid";

  wrapper.innerHTML = `
      <label
          for="${pickerId.toLowerCase()}"
          class="AdrField"
      >
      <span>
          ${label}
      </span>

      <select
          id="${pickerId.toLowerCase()}"
          class="js-select2 w-full px-3 sm:px-4 py-2 sm:py-3
                  placeholder-slate-400 focus:outline-none
                  focus:ring-2 focus:ring-primary-500
                  focus:border-transparent transition-all
                  text-sm sm:text-base"
          custom-people="${pickerId}"
          speed-bind="${pickerId}"
          speed-validate-mode="false"
          speed-include-control="true"
          speed-as-static="true"
          control-value-type="people"
          disable-selection-order="false"
          placeholder="${placeholder}"
          ${multiple ? "multiple" : ""}
      ></select>
      </label>
  `;

  container.appendChild(wrapper);

  const picker = wrapper.querySelector(`[custom-people="${pickerId}"]`);

  // 1. Initialize first
  PeoplePicker.initializePeoplePickers(MainApplication.staffList);

  // 2. Set default AFTER initialization (so getValue / bind actually see it)
  if (defaultValue) {
    if (typeof PeoplePicker.setValue === "function") {
      PeoplePicker.setValue(pickerId, defaultValue);
    } else if (typeof PeoplePicker.setDefault === "function") {
      PeoplePicker.setDefault(pickerId, defaultValue);
    }

    // Force the underlying <select> so $spcontext.bind picks it up
    if (picker) {
      $(picker).val(defaultValue).trigger("change");
    }
  }

  // 3. Make it readonly / non-editable
  if (picker) {
    // Native disable
    picker.disabled = true;
    picker.setAttribute("readonly", "readonly");

    // If Select2 is in use (js-select2 class), also disable via Select2 API
    if (typeof $(picker).select2 === "function") {
      try {
        $(picker).select2("enable", false);
      } catch (e) {
        // Select2 may not be fully ready; fall back to CSS
        $(picker).next(".select2-container").css("pointer-events", "none");
        $(picker).next(".select2-container").addClass("select2-container--disabled");
      }
    }

    // Extra safety: block pointer events on the whole control
    $(picker).closest(".AdrField").css({
      "pointer-events": "none",
      opacity: "0.85",
    });
  }
};
