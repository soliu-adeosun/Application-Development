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
  // globalDefinitions.callLoader();
  $spcontext.assignAttributes();
  MainApplication.CurrentPageSubmitFunction = MainApplication.NewRequestComponent.confirmSubmit;
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
    if (AppRequest.mode === "correction") {
      $(".commentContainer").show();
      $("#approvercomment").attr("speed-bind", "Comment");
    }

  $spcontext.appliedEvents.attachments = [];

  var basicQuery = [
    {
        ascending: "TRUE",
        orderby: "Title",
    },
];

delete rsBAContext.htmlDictionary['RSDivisions'];

rsBAContext.bindListDirectives({
    RSDivisions: {
        query: $spcontext.camlBuilder(basicQuery),

        customAfterLoadFunction: function (listElements) {

            const $select = $("#divisionsInvolved");

            // Add "All Division" without adding it to SharePoint
            $select.prepend(
                $("<option>", {
                    value: "All Divisions/Units",
                    text: "All Division/Units"
                })
            );

            // Initialize Select2
            $select.select2({
                placeholder: "Select a Division/Unit",
                allowClear: true
            });

        }
    }
});

    PeoplePicker.defaultValues = {};
    PeoplePicker.initializePeoplePickers(MainApplication.staffList);

  $spcontext.applyAttachmentEvent(
		{
			o365: true,
			appendFiles: true,
			cancelClear: false,
			dynamicNaming: false,
			fileNameasName: true,
		},
		function (elementName, listOfFiles, fileId) {
			const allowedExtensions = null;

			$("div[speed-file-bind='" + elementName + "']").empty();

			if (listOfFiles.files.length !== 0) {
				for (var y = 0; y < listOfFiles.files.length; y++) {
					let fileObject = listOfFiles.files[y];

					let fileName =
						typeof fileObject === "string"
							? fileObject.split("/").pop()
							: fileObject.dataName;

					if (Array.isArray(allowedExtensions) && allowedExtensions.length > 0) {
						if (!allowedExtensions.some(ext => fileName.toLowerCase().endsWith(ext))) {
							$spcontext.clearFileInput(fileId);
							globalDefinitions.HandlerError("File type not allowed!");
							listOfFiles.files.splice(y, 1);
							y--;
							continue;
						}
					}


					// Continue to display files normally
					if (typeof fileObject === "string") {
						// For existing uploaded file URLs
						var splitedLinks = fileObject.split("/");
						var pos = splitedLinks.length - 1;
						var displayName = splitedLinks[pos];

						var attachmentBlock =
							"<p id='" + elementName + "class='docstring' " + "display" + y + "' style='color:#002c4d'>" +
							fileName +
							"<a href='#' " +
							"class='attachment-inline-delete' " +
							"data-element='" + elementName + "' " +
							"data-index='" + y + "' " +
							"data-fileid='" + fileId + "' " +
							"style='color:red; cursor:pointer; padding-left:5px'>" +
							"x</a></p>";

						$("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);

					} else {
						// For newly added but not yet uploaded files
						var attachmentBlock =
							"<p id='" + elementName + "display" + y + "' style='color:#002c4d'>" +
							fileName +
							"<a href='#' " +
							"class='attachment-inline-delete' " +
							"data-element='" + elementName + "' " +
							"data-index='" + y + "' " +
							"data-fileid='" + fileId + "' " +
							"style='color:red; cursor:pointer; padding-left:5px'>" +
							"x</a></p>";

						$("div[speed-file-bind='" + elementName + "']").append(attachmentBlock);
					}
				}
			}
		},
		function (errors) {
			globalDefinitions.HandlerError(errors.msg, false);
		}
	);

  MainApplication.NewRequestComponent.prepareAllTables();

  $("#isApprovalsNeeded").on("change", function () {
      MainApplication.NewRequestComponent.toggleApprovalStages();
  });
  $("#period").on("change", function () {
      MainApplication.NewRequestComponent.toggleOtherPeriod();
  });
  $("#retentionPeriod").on("change", function () {
      MainApplication.NewRequestComponent.toggleRetentionPeriod();
  });

  $("#pullFromAnothersystem").on("change", function () {
      const value = $(this).val();
      MainApplication.NewRequestComponent.togglePullFromOtherSystem(value);
  });

  $("#isProcessRelated").on("change", function () {
      const value = $(this).val();
      MainApplication.NewRequestComponent.toggleRelatedProcess(value);
  });

  $("#requestType").on("change", function () {
      const value = $(this).val();
      MainApplication.NewRequestComponent.toggleRequestType(value);
  });

  // #modificationType is created/destroyed dynamically inside
  // #modificationTypeContainer, so it's bound via delegation rather
  // than a direct handler.
  $(document).on("change", "#modificationType", function () {
      const value = $(this).val();
      MainApplication.NewRequestComponent.toggleModificationType(value);
  });

$("#conditionalApproval").on("change", function () {

    const value = $(this).val();

    if (value === "Yes") {

        MainApplication.renderField({
            containerId: "approvalsContainer",
            className: "top-space",
            type: "textarea",
            bindValidate: "ConditionalApprovalInformation",
            placeholder: "Describe the conditional approval information...",
            rows: 4,
            required: true
        });

    } else {
        $("#approvalsContainer").empty();
    }
});

  $(document).on("click", ".attachment-inline-delete", function (e) {
		e.preventDefault();

		const elementName = $(this).data("element");
		const index = parseInt($(this).data("index"), 10);
		const fileId = $(this).data("fileid");

		MainApplication.NewRequestComponent.deleteRowAttachment(
			elementName,
			index,
			fileId
		);
	});

  // Set the correct state on page load
  MainApplication.NewRequestComponent.toggleRetentionPeriod();
  MainApplication.NewRequestComponent.toggleOtherPeriod();
  MainApplication.NewRequestComponent.toggleApprovalStages();
  MainApplication.NewRequestComponent.togglePullFromOtherSystem();
  MainApplication.NewRequestComponent.toggleRelatedProcess();
  MainApplication.NewRequestComponent.toggleRequestType();
  $spcontext.applyValidationEvents();

  MainApplication.NewRequestComponent.clearAllAttachments("SupportingDocuments", "fileUploader");
  setTimeout(function () {
        if (AppRequest.itemId !== null && AppRequest.itemId !== "") {
            MainApplication.NewRequestComponent.recoverListData();
        }
        $("#newLoader").hide();
        $("#newrequest-page").removeClass("hidden");
        globalDefinitions.closeLoader();
    }, 1000);
  
}

