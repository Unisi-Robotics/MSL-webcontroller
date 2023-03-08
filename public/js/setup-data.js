const consoleCoordinate = $("#consoleCoordinate")
const tableObstacle = $("#obstacle-table")
const tablePlanning = $("#planning-table")
const urlApi = '/';

const canvas = document.getElementById('petaLapangan')
const ctx = canvas.getContext("2d")

$(canvas).css('background-image', 'url(/images/image12.png)')

$(canvas).click(function (event) {
    const offset = $(this).offset()
    const x = Math.round(event.pageX - offset.left)
    const y = Math.round(event.pageY - offset.top)

    console.log(x, y)
    consoleCoordinate.html(`Coordinate: ${x},${y}`)
})

let objects = {
    bs: {
        obstacles: [],
    }
}

let strategy = "A"

let obstacles = []

let planning = []

let currentPlanIndex = null
let currentPlan = null

function getStrategy(dir) {
    if (dir.value == "A") {
        strategy = "A"
        console.log(strategy)
    }
    else if (dir.value == "B") {
        strategy = "B"
        console.log(strategy)
    }
    else if (dir.value == "C") {
        strategy = "C"
        console.log(strategy)
    }
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

function renderObstacleTable() {
    tableObstacle.html('')
    $.each(obstacles, function (i, val) {
        let obs = `
            <tr>
                <td>
                    <input type="checkbox" onchange="obstacleChecked(this, ${i})">
                </td>
                <td>${val.name}</td>
                <td>${val.coordinate_x} , ${val.coordinate_y}</td>
            </tr>
        `
        tableObstacle.append(obs)
    })
}

function renderPlanningTable(plan) {
    tablePlanning.html('')
    if (plan) {
        $.each(plan.move_path, function (i, val) {
            renderPlanInput(i, val.agent, val.path, `${val.coordinate_x},${val.coordinate_y}`)
        })

        shoot_coordinate = ""

        coor_shoot_x = plan.shoot_target.coordinate_x
        coor_shoot_y = plan.shoot_target.coordinate_y

        shoot_coordinate = coor_shoot_x + ',' + coor_shoot_y

        $('.shoot-coordinate').val(shoot_coordinate)
    }
}

function deletePath(idx) {
    currentPlan.move_path.splice(idx, 1);
    renderPlanningTable(currentPlan)
}

function deleteValue(class_name) {
    $(class_name).val('0,0')
}

function deletePlan() {
    planning.splice(currentPlanIndex, 1)
    currentPlanIndex = null
    currentPlan = null
    renderPlanningTable(null)
}

function addPlanPath() {
    if (objects.bs.obstacles.length == 0) {
        return
    }

    if (currentPlan == null) {
        currentPlan = {
            obstacles: [...objects.bs.obstacles],
            strategyData: strategy,
            move_path: [
                {
                    agent: "",
                    path: "",
                    coordinate_x: 0,
                    coordinate_y: 0
                }
            ],
            shoot_target: {
                coordinate_x: 0,
                coordinate_y: 0
            }
        }
    } else {
        currentPlan.move_path.push({
            agent: "",
            path: "",
            coordinate_x: 0,
            coordinate_y: 0
        })
    }

    renderPlanningTable(currentPlan)
}

function renderPlanInput(index = null, agent = "", path = "", coordinate = "") {
    let obj_option = ``

    $.each(Object.keys(objects), function (i, val) {
        obj_option += `<option value="${val}">${val}</option>`
    })

    let plan = `
        <tr>
            <td>
                <select class="form-control plan-agent">
                <option value="">-- pilih --</option>
                <option value="r1">Robot #1</option>
                <option value="r2">Robot #2</option>
                </select>
            </td>
            <td>
                <select class="form-control plan-path">
                <option value="">-- pilih --</option>
                <option value="path_1">path 1</option>
                <option value="path_2">path 2</option>
                <option value="path_3">path 3</option>
            </td>
            <td>
                <input type="text" style="width: 90px" class="form-control plan-coordinate">
            </td>
            <td>
                <a href="#" onclick="deletePath(${index})">del</a>
            </td>
        </tr>
    `
    tablePlanning.append(plan)

    $($('.plan-agent')[index]).val(agent)
    $($('.plan-path')[index]).val(path)
    $($('.plan-coordinate')[index]).val(coordinate)
}

// TODO: penentu plan 
function obstacleChecked(cbx, i) {
    if ($(cbx).prop('checked')) {
        objects.bs.obstacles.push(i)
    } else {
        const index = objects.bs.obstacles.indexOf(i);
        if (index > -1) {
            objects.bs.obstacles.splice(index, 1);
        }
    }

    combIndex = indexOfCombination(objects.bs.obstacles, strategy)
    if (combIndex != null) {
        currentPlanIndex = combIndex
        currentPlan = { ...planning[currentPlanIndex] }

        if (typeof (currentPlan.shoot_target) == "undefined") {
            currentPlan.shoot_target = { coordinate_x: 0, coordinate_y: 0, direction: "kiri" }
        }

        renderPlanningTable(currentPlan)
    } else {
        currentPlanIndex = null
        currentPlan = null
        tablePlanning.html('')
    }
}

function savePlanning() {
    if (currentPlan != null) {
        let shoot_coor = $($('#shoot-coordinate')).val()
        currentPlan.strategyData = strategy

        $.each(currentPlan.move_path, function (i, val) {
            let coor = $($('.plan-coordinate')[i]).val()

            let coorx = coor.split(',')[0] ? Number(coor.split(',')[0]) : 0
            let coory = coor.split(',')[1] ? Number(coor.split(',')[1]) : 0

            currentPlan.move_path[i].agent = $($('.plan-agent')[i]).val()
            currentPlan.move_path[i].path = $($('.plan-path')[i]).val()
            currentPlan.move_path[i].coordinate_x = coorx
            currentPlan.move_path[i].coordinate_y = coory
        })

        if (currentPlanIndex == null) {
            currentPlanIndex = planning.length
            planning.push({ ...currentPlan })
        } else {
            planning[currentPlanIndex] = { ...currentPlan }
        }

        // console.log(planning)

        post_data_api(urlApi, 'plannings', planning)
    }
}

function drawObjects() {
    setInterval(function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        radius = 19
        obstacle_size = 50

        if (currentPlanIndex != null) {
            let plan = planning[currentPlanIndex]

            $.each(plan.move_path, function (i, val) {
                x = val.coordinate_x
                y = val.coordinate_y

                ctx.beginPath()
                ctx.arc(x, y, radius, 0, 2 * Math.PI);
                ctx.strokeStyle = val.agent == 'r1' ? 'magenta' : 'cyan'
                ctx.lineWidth = 4;
                ctx.stroke()
                ctx.fillStyle = 'black'
                ctx.fillText(val.path, x, y);
            })
        }

        if (objects.bs.obstacles.length > 0) {
            $.each(objects.bs.obstacles, function (i, val) {
                x = obstacles[val].coordinate_x
                y = obstacles[val].coordinate_y

                ctx.beginPath()
                ctx.fillStyle = 'black'
                ctx.fillRect(x - (obstacle_size / 2), y - (obstacle_size / 2), obstacle_size, obstacle_size);
            })
        }

    }, 100)
}

function get_data_api(url, target) {
    return fetch(url + target, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => data);
}

async function post_data_api(url, target, data) {
    await fetch(url + target, {
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

async function getAllObstacle() {
    obstacles = await get_data_api(urlApi, 'obstacles');
    renderObstacleTable()
}

async function getAllPlanning() {
    planning = await get_data_api(urlApi, 'plannings')
    console.log(planning)
}

// SET DEFAULT SHOOT VALUE
$('.shoot-coordinate').val('0,0')

// RENDER ELEMENT
getAllObstacle()
getAllPlanning()
drawObjects()


