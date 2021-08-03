(function ($, localStorage) {
  var Calendar = tui.Calendar; /* CommonJS */
  let displayMonth = $("#calendarMonth");
  let lastMonthButton = $("#lastMonth");
  let nextMonthButton = $("#nextMonth");

  var calendar = new Calendar("#calendar", {
    defaultView: "month",
    taskView: true,
    template: {},
    useDetailPopup: true,
    month: {
      daynames: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      startDayOfWeek: 0,
      narrowWeekend: false,
    },
    isReadOnly: true,
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const calendarMonth = calendar.getDate().getMonth();
  const calendarYear = calendar.getDate().getFullYear();
  let currentMonth = calendarMonth;
  displayMonth.html(monthNames[calendarMonth] + " " + calendarYear.toString());

  // Reload trophies function
  function reloadTrophies() {
    // Go through each event and see if we need to add an image in the box
    for (let i = 0; i < responseMessage.length; i++) {
      const currentEvent = calendar.getElement(i.toString(), "1");
      const currentEventDetails = calendar.getSchedule(i.toString(), "1");
      // If the activity isn't in the current month, continue
      if (currentEventDetails.start._date.getMonth() !== currentMonth) {
        continue;
      }
      // This is how to add a picture
      let elem = document.createElement("img");
      elem.setAttribute("height", "30px");
      elem.setAttribute("width", "30px");
      elem.style.marginTop = "5px";
      elem.style.alignContent = "center";
      elem.src = "public/images/trophy.png";
      currentEvent.appendChild(elem);
    }
  }

  // Calendar pagination function
  function moveToNextOrPrevRange(val) {
    if (val === -1) {
      calendar.prev();
    } else if (val === 1) {
      calendar.next();
    }
    calendar.render(true);
    const calendarMonth = calendar.getDate().getMonth();
    const calendarYear = calendar.getDate().getFullYear();
    currentMonth = calendarMonth;
    displayMonth.html(
      monthNames[calendarMonth] + " " + calendarYear.toString()
    );
    reloadTrophies();
  }

  // Bind buttons
  lastMonthButton.on("click", function () {
    moveToNextOrPrevRange(-1);
  });
  nextMonthButton.on("click", function () {
    moveToNextOrPrevRange(1);
  });

  // Make an AJAX call to fetch the user's data
  let requestConfig = {
    method: "GET",
    url: "/users/activities",
    contentType: "application/json",
    async: false,
  };
  console.log(requestConfig);
  var responseMessage;
  $.ajax(requestConfig).then(function (response) {
    // Get all of the user's activities in an array
    responseMessage = response;
    if (!Array.isArray(responseMessage)) {
      return;
    }
    // Iterate through the array and make the events
    allEvents = [];
    for (let i = 0; i < responseMessage.length; i++) {
      const workoutDate = responseMessage[i][0];
      const workoutType = responseMessage[i][2][0];
      const workoutDesc = responseMessage[i][2][1];
      const workoutComment = responseMessage[i][3];
      let pastEvent;
      pastEvent = {
        id: i.toString(),
        calendarId: "1",
        title: workoutType,
        category: "time",
        isAllDay: true,
        start: workoutDate,
        end: workoutDate,
        body: `${workoutDesc} - ${workoutComment}`,
      };
      allEvents.push(pastEvent);
    }
    // Update the schedule in calendar object with past activities
    calendar.createSchedules(allEvents);
    calendar.render(true);
    reloadTrophies();
  });
})(jQuery, window.localStorage);
