var MainApplication = new MainStartPoint();
var customWorkflowEngine;
var CurrentUserProperties = {};

var configProperties = {
  restrictedlinks: [],
};

var configPropertiesRoot = {
  restrictedlinks: [],
};

var speedctxRoot;
var globalDefinitions;
var rsBAContext;
var popContext;

var dependencyState = {
  userLoaded: false,
  configLoaded: false,
  groupChecksStarted: false,
};

function MainStartPoint() {
  this.url = window.location.href;
  this.notyf = new Notyf({
    duration: 5000,
    //dismissible: true,
    position: {
      x: "right", // 'left' or 'right'
      y: "top", // 'top' or 'bottom'
    },
    types: [
      {
        type: "black",
        background: "black",
        icon: {
          className: "material-icons",
          tagName: "i",
          text: "info", // optional icon
        },
        duration: 3000,
      },
    ],
  });
  this.profilephoto = `/_layouts/15/userphoto.aspx?size=M&accountname=`;
  this.profilephotoLarge = `/_layouts/15/userphoto.aspx?size=L&accountname=`;
  this.messageTemplate = {};
  this.cachedState = {
    mode: false,
    pageStateCall: null,
    reportAdmin: false,
    isWorkflowActor: false,
    workflowActors: {},
    isAdmin: false,
    isReportAdmin: false,
    ipaddress: "",
    departments: [],
    hods: {},
    currentUserIsHod: {
      auth: false,
      department: "",
    },
  };
  this.staffDetails = {};
  this.staffList = [];

  this.AuditDetails = {};
  this.AuditList = [];

  this.configuredTaskMembers = {};
  this.isUserAnActor = false;
  this.isPureHOD = false;

  this.NewRequestComponent = {};
  this.DashboardComponent = {};
  this.ApproveRequestComponent = {};
  this.ViewRequestComponent = {};
  this.ReportComponent = {};

  this.CurrentPageSubmitFunction = null;
  this.inspectionItems = [];
  this.processes = [];
  // this.procedures = [];
  this.extraFeatures = [
    {
        id: "saveDraft",
        title: "Save as Draft",
        description: "Ability to save an incomplete form and return to it later.",
        defaultChecked: true
    },
    
    {
        id: "exportExcel",
        title: "Export to Excel / CSV",
        description: "Download records as a spreadsheet.",
        defaultChecked: true
    },
    {
        id: "printPdf",
        title: "Print / Download as PDF",
        description: "Print or save records as PDF documents.",
        defaultChecked: true
    },
    {
        id: "dashboardSummary",
        title: "Dashboard / Summary View",
        description: "A visual overview of process status and statistics.",
        defaultChecked: true
    },
    {
        id: "sortFilter",
        title: "Sort / Filter",
        description: "Ability to rearrange and display data based on criteria.",
        defaultChecked: true
    },
    {
        id: "editAfterSubmission",
        title: "Edit and Resubmit",
        description: "Ability to edit a record and resubmit, if declined.",
        defaultChecked: false
    },
    {
        id: "attachmentUpload",
        title: "Attachment Upload",
        description: "Ability to attach files to records.",
        defaultChecked: false
    }
];

  this.auditNavigationClicks = function (clicklocation) {
    globalDefinitions.AuditLogManager_SaveLog({
      Action: `Authorized accessed ${clicklocation}`,
      Message: `user visited the ${clicklocation} at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`,
    });
  };
}

