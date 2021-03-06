(function ($, localStorage) {
  var Calendar = tui.Calendar; /* CommonJS */
  let displayMonth = $("#calendarMonth");
  let lastMonthButton = $("#lastMonth");
  let nextMonthButton = $("#nextMonth");

  function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
  }

  // Populate a motivational quote
  async function fetchQuotes() {
    const quotes = await fetch("https://type.fit/api/quotes");
    const parsedQuotes = await quotes.json();
    console.log(parsedQuotes);
    const randomNum = getRandomInt(0, parsedQuotes.length);
    // Use that randomQuote and put into the page
    const randomQuote = parsedQuotes[randomNum];
    const quoteText = $("#motivationalQuote");
    quoteText.html(`${randomQuote.text} - ${randomQuote.author || "Unknown"}`);
  }

  fetchQuotes();

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
    isReadOnly: false,
  });

  // On calendar double click, redirect to add new activity
  calendar.on("beforeCreateSchedule", async function (event) {
    event.guide.clearGuideElement();
    // Check if it was a double click
    if (event.triggerEventName === "dblclick") {
      // Save the selected date in local storage and redirect to add activity page
      let selectedDate = new Date(event.start._date).toDateString();
      localStorage.setItem("activityDate", selectedDate);
      window.location.replace("/users/addActivity");
    }
  });

  // When user presses delete button, delete the activity
  calendar.on("beforeDeleteSchedule", async function (e) {
    // Find the activity to be deleted
    let activityTitle = e.schedule.title;
    let activityNumber = parseFloat(e.schedule.body.split("-")[0]);
    let activityDate = e.schedule.start._date;
    let toDelete, indexDelete;
    toDelete = { activity: responseMessage[e.schedule.id] };
    let response = await fetch("/../users/deleteActivity", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toDelete),
    });
    // Remove the activity from responseMessage
    delete responseMessage[e.schedule.id];

    calendar.deleteSchedule(e.schedule.id, e.schedule.calendarId);
    calendar.render(true);
    reloadTrophies();
  });

  // When user presses edit button, edit the activity
  calendar.on("beforeUpdateSchedule", async function (e) {
    // Store all of the relevant information in localStorage for fetching
    console.log(e);
    const exerciseAmount = e.schedule.body.split("-")[0];
    const exerciseDesc = e.schedule.body.split("-")[1];
    localStorage.setItem("activityDate", e.schedule.start._date);
    localStorage.setItem("activityType", e.schedule.title);
    localStorage.setItem("activityAmount", exerciseAmount);
    localStorage.setItem("activityDesc", exerciseDesc);
    localStorage.setItem("oldActivity", responseMessage[e.schedule.id]);

    window.location.replace("/users/editActivity");
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
    for (const [key, value] of Object.entries(responseMessage)) {
      let currEvent = value;
      const currentEvent = calendar.getElement(key.toString(), "1");
      const currentEventDetails = calendar.getSchedule(key.toString(), "1");
      // If the activity isn't in the current month, continue
      if (currentEventDetails.start._date.getMonth() !== currentMonth) {
        continue;
      }
      // If the activity has a "true" field in the end then we add a trophy
      if (currEvent[4] === true) {
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
    // Convert response message to an object with index values as keys
    responseMessage = Object.assign({}, responseMessage);
    console.log(responseMessage);
    // Iterate through the array and make the events
    allEvents = [];
    for (let i = 0; i < Object.keys(responseMessage).length; i++) {
      let currWorkout = responseMessage[i];
      const workoutDate = currWorkout[0];
      const workoutType = currWorkout[2][0];
      const workoutDesc = currWorkout[2][1];
      const workoutComment = currWorkout[3];
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
