const fs = require('fs')


exports.obstacles_get_all = (req, res, next) => {
    let rawdata = fs.readFileSync('./data_storage/obstacles.json');
    let obstacles = JSON.parse(rawdata);

    if (!obstacles) {
        return res.status(404).json({
            message: "Plan not found"
        });
    }
    
    res.status(200).json(obstacles);
}