function whenLayoutLoaded() {
  //load view port to enable page to be mobile responsive
  $("head").append(
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
  );
  //============================================================================================
  $spcontext.loadSPDependencies(function () {
    var dependenciesCount = 0;
    var expectedDepenciesCount = 8;
    // speedctxRoot = new Speed();
    globalDefinitions = new GlobalDefinitionsManager();

    // globalDefinitions.callLoader();
    $("#reports").hide();

    window.globalProp
      .getClientIP()
      .then((response) => {
        MainApplication.cachedState.ipaddress = response;
        checkAppDependency();
      })
      .catch((error) => {
        checkAppDependency();
      });

    $spcontext.currentUserDetails((user) => {
      // console.log("User loaded");
      CurrentUserProperties.email = user.get_email();
      CurrentUserProperties.email = CurrentUserProperties.email.toLowerCase();
      CurrentUserProperties.login = CurrentUserProperties.email;
      CurrentUserProperties.title = user.get_title();

      var nameParts = $.trim(CurrentUserProperties.title).split(/\s+/);
      var initials = "";
      var shortName = "";

      if (nameParts.length > 0) {
        initials = nameParts[0].charAt(0).toUpperCase();

        if (nameParts.length > 1) {
          initials += nameParts[1].charAt(0).toUpperCase();
          shortName =
            nameParts[0] + " " + nameParts[1].charAt(0).toUpperCase() + ".";
        } else {
          shortName = nameParts[0];
        }
      }

      // store if you want to reuse elsewhere
      CurrentUserProperties.initials = initials;
      CurrentUserProperties.shortName = shortName;

      // $(".user-name").text(CurrentUserProperties.shortName);
      // $("#userinitials").text(initials).attr("title", shortName);

      dependencyState.userLoaded = true;
      tryRunGroupChecks();
      checkAppDependency();
    });

    $spcontext.getItem(
      "Configuration",
      $spcontext.camlBuilder(),
      function (configObjects) {
        var listEnumerator = configObjects.getEnumerator();
        while (listEnumerator.moveNext()) {
          var settingType = listEnumerator
            .get_current()
            .get_item("SettingType");
          var configObj = {};
          configObj.title = listEnumerator.get_current().get_item("Title");
          configObj.setting = listEnumerator.get_current().get_item("Setting");
          if (settingType == "Restricted") {
            configPropertiesRoot.restrictedlinks.push(configObj);
          } else {
            configPropertiesRoot[configObj.title] = configObj;
          }
        }

        rsBAContext = new Speed(configPropertiesRoot.POPCONTEXT.setting);
        popContext = new Speed(configPropertiesRoot.REALPOPCONTEXT.setting);

        speedctxRoot = new Speed(configPropertiesRoot.APPDEVURL.setting);

        // testContext = new Speed("/sites");
        speedctxRoot.errorHandler = globalDefinitions.errorHandler;

        dependencyState.configLoaded = true;
        tryRunGroupChecks();

        speedctxRoot.getItem(
          "Configuration",
          speedctxRoot.camlBuilder(),
          function (configObjects) {
            var listEnumerator = configObjects.getEnumerator();
            while (listEnumerator.moveNext()) {
              var settingType = listEnumerator
                .get_current()
                .get_item("SettingType");
              var configObj = {};
              configObj.title = listEnumerator.get_current().get_item("Title");
              configObj.setting = listEnumerator
                .get_current()
                .get_item("Setting");
              if (settingType == "Restricted") {
                configProperties.restrictedlinks.push(configObj);
              } else {
                configProperties[configObj.title] = configObj;
              }
            }

            globalDefinitions.stageDefinitions.workflowcode =
              configProperties.WORKFLOWCODE.setting;
            globalDefinitions.stageDefinitions.workflow =
              configProperties.WORKFLOWNAME.setting;

            $("#auditmanagementversion").text(
              configProperties.NCVERSION.setting,
            );
            $("#versioneffectivedate").text(
              configProperties.VERSIONEFFECTIVEDATE.setting,
            );
            $("#auditmanagementversionMobile").text(
              configProperties.NCVERSION.setting,
            );
            $("#versioneffectivedateMobile").text(
              configProperties.VERSIONEFFECTIVEDATE.setting,
            );

            checkAppDependency();
          },
        );

        var basicQuery = [
          {
            ascending: "TRUE", //ascending or descending
            orderby: "Title", //Column Name to order by
          },
        ];

        // runGroupChecks();

        // var basicQuery = [
        //   {
        //     ascending: "TRUE",  //ascending or descending
        //     orderby: "Title", //Column Name to order by
        //   }
        // ];

        var employeeInfoColumns = [
          "ID",
          "Title",
          "EMAIL_x0020_ADDRESS",
          "DESIGNATION",
          "SUPERVISOR",
          "PERSONAL_x0020_NUMBER",
          "DEPARTMENT",
          "EID",
          "D_x002e_O_x002e_E_x0020__x002f__",
          "Job_x0020_Role",
          "Active",
          "HOD",
          "HOD_x0020_EMAIL",
        ];

        rsBAContext.getListToItems(
          "Staff List",
          [
            {
              orderby: "ID",
              ascending: "FALSE",
            },
            {
              operator: "Eq",
              field: "Active",
              type: "Text",
              val: "Yes",
            },
          ],
          {
            ignoreThreshold: false,
            data: employeeInfoColumns,
            merge: false,
          },
          false,
          function (item) {
            // Transform item to use new field names
            const transformedItem = {
              ID: item.ID || "",
              Title: item.Title || "",
              Email: item.EMAIL_x0020_ADDRESS || "",
              Designation: item.DESIGNATION || "",
              Supervisor: item.SUPERVISOR || "",
              PersonalNumber: item.PERSONAL_x0020_NUMBER || "",
              Department: item.DEPARTMENT || "",
              EmployeeId: item.EID || "",
              DateOfEmployment: item.D_x002e_O_x002e_E_x0020__x002f__ || "",
              JobRole: item.Job_x0020_Role || "",
              Active: item.Active || "",
              Hod: item.HOD || "",
              HodEmail: item.HOD_x0020_EMAIL || "",
            };

            if (transformedItem.Email !== "") {
              if (
                typeof MainApplication.staffDetails[
                  transformedItem.Email.toLowerCase()
                ] === "undefined"
              ) {
                MainApplication.staffDetails[
                  transformedItem.Email.toLowerCase()
                ] = transformedItem;
                MainApplication.staffList.push(transformedItem);
              }
            }

            return transformedItem;
          },
          function (items) {
            MainApplication.staffList = items;
            checkAppDependency();
          },
        );

        var divisionQuery = [
          {
            ascending: "TRUE", //ascending or descending
            orderby: "Title", //Column Name to order by
          },
        ];

        rsBAContext.getItem("RSDivisions", $spcontext.camlBuilder(divisionQuery), function (_spMeta) {
          var listEnumerator = _spMeta.getEnumerator();
          MainApplication.newDivisions = [];
          while (listEnumerator.moveNext()) {
            var title = listEnumerator.get_current().get_item("Title");
            MainApplication.newDivisionDetails = {};
            while (listEnumerator.moveNext()) {
              var title = listEnumerator.get_current().get_item("Title");
              var divisionEmail = $spcontext.checkNull(listEnumerator.get_current().get_item("DivisionEmail"));
              MainApplication.newDivisions.push(title);
              MainApplication.newDivisionDetails[title] = {
                title: title,
                divisionEmail: divisionEmail
              };
            }
          }

          checkAppDependency();
        });

        var developerQuery = [
    {
        ascending: "TRUE",
        orderby: "Title"
    }
];

speedctxRoot.getItem(
    "Developers",
    $spcontext.camlBuilder([developerQuery]),
    function (_spMeta) {

        MainApplication.developers = [];

        var listEnumerator = _spMeta.getEnumerator();

        while (listEnumerator.moveNext()) {

            var currentItem = listEnumerator.get_current();

            var title = $spcontext.checkNull(
                currentItem.get_item("Title")
            );

            var email = $spcontext.checkNull(
                currentItem.get_item("Email")
            );

            MainApplication.developers.push({
                Title: title,
                Email: email
            });
        }


        checkAppDependency();
    }
);

      },
    );

    function checkAppDependency() {
      dependenciesCount++;
      if (dependenciesCount === expectedDepenciesCount) {
        console.log("Dependency count: ", dependenciesCount);
        console.log("Expected Dependencies: ", expectedDepenciesCount);
        globalDefinitions.AuditLogManager_SaveLog({
          Action: `Logged into/Opened Vehicle Inspection application`,
          Message: `user logged in to application at ${$spcontext.stringnifyDate({ format: "dd/mm/yy", includeTime: true })}`,
        });

        const userEmail = CurrentUserProperties.email?.toLowerCase();
        const pp = MainApplication.profilephoto + userEmail;

        if (userEmail) {
          // $(".user-name").text(CurrentUserProperties.shortName || "");
          $("#currentusername").text(CurrentUserProperties.shortName || "");
          // $(".av").text(CurrentUserProperties.shortName || "");
          $(".user-role").text(
            MainApplication.staffDetails[userEmail].Department || "",
          );
          $(".user-avatar").attr(
            "src",
            pp ||
              `https://placehold.co/120x120/8B5CF6/FFFFFF?text=${CurrentUserProperties.initials}`,
          );
          // $(".top-avatar-img").attr("src", pp || `https://placehold.co/120x120/8B5CF6/FFFFFF?text=${CurrentUserProperties.initials}`);
        }

        if (MainApplication.isUserAnActor) {
          $("#reports").show();
          // $("#adminView").show();
          // $(".adminPages").show();
          // $(".reviewNav").show();
          // $(".newNCNav").show();
          // $(".newNCNavMobile").show();
        }

        $spcontext.errorHandler = globalDefinitions.errorHandler;
        MainApplication.cachedState.mode = true;
        MainApplication.cachedState.pageStateCall();
      }
    }

    function runGroupChecks() {
      if (!CurrentUserProperties.email || !configPropertiesRoot.MANAGEMENT)
        return;

      $spcontext.isUserMemberOfGroup(
        [
          configPropertiesRoot.MANAGEMENT.setting,
          configPropertiesRoot.CEO.setting,
          configPropertiesRoot.REPORTADMIN.setting,
          configPropertiesRoot.HOD.setting,
          configPropertiesRoot.PRODUCTMANAGER.setting
        ],
        { email: CurrentUserProperties.email, groupEmails: true },
        function (isUserMember, groupUserProperties) {
          MainApplication.isUserAnActor = isUserMember || false;
          MainApplication.configuredTaskMembers = groupUserProperties || {};

          const isInHOD =
            groupUserProperties[configPropertiesRoot.HOD.setting]?.belongs ||
            false;
          const isInManagement =
            groupUserProperties[configPropertiesRoot.MANAGEMENT.setting]
              ?.belongs || false; // adjust key if needed
          const isInCEO =
            groupUserProperties[configPropertiesRoot.CEO.setting]?.belongs ||
            false; // adjust key
          const isInReportAdmin =
            groupUserProperties[configPropertiesRoot.REPORTADMIN.setting]
              ?.belongs || false; 
              
          const isProductManager =
            groupUserProperties[configPropertiesRoot.PRODUCTMANAGER.setting]
              ?.belongs || false; 

          MainApplication.isPureHOD =
            isInHOD && !isInManagement && !isInCEO && !isInReportAdmin && !isProductManager;
          checkAppDependency();
        },
      );

      $spcontext.isCurrentUserMemberOfGroup(
        configPropertiesRoot.REPORTADMIN.setting,
        function (isAdmin) {
          MainApplication.cachedState.isReportAdmin = isAdmin || false;
          checkAppDependency();
        },
      );
    }

    function tryRunGroupChecks() {
      console.log("Trying to run group checks...");
      if (
        dependencyState.userLoaded &&
        dependencyState.configLoaded &&
        !dependencyState.groupChecksStarted
      ) {
        dependencyState.groupChecksStarted = true;
        runGroupChecks();
      }
    }
  });
}

