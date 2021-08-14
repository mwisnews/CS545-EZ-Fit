(function ($, localStorage) {
  // Set date in the edit form
  const exerciseDate = $("#exerciseDate");
  const activityDate = new Date(localStorage.getItem("activityDate"))
    .toISOString()
    .split("T")[0];
  exerciseDate.val(activityDate);
})(jQuery, window.localStorage);

const addactivity_form = document.getElementById("add-activity-form");
addactivity_form.addEventListener("submit", addActivity);

async function addActivity(event) {
  event.preventDefault();
  // Get the new activity
  let raw_formdata = new FormData(addactivity_form);
  let formdata = {
    exerciseDate: raw_formdata.get("exerciseDate"),
    exerciseGoal: raw_formdata.get("goal"),
    exerciseType: raw_formdata.get("exercise"),
    exerciseAmount: raw_formdata.get("amount"),
    exerciseDesc: raw_formdata.get("description"),
  };
  console.log(formdata);
  // Error check
  if (
    !formdata.exerciseDate ||
    !formdata.exerciseGoal ||
    !formdata.exerciseType ||
    !formdata.exerciseAmount ||
    !formdata.exerciseDesc
  ) {
    alert("You must fill out all fields!");
    return;
  }
  // Make the call
  try {
    let response = await fetch("", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formdata),
    });

    console.log("response", response);

    // Let the user know they are getting redirected
    $("#redirect-text").removeAttr("hidden");
    await new Promise((r) => setTimeout(r, 2000));
    window.location.href = "/home";
  } catch (e) {
    console.log(e);
  }
}
