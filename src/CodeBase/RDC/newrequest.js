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
};

function whenNewRequestDependeciesLoaded() {
  globalDefinitions.callLoader();
  $spcontext.assignAttributes();
  MainApplication.CurrentPageSubmitFunction =
  MainApplication.NewRequestComponent.confirmSubmit;
  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  globalDefinitions.extendStages();

  AppRequest.itemId = $spcontext.getParameterByName("itemid", window.location.href);
  AppRequest.mode = $spcontext.getParameterByName("mode", window.location.href);

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  globalDefinitions.SetWorkflowRouting(customWorkflowEngine);
  customWorkflowEngine.routeEngine(customWorkflowEngine).setCurrentUserAsInitiator();

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

  AppRequest.stepByStepCTX.dynamicTable("StepByStepProcess", {
        root: "stepByStepDescription",
        pagesize: 200,
        paginateSize: 5,
        bindExtensions: {
            "description": function (valueToEva, pos) {
                return "<input id='" + $spcontext.uniqueIdGenerator() + "' placeholder='Enter text' type='text' speed-bind-validate='TempData' class='form-control no-border-radius speed-table-include' speed-as-static='true' value='" + valueToEva.description + "'/>";
            },
            "actors": function (valueToEva, pos) {
                return "<input id='" + $spcontext.uniqueIdGenerator() + "' placeholder='Enter text' type='text' speed-bind-validate='TempData' class='form-control no-border-radius speed-table-include' speed-as-static='true' value='" + valueToEva.actors + "'/>";
            },
            "action": function (valueToEva, pos) {
                return `
                    <i
                        class="fa-solid fa-trash delete-step-row"
                        style="color:#e6053d;cursor:pointer;"
                        data-pos="${pos}"
                        data-table="StepByStepProcess">
                    </i>
                `;
                // return `<i class="fa-solid fa-trash" style="color: #e6053d; cursor: pointer;" onclick='MainApplication.NewRequestComponent.deleteTableRow(${pos},"StepByStepProcess")';></i>`;
            },
        },
        afterRowAdded: function () {
            $spcontext.applyValidationEvents();
            MainApplication.NewRequestComponent.bindDeleteEvents();
        },
        afterRowRemoved: function () {
            $spcontext.applyValidationEvents();
            MainApplication.NewRequestComponent.bindDeleteEvents();
        }
    });
    MainApplication.NewRequestComponent.addTableRow("StepByStepProcess");
    $("#stepByStepButton").on("click", () => {
        MainApplication.NewRequestComponent.addTableRow("StepByStepProcess");
    });

    $spcontext.applyValidationEvents();

  
  $("#newrequest-page").removeClass("hidden");
  globalDefinitions.closeLoader();
}

MainApplication.NewRequestComponent.bindDeleteEvents = function () {
    $(".delete-step-row")
        .off("click")
        .on("click", function () {
            const pos = $(this).data("pos");
            const table = $(this).data("table");

            MainApplication.NewRequestComponent.deleteTableRow(pos, table);
        });
}

MainApplication.NewRequestComponent.addTableRow = function (bindclass) {
    AppRequest.stepByStepCTX.dynamicTableSettings[bindclass].addRow();
}

MainApplication.NewRequestComponent.deleteTableRow = function (pos, bindclass) {
    AppRequest.stepByStepCTX.dynamicTableSettings[bindclass].deleteRow(pos);
}

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
        formData.HOD = SP.FieldUserValue.fromUser(MainApplication.staffDetails[formData.EmployeeEmail].HodEmail);
        formData.HODEmail = MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
        formData.Division = MainApplication.staffDetails[formData.EmployeeEmail].Department;

        formData.Title = MainApplication.staffDetails[formData.EmployeeEmail].Title;
        globalDefinitions.callLoader();
        AppRequest.returned = AppRequest.requestDetails.ReturnForCorrection;

        customWorkflowEngine.updateStageByName({
          name: globalDefinitions.stageDefinitions.employee,
          username: formData.Title,
          authenticationValue: formData.EmployeeEmail,
          emails: [formData.EmployeeEmail],
        });
        
        formData = customWorkflowEngine.routeEngine(customWorkflowEngine).requestHistoryHandler(formData, AppRequest.transactionHistory, { stage: "Management Rep", action: "Violation Notice Issued" });
        formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData);


        globalDefinitions.onActionCompleted();
        MainApplication.NewRequestComponent.proceedToList(formData, false);
        // console.log("Form Data to be submitted:", formData);
    }
    else {
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
            globalDefinitions.HandlerSuccess(`Violation Notice issued successfully`);
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