MainApplication.reportSyncSearch = function (keyquery, data) {
  if (!keyquery || keyquery.trim().length < 3) {
    return data;
  }

  keyquery = keyquery.trim().toLowerCase();

  return data.filter(
    (item) =>
      item.EmployeeName?.toLowerCase().includes(keyquery) ||
      item.WorkflowRequestID?.toLowerCase().includes(keyquery) ||
      item.Title?.toLowerCase().includes(keyquery) ||
      item.EmployeeDivision?.toLowerCase().includes(keyquery) ||
      item.EmployeeEmail?.toLowerCase().includes(keyquery) ||
      item.Approval_Status?.toLowerCase().includes(keyquery) ||
      item.Current_Approver?.toLowerCase().includes(keyquery) ||
      item.RDC_Status?.toLowerCase().includes(keyquery),
  );
};

MainApplication.renderExtraFeaturesTable = function (tableId, features) {

    const tbody = document.querySelector(`#${tableId} tbody`);

    tbody.innerHTML = "";

    features.forEach(feature => {

        tbody.innerHTML += `
            <tr data-id="${feature.id}">
                <td>
                    <input
                      type="checkbox"
                      ${feature.defaultChecked ? "checked disabled" : ""}
                    >
                </td>

                <td>
                    <strong>${feature.title}</strong><br>
                    <small>${feature.description}</small>
                </td>

                <td>
                    <textarea placeholder="Enter note"></textarea>
                </td>
            </tr>
        `;

    });

}

