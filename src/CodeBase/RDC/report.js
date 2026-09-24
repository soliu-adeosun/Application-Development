loadReportComponent = function () {
  console.log("Loading Report Component");
  if (MainApplication.cachedState.mode) {
    whenReportDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadReportComponent;
  }
};

// var AppRequest;

// var customWorkflowEngine;

// MainApplication.ReportComponent.ApplicationDetails = function () {
//   this.url = window.location.href;
//   this.itemId = null;
//   this.mode = null;
//   this.requestDetails = {};
//   this.Attachments = [];
//   this.FileUrls = {};
//   this.FolderUrl = "";
//   this.AttachmentLoader = {};
//   this.messageTemplate = {};
//   this.feedback = false;
//   this.approverComments = "";
//   this.transactionHistory = [];
//   this.defaultStage = "AA0";
//   this.returned = null;
//   this.sectionArr = [];
//   this.sections = {};
//   this.finalrating = [];
//   this.questionSetCounter = 0;
//   this.groupProperties = {};
//   this.nonConformanceCounter = 1;
// };
whenReportDependeciesLoaded = function () {
  globalDefinitions.extendStages();
  globalDefinitions.sortResponse();

  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  AppRequest.fullTableData = [];
  AppRequest.dataForExport = [];

  MainApplication.ReportComponent.populateDivisionFilter();

  customWorkflowEngine = new WorkflowManagerEngine(CurrentUserProperties);

  speedctxRoot.DataForTable.tablecontentId = "speed-data-table";
  speedctxRoot.DataForTable.pagesize = 20;
  speedctxRoot.DataForTable.paginateSize = 5;
  speedctxRoot.DataForTable.modifyTR = false;
  speedctxRoot.DataForTable.context = speedctxRoot;
  speedctxRoot.DataForTable.paginationbId = "myrequestpagination";
  speedctxRoot.DataForTable.paginationuId = "toppagination";

  speedctxRoot.DataForTable.propertiesHandler = {
    Modified: function (valueToEva) {
      return `
        <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}"
           class="btn btn-sm btn-primary btn-icon">
          <i class="fa-solid fa-eye" style="font-size:11px"></i>
        </a>`;
    },
    ModificationType: function (valueToEva) {
      return valueToEva.ModificationType || valueToEva.RequestType || "—";
    },
  };

  // ---- Bind all filter controls to one function ----
  $("#status-filter, #division-filter, #overdue-filter, #requeststrDate, #requestendDate")
    .on("change", MainApplication.ReportComponent.applyFilters);

  $("#searchInput").on("keyup", MainApplication.ReportComponent.applyFilters);

  // Date min/max constraints
  $("#requeststrDate, #requestendDate").on("change", function () {
    MainApplication.ReportComponent.updateDateConstraints();
  });

  $("#exportToExcel").click(() => {
    MainApplication.ReportComponent.exportToExcel();
  });

  MainApplication.ReportComponent.retrieveRequest();
};

MainApplication.ReportComponent.applyFilters = function () {
  var data = AppRequest.fullTableData || [];
  var workflow = ($("#status-filter").val() || "").trim();
  var division = ($("#division-filter").val() || "").trim();
  var overdue  = ($("#overdue-filter").val() || "").trim();
  var search   = ($("#searchInput").val() || "").toLowerCase().trim();
  var fromDate = $("#requeststrDate").val();   // yyyy-mm-dd
  var toDate   = $("#requestendDate").val();

  var filtered = data.filter(function (item) {
    // Workflow (DetailedStatus)
    if (workflow && (item.DetailedStatus || "") !== workflow) return false;

    // Division
    if (division && (item.Division || "") !== division) return false;

    // Overdue / On Track
    if (overdue && (item.Due_Overdue || "") !== overdue) return false;

    // Free-text search (Requestor or Ref ID)
    if (search) {
      var haystack = (
        (item.Title || "") + " " +
        (item.WorkflowRequestID || "") + " " +
        (item.ProcessName || "")
      ).toLowerCase();
      if (haystack.indexOf(search) === -1) return false;
    }

    // Date range – use Modified or RequestCreated (whichever you prefer)
    var itemDateStr = item.Modified || item.RequestCreated;
    if (itemDateStr && (fromDate || toDate)) {
      var itemDate = new Date(itemDateStr);
      itemDate.setHours(0, 0, 0, 0);

      if (fromDate) {
        var from = new Date(fromDate);
        from.setHours(0, 0, 0, 0);
        if (itemDate < from) return false;
      }
      if (toDate) {
        var to = new Date(toDate);
        to.setHours(23, 59, 59, 999);
        if (itemDate > to) return false;
      }
    }

    return true;
  });

  MainApplication.ReportComponent.showTableData(filtered);
};

