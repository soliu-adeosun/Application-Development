loadDashboardComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenDashboardDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadDashboardComponent;
  }
};

var AppRequest;

var customWorkflowEngine;

MainApplication.DashboardComponent.ApplicationDetails = function () {
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
  this.nonConformanceCounter = 1;
};

whenDashboardDependeciesLoaded = function () {
  globalDefinitions.callLoader();
  globalDefinitions.extendStages();
  globalDefinitions.sortResponse();
  AppRequest = new MainApplication.DashboardComponent.ApplicationDetails();
  AppRequest.pendingItems = [];
  AppRequest.myItems = [];
  // MainApplication.getNCOnQueue();
  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);
  vnContext.DataForTable.tablecontentId = "speed-data-table";
  vnContext.DataForTable.pagesize = 20;
  vnContext.DataForTable.paginateSize = 5;
  vnContext.DataForTable.modifyTR = false;
  vnContext.DataForTable.context = vnContext;
  vnContext.DataForTable.paginationbId = "myrequestpagination";
  vnContext.DataForTable.paginationuId = "toppagination";
  vnContext.DataForTable.propertiesHandler = {
    Employee: function (valueToEva) {
      return valueToEva.Title;
    },

    DateOfViolation: function (valueToEva) {
      return $spcontext.stringnifyDate({
        value: valueToEva.DateOfViolation,
        includeTime: false,
        format: "dd/mm/yy",
      });
    },

    Modified: function (valueToEva) {
      // var isActor = MainApplication.isUserAnActor;

      let isActor = false;

      try {
        isActor =
          CurrentUserProperties.email === valueToEva.PendingUserLogin ||
          MainApplication.configuredTaskMembers[valueToEva.Current_Approver]
            .belongs;
      } catch (error) {}

      var approvalStr = `

                                    ${
                                      isActor
                                        ? `
                <a href="#/approverequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-pen" style="font-size:11px"></i>
                </a>` : ""}`;

      var editStr = `
                <a title="Modify" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=${valueToEva.Title}" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 

                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414

                                                a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                </a>`;

      var editDraftStr = `
                <a title="Modify" href="#/newrequest?itemId=${valueToEva.WorkflowRequestID}&mode=editdraft" 

                                        class="p-1 sm:p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 

                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414

                                                a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                </a>`;

      var viewStr = `
                <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-eye" style="font-size:11px"></i>
                </a>`;

      if (
        valueToEva.Approval_Status === "Pending" &&
        valueToEva.Current_Approver === globalDefinitions.stageDefinitions.save
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${editDraftStr}</div>`;
      } else if (
        valueToEva.Approval_Status === "Declined" &&
        valueToEva.ReturnForCorrection === "Yes"
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${editStr}</div>`;
      } else if (
        valueToEva.Approval_Status === "Completed" ||
        valueToEva.Approval_Status === "Declined"
      ) {
        return `<div class="flex space-x-1 sm:space-x-2">${viewStr}</div>`;
      } else {
        return `<div class="flex space-x-1 sm:space-x-2">${viewStr} ${approvalStr}</div>`;
      }
    },
  };

  $("#dashboard-tabs").empty();

  // if (MainApplication.isUserAnActor) {

  $("#dashboard-tabs").append(`
    <div class="dashboard-tabs">
        <button id="myAuditsTab" class="tab-btn active" data-tab="myAudits">
            My Requests
        </button>

        <button id="pendingTab" class="tab-btn" data-tab="pending">
            Action Required (<span id="auditsAwaitingMyAction"></span>)
        </button>
    </div>
`);

  $(".tab-btn").on("click", function () {

    $(".tab-btn").removeClass("active");
    $(this).addClass("active");

    const tab = $(this).data("tab");

    switch (tab) {

        case "myAudits":
            MainApplication.DashboardComponent.currentTab = "MyAudits";
            MainApplication.DashboardComponent.showTableData(AppRequest.myItems);
            break;

        case "pending":
            MainApplication.DashboardComponent.currentTab = "Pending";
            MainApplication.DashboardComponent.showTableData(AppRequest.pendingItems);
            break;
    }

});

  // Fetch data for both tabs

  MainApplication.DashboardComponent.pendingRequests();

  MainApplication.DashboardComponent.myRequests();

  MainApplication.DashboardComponent.currentTab = "MyAudits";

  if (
    MainApplication.configuredTaskMembers[
      globalDefinitions.stageDefinitions.management
    ].belongs
  ) {
    $(".issue-new-nc-btn").show();
  }

  setTimeout(function () {
    globalDefinitions.closeLoader();
  }, 2000);
};