MainApplication.getExtraFeatures = function (tableId) {

    const rows = document.querySelectorAll(`#${tableId} tbody tr`);

    return [...rows].map(row => ({

        id: row.dataset.id,

        enabled: row.querySelector("input").checked,

        note: row.querySelector("textarea").value.trim()

    }));

}


MainApplication.buildReadOnlyData = function (savedData) {
    const extraFeatures = MainApplication.extraFeatures || [];
    return extraFeatures.map(feature => {

        const saved = savedData.find(x => x.id === feature.id) || {};

        return {

            title: feature.title,

            description: feature.description,

            enabled: saved.enabled || false,

            note: saved.note || ""

        };

    });

}

MainApplication.renderReadOnlyTable = function (tableId, data) {

    const tbody = document.querySelector(`#${tableId} tbody`);

    tbody.innerHTML = "";

    data.forEach(item=>{

        tbody.innerHTML += `
            <tr>

                <td>
                    ${item.enabled ? "✔" : "—"}
                </td>

                <td>
                    <strong>${item.title}</strong><br>
                    <small>${item.description}</small>
                </td>

                <td>
                    ${item.note || "-"}
                </td>

            </tr>
        `;

    });

}

MainApplication.populateSelect2 = function (divisions) {
  const $select = $("#divisionsInvolved");
  $select.select2();
  // Remove existing options
  $select.empty();

  // Add new options
  $.each(divisions, function (_, division) {
      $select.append(new Option(division, division));
  });

  // Refresh Select2
  
  $select
    .prop("disabled", true)
    .trigger("change.select2");
  
}

