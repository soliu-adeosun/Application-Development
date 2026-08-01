loadReportComponent = function () {
  if (MainApplication.cachedState.mode) {
    whenReportDependeciesLoaded();
  } else {
    MainApplication.cachedState.pageStateCall = loadReportComponent;
  }
};

whenReportDependeciesLoaded = function () {
  globalDefinitions.callLoader();
  // globalDefinitions.extendStages();
  globalDefinitions.sortResponse();

  // $("#requeststrDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'maxDate', $('#requestendDate').val()); } });
  // $("#requestendDate").datepicker({ dateFormat: 'yy-mm-dd', beforeShow: function () { jQuery(this).datepicker('option', 'minDate', $('#requeststrDate').val()); } });
  AppRequest = new MainApplication.NewRequestComponent.ApplicationDetails();
  AppRequest.fullTableData = [];
  AppRequest.dataForExport = [];

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
      var viewStr = `
                <a href="#/viewrequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-eye" style="font-size:11px"></i>
                </a>`;

      var editStr = `
                <a href="#/approverequest?itemId=${valueToEva.WorkflowRequestID}" class="btn btn-sm btn-primary btn-icon">
                    <i class="fa-solid fa-pen" style="font-size:11px"></i>
                </a>`;

      if (valueToEva.Status === "Save") {
        return `<div>${editStr} ${viewStr}</div`;
      } else {
        return viewStr;
      }
    },
  };

  // $("#searchbtn").click(() => {
  //     MainApplication.ReportComponent.retrieveRequest();
  // });

  // let debounceTimer;
  $("#division-filter")
    .empty()
    .append('<option value="" selected>All Divisions/Units</option>')
    .append(
      MainApplication.newDivisions
        .map((dept) => `<option value="${dept}">${dept}</option>`)
        .join(""),
    );

  $(
    "#division-filter, #severity-filter, #warning-level-filter, #month-filter",
  ).on("keyup change", function () {
    // clearTimeout(debounceTimer);
    // debounceTimer = setTimeout(() => {
    MainApplication.ReportComponent.retrieveRequest();
    // }, 500);
  });

  $("#exportbtn").click(() => {
    MainApplication.ReportComponent.exportToExcel();
  });

  $("#reportsearchfield").on("keyup", function () {
    var searchQuery = $(this).val();
    var data = AppRequest.fullTableData || [];
    var filteredItems = MainApplication.reportSyncSearch(searchQuery, data);
    MainApplication.ReportComponent.showTableData(filteredItems);
  });

  $("#filter-btn, #closesearchfilter").click(() => {
    $(".sort-box").toggleClass("hidden");
  });

  // if (MainApplication.isUserAnActor) {
  //   MainApplication.ReportComponent.retrieveRequest();
  // } else {
  //   globalDefinitions.HandlerError(
  //     "You are not authorized to access this page...",
  //   );
  //   $spcontext.redirect("#/", false);
  //   globalDefinitions.closeLoader();
  // }
  // setTimeout(function () {
  //     globalDefinitions.closeLoader();
  //     $("#report-page").addClass("active");
  //     $("#newLoader").hide();
  // }, 2000);
};

MainApplication.ReportComponent.retrieveRequest = function () {
  // globalDefinitions.callLoader();
  var reportQuery = [
    {
      ascending: "FALSE",
      orderby: "Modified",
    },
  ];

  reportQuery = vnContext.formQueryArrayGenerator(reportQuery);

  var query = vnContext.camlBuilder(reportQuery);
  var extraProperties = {
    merge: true,
    data: [
      "ID",
      "Title",
      "Month",
      "Year",
      "WorkflowRequestID",
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
      "HODEmail",
      "Division",
      "Approval_Status",
      "Modified",
    ],
  };

  vnContext.getListToItems(
    configProperties.VNLIST.setting,
    query,
    extraProperties,
    true,
    null,
    function (tableData) {
      AppRequest.fullTableData = tableData;

      // ===============================
      // Total Notices
      // ===============================
      const totalNotice = tableData.length;

      // ===============================
      // This Month
      // ===============================
      const today = new Date();
      const currentMonth = today.toLocaleString("default", { month: "long" });
      const currentYear = today.getFullYear().toString();

      const thisMonth = tableData.filter(
        (item) => item.Month === currentMonth && item.Year === currentYear,
      ).length;

      // ===============================
      // Employees Involved (Unique)
      // ===============================
      const employeesInvolved = new Set(
        tableData.map((item) => item.Title).filter(Boolean),
      ).size;

      // ===============================
      // Repeat Offenders (2 or more notices)
      // ===============================
      const employeeCount = {};

      tableData.forEach((item) => {
        if (!item.Title) return;

        employeeCount[item.Title] = (employeeCount[item.Title] || 0) + 1;
      });

      const repeatOffenders = Object.values(employeeCount).filter(
        (count) => count >= 2,
      ).length;

      // ===============================
      // Update Dashboard
      // ===============================
      $("#total-notice").text(totalNotice);
      $("#this-month").text(thisMonth);
      $("#employees-involved").text(employeesInvolved);
      $("#repeat-offenders").text(repeatOffenders);

      MainApplication.ReportComponent.showTableData(tableData);
    },
  );
};

MainApplication.ReportComponent.showTableData = function (tableData) {
  AppRequest.dataForExport = tableData;
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
  $("#report-page").addClass("active");
  globalDefinitions.closeLoader();
};

MainApplication.ReportComponent.exportToExcel = function () {
  var excelName =
    "ViolationNoticeReport" + $spcontext.stringnifyDate() + ".csv";
  var dataStringHeader = [
    "Employee",
    "Divison",
    "Warning Notice",
    "Date",
    "Severity",
    "Location",
  ];

  var excelData = dataStringHeader.toString() + "\n";

  $.each(AppRequest.dataForExport, function (index, itemProperties) {
    var dataString = [];
    dataString.push(itemProperties.Title);
    dataString.push(itemProperties.Divison);
    dataString.push(itemProperties.WarningNotice);
    dataString.push(
      $spcontext.stringnifyDate({
        value: itemProperties.DateOfViolation,
        includeTime: false,
      }),
    );
    dataString.push(itemProperties.Severity);
    dataString.push(itemProperties.Location);

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
