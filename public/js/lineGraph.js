(function ($, localStorage) {
  // Make an AJAX call to fetch the user's data
  let requestConfig = {
    method: "GET",
    url: "/users/activities",
    contentType: "application/json",
    async: false,
  };
  console.log(requestConfig);
  var responseMessage, allEvents;
  $.ajax(requestConfig).then(function (response) {
    // Get all of the user's activities in an array
    responseMessage = response;
    if (!Array.isArray(responseMessage)) {
      return;
    }
    // Get the currently selected value
    const selectedWorkout = $("select").val();
    // Iterate through the array and make the events
    allEvents = [];
    for (let i = 0; i < responseMessage.length; i++) {
      const workoutDate = responseMessage[i][0];
      const workoutType = responseMessage[i][2][0];
      const workoutDesc = responseMessage[i][2][1];
      const workoutComment = responseMessage[i][3];
      if (selectedWorkout === "All" || workoutType === selectedWorkout) {
        let pastEvent;
        console.log(workoutDate);
        const workoutDateSplit = workoutDate.split("T")[0].split("-");
        console.log(workoutDateSplit);
        pastEvent = {
          x: new Date(
            workoutDateSplit[0],
            workoutDateSplit[1] - 1,
            workoutDateSplit[2] - 1
          ),
          y: workoutDesc,
          indexLabel: workoutType,
        };
        allEvents.push(pastEvent);
      }
    }
  });
  console.log(allEvents);

  var chart = new CanvasJS.Chart("chartContainer", {
    animationEnabled: true,
    theme: "light2",
    title: {
      text: "Your Past Activity",
    },
    axisX: {
      valueFormatString: "MM/DD",
      interval: 1,
      intervalType: "day",
      text: "Date",
    },
    data: [
      {
        type: "line",
        dataPoints: allEvents,
      },
    ],
  });
  chart.render();

  // On select change, re render the graph
  $("select").on("change", function () {
    rerenderGraph();
  });

  function rerenderGraph() {
    // Get the currently selected value
    const selectedWorkout = $("select").val();
    // Iterate through the array and make the events
    allEvents = [];
    for (let i = 0; i < responseMessage.length; i++) {
      const workoutDate = responseMessage[i][0];
      const workoutType = responseMessage[i][2][0];
      const workoutDesc = responseMessage[i][2][1];
      const workoutComment = responseMessage[i][3];
      if (selectedWorkout === "All" || workoutType === selectedWorkout) {
        let pastEvent;
        console.log(workoutDate);
        const workoutDateSplit = workoutDate.split("T")[0].split("-");
        console.log(workoutDateSplit);
        pastEvent = {
          x: new Date(
            workoutDateSplit[0],
            workoutDateSplit[1] - 1,
            workoutDateSplit[2] - 1
          ),
          y: workoutDesc,
          indexLabel: workoutType,
        };
        allEvents.push(pastEvent);
      }
    }
    console.log(allEvents);
    chart.options.data[0].dataPoints = allEvents;
    console.log(chart);
    chart.render();
  }
})(jQuery, window.localStorage);