MainApplication.DashboardComponent.pendingRequests = function () {
  var queryCaml = [
    {
      ascending: "FALSE",
      orderby: "Modified",
    },
    {
      operator: "Eq",
      field: "Approval_Status",
      type: "Text",
      val: "Pending",
    },

    // {

    //     operator: 'Eq',

    //     field: 'PendingUserLogin',

    //     type: 'Text',

    //     val: CurrentUserProperties.email

    // },
  ];

  if (
    MainApplication.configuredTaskMembers[
      globalDefinitions.stageDefinitions.management
    ].belongs
  ) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "Current_Approver",
      type: "Text",
      val: globalDefinitions.stageDefinitions.management,
    });
  }

  if (
    MainApplication.configuredTaskMembers[
      globalDefinitions.stageDefinitions.ceo
    ].belongs
  ) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "Current_Approver",
      type: "Text",
      val: globalDefinitions.stageDefinitions.ceo,
    });
  }

  if (globalDefinitions.stageDefinitions.employee) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "PendingUserLogin",
      type: "Text",
      val: CurrentUserProperties.email,
    });
  }

  if (globalDefinitions.stageDefinitions.hod) {
    queryCaml.push({
      evaluator: "Or",
      operator: "Eq",
      field: "PendingUserLogin",
      type: "Text",
      val: CurrentUserProperties.email,
    });
  }

  queryCaml = customWorkflowEngine.setupTaskForGroups(queryCaml);

  var query = vnContext.camlBuilder(queryCaml);

  var extraProperties = {
    merge: true,

    data: [
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
    ],
  };

  vnContext.getListToItems(
    configProperties.VNLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      AppRequest.pendingItems = tableData;

      $("#auditsAwaitingMyAction").text(tableData.length);

      if (MainApplication.DashboardComponent.currentTab === "Pending") {
        MainApplication.DashboardComponent.showTableData(tableData);
      }
    },
  );
};

MainApplication.DashboardComponent.myRequests = function () {
  var queryToUse = [
    {
      ascending: "FALSE",

      orderby: "Modified",

      viewScope: "RecursiveAll",
    },
    {
      operator: "Eq",

      field: "EmployeeEmail",

      type: "Text",

      val: CurrentUserProperties.email,
    },
  ];

  var query = vnContext.camlBuilder(queryToUse);

  var extraProperties = {
    merge: true,

    data: [
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
    ],
  };

  vnContext.getListToItems(
    configProperties.VNLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      var completedItems = tableData.filter(function (item) {
        return item.Approval_Status === "Completed";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Approval_Status === "Pending";
      });

      AppRequest.myItems = tableData;

      // AppRequest.ncData = MainApplication.AuditList;

      $(".dashboard-stats-grid").empty();

      $(".dashboard-stats-grid").append(
        `

          <div class="stat-card accent">
            <div class="stat-label">Total Notice</div>
            <div class="stat-value">${tableData.length}</div>

          </div>
          <div class="stat-card accent">
            <div class="stat-label">Pending Notice</div>
            <div class="stat-value">${pendingItems.length}</div>

          </div>
          <div class="stat-card accent">
            <div class="stat-label">Closed Notice</div>
            <div class="stat-value">${completedItems.length}</div>

          </div>

            `,
      );

      if (MainApplication.DashboardComponent.currentTab === "MyAudits") {
        MainApplication.DashboardComponent.showTableData(tableData);
      }
    },
  );
};

MainApplication.DashboardComponent.showTableData = function (tableData) {
  if (tableData.length === 0) {
    $("#tasktable").hide();

    $("#speed-data-table").empty();

    $(".threport").hide();

    $(".norequest").show();
  } else {
    $("#tasktable").show();

    $(".threport").show();

    $(".norequest").hide();

    vnContext.manualTable(tableData);
  }
  
  $("#dashboard-page").addClass("active");
  globalDefinitions.closeLoader();

};