MainApplication.NewRequestComponent.togglePullFromOtherSystem = function (value) {
  

    if (value === "Yes") {

        MainApplication.renderField({
            containerId: "pullDataContainer",
            className: "top-space",
            type: "textarea",
            bindValidate: "SystemInformation",
            placeholder: "Describe the information to be pulled...",
            rows: 4,
            required: true
        });

    } else {
        $("#pullDataContainer").empty();
    }
}

MainApplication.NewRequestComponent.toggleRelatedProcess = function (value) {
  

    if (value === "Yes") {

        MainApplication.renderField({
            containerId: "relatedProcessContainer",
            className: "top-space",
            type: "textarea",
            bindValidate: "RelatedProcessInformation",
            placeholder: "Describe the information to be pulled...",
            rows: 4,
            required: true
        });

    } else {
        $("#relatedProcessContainer").empty();
    }
}

// Request Type ("New" / "Modification") gates the whole form below it.
// - "New" -> show the full form.
// - "Modification" -> reveal the "Modification" (Minor/Major) selector.
//     - "Minor" -> show only a description text area.
//     - "Major" -> show the full form, same as "New".
//
// toggleMainForm() is what actually shows/hides the big form and, just as
// importantly, strips speed-bind-validate / speed-validate-mode from
// everything inside it while it's hidden so $spcontext.checkPassedValidation()
// doesn't block submission on fields the user can't see. Nothing inside the
// wrapper is touched otherwise, so whatever the user already filled in is
// still there if they flip back to "New"/"Major".
MainApplication.NewRequestComponent.toggleRequestType = function (value) {
    const $modTypeContainer = $("#modificationTypeContainer");

    if (value === "Modification") {

        $modTypeContainer.html(`
            <span>
                Modification
                <span class="required">*</span>
            </span>
            <select id="modificationType" speed-bind-validate="ModificationType" speed-bind-class="ProcessOverview">
                <option value="">Select a value</option>
                <option value="Minor">Minor</option>
                <option value="Major">Major</option>
            </select>
        `);

        $("#modificationDetailsContainer").empty();
        MainApplication.NewRequestComponent.toggleMainForm(false);

    } else if (value === "New") {

        // MainApplication.NewRequestComponent.prepareAllTables();
        $modTypeContainer.empty();
        $("#modificationDetailsContainer").empty();
        MainApplication.NewRequestComponent.toggleMainForm(true);

    } else {

        $modTypeContainer.empty();
        $("#modificationDetailsContainer").empty();
        MainApplication.NewRequestComponent.toggleMainForm(false);
    }
};

MainApplication.NewRequestComponent.toggleModificationType = function (value) {

    if (value === "Minor") {

        $("#modificationDetailsContainer").html(`
            <div class="AdrFormGrid top-space">
                <label class="AdrField">
                    <span>
                        Process Name
                        <span class="required">*</span>
                    </span>
                    <input type="text" placeholder="Enter text" speed-bind-validate="ProcessName" speed-bind-class="Minor" />
                </label>

                <label class="AdrField">
                    <span>
                        Link to Application
                        <span class="required">*</span>
                    </span>
                    <input type="text" placeholder="Enter text" speed-bind-validate="ExistingLink" speed-bind-class="Minor" />
                </label>

                <label class="AdrField">
                    <span>
                        Current functionality (What does the system do today?)
                        <span class="required">*</span>
                    </span>
                    <textarea placeholder="Enter text" speed-bind-validate="CurrentFunctionality" speed-bind-class="Minor"></textarea>
                </label>

                <label class="AdrField">
                    <span>
                        What should change?
                        <span class="required">*</span>
                    </span>
                    <textarea placeholder="Enter text" speed-bind-validate="WhatShouldChange" speed-bind-class="Minor"></textarea>
                </label>

                <label class="AdrField">
                    <span>
                        Reason / justification (Why is this change needed?)
                        <span class="required">*</span>
                    </span>
                    <textarea placeholder="Enter text" speed-bind-validate="ModificationReason" speed-bind-class="Minor"></textarea>
                </label>

                <label class="AdrField">
                    <span>
                        Systems / users affected
                        <span class="required">*</span>
                    </span>
                    <textarea placeholder="Enter text" speed-bind-validate="SystemsAffected" speed-bind-class="Minor"></textarea>
                </label>

                <label class="AdrField">
                    <span>
                        Date needed
                        <span class="required">*</span>
                    </span>
                    <input type="date" speed-bind-validate="DateRequired" speed-bind-class="Minor" />
                </label>
            </div>
        `);

        MainApplication.NewRequestComponent.toggleMainForm(false);

    } else if (value === "Major") {
        // MainApplication.NewRequestComponent.prepareAllTables();

        $("#modificationDetailsContainer").empty();
        MainApplication.NewRequestComponent.toggleMainForm(true);

    } else {

        $("#modificationDetailsContainer").empty();
        MainApplication.NewRequestComponent.toggleMainForm(false);
    }
};

