const fs = require('fs');

exports.task_get_all = (req, res, next) => {
    let rawdata = fs.readFileSync('./data_storage/task.json');
    let task = JSON.parse(rawdata);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }
    
    res.status(200).json(task);
    
}

exports.task_post = (req, res, next) => {
    const newTask = req.body;
    
    if(!newTask) {
        return res.status(404).json({
            message: "Task not found"
        });
    }
    
    const saveTask = JSON.stringify(newTask);
    console.log(saveTask);
    fs.writeFileSync('./data_storage/task.json', saveTask);

    res.status(201).json({
        message : "Handling POST requests to /tasks",
        task_inform : newTask
    });
}


// exports.task_get_all = (req, res, next) => {
//     Order.find()
//         .select("product quantity _id")
//         .populate("product", "name")
//         .exec()
//         .then(docs => {
//             res.status(200).json({
//                 count: docs.length,
//                 orders: docs.map(doc => {
//                     return {
//                         _id: doc._id,
//                         product: doc.product,
//                         quantity: doc.quantity,
//                         request: {
//                             type: "GET",
//                             url: "http://localhost:3000/orders/" + doc._id
//                         }
//                     };
//                 })
//             });
//         })
//         .catch(err => {
//             res.status(500).json({
//                 error: err
//             });
//         });
// };