// const { delete } = require("../../app")

// const { response } = require("express")
const consoleCoordinate = $("#consoleCoordinate")
const inputTaskId = $("#input-task-id")
const inputTaskName = $("#input-task-name")
const inputTaskCheckR1 = $("#input-task-check-r1")
const inputTaskR1Name = $("#input-task-r1-name")
const inputTaskR1Object = $("#input-task-r1-object")
const inputTaskR1Var = $("#input-task-r1-variable")
const inputTaskCheckR2 = $("#input-task-check-r2")
const inputTaskR2Name = $("#input-task-r2-name")
const inputTaskR2Object = $("#input-task-r2-object")
const inputTaskR2Var = $("#input-task-r2-variable")
const inputTaskGoalObject = $("#input-task-goal-object")
const inputTaskGoalVar = $("#input-task-goal-variable")
const inputTaskGoalValObject = $("#input-task-goal-val-object")
const inputTaskGoalValVar = $("#input-task-goal-val-variable")
const tableTask = $("#task-table")
const tableObstacle = $("#obstacle-table")
const urlApi = '/';
const canvas = document.getElementById('petaLapangan')
const ctx = canvas.getContext("2d")

$(canvas).css('background-image', 'url(/images/image12.png)')

$(canvas).click(function (event) {
    const offset = $(this).offset()
    console.log(event.pageX);
    const x = Math.round(event.pageX - offset.left)
    const y = Math.round(event.pageY - offset.top)

    console.log(x, y)
    consoleCoordinate.html(`Coordinate: ${x},${y}`)
})

function get_data_api(url, target) {
    return fetch(url + target, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => data);
}

