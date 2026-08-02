loadNewRequestComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenNewRequestDependeciesLoaded();
  } else {
    setTimeout(function () {
      MainApplication.cachedState.pageStateCall = loadNewRequestComponent;
    }, 1000);
  }
};

var AppRequest;
var customWorkflowEngine;

MainApplication.NewRequestComponent.ApplicationDetails = function () {
  this.url = window.location.href;
  this.itemId = null;
  this.mode = null;
  this.requestDetails = {};
  this.Attachments = [];
  this.FileUrls = {};
  this.FolderUrl = "";
  this.AttachmentLoader = {};
  this.messageTemplate = {};
  this.feedback = false;
  this.approverComments = "";
  this.transactionHistory = [];
  this.defaultStage = "AA0";
  this.returned = null;
  this.sectionArr = [];
  this.sections = {};
  this.finalrating = [];
  this.questionSetCounter = 0;
  this.groupProperties = {};
  this.hodName = "";
  this.hodEmail = "";
  this.ncData = [];
  this.revisionDate = "";
  this.DocumentID = "";
  this.tableRecord = {};
  this.retrievedtableData = {};
  this.action = "";
  this.stepByStepCTX = new Speed();
  this.approvalTableCTX = new Speed();
  this.notificationTableCTX = new Speed();
  this.userAccessCTX = new Speed();
  this.reportTableCTX = new Speed();
  this.tableCtxRegistry = {};
};

function whenNewRequestDependeciesLoaded() {
  globalDefinitions.callLoader();
  $spcontext.assignAttributes();
  MainApplication.CurrentPageSubmitFunction =
    MainApplication.NewRequestComponent.confirmSubmit;
  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();

  AppRequest.itemId = $spcontext.getParameterByName(
    "itemid",
    window.location.href,
  );
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  customWorkflowEngine
    .routeEngine(customWorkflowEngine)
    .setCurrentUserAsInitiator();

  $spcontext.appliedEvents.attachments = [];
  $spcontext.applyAttachmentEvent(
    {
      o365: true,
      appendFiles: true,
      cancelClear: false,
    },
    function (elementName, listOfFiles, fileId) {
      MainApplication.attachmentFeedbackDisplay(
        elementName,
        listOfFiles,
        fileId,
      );
    },
    function (errors) {
      globalDefinitions.HandlerError(errors.msg, false);
    },
  );

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.stepByStepCTX,

    tableName: "StepByStepProcess",

    root: "stepByStepDescription",

    addButton: "#stepByStepButton",

    bindExtensions: {
      description:
        MainApplication.NewRequestComponent.textColumn("description", "StepByStepProcess"),

      actors: MainApplication.NewRequestComponent.textColumn("actors", "StepByStepProcess"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.stepByStepCTX, "StepByStepProcess"),
    },
  });

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.approvalTableCTX,

    tableName: "Approvers",

    root: "approvalStages",

    addButton: "#addApproverButton",

    bindExtensions: {
      approver: MainApplication.NewRequestComponent.textColumn("approver", "Approvers"),

      reason: MainApplication.NewRequestComponent.textColumn("reason", "Approvers"),

      approved: MainApplication.NewRequestComponent.textColumn("approved", "Approvers"),

      declined: MainApplication.NewRequestComponent.textColumn("declined", "Approvers"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.approvalTableCTX, "Approvers"),
    },
  });

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.notificationTableCTX,

    tableName: "Notifications",

    root: "notifications",

    addButton: "#addNotificationButton",

    bindExtensions: {
      event: MainApplication.NewRequestComponent.textColumn("event", "Notifications"),

      users: MainApplication.NewRequestComponent.textColumn("users", "Notifications"),

      template: MainApplication.NewRequestComponent.textColumn("template", "Notifications"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.notificationTableCTX, "Notifications"),
    },
  });

  $spcontext.applyValidationEvents();

  $("#newrequest-page").removeClass("hidden");
  globalDefinitions.closeLoader();
}

// MainApplication.NewRequestComponent.tableCtxRegistry = {};

MainApplication.NewRequestComponent.bindDeleteEvents = function () {
  $(".delete-row")
    .off("click")
    .on("click", function () {
      const pos = $(this).data("pos");
      const table = $(this).data("table");
      const ctx = AppRequest.tableCtxRegistry[table];

      MainApplication.NewRequestComponent.deleteTableRow(ctx, pos, table);
    });
};

MainApplication.NewRequestComponent.initializeDynamicTable = function (config) {
  AppRequest.tableCtxRegistry[config.tableName] = config.ctx;

  config.ctx.dynamicTable(config.tableName, {
    root: config.root,
    pagesize: 200,
    paginateSize: 5,
    bindExtensions: config.bindExtensions,

    afterRowAdded: function () {
      $spcontext.applyValidationEvents();
      MainApplication.NewRequestComponent.bindDeleteEvents();
    },

    afterRowRemoved: function () {
      $spcontext.applyValidationEvents();
      MainApplication.NewRequestComponent.bindDeleteEvents();
    },
  });

  MainApplication.NewRequestComponent.addTableRow(config.ctx, config.tableName);

  $(config.addButton).on("click", function () {
    MainApplication.NewRequestComponent.addTableRow(config.ctx, config.tableName);
  });
};