MainApplication.NewRequestComponent.toggleMainForm = function (show) {
    const $wrapper = $("#mainRequestFormWrapper");
    const $draftBtn = $(".draftbtn");

    $wrapper.toggleClass("hidden", !show);
    $draftBtn.toggleClass("hidden", !show);

    if (!show) {
        // Stash every currently-active validate marker inside the wrapper
        // and remove it, so hidden fields are never required.
        $wrapper.find("[speed-bind-validate]").each(function () {
            $(this).attr("data-speed-bind-validate-backup", $(this).attr("speed-bind-validate"));
            $(this).removeAttr("speed-bind-validate");
        });

        $wrapper.find("[speed-file-validate]").each(function () {
            $(this).attr("data-speed-file-validate-backup", $(this).attr("speed-file-validate"));
            $(this).removeAttr("speed-file-validate");
        });

        $wrapper.find("[speed-validate-mode='true']").each(function () {
            $(this).attr("data-speed-validate-mode-backup", "true");
            $(this).attr("speed-validate-mode", "false");
        });

    } else {
        // Restore exactly what was active before the wrapper was hidden.
        $wrapper.find("[data-speed-bind-validate-backup]").each(function () {
            $(this)
                .attr("speed-bind-validate", $(this).attr("data-speed-bind-validate-backup"))
                .removeAttr("data-speed-bind-validate-backup");
        });

        $wrapper.find("[data-speed-file-validate-backup]").each(function () {
            $(this)
                .attr("speed-file-validate", $(this).attr("data-speed-file-validate-backup"))
                .removeAttr("data-speed-file-validate-backup");
        });

        $wrapper.find("[data-speed-validate-mode-backup]").each(function () {
            $(this)
                .attr("speed-validate-mode", "true")
                .removeAttr("data-speed-validate-mode-backup");
        });
    }
};

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
  AppRequest.tableRootRegistry = AppRequest.tableRootRegistry || {};
  AppRequest.tableRootRegistry[config.tableName] = config.root;
  AppRequest.tableFieldOrderRegistry = AppRequest.tableFieldOrderRegistry || {};
  AppRequest.tableFieldOrderRegistry[config.tableName] = Object.keys(config.bindExtensions)
    .filter(function (key) { return key !== "action"; });

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

MainApplication.NewRequestComponent.textColumn = function (field) {
  return function (valueToEva) {
    return `
            <input
                id="${$spcontext.uniqueIdGenerator()}"
                type="text"
                placeholder="Enter text"
                speed-bind-validate="TempData"
                speed-as-static="true"
                class="form-control no-border-radius speed-table-include"
                value="${valueToEva[field] || ""}"
            />
        `;
  };
};

MainApplication.NewRequestComponent.textAreaColumn = function (field) {
  return function (valueToEva) {
    return `
            <textarea
                id="${$spcontext.uniqueIdGenerator()}"
                placeholder="Enter text"
                speed-bind-validate="TempData"
                speed-as-static="true"
                row="4"
                class="form-control no-border-radius speed-table-include"
                
            >${valueToEva[field] || ""}</textArea>
        `;
  };
};

MainApplication.NewRequestComponent.addTableRow = function (ctx, tableName) {
    ctx.dynamicTableSettings[tableName].addRow();
};

// stringnifyDate only ever outputs day-month-year, regardless of what
// format string you pass it - this reorders that into yyyy-mm-dd so it
// survives being dropped into an <input type="date">. Handles both "-"
// and "/" separators and 2- or 4-digit years.
MainApplication.NewRequestComponent.toISODateInput = function (rawValue) {
    if (!rawValue) {
        return "";
    }

    var parts = rawValue.split(/[-\/]/);
    if (parts.length !== 3) {
        return "";
    }

    var day = parts[0].padStart(2, "0");
    var month = parts[1].padStart(2, "0");
    var year = parts[2];

    if (year.length === 2) {
        year = (Number(year) < 70 ? "20" : "19") + year;
    }

    return `${year}-${month}-${day}`;
};

MainApplication.NewRequestComponent.deleteTableRow = function (ctx, pos, tableName) {
    ctx.dynamicTableSettings[tableName].deleteRow(pos);
};
MainApplication.NewRequestComponent.hydrateDynamicTables = function (savedData) {
  Object.keys(savedData).forEach(function (tableName) {
    var ctx = AppRequest.tableCtxRegistry[tableName];
    var root = AppRequest.tableRootRegistry[tableName];
    var fieldOrder = AppRequest.tableFieldOrderRegistry[tableName];
    var rows = savedData[tableName];

    if (!ctx || !root || !Array.isArray(rows) || rows.length === 0) {
      // Nothing saved for this section yet - keep the single blank row
      // that initializeDynamicTable() already added, so the user still
      // has somewhere to start typing.
      return;
    }

    var settings = ctx.dynamicTableSettings[tableName];

    while ($("#" + root).children("tr").length > 0) {
      MainApplication.NewRequestComponent.deleteTableRow(ctx, 0, tableName);
    }

    rows.forEach(function (rowData) {
      settings.addRow();

      var $row = $("#" + root).children("tr").last();
      var $inputs = $row.find(".speed-table-include");

      fieldOrder.forEach(function (fieldName, index) {
        var $input = $inputs.eq(index);
        if ($input.length) {
          $input.val(rowData[fieldName] || "");
        }
      });
    });
  });

  MainApplication.NewRequestComponent.bindDeleteEvents();
  $spcontext.applyValidationEvents();
};

// Form submission processes
MainApplication.NewRequestComponent.confirmSubmit = function (action) {
  if (action === "Draft") {
        MainApplication.confirmAction = MainApplication.NewRequestComponent.saveConfirmed;
        $("#confirmModal").modal("show");
        console.log(action);
    } else {
        MainApplication.confirmAction = MainApplication.NewRequestComponent.actionConfirmed;
        $("#confirmModal").modal("show");
        console.log(action);
    }
}

