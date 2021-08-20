(function ($, localStorage) {
  // Set date in the edit form
  const exerciseDate = $("#exerciseDate");
  const activityDate = new Date(localStorage.getItem("activityDate"))
    .toISOString()
    .split("T")[0];
  console.log(localStorage.getItem("activityDate"));
  console.log(new Date(localStorage.getItem("activityDate")));
  console.log(new Date(localStorage.getItem("activityDate")).toISOString());
  exerciseDate.val(activityDate);

  // Set exercise in the edit form
  const exerciseType = $("#exercise");
  exerciseType.val(localStorage.getItem("activityType"));

  // Set exercise amount in the edit form
  const exerciseAmount = $("#amount");
  exerciseAmount.val(parseFloat(localStorage.getItem("activityAmount")));

  // Set description amount in the edit form
  const desc = $("#description");
  desc.val(localStorage.getItem("activityDesc"));
})(jQuery, window.localStorage);

const editactivity_form = document.getElementById("edit-activity-form");
editactivity_form.addEventListener("submit", editActivity);

async function editActivity(event) {
  event.preventDefault();
  // Get the old activity
  const oldActivity = localStorage.getItem("oldActivity").split(",");
  // Get the new activity
  let raw_formdata = new FormData(editactivity_form);
  let formdata = {
    exerciseDate: raw_formdata.get("exerciseDate"),
    exerciseGoal: raw_formdata.get("goal"),
    exerciseType: raw_formdata.get("exercise"),
    exerciseAmount: raw_formdata.get("amount"),
    exerciseDesc: raw_formdata.get("description"),
    oldActivity: oldActivity,
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