MainApplication.renderField = function (options) {
    const {
        containerId,
        type = "input",          // "input" | "textarea" | "a"
        bindValidate = "",
        placeholder = "",
        inputType = "text",
        required = false,
        readonly = false,
        value = "",
        rows = 4,
        className = "",
        // New options for <a>
        href = "#",
        target = "_self",
        download = false,
        text = ""               // preferred over "value" for links
    } = options;

    const $container = $("#" + containerId);

    if (!$container.length) {
        console.warn(`Container #${containerId} not found.`);
        return;
    }

    // Clear existing content
    $container.empty();

    let $field;

    if (type === "textarea") {
        $field = $("<textarea>", {
            class: className,
            placeholder: placeholder,
            rows: rows
        });
        $field.val(value);

    } else if (type === "a" || type === "link") {
        $field = $("<a>", {
            class: className,
            href: href,
            target: target
        });

        // Prefer explicit "text", fall back to "value"
        $field.text(text || value || href);

        if (download) {
            $field.attr("download", typeof download === "string" ? download : true);
        }

    } else {
        // Default: input
        $field = $("<input>", {
            type: inputType,
            class: className,
            placeholder: placeholder
        });
        $field.val(value);
    }

    // These only make sense for form controls
    if (type !== "a" && type !== "link") {
        $field.prop("required", required);
        $field.prop("readonly", readonly);

        // Add speed validation binding if supplied
        if (bindValidate) {
            $field.attr("speed-bind-validate", bindValidate);
        }
    }

    $container.append($field);

    // Optional: return the created element for further chaining
    return $field;
};

MainApplication.DateConstraints = {
  /** Today's date as YYYY-MM-DD (local) */
  todayISO() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.toISOString().slice(0, 10);
  },

  isWeekend(isoDate) {
    if (!isoDate) return false;
    const day = new Date(isoDate + "T00:00:00").getDay(); // 0 = Sun, 6 = Sat
    return day === 0 || day === 6;
  },

  /** Next weekday on or after the given ISO date */
  nextWeekday(isoDate) {
    const d = new Date(isoDate + "T00:00:00");
    while (d.getDay() === 0 || d.getDay() === 6) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString().slice(0, 10);
  },

  /**
   * Apply global rules to any date input:
   * - no past dates
   * - no weekends (clears + warns if user picks one)
   */
  applyBasicRules(input) {
    if (!input || input.type !== "date") return;

    // Block past dates
    input.min = this.todayISO();

    const enforce = () => {
      if (!input.value) return;

      if (input.value < this.todayISO()) {
        input.value = "";
        MainApplication.notyf?.error?.("Past dates are not allowed");
        return;
      }

      if (this.isWeekend(input.value)) {
        input.value = "";
        MainApplication.notyf?.error?.("Weekends are not allowed. Please choose a weekday.");
      }
    };

    input.addEventListener("change", enforce);
    input.addEventListener("input", enforce);
  },

  /**
   * Make ProposedStartDate and EndDate depend on each other.
   * - Start: today onward, weekdays only
   * - End: on/after Start, weekdays only
   * - When Start changes → End.min updates
   * - When End is before Start → clear End
   */
  linkStartAndEnd(startInput, endInput) {
    if (!startInput || !endInput) return;

    this.applyBasicRules(startInput);
    this.applyBasicRules(endInput);

    const sync = () => {
      const start = startInput.value;
      const end = endInput.value;

      if (start) {
        // End cannot be before Start
        const minEnd = this.nextWeekday(start);
        endInput.min = minEnd;

        if (end && end < start) {
          endInput.value = "";
          MainApplication.notyf?.error?.("End Date cannot be before Proposed Start Date");
        }
      } else {
        // No start yet → End still can't be in the past
        endInput.min = this.todayISO();
      }
    };

    startInput.addEventListener("change", sync);
    startInput.addEventListener("input", sync);
    endInput.addEventListener("change", sync);
    endInput.addEventListener("input", sync);

    // Run once in case values are already filled
    sync();
  },

  /** Apply basic rules to every date input currently in the DOM */
  applyToAllDateInputs(root = document) {
    root.querySelectorAll('input[type="date"]').forEach((input) => {
      this.applyBasicRules(input);
    });
  },
};

whenLayoutLoaded();