MainApplication.NewRequestComponent.actionConfirmed = function () {
  MainApplication.NewRequestComponent.saveDataToList();
};

MainApplication.NewRequestComponent.saveConfirmed = function () {
    MainApplication.NewRequestComponent.saveDataToListAsDraft();
}
MainApplication.NewRequestComponent.saveDataToList = function () {
  globalDefinitions.onActionClicked();

  var formData = $spcontext.bind({});
  var pickerValues = PeoplePicker.getValue();
  var people = PeoplePicker.getConfiguredValue();

  formData.ExtraFeatures = MainApplication.getExtraFeatures("extraFeaturesTable");
  formData.StepByStepProcess = JSON.stringify(formData.StepByStepProcess);
  formData.Approvers = JSON.stringify(formData.Approvers);
  formData.Notifications = JSON.stringify(formData.Notifications);
  formData.UserAccess = JSON.stringify(formData.UserAccess);
  formData.Reports = JSON.stringify(formData.Reports);
  formData.ExtraFeatures = JSON.stringify(formData.ExtraFeatures);
  if ($spcontext.checkPassedValidation()) {

    try {
      var delegate = pickerValues?.Delegate;

      formData.Delegate =
          delegate && delegate.$GI_1
              ? delegate
              : null;
      formData.DivisionsInvolved = $("#divisionsInvolved").val() || [];
      formData.DivisionsInvolved = JSON.stringify(formData.DivisionsInvolved);
      formData.EmployeeEmail = CurrentUserProperties.email;
      
      formData.HOD = SP.FieldUserValue.fromUser(
        MainApplication.staffDetails[formData.EmployeeEmail].HodEmail,
      );
      formData.HODEmail =
        MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
      formData.Division =
        MainApplication.staffDetails[formData.EmployeeEmail].Department;
    } catch (error){};
    

    formData.Title = CurrentUserProperties.title;
    globalDefinitions.callLoader();
    AppRequest.returned = AppRequest.requestDetails.ReturnForCorrection;

    customWorkflowEngine.updateStageByName({
      name: globalDefinitions.stageDefinitions.hod,
      username: MainApplication.staffDetails[formData.HODEmail].Title,
      authenticationValue: formData.HODEmail,
      emails: [formData.HODEmail],
    });

    if (AppRequest.mode === "correction"){
      formData.ReturnForCorrection = "No";
      formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(formData, AppRequest.transactionHistory, {
        stage: globalDefinitions.stageDefinitions.employee,
        action: "Application Re-submitted",
      });
    } else {
      formData = customWorkflowEngine
      .routeEngine(customWorkflowEngine)
      .requestHistoryHandler(formData, AppRequest.transactionHistory, {
        stage: globalDefinitions.stageDefinitions.employee,
        action: "Application Submitted",
      });
    }
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

MainApplication.NewRequestComponent.saveDataToListAsDraft = function () {
  globalDefinitions.onActionClicked();
  var formData = $spcontext.bind({}, "ProcessOverview") || {};
  if ($spcontext.checkPassedValidation()) {
    formData = $spcontext.bind({});
    var pickerValues = PeoplePicker.getValue() || {};
    var people = PeoplePicker.getConfiguredValue() || {};
    try {
      formData.ExtraFeatures = MainApplication.getExtraFeatures("extraFeaturesTable") || {};
      formData.StepByStepProcess = JSON.stringify(formData.StepByStepProcess) || {};
      formData.Approvers = JSON.stringify(formData.Approvers) || {};
      formData.Notifications = JSON.stringify(formData.Notifications) || {};
      formData.UserAccess = JSON.stringify(formData.UserAccess) || {};
      formData.Reports = JSON.stringify(formData.Reports) || {};
      formData.ExtraFeatures = JSON.stringify(formData.ExtraFeatures) || {};
      // if (formData.DateRequired) {
      // formData.DateRequired = $spcontext.stringnifyDate({
      //     value: formData.DateRequired,
      //     includeTime: false,
      //     format: "dd-mm-yy",
      // });
      // } else {
      //     formData.DateRequired = null;
      // }

      var delegate = pickerValues?.Delegate;

      formData.Delegate =
          delegate && delegate.$GI_1
              ? delegate
              : null;
      formData.DivisionsInvolved = $("#divisionsInvolved").val() || [];
      formData.DivisionsInvolved = JSON.stringify(formData.DivisionsInvolved) || {};
    } catch (error) {};
    formData.EmployeeEmail = CurrentUserProperties.email;
    
    formData.HOD = SP.FieldUserValue.fromUser(
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail,
    );
    formData.HODEmail =
      MainApplication.staffDetails[formData.EmployeeEmail].HodEmail;
    formData.Division =
      MainApplication.staffDetails[formData.EmployeeEmail].Department;

    formData.Title = CurrentUserProperties.title;
    globalDefinitions.callLoader();

    formData = customWorkflowEngine.routeEngine(customWorkflowEngine).runRouting(formData, AppRequest.defaultStage, globalDefinitions.stageDefinitions.save);
    formData.Approval_Status = globalDefinitions.stageDefinitions.save;
    formData.Current_Approver = globalDefinitions.stageDefinitions.employee;
    globalDefinitions.onActionCompleted();
    console.log("Data at SaveAsDraft: ", formData);
    MainApplication.NewRequestComponent.proceedToList(formData, false);
} else {
    globalDefinitions.HandlerError("Please fill the Process Overview part at least");
    globalDefinitions.onActionFailed();
}
  // console.log("Form Data to be submitted:", formData);
}
MainApplication.NewRequestComponent.proceedToList = function (formData) {
  
	var Attachments = $spcontext.grabAllAttachments();
	//used to grab all string links so that it can be updated.
	//mostly used when return for more information is part of the workflow process
	AppRequest.FileUrls = $spcontext.grabAllAttachmentsLinks();
	globalDefinitions.uploadAttachment(speedctxRoot, Attachments, globalDefinitions.stageDefinitions.foldername, globalDefinitions.stageDefinitions.documentlib, function () {
		if (AppRequest.itemId == null) {
      console.log("New data about to be created: ", formData);
			speedctxRoot.createItems([formData], globalDefinitions.stageDefinitions.listname, function (createdItemsProperties) {
				var itemID = createdItemsProperties[0].get_id();
				var updateObj = {};
				updateObj.ID = itemID;
				// var dateCreatedCode = $spcontext.stringnifyDate({
				// 	includeTime: true,
				// 	timeSpace: false,
				// 	format: "dd-mm-yy",
				// });
				// dateCreatedCode = itemID + "_" + dateCreatedCode.replace(/-/g, "");
				updateObj.WorkflowRequestID = globalDefinitions.stageDefinitions.workflowcode + itemID;

				AppRequest.requestDetails = formData;
				AppRequest.requestDetails.WorkflowRequestID = updateObj.WorkflowRequestID;
				if (!jQuery.isEmptyObject(AppRequest.AttachmentLoader)) {
					updateObj.Attachment_Folder = AppRequest.AttachmentLoader.Attachmentfolder;
					updateObj.AttachmentURL = AppRequest.AttachmentLoader.Attachmentlinks;
				}
        updateObj.RequestCreated = $spcontext.serverDate();
				updateObj.Year = $spcontext.serverDate().getFullYear();
        updateObj.Month = $spcontext.serverDate().getMonth();
				updateObj.LastTimeItemModifiedByWorklow = $spcontext.serverDate();
				updateObj.SLA_COUNT_UPDATED = "No";

				speedctxRoot.updateItems([updateObj], globalDefinitions.stageDefinitions.listname, function () {
					globalDefinitions.HandlerSuccess(`Request submitted successfully`);
					$spcontext.redirect("#/", false);
					globalDefinitions.closeLoader();

					globalDefinitions.AuditLogManager_SaveLog({
						Action: `Submitted Request  ${AppRequest.requestDetails.WorkflowRequestID}`,
					});
					// });

					globalDefinitions.onActionCompleted();
				});
			});
		} else {
      console.log("New data about to be updated: ", formData);
			formData.ID = AppRequest.requestDetails.ID;
			formData.AttachmentURL = JSON.stringify(AppRequest.FileUrls);
      // formData.DateRequired = $spcontext.stringnifyDate({
      //     value: formData.DateRequired,
      //     includeTime: false,
      //     format: "dd/mm/yy",
      // });

			speedctxRoot.updateItems([formData], globalDefinitions.stageDefinitions.listname, function () {
				if (AppRequest.requestDetails.ReturnForCorrection !== "Yes") {
					AppRequest.requestDetails.Current_Approver = formData.Current_Approver;
				}

				setTimeout(() => {
					globalDefinitions.closeLoader();
				}, 2000);
				globalDefinitions.HandlerSuccess("Request modified successfully");

				globalDefinitions.AuditLogManager_SaveLog({
					Action: `submitted request ${AppRequest.requestDetails.WorkflowRequestID}`
				});
				globalDefinitions.onActionCompleted();
				$spcontext.redirect("#/", false);
			});
		}
	});
};
MainApplication.NewRequestComponent.toggleApprovalStages = function () {
    const isApprovalNeeded = $("#isApprovalsNeeded").val() === "Yes";

    const $container = $("#approvalStagesContainer");
    const $conditionalApprovalContainer = $("#conditionalApprovalContainer");
    const $table = $("#approvalTable");

    const $conditionalApproval = $("#conditionalApproval");
    const $maxApprovalTime = $("#maxApprovalTime");

    // Approval table
    $container.toggleClass("hidden", !isApprovalNeeded);

    $table.attr(
        "speed-validate-mode",
        isApprovalNeeded ? "true" : "false"
    );

    // Approval-related fields
    $conditionalApprovalContainer.toggleClass(
        "hidden",
        !isApprovalNeeded
    );

    if (isApprovalNeeded) {

        // Make fields required
        $conditionalApproval.attr(
            "speed-bind-validate",
            "ConditionalApproval"
        );

        $maxApprovalTime.attr(
            "speed-bind-validate",
            "MaxApprovalTime"
        );

    } else {

        // Make fields non-required
        $conditionalApproval.removeAttr(
            "speed-bind-validate"
        );

        $maxApprovalTime.removeAttr(
            "speed-bind-validate"
        );

        // Reset values
        $conditionalApproval.val("");
        $maxApprovalTime.val("");

        // Hide/clear conditional approval content
        $("#approvalsContainer").empty();

        // Clear table
        $("#approvalStages").empty();
    }
};

MainApplication.NewRequestComponent.populateSelect2Editable = function (savedDivisions) {
    const $select = $("#divisionsInvolved");
    $select.val(savedDivisions || []).trigger("change.select2");
};

MainApplication.NewRequestComponent.renderEditableExtraFeaturesTable = function (tableId, savedFeatures) {
    const allFeatures = MainApplication.extraFeatures || [];
    const savedList = Array.isArray(savedFeatures) ? savedFeatures : [];
    const tbody = document.querySelector(`#${tableId} tbody`);
    tbody.innerHTML = "";

    allFeatures.forEach(feature => {
        const saved = savedList.find(x => x.id === feature.id) || {};
        tbody.innerHTML += `
            <tr data-id="${feature.id}">
                <td>
                    <input type="checkbox" ${saved.enabled ? "checked" : ""}>
                </td>
                <td>
                    <strong>${feature.title}</strong><br>
                    <small>${feature.description}</small>
                </td>
                <td>
                    <textarea placeholder="Enter note">${saved.note || ""}</textarea>
                </td>
            </tr>
        `;
    });
};

MainApplication.NewRequestComponent.toggleOtherPeriod = function (savedPeriodValue) {
    const $periodSelect = $("#period");
    const knownOptions = ["", "Daily", "Weekly", "Monthly", "Annually", "On Demand/Ad Hoc", "Other"];
    const isCustomValue = !!savedPeriodValue && knownOptions.indexOf(savedPeriodValue) === -1;

    if (isCustomValue) {
        $periodSelect.val("Other");
    }

    const $container = $("#otherPeriodContainer");

    if ($periodSelect.val() === "Other") {
        $container.html(`
            <input
                type="text"
                id="otherPeriod"
                placeholder="Please specify"
                speed-bind-validate="Period"
                speed-bind-class="ProcessOverview"
                class="top-space"
                value="${isCustomValue ? savedPeriodValue : ""}"
            />
        `);
    } else {
        $container.empty();
    }
};

// See toggleOtherPeriod - same custom-value inference for RetentionPeriod.
MainApplication.NewRequestComponent.toggleRetentionPeriod = function (savedRetentionValue) {
    const $retentionSelect = $("#retentionPeriod");
    const knownOptions = ["", "Other"]; // extend this with the real dropdown options
    const isCustomValue = !!savedRetentionValue && knownOptions.indexOf(savedRetentionValue) === -1;

    if (isCustomValue) {
        $retentionSelect.val("Other");
    }

    const $container = $("#retentionContainer");

    if ($retentionSelect.val() === "Other") {
        $container.html(`
            <input
                type="text"
                id="otherRetentionPeriod"
                placeholder="Please specify"
                speed-bind-validate="RetentionPeriod"
                class="top-space"
                value="${isCustomValue ? savedRetentionValue : ""}"
            />
        `);
    } else {
        $container.empty();
    }
};

MainApplication.NewRequestComponent.recoverListData = function () {
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
        evaluator: "Or",
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: globalDefinitions.stageDefinitions.save,
      },
      {
        evaluator: "Or",
        operator: "Eq",
        field: "Approval_Status",
        type: "Text",
        val: "Revise",
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
    ];

    speedctxRoot.getListToControl(
      globalDefinitions.stageDefinitions.listname,
      query,
      extraProperties,
      function (listProperties) {
        if (listProperties.RequestType === "New" || listProperties.ModificationType === "Major") {
          // MainApplication.NewRequestComponent.prepareAllTables();
          MainApplication.NewRequestComponent.toggleMainForm(true);
        }
        if ($.isEmptyObject(listProperties)) {
          MainApplication.notyf.error("Process does not exist...");
          $spcontext.redirect("#/", false);
          globalDefinitions.closeLoader();
        } else {
          // customWorkflowEngine.routeEngine(customWorkflowEngine).updateRoutesinFlow(listProperties, function (resolved) {
          //     customWorkflowEngine.routeEngine(customWorkflowEngine).PageSecurity(
          //         customWorkflowEngine.stages.securityModeView,
          //         listProperties.Current_Approver,
          //         listProperties.Approval_Status,
          //         function (error) {
                    // if (MainApplication.configuredTaskMembers[listProperties.Current_Approver].belongs) {

                    if (typeof error === "undefined") {
                      console.log("Recovering saved draft data:", listProperties);
                      listProperties.RequestCreated = $spcontext.stringnifyDate({
                        value: listProperties.RequestCreated,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });

                      // <input type="date"> requires ISO yyyy-mm-dd - "dd/mm/yy"
                      // (the format ViewRequest's readonly textarea is fine with)
                      // gets silently rejected by the native date control, which
                      // is why the field wasn't rendering. Verify "yyyy-mm-dd" is
                      // a format string $spcontext.stringnifyDate actually
                      // recognizes; if not, format it manually here instead.
                      // stringnifyDate ignores the "yyyy-mm-dd" format request
                      // and always returns dd-mm-yyyy (confirmed: got back
                      // "08-08-2026") - so reorder its output ourselves rather
                      // than relying on the format param.
                      listProperties.DateRequired = $spcontext.stringnifyDate({
                        value: listProperties.DateRequired,
                        includeTime: false,
                        format: "dd/mm/yy",
                      });
                      listProperties.DateRequired = MainApplication.NewRequestComponent.toISODateInput(listProperties.DateRequired);

                      // Same reasoning as DateRequired above - DateRequired
                      // is also a native <input type="date"> and needs ISO yyyy-mm-dd.
                      // if (listProperties.DateRequired) {
                      //   listProperties.DateRequired = $spcontext.stringnifyDate({
                      //     value: listProperties.DateRequired,
                      //     includeTime: false,
                      //     format: "dd/mm/yy",
                      //   });
                      //   listProperties.DateRequired = MainApplication.NewRequestComponent.toISODateInput(listProperties.DateRequired);
                      // }

                      listProperties.StepByStepProcess = $spcontext.JSONToObject(listProperties.StepByStepProcess);
                      listProperties.Approvers = $spcontext.JSONToObject(listProperties.Approvers);
                      listProperties.Notifications = $spcontext.JSONToObject(listProperties.Notifications);
                      listProperties.UserAccess = $spcontext.JSONToObject(listProperties.UserAccess);
                      listProperties.Reports = $spcontext.JSONToObject(listProperties.Reports);
                      listProperties.DivisionsInvolved = $spcontext.JSONToObject(listProperties.DivisionsInvolved);
                      // NOT routed through MainApplication.buildReadOnlyData here -
                      // that reshapes each entry to {title, description, enabled,
                      // note} and drops "id", which is exactly what
                      // renderEditableExtraFeaturesTable needs to match a saved
                      // row back to the right checkbox. Keep the raw
                      // {id, enabled, note} shape that was actually saved.
                      listProperties.ExtraFeatures = $spcontext.JSONToObject(listProperties.ExtraFeatures);

                      listProperties.Transaction_History =
                        $spcontext.JSONToObject(
                          listProperties.Transaction_History,
                        );
                      listProperties.AttachmentURL = $spcontext.JSONToObject(
                        listProperties.AttachmentURL,
                        "object",
                      );

                      listProperties.Delegate = listProperties.Delegate.email;

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

                      MainApplication.NewRequestComponent.populateSelect2Editable(listProperties.DivisionsInvolved);
                      MainApplication.NewRequestComponent.renderEditableExtraFeaturesTable("extraFeaturesTable", listProperties.ExtraFeatures);
                      // if (listProperties.Current_Approver !== "Employee" && listProperties.Current_Approver_Code !== "AA1") {
                      // 	listProperties.Comment = "";
                      // }


                      AppRequest.requestDetails = listProperties;

                      // htmlBind only fills in elements that currently carry a
                      // speed-bind-validate attribute. #mainRequestFormWrapper
                      // starts hidden by default (see the page-load toggle call),
                      // which strips that attribute from EVERY field inside it -
                      // Period, ProcessName, RequirementStatement, all of it, not
                      // just the handful of conditional ones below. Left alone,
                      // htmlBind would run against a wrapper with no bindable
                      // fields and only the handful of fields we set manually
                      // further down would end up populated. Un-hiding (and so
                      // restoring those attributes) has to happen before htmlBind,
                      // not after.
                      const savedRequestType = listProperties.RequestType || "New";
                      MainApplication.NewRequestComponent.toggleRequestType(savedRequestType);
                      if (savedRequestType === "Modification") {
                        MainApplication.NewRequestComponent.toggleModificationType(listProperties.ModificationType);
                      }

                      $spcontext.htmlBind(listProperties);

                      // Dynamic tables (StepByStepProcess, Approvers, Notifications,
                      // UserAccess, Reports) aren't touched by htmlBind - they're
                      // managed separately through ctx.dynamicTableSettings. Without
                      // this, a returning Draft always shows the single blank row
                      // initializeDynamicTable() added on page load, regardless of
                      // what was actually saved.
                      try{
                        MainApplication.NewRequestComponent.hydrateDynamicTables({
                          StepByStepProcess: listProperties.StepByStepProcess,
                          Approvers: listProperties.Approvers,
                          Notifications: listProperties.Notifications,
                          UserAccess: listProperties.UserAccess,
                          Reports: listProperties.Reports,
                        });
                      } catch(error){};

                      // toggleApprovalStages/toggleOtherPeriod/toggleRetentionPeriod
                      // already ran once at page load, before any draft value existed,
                      // so whatever they decided then (fields hidden, nothing required)
                      // is stale. Re-run them now that the real saved values are bound,
                      // so a draft with IsApprovalsNeeded="Yes" or a custom Period
                      // actually shows the right section instead of staying hidden.
                      MainApplication.NewRequestComponent.toggleOtherPeriod(listProperties.Period);
                      MainApplication.NewRequestComponent.toggleRetentionPeriod(listProperties.RetentionPeriod);
                      MainApplication.NewRequestComponent.toggleApprovalStages();
                      MainApplication.NewRequestComponent.togglePullFromOtherSystem(listProperties.PullDataFromAnotherSystem);
                      MainApplication.NewRequestComponent.toggleRelatedProcess(listProperties.RelatedProcessInformation);

                      // Request Type / Modification Type were already resolved
                      // above, before htmlBind ran (that's what un-hides the
                      // wrapper in time for htmlBind to actually find its
                      // fields). No need to re-run it here.

                      // if (AppRequest.requestDetails.Current_Approver !== 'Employee'){
                      $spcontext.attachmentLinkBind(
                        listProperties.AttachmentURL,
                      );
                      // }
                      // $spcontext.assignAttributes();
                      // setTimeout(function () {

                        // was "#viewrequest-page" - leftover from copy-pasting
                        // ViewRequestComponent.recoverListData; NewRequest's page
                        // shell uses #newrequest-page (see NewRequest.tsx / the
                        // setTimeout below in whenNewRequestDependeciesLoaded).
                        
                        $("#conditionalApproval").val(listProperties.ConditionalApproval);
                        $("#maxApprovalTime").val(listProperties.MaxApprovalTime);
                        $('[speed-bind-validate="SystemInformation"]').val(listProperties.SystemInformation);
                        $('[speed-bind-validate="RelatedProcessInformation"]').val(listProperties.RelatedProcessInformation);
                        $("#requestType").val(listProperties.RequestType || "New");
                        if (listProperties.RequestType === "Modification") {
                          $("#modificationType").val(listProperties.ModificationType);
                          if (listProperties.ModificationType === "Minor") {
                            $('[speed-bind-validate="ProcessName"]').val(listProperties.ProcessName);
                            $('[speed-bind-validate="ExistingLink"]').val(listProperties.ExistingLink);
                            $('[speed-bind-validate="CurrentFunctionality"]').val(listProperties.CurrentFunctionality);
                            $('[speed-bind-validate="WhatShouldChange"]').val(listProperties.WhatShouldChange);
                            $('[speed-bind-validate="ModificationReason"]').val(listProperties.ModificationReason);
                            $('[speed-bind-validate="SystemsAffected"]').val(listProperties.SystemsAffected);
                            $('[speed-bind-validate="DateRequired"]').val(listProperties.DateRequired);
                          }
                        }
                        PeoplePicker.setDefault("Delegate", listProperties.Delegate);
                        PeoplePicker.initializePeoplePickers(MainApplication.staffList);
                        $("#newrequest-page").removeClass("hidden");
                        $("#newLoader").hide();
                        globalDefinitions.closeLoader();
                      // }, 2000);
                    } else {
                      globalDefinitions.HandlerError(
                        "You are not allowed to access this request",
                      );
                      globalDefinitions.AuditLogManager_SaveLog({
                        Action: `Unauthorized action on ${listProperties.WorkflowRequestID}`,
                        Message: "User is not allowed to view this request",
                      });
                      // setTimeout(function () {
                        globalDefinitions.closeLoader();
                      // }, 1000);
                      $spcontext.redirect("#/", false);
                    }

                    // }
            //       },
            //     ); //commented here
            // }); //commented here
        }
      },
    );
  } else {
    globalDefinitions.closeLoader();
    MainApplication.notyf.error("Invalid Request...");
    $spcontext.redirect("#/", false);
  }
};

