const fs = require('fs');

exports.planning_get_all = (req, res, next) => {
    let rawdata = fs.readFileSync('./data_storage/planning.json');
    let plan = JSON.parse(rawdata);

    if (!plan) {
        return res.status(404).json({
            message: "Plan not found"
        });
    }
    
    res.status(200).json(plan);
}

exports.planning_post = (req, res, next) => {
    const newPlanning = req.body;
    
    if(!newPlanning) {
        return res.status(404).json({
            message: "Plan not found"
        });
    }
    
    const savePlan = JSON.stringify(newPlanning);
    console.log(savePlan);
    fs.writeFileSync('./data_storage/planning.json', savePlan);

    res.status(201).json({
        message : "Handling POST requests to /tasks",
        plan_inform : newPlanning
    });
}