function post_data_api(url, target, data) {
    fetch(url + target, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(result => {
            console.log('berhasil: ' + result);
        })
        .catch(err => {
            console.log('error: ' + err)
        })
}

let objects = {
    r1: {
        ball_status: false,
        position: [127, 363, 0], // x, y, orien
        ball_location: [0, 0],
        map_pose: [113, 337, 0]
    },
    r2: {
        ball_status: false,
        position: [674, 363, 0], // x, y, orien
        ball_location: [0, 0],
        map_pose: [636, 336, 0]
    },
    bs: {
        goal_target_kiri: [320, 90],
        goal_target_kanan: [425, 87],
        // corner_kiri: [106, 78],
        strategy: "A", //BARU--------------------------------------------------------------
        shoot_target: {
            coordinate_x: 320,
            coordinate_y: 90
        },
        obstacles: [],
        // temp_obs: [], //buat menyimpan strategi a b sebelum diubah ke c
        post_r1: [0, 0],
        post_r2: [0, 0],
        r1_positioning_1: null,
        r1_positioning_2: null,
        r1_positioning_3: null,
        r1_test_post_1: [279, 430],
        r1_test_post_2: [378, 282],
        r2_positioning_1: null,
        r2_positioning_2: null,
        r2_positioning_3: null,
        status_bola_lepas: false,
        status_bola_tangkap: true,
        ball_location: [0, 0]
    }
}

let listTaskGlobal = [
    { text: "Ambil Bola", val: "AMBIL_BOLA" },
    { text: "Positioning", val: "POSITIONING" },
    { text: "Hadap Arah", val: "HADAP_ARAH" },
    { text: "Operan", val: "OPERAN" },
    { text: "Cetak Goal", val: "CETAK_GOAL" },
]

let listTaskRobot = [
    { text: "Ambil Bola", val: "AMBIL_BOLA" },
    { text: "Positioning", val: "POSITIONING" },
    { text: "Cetak Goal", val: "CETAK_GOAL" },
    { text: "Kirim Bola", val: "KIRIM_BOLA" },
    { text: "Terima Bola", val: "TERIMA_BOLA" },
    { text: "Hadap Arah", val: "HADAP_ARAH" },
]

let listTaskObject = [
    { text: "Robot #1", val: "r1" },
    { text: "Robot #2", val: "r2" },
    { text: "Base station", val: "bs" },
]

let tasks = []
let obstacles = []
let planning = []
let currentPlan = null
let strategy = "A"

inputTaskCheckR1.change(function () {
    const checked = $(this).prop('checked')
    if (checked) {
        inputTaskR1Name.prop('disabled', false)
        inputTaskR1Object.prop('disabled', false)
        inputTaskR1Var.prop('disabled', false)
    } else {
        inputTaskR1Name.prop('disabled', true)
        inputTaskR1Object.prop('disabled', true)
        inputTaskR1Var.prop('disabled', true)
    }
}).trigger('change')


inputTaskCheckR2.change(function () {
    const checked = $(this).prop('checked')
    if (checked) {
        inputTaskR2Name.prop('disabled', false)
        inputTaskR2Object.prop('disabled', false)
        inputTaskR2Var.prop('disabled', false)
    } else {
        inputTaskR2Name.prop('disabled', true)
        inputTaskR2Object.prop('disabled', true)
        inputTaskR2Var.prop('disabled', true)
    }
}).trigger('change')

function getObjectVariable(obj) {
    if (obj == "") {
        return []
    }
    const keys = Object.keys(objects[obj])
    return keys
}

function renderRobotTaskOption() {
    inputTaskR1Name.find('option').remove().end()
    inputTaskR2Name.find('option').remove().end()
    inputTaskR1Name.append(new Option("-- pilih --", ""))
    inputTaskR2Name.append(new Option("-- pilih --", ""))

    $.each(listTaskRobot, function (i, val) {
        inputTaskR1Name.append(new Option(val.text, val.val))
        inputTaskR2Name.append(new Option(val.text, val.val))
    })
}

function renderTaskOption() {
    inputTaskName.find('option').remove().end()
    inputTaskName.append(new Option("-- pilih --", ""))

    $.each(listTaskGlobal, function (i, val) {
        inputTaskName.append(new Option(val.text, val.val))
    })
}

function renderObjectOption() {
    inputTaskR1Object.find('option').remove().end()
    inputTaskR2Object.find('option').remove().end()
    inputTaskGoalObject.find('option').remove().end()
    inputTaskGoalValObject.find('option').remove().end()

    inputTaskR1Object.append(new Option("-- pilih --", ""))
    inputTaskR2Object.append(new Option("-- pilih --", ""))
    inputTaskGoalObject.append(new Option("-- pilih --", ""))
    inputTaskGoalValObject.append(new Option("-- pilih --", ""))

    $.each(listTaskObject, function (i, val) {
        inputTaskR1Object.append(new Option(val.text, val.val))
        inputTaskR2Object.append(new Option(val.text, val.val))
        inputTaskGoalObject.append(new Option(val.text, val.val))
        inputTaskGoalValObject.append(new Option(val.text, val.val))
    })

    inputTaskR1Object.change(function () {
        const obj = inputTaskR1Object.val()
        const vars = getObjectVariable(obj)

        inputTaskR1Var.find('option').remove().end()
        inputTaskR1Var.append(new Option("-- pilih --", ""))
        $.each(vars, function (i, val) {
            inputTaskR1Var.append(new Option(val, val))
        })
    })

    inputTaskR2Object.change(function () {
        const obj = inputTaskR2Object.val()
        const vars = getObjectVariable(obj)

        inputTaskR2Var.find('option').remove().end()
        inputTaskR2Var.append(new Option("-- pilih --", ""))
        $.each(vars, function (i, val) {
            inputTaskR2Var.append(new Option(val, val))
        })
    })

    inputTaskGoalObject.change(function () {
        const obj = inputTaskGoalObject.val()
        const vars = getObjectVariable(obj)

        inputTaskGoalVar.find('option').remove().end()
        inputTaskGoalVar.append(new Option("-- pilih --", ""))
        $.each(vars, function (i, val) {
            inputTaskGoalVar.append(new Option(val, val))
        })
    })

    inputTaskGoalValObject.change(function () {
        const obj = inputTaskGoalValObject.val()
        const vars = getObjectVariable(obj)

        inputTaskGoalValVar.find('option').remove().end()
        inputTaskGoalValVar.append(new Option("-- pilih --", ""))
        $.each(vars, function (i, val) {
            inputTaskGoalValVar.append(new Option(val, val))
        })
    })
}

function clearFormTask() {
    inputTaskId.val("")
    inputTaskName.val("")
    inputTaskCheckR1.prop('checked', false)
    inputTaskR1Name.val("")
    inputTaskR1Object.val("")
    inputTaskR1Var.val("")
    inputTaskCheckR2.prop('checked', false)
    inputTaskR2Name.val("")
    inputTaskR2Object.val("")
    inputTaskR2Var.val("")
    inputTaskGoalObject.val("")
    inputTaskGoalVar.val("")
    inputTaskGoalValObject.val("")
    inputTaskGoalValVar.val("")
}

function setDataModal(task, taskId = "") {
    inputTaskId.val(taskId)
    inputTaskName.val(task.task)
    $.each(task.agent, function (i, val) {
        if (val.name == "r1") {
            inputTaskCheckR1.prop("checked", true)
            inputTaskR1Name.val(val.task)
            inputTaskR1Object.val(val.data.object)
            inputTaskR1Object.trigger('change')
            inputTaskR1Var.val(val.data.variable)
        }

        if (val.name == "r2") {
            inputTaskCheckR2.prop("checked", true)
            inputTaskR2Name.val(val.task)
            inputTaskR2Object.val(val.data.object)
            inputTaskR2Object.trigger('change')
            inputTaskR2Var.val(val.data.variable)
        }
    })
    inputTaskCheckR1.trigger("change")
    inputTaskCheckR2.trigger("change")

    inputTaskGoalObject.val(task.goal.object)
    inputTaskGoalObject.trigger('change')
    inputTaskGoalVar.val(task.goal.variable)
    inputTaskGoalValObject.val(task.goal.object_val)
    inputTaskGoalValObject.trigger('change')
    inputTaskGoalValVar.val(task.goal.variable_val)
}

// function getStrategy(dir) {
//     let strat = ""

//     if (dir.value == "A") {
//         strat = "A"

//         for (let i = 0; i < objects.bs.temp_obs.length; i++) {
//             console.log(objects.bs.temp_obs.length)
//             objects.bs.obstacles.push(objects.bs.temp_obs[i])
//         }


//         while (objects.bs.obstacles.length > 2) {
//             console.log("masuk")
//             objects.bs.obstacles.shift()
//         }

//     } else if (dir.value == "B") {
//         strat = "B"

//         for (let i = 0; i < objects.bs.temp_obs.length; i++) {
//             console.log(objects.bs.temp_obs.length)
//             objects.bs.obstacles.push(objects.bs.temp_obs[i])
//         }

//         while (objects.bs.obstacles.length > 2) {
//             console.log("masuk")
//             objects.bs.obstacles.shift()
//         }

//     } else if (dir.value == "C") {
//         strat = "C"
//         console.log(dir.value)
//         //menghapus array dan menambah checked array baru di 1 4 
//         for (let i = 0; i < objects.bs.obstacles.length; i++) { //isinya dipindah dulu ke temp
//             objects.bs.temp_obs.push(objects.bs.obstacles[i])
//         }
//         while (objects.bs.obstacles.length > 0) {   //mengkosongkan obstacles
//             objects.bs.obstacles.pop()
//         }
//         objects.bs.obstacles.push(5)
//         objects.bs.obstacles.push(7)
//     }

//     settingPathObstacle()

//     objects.bs.strategy = strat
//     console.log(objects.bs.strategy)
//     console.log(objects.bs.obstacles)
// }

function getStrategy(dir) {
    if (dir.value == "A") {
        strategy = "A"
        settingPathObstacle()
        console.log(currentPlan)
    }
    else if (dir.value == "B") {
        strategy = "B"
        settingPathObstacle()
        console.log(currentPlan)
    }
    else if (dir.value == "C") {
        strategy = "C"
        settingPathObstacle()
        console.log(currentPlan)
    }
    else if (dir == "A") {
        strategy = "A"
        settingPathObstacle()
        console.log(currentPlan)
    }
    else if (dir == "B") {
        strategy = "B"
        settingPathObstacle()
        console.log(currentPlan)
    }
    else if (dir == "C") {
        strategy = "C"
        settingPathObstacle()
        console.log(currentPlan)
    }

}

function getValue(dir) {
    let coor_shoot_x = 340
    let coor_shoot_y = 102

    if (dir.value == "Kiri") {
        coor_shoot_x = 350
        coor_shoot_y = 102
    } else if (dir.value == "Tengah") {
        coor_shoot_x = 405
        coor_shoot_y = 102
    } else if (dir.value == "Kanan") {
        coor_shoot_x = 455
        coor_shoot_y = 102
    }
    else if (dir == "Kiri") {
        coor_shoot_x = 345
        coor_shoot_y = 102
    } else if (dir == "Tengah") {
        coor_shoot_x = 405
        coor_shoot_y = 102
    } else if (dir == "Kanan") {
        coor_shoot_x = 455
        coor_shoot_y = 102
    }

    objects.bs.shoot_target.coordinate_x = coor_shoot_x
    objects.bs.shoot_target.coordinate_y = coor_shoot_y
    console.log(objects.bs.shoot_target)

}

function openTask(taskId = null) {
    clearFormTask()
    console.log('open task')
    if (taskId != null) {
        console.log(tasks[taskId])
        setDataModal(tasks[taskId], taskId)
    }
    $("#modalTask").modal('show')
}

async function deleteTask(taskId = null) {
    console.log('delete task')
    if (taskId != null) {
        console.log(tasks[taskId])

        tasks.splice(taskId, 1);
        await post_data_api(urlApi, 'tasks', tasks);
    }
    renderTaskTable()
}

async function addTask() {
    console.log('add task')

    let task = {
        task: inputTaskName.val(),
        agent: [],
        goal: {
            object: inputTaskGoalObject.val(),
            variable: inputTaskGoalVar.val(),
            object_val: inputTaskGoalValObject.val(),
            variable_val: inputTaskGoalValVar.val()
        },
        status: 'waiting'
    }

    if (inputTaskCheckR1.prop("checked") === true) {
        task.agent.push(
            {
                name: 'r1',
                task: inputTaskR1Name.val(),
                data: {
                    object: inputTaskR1Object.val(),
                    variable: inputTaskR1Var.val()
                }
            }
        )
    }

    if (inputTaskCheckR2.prop("checked") === true) {
        task.agent.push(
            {
                name: 'r2',
                task: inputTaskR2Name.val(),
                data: {
                    object: inputTaskR2Object.val(),
                    variable: inputTaskR2Var.val()
                }
            }
        )
    }

    let idTask = inputTaskId.val();

    if (idTask != "") {
        tasks[idTask] = task;
    } else {
        tasks.push(task);
    }

    await post_data_api(urlApi, 'tasks', tasks);

    renderTaskTable()
    $('#modalTask').modal('hide')

}

function renderTaskTable() {
    tableTask.html('')
    $.each(tasks, function (i, val) {
        let row = `
            <tr>
                <td>${i + 1}</td>
                <td>${val.task}</td>
                <td><span class="badge badge-success">${val.status}</span></td>
                <td>
                  <a href="#" onclick="openTask(${i})" >open</a> | <a href="#" onclick="deleteTask(${i})">delete</a>
                </td>
            </tr>
        `
        tableTask.append(row)
    })
}

function renderObstacleTable() {
    tableObstacle.html('')
    $.each(obstacles, function (i, val) {
        let obs = `
            <tr>
                <td>
                    <input type="checkbox" onchange="obstacleChecked(this, ${i})">
                </td>
                <td>${val.name} </td>
                <td>${val.coordinate_x} , ${val.coordinate_y}</td>
            </tr>
        `
        tableObstacle.append(obs)
    })
}

function settingPathObstacle() {
    idx = indexOfCombination(objects.bs.obstacles, strategy)
    if (idx != null) {
        currentPlan = planning[idx]
        objects.bs.strategy = currentPlan.strategyData
        $.each(currentPlan.move_path, function (i, val) {
            x = val.coordinate_x
            y = val.coordinate_y

            if (val.agent == 'r1') {
                if (val.path == 'path_1') {
                    objects.bs.r1_positioning_1 = [x, y]
                } else if (val.path == 'path_2') {
                    objects.bs.r1_positioning_2 = [x, y]
                } else if (val.path == 'path_3') {
                    objects.bs.r1_positioning_3 = [x, y]
                }
            } else if (val.agent == 'r2') {
                if (val.path == 'path_1') {
                    objects.bs.r2_positioning_1 = [x, y]
                } else if (val.path == 'path_2') {
                    objects.bs.r2_positioning_2 = [x, y]
                } else if (val.path == 'path_3') {
                    objects.bs.r2_positioning_3 = [x, y]
                }
            }
        })

        // display coordinate of shoot target
        if (typeof (currentPlan.shoot_target != "undefined")) {
            shoot_coordinat_x = currentPlan.shoot_target.coordinate_x
            shoot_coordinat_y = currentPlan.shoot_target.coordinate_y

            objects.bs.shoot_target.coordinate_x = shoot_coordinat_x
            objects.bs.shoot_target.coordinate_y = shoot_coordinat_y
        }

        console.log(objects.bs.shoot_target)

    } else {
        currentPlan = null
    }
}

function obstacleChecked(cbx, i) {
    if ($(cbx).prop('checked')) {
        objects.bs.obstacles.push(i)
    } else {
        const index = objects.bs.obstacles.indexOf(i);
        if (index > -1) {
            objects.bs.obstacles.splice(index, 1);
        }
    }

    shoot_coordinat_x = 0
    shoot_coordinat_y = 0

    settingPathObstacle()
    $('#shoot-direction').text("arah : " + currentPlan.shoot_target.direction)
}

async function getAllTask() {
    tasks = await get_data_api(urlApi, 'tasks');
    renderTaskTable()
}

async function getAllObstacle() {
    obstacles = await get_data_api(urlApi, 'obstacles');
    renderObstacleTable()
}

async function getAllPlanning() {
    planning = await get_data_api(urlApi, 'plannings')
}

function indexOfCombination(comb, strat) {
    let index = null
    let is_exist = false

    $.each(planning, function (i, val) {
        if (comb.length == val.obstacles.length && val.strategyData == strat) {
            is_exist = true
            $.each(comb, function (j, c) {
                if (!val.obstacles.includes(c)) {
                    is_exist = false
                }
            })

            if (is_exist) {
                index = i
                console.log(strat, val.strategyData)
                console.log('plan found', comb.length, val.obstacles.length)
            }
        }
    })

    return index
}

function degrees_to_radians(degrees) {
    var pi = Math.PI;
    return degrees * (pi / 180);
}

function drawObjects() {
    setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        radius = 19
        obstacle_size = 50

        x = objects.r1.position[0]
        y = objects.r1.position[1]
        ori = objects.r1.position[2]

        ctx.beginPath();
        ctx.strokeStyle = 'magenta'
        ctx.lineWidth = 5;
        ctx.moveTo(x, y);
        xt = Math.cos(degrees_to_radians(ori)) * 1000 + x
        yt = Math.sin(degrees_to_radians(ori)) * 1000 + y
        ctx.lineTo(xt, yt);
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'magenta'
        ctx.fill()
        ctx.beginPath()
        ctx.strokeStyle = 'magenta'
        ctx.lineWidth = 10;
        ctx.arc(x, y, radius, (ori + 15) * (Math.PI / 180), (ori - 15) * (Math.PI / 180));
        ctx.stroke()

        x = objects.r2.position[0]
        y = objects.r2.position[1]
        ori = objects.r2.position[2]

        ctx.beginPath();
        ctx.strokeStyle = 'cyan'
        ctx.moveTo(x, y);
        ctx.lineWidth = 5;
        xt = Math.cos(degrees_to_radians(ori)) * 1000 + x
        yt = Math.sin(degrees_to_radians(ori)) * 1000 + y
        ctx.lineTo(xt, yt);
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = 'cyan'
        ctx.fill()
        ctx.beginPath()
        ctx.strokeStyle = 'cyan'
        ctx.lineWidth = 10;
        ctx.arc(x, y, radius, (ori + 15) * (Math.PI / 180), (ori - 15) * (Math.PI / 180));
        ctx.stroke()

        // --- baru nih

        x = objects.r1.map_pose[0]
        y = objects.r1.map_pose[1]
        ori = objects.r1.map_pose[2]

        ctx.beginPath();
        ctx.strokeStyle = '#DDA0DD'
        ctx.moveTo(x, y);
        ctx.lineWidth = 5;
        xt = Math.cos(degrees_to_radians(ori)) * 1000 + x
        yt = Math.sin(degrees_to_radians(ori)) * 1000 + y
        ctx.lineTo(xt, yt);
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#DDA0DD'
        ctx.fill()
        ctx.beginPath()
        ctx.strokeStyle = '#DDA0DD'
        ctx.lineWidth = 10;
        ctx.arc(x, y, radius, (ori + 15) * (Math.PI / 180), (ori - 15) * (Math.PI / 180));
        ctx.stroke()

        x = objects.r2.map_pose[0]
        y = objects.r2.map_pose[1]
        ori = objects.r2.map_pose[2]

        ctx.beginPath();
        ctx.strokeStyle = '#E0FFFF'
        ctx.moveTo(x, y);
        ctx.lineWidth = 5;
        xt = Math.cos(degrees_to_radians(ori)) * 1000 + x
        yt = Math.sin(degrees_to_radians(ori)) * 1000 + y
        ctx.lineTo(xt, yt);
        ctx.stroke();

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#E0FFFF'
        ctx.fill()
        ctx.beginPath()
        ctx.strokeStyle = '#E0FFFF'
        ctx.lineWidth = 10;
        ctx.arc(x, y, radius, (ori + 15) * (Math.PI / 180), (ori - 15) * (Math.PI / 180));
        ctx.stroke()

        if (objects.bs.obstacles.length > 0) {
            $.each(objects.bs.obstacles, function (i, val) {
                x = obstacles[val].coordinate_x
                y = obstacles[val].coordinate_y

                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.fillRect(x - (obstacle_size / 2), y - (obstacle_size / 2), obstacle_size, obstacle_size);
            })
        }

        if (currentPlan != null) {
            $.each(currentPlan.move_path, function (i, val) {
                x = val.coordinate_x
                y = val.coordinate_y

                ctx.beginPath()
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = val.agent == 'r1' ? 'magenta' : 'cyan'
                ctx.lineWidth = 4;
                ctx.stroke()
            })
        }
        // x = objects.bs.corner_kiri[0]
        // y = objects.bs.corner_kiri[1]

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        // ctx.strokeStyle = val.agent == 'r1' ? 'magenta' : 'cyan'
        ctx.lineWidth = 4;
        ctx.stroke()

    }, 100)
}