MainApplication.NewRequestComponent.deleteColumn = function (ctx, tableName) {
  return function (valueToEva, pos) {
    return `
            <i class="fa-solid fa-trash delete-row"
                data-pos="${pos}"
                data-table="${tableName}"
                style="cursor:pointer;color:#e6053d;">
            </i>
        `;
  };
};

MainApplication.NewRequestComponent.textColumn = function (field, tableName) {
  return function (valueToEva) {
    return `
            <input
                id="${$spcontext.uniqueIdGenerator()}"
                type="text"
                placeholder="Enter text"
                speed-bind-validate="${tableName}_${field}"
                speed-as-static="true"
                class="form-control no-border-radius speed-table-include"
                value="${valueToEva[field] || ""}"
            />
        `;
  };
};

MainApplication.NewRequestComponent.addTableRow = function (ctx, tableName) {
    ctx.dynamicTableSettings[tableName].addRow();
};

MainApplication.NewRequestComponent.deleteTableRow = function (ctx, pos, tableName) {
    ctx.dynamicTableSettings[tableName].deleteRow(pos);
};

// Form submission processes
MainApplication.NewRequestComponent.confirmSubmit = function (action) {
  AppRequest.action = action;
  MainApplication.confirmAction =
    MainApplication.NewRequestComponent.actionConfirmed;
  $("#confirmModal").modal("show");
};

MainApplication.NewRequestComponent.actionConfirmed = function () {
  MainApplication.NewRequestComponent.saveDataToList();
};

MainApplication.NewRequestComponent.saveDataToList = function () {
  globalDefinitions.onActionClicked();

  var formData = $spcontext.bind({});

  var pickerValues = PeoplePicker.getValue();
  var people = PeoplePicker.getConfiguredValue();
  if ($spcontext.checkPassedValidation()) {
    formData.Employee = pickerValues.Employee;
    formData.Witness = pickerValues.Witness;
    formData.ReportedBy = pickerValues.ReportedBy;

    formData.EmployeeEmail = people.Employee;
    formData.HOD = SP.FieldUserValue.fromUser(
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail,
    );
    formData.HODEmail =
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
    formData.Division =
      MainApplication.staffDetails[formData.EmployeeEmail].Department;

    formData.Title = MainApplication.staffDetails[formData.EmployeeEmail].Title;
    globalDefinitions.callLoader();
    AppRequest.returned = AppRequest.requestDetails.ReturnForCorrection;

    customWorkflowEngine.updateStageByName({
      name: globalDefinitions.stageDefinitions.employee,
      username: formData.Title,
      authenticationValue: formData.EmployeeEmail,
      emails: [formData.EmployeeEmail],
    });

    formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(formData, AppRequest.transactionHistory, {
        stage: "Management Rep",
        action: "Violation Notice Issued",
      });
    formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .runRouting(formData);

    globalDefinitions.onActionCompleted();
    MainApplication.NewRequestComponent.proceedToList(formData, false);
    // console.log("Form Data to be submitted:", formData);
  } else {
    globalDefinitions.HandlerError("", true);
    globalDefinitions.onActionFailed();
  }
};

MainApplication.NewRequestComponent.proceedToList = function (formData) {
  if (AppRequest.itemId == null) {
    speedctxRoot.createItems(
      [formData],
      globalDefinitions.stageDefinitions.listname,
      function (createdItemsProperties) {
        var itemID = createdItemsProperties[0].get_id();
        var updateObj = {};
        updateObj.ID = itemID;
        updateObj.WorkflowRequestID =
          globalDefinitions.stageDefinitions.workflowcode + itemID;

        AppRequest.requestDetails = formData;
        AppRequest.requestDetails.WorkflowRequestID =
          updateObj.WorkflowRequestID;
        // updateObj.Title = updateObj.WorkflowRequestID;
        updateObj.RequestCreated = $spcontext.serverDate();
        updateObj.Year = $spcontext.serverDate().getFullYear();
        updateObj.Month = $spcontext.serverDate().getMonth() + 1;

        speedctxRoot.updateItems(
          [updateObj],
          globalDefinitions.stageDefinitions.listname,
          function () {
            globalDefinitions.HandlerSuccess(
              `Violation Notice issued successfully`,
            );
            //   MainApplication.NewRequestComponent.resetFoodInspectionForm();

            globalDefinitions.AuditLogManager_SaveLog({
              Action: `Issued Violation Notice Form ${AppRequest.requestDetails.WorkflowRequestID}`,
            });
            // });
            globalDefinitions.closeLoader();
            $spcontext.redirect("#/", false);

            globalDefinitions.onActionCompleted();
          },
        );
      },
    );
  }
};