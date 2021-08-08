let newgoal_form = document.getElementById('newgoal-form');
let milestones = document.getElementById('milestones');

function addMilestone() {
  let index = milestones.children.length;

  let emptyMilestone = document.createElement("div");
  emptyMilestone.classList.add("milestone");
  emptyMilestone.innerHTML = `<input type="text" name="milestone_type_${index}" placeholder="Bench Press">
                              <input type="number" name="milestone_quant_${index}" placeholder="123">`;

  milestones.appendChild(emptyMilestone);
}

async function addGoal(event) {
  event.preventDefault();

  let raw_formdata = new FormData(newgoal_form);
  let formdata = {
    'exerciseType': raw_formdata.get('exerciseType'),
    'description': raw_formdata.get('description'),
    'target': [
      raw_formdata.get('target_activity'),
      raw_formdata.get('target_number')
    ],
    'startDate': raw_formdata.get('startDate'),
    'endDate': raw_formdata.get('endDate'),
    'milestones': []
  };
  
  for (let i = 0; i < milestones.children.length; i++) {
    let milestone_type = `milestone_type_${i}`;
    let milestone_quant = `milestone_quant_${i}`;
    formdata.milestones.push([raw_formdata.get(milestone_type), raw_formdata.get(milestone_quant)]);
  }

  console.log(formdata);

  let response = await fetch('/goals', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formdata)
  });

  let json = await response.json();
  console.log('response', json);

  location.reload();

  return false;
}

newgoal_form.addEventListener('submit', addGoal);