MainApplication.ReportComponent.retrieveRequest = function () {
  // globalDefinitions.callLoader();
  // var reportQuery = [
  //   {
  //     ascending: "FALSE",
  //     orderby: "Modified",
  //     viewScope: "RecursiveAll",
  //   },
  // ];

  // reportQuery = speedctxRoot.formQueryArrayGenerator(reportQuery);

  // var query = speedctxRoot.camlBuilder(reportQuery);
  var query = `<View Scope="RecursiveAll">
               <Query>
                 <OrderBy>
                   <FieldRef Name="Modified" Ascending="FALSE"/>
                 </OrderBy>
               </Query>
             </View>`;
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
      "Comment",
      "HOD",
      "Division",
      "ProcessName",
      "Modified",
      "IsApprovalsNeeded",
      "ConditionalApproval",
      "RetentionPeriod",
      "ReasonForAutomation",
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
      "UATStatus",
      "DetailedStatus",
      "Developer",
      "IsOtherUsersNeeded",
      "Due_Overdue",
    ],
  };

  speedctxRoot.getListToItems(
    configProperties.APPDEVLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      console.log("Table Data: ", tableData);
      AppRequest.fullTableData = tableData;

      var completedItems = tableData.filter(function (item) {
        return item.Approval_Status === "Completed";
      });

      var pendingItems = tableData.filter(function (item) {
        return item.Approval_Status === "Pending";
      });

      var overdueItems = tableData.filter(function (item) {
        return item.Due_Overdue === "Overdue";
      });
      

      $("#totalRequest").text(tableData.length);
      $("#pendingRequest").text(pendingItems.length);
      $("#completedRequest").text(completedItems.length);
      $("#overdueRequest").text(overdueItems.length);
      
      MainApplication.ReportComponent.showTableData(tableData);
    },
  );
};

MainApplication.ReportComponent.showTableData = function (tableData) {
  AppRequest.dataForExport = tableData;

  // Update the live count
  var total = (AppRequest.fullTableData || []).length;
  $("#filteredCount").text(tableData.length);
  $("#totalCount").text(total);

  if (tableData.length === 0) {
    $("#tasktable").hide();
    $("#speed-data-table").empty();
    $(".norequest").show();
    $('#myrequestpagination').hide();
  } else {
    $("#tasktable").show();
    $(".norequest").hide();
    $('#myrequestpagination').show();
    speedctxRoot.manualTable(tableData);
  }

  $("#newLoader").hide();
  $("#report-page").removeClass("hidden");
  globalDefinitions.closeLoader();
};

MainApplication.ReportComponent.populateDivisionFilter = function () {
  var $sel = $("#division-filter");
  var divisions = MainApplication.newDivisions || [];

  // keep the "All" option, clear the rest
  $sel.find("option:not(:first)").remove();

  divisions.forEach(function (d) {
    if (d) {
      $sel.append($("<option>").val(d).text(d));
    }
  });
};

MainApplication.ReportComponent.exportToExcel = function () {
  var excelName =
    "AppDeveklopmentReport" + $spcontext.stringnifyDate() + ".csv";
  var dataStringHeader = [
    "Ref ID",
    "Process Name",
    "Requestor",
    "Division",
    "Next Approver",
    "Status",
  ];

  var excelData = dataStringHeader.toString() + "\n";

  $.each(AppRequest.dataForExport, function (index, itemProperties) {
    var dataString = [];
    dataString.push(itemProperties.WorkflowRequestID);
    dataString.push(itemProperties.ProcessName);
    dataString.push(itemProperties.Title);
    dataString.push(itemProperties.Division);
    dataString.push(itemProperties.Current_Approver);
    dataString.push(itemProperties.Approval_Status);

    // dataString.push(
    //   $spcontext.stringnifyDate({
    //     value: itemProperties.DateOfViolation,
    //     includeTime: false,
    //   }),
    // );
    // dataString.push(itemProperties.Severity);
    // dataString.push(itemProperties.Location);

    /*
        dataString.push(delegateEmail);*/
    excelData += dataString.toString() + "\n";
    excelData = "\uFEFF" + excelData;
  });

  MainApplication.ReportComponent.downloadData(excelName, excelData);
};

MainApplication.ReportComponent.downloadData = function (excelname, data) {
  if (navigator.msSaveOrOpenBlob) {
    var blobContent = data;
    // Works for Internet Explorer and Microsoft Edge
    var blob = new Blob([blobContent], { type: "text/csv" });
    navigator.msSaveOrOpenBlob(blob, excelname);
  } else {
    var encodedString;
    var downloadLink;
    try {
      encodedString = btoa(data);
      downloadLink = `data:text/csv;base64,${encodedString}`;
    } catch (e) {
      var csvContent = "data:text/csv;charset=utf-8,";
      csvContent += data;
      var blob = new Blob([data]);
      if (blob.size > 2000000) {
        globalDefinitions.HandlerError(
          "Please use the filter to reduce the data size, as the size of the data exceeds 2MB",
        );
      }
      downloadLink = encodeURI(csvContent);
    }

    var link = document.createElement("a");
    link.setAttribute("href", downloadLink);
    link.setAttribute("download", excelname);
    link.click();
  }
};

MainApplication.ReportComponent.validateCSVContent = function (data) {
  if (typeof data == "string") {
    //data = data.replace(/,/g, "~");
    data = data.replace(/\n/g, "");
    data = data.replace(/\r/g, "");
    data = data.replace(/\r\n/g, "");
    data = MainApplication.ReportComponent.encloseStringWithCommaCheck(data);
  }
  return data;
};

MainApplication.ReportComponent.encloseStringWithCommaCheck = function (value) {
  if (value.includes(",")) {
    return '"' + value + '"';
  }
  return value;
};

MainApplication.ReportComponent.updateDateConstraints = function () {
  var startDate = $("#requeststrDate").val();
  var endDate = $("#requestendDate").val();
  if (startDate) {
    $("#requestendDate").attr("min", startDate);
  } else {
    $("#requestendDate").removeAttr("min");
  }

  if (endDate) {
    $("#requeststrDate").attr("max", endDate);
  } else {
    $("#requeststrDate").removeAttr("max");
  }
};