// var minutesLabel = document.getElementById("minutes");
// var secondsLabel = document.getElementById("seconds");
// var totalSeconds = 0;
// var timeInterval = null;

// function setTime() {
//     ++totalSeconds;
//     secondsLabel.innerHTML = pad(totalSeconds % 60);
//     minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
// }

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

// RENDER ELEMNET
renderTaskOption()
renderRobotTaskOption()
renderObjectOption()
drawObjects()

// LOAD DATA FROM API
getAllTask()
getAllObstacle()
getAllPlanning()

setTimeout(() => {
    var elStrategy = document.getElementById('strategy-skema');
    var eventChange = new Event('change');
    elStrategy.dispatchEvent(eventChange);

    var elShot = document.getElementById('shoot-coordinate');
    elShot.dispatchEvent(eventChange);
}, 2000)


// keyboard control
document.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "j":
            restart();
            start();
            break;
        case "k":
            stop();
            break;
        case "l":
            restart();
            break;
        case "q":
            getStrategy("A");
            getValue("Kiri");
            send_data();
            break;
        case "w":
            getStrategy("A");
            getValue("Tengah");
            send_data();
            break;
        case "e":
            getStrategy("A");
            getValue("Kanan");
            send_data();
            break;
        case "a":
            getStrategy("B");
            getValue("Kiri");
            send_data();
            break;
        case "s":
            getStrategy("B");
            getValue("Tengah");
            send_data();
            break;
        case "d":
            getStrategy("B");
            getValue("Kanan");
            send_data();
            break;
        case "z":
            getStrategy("C");
            getValue("Kiri");
            send_data();
            break;
        case "x":
            getStrategy("C");
            getValue("Tengah");
            send_data();
            break;
        case "c":
            getStrategy("C");
            getValue("Kanan");
            send_data();
            break;
        case "Enter":
            send_data();
            break;
        default:
            return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);