MainApplication.NewRequestComponent.renderAttachments = function (elementBindProperty, property, elementId) {

    const container = $("div[speed-file-bind='" + elementBindProperty + "']");
    const files = $spcontext.filesDictionary[property]?.files || [];

    container.empty();

    files.forEach((file, index) => {

        let fileName, fileUrl = null;

        if (typeof file === "string") {
            fileUrl = file;
            fileName = file.split("/").pop();
        } else {
            fileName = file.dataName;
        }

        const $p = $("<p>", {
            id: `${elementBindProperty}display${index}`,
            css: { color: "#002c4d" }
        });

        if (fileUrl) {
            $("<a>", {
                href: fileUrl,
                text: fileName,
                target: "_blank"
            }).appendTo($p);
        } else {
            $p.text(fileName);
        }

        const $deleteBtn = $("<a>", {
            href: "#",
            text: " x",
            class: "attachment-inline-delete",
            "data-element": elementBindProperty,
            "data-index": index,
            "data-fileid": elementId,
            css: {
                color: "red",
                cursor: "pointer",
                paddingLeft: "5px"
            }
        });

        $p.append($deleteBtn);
        container.append($p);
    });
};

MainApplication.NewRequestComponent.deleteRowAttachment = function (elementBindProperty, index, elementId) {

    const el = document.getElementById(elementId);

    let property =
        el.getAttribute("speed-file-validate") ||
        el.getAttribute("speed-file-bind");

    const fileStore = $spcontext.filesDictionary[property];

    if (!fileStore || !Array.isArray(fileStore.files)) return;

    // Remove file safely
    fileStore.files.splice(index, 1);

    // Clear input (important for re-uploading same file)
    $spcontext.clearFileInput(elementId);

    // Re-render UI
    MainApplication.NewRequestComponent.renderAttachments(
        elementBindProperty,
        property,
        elementId
    );
};

MainApplication.NewRequestComponent.clearAllAttachments = function (elementBindProperty, elementId) {

    const el = document.getElementById(elementId);

    let property =
        el.getAttribute("speed-file-validate") ||
        el.getAttribute("speed-file-bind");

    const fileStore = $spcontext.filesDictionary[property];

    if (!fileStore || !Array.isArray(fileStore.files)) return;

    // Drain the array the same way deleteRowAttachment does it (splice), 
    // but all at once instead of one by one
    fileStore.files.splice(0, fileStore.files.length);

    // Clear the actual file input
    $spcontext.clearFileInput(elementId);

    // Re-render UI (will render empty since files array is now empty)
    MainApplication.NewRequestComponent.renderAttachments(
        elementBindProperty,
        property,
        elementId
    );
};

MainApplication.NewRequestComponent.prepareAllTables = function () {
  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.stepByStepCTX,

    tableName: "StepByStepProcess",

    root: "stepByStepDescription",

    addButton: "#stepByStepButton",

    bindExtensions: {
      description:
        MainApplication.NewRequestComponent.textAreaColumn("description"),

      actors: MainApplication.NewRequestComponent.textAreaColumn("actors"),

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
      approver: MainApplication.NewRequestComponent.textColumn("approver"),

      reason: MainApplication.NewRequestComponent.textColumn("reason"),

      approved: MainApplication.NewRequestComponent.textColumn("approved"),

      declined: MainApplication.NewRequestComponent.textColumn("declined"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.approvalTableCTX, "Approvers"),
    },
  });

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.notificationTableCTX,

    tableName: "Notifications",

    root: "notificationsBody",

    addButton: "#addNotificationButton",

    bindExtensions: {
      event: MainApplication.NewRequestComponent.textColumn("event"),

      users: MainApplication.NewRequestComponent.textColumn("users"),

      template: MainApplication.NewRequestComponent.textColumn("template"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.notificationTableCTX, "Notifications"),
    },
  });

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.userAccessCTX,

    tableName: "UserAccess",

    root: "userAccessBody",

    addButton: "#addUserAccessButton",

    bindExtensions: {
      role: MainApplication.NewRequestComponent.textColumn("role"),

      feature: MainApplication.NewRequestComponent.textColumn("feature"),

      user: MainApplication.NewRequestComponent.textColumn("user"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.userAccessCTX, "UserAccess"),
    },
  });

  MainApplication.NewRequestComponent.initializeDynamicTable({
    ctx: AppRequest.reportTableCTX,

    tableName: "Reports",

    root: "reportsBody",

    addButton: "#addReportButton",

    bindExtensions: {
      name: MainApplication.NewRequestComponent.textColumn("name"),

      users: MainApplication.NewRequestComponent.textColumn("users"),

      interval: MainApplication.NewRequestComponent.textColumn("interval"),

      action:
        MainApplication.NewRequestComponent.deleteColumn(AppRequest.reportTableCTX, "Reports"),
    },
  });

  MainApplication.renderExtraFeaturesTable("extraFeaturesTable", MainApplication.extraFeatures);
}