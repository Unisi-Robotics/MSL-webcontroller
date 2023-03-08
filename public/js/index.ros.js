const ros = new ROSLIB.Ros({
    url: `ws://${window.location.hostname}:9090`
})
let mainProcess;
let taskRunning;

ros.on('connection', function () {
    console.log('Connected to websocket server.');
});

ros.on('error', function (error) {
    console.log('Error connecting to websocket server: ', error);
});

ros.on('close', function () {
    console.log('Connection to websocket server closed.');
});

// publish topic
const rosTaskMessage = new ROSLIB.Message({
    task: new ROSLIB.Message({ data: 'STOP' }),
    target: new ROSLIB.Message({
        x: 0,
        y: 0,
        z: 0
    })
})

const rosLocationMessage = new ROSLIB.Message({
    kickoff: new ROSLIB.Message({
        x: 0,
        y: 0,
        z: 0
    }),
    passing: new ROSLIB.Message({
        x: 0,
        y: 0,
        z: 0
    }),
    cetak_goal: new ROSLIB.Message({
        x: 0,
        y: 0,
        z: 0
    }),
    goal_target: new ROSLIB.Message({
        x: 0,
        y: 0,
        z: 0
    }),
    obstacles: [],
})

const rosR1Task = new ROSLIB.Topic({
    ros: ros,
    name: '/r1/task',
    message: 'rsbuii_msgs/Task'
})

const rosR1MapPose = new ROSLIB.Topic({
    ros: ros,
    name: '/r1/map_pose',
    message: 'geometry_msgs/Point'
})

const rosR2MapPose = new ROSLIB.Topic({
    ros: ros,
    name: '/r2/map_pose',
    message: 'geometry_msgs/Point'
})

const rosR2Task = new ROSLIB.Topic({
    ros: ros,
    name: '/r2/task',
    message: 'std_msgs/Task'
})

const rosR1Pose = new ROSLIB.Topic({
    ros: ros,
    name: '/r1/pose',
    message: 'geometry_msgs/Point'
})

rosR1Pose.subscribe(function (m) {
    objects.r1.position = [m.x, m.y, m.z]
});

const rosR2Pose = new ROSLIB.Topic({
    ros: ros,
    name: '/r2/pose',
    message: 'geometry_msgs/Point'
})

const rosR1Position = new ROSLIB.Topic({
    ros: ros,
    name: '/r1/position',
    message: 'geometry_msgs/Point'
})

const rosR2Position = new ROSLIB.Topic({
    ros: ros,
    name: '/r2/position',
    message: 'geometry_msgs/Point'
})

rosR2Pose.subscribe(function (m) {
    objects.r2.position = [m.x, m.y, m.z]
});

rosR1MapPose.subscribe(function (d) {
    objects.r1.map_pose = [d.x, d.y, d.z]
});

rosR2MapPose.subscribe(function (d) {
    objects.r2.map_pose = [d.x, d.y, d.z]
});

const rosCommand = new ROSLIB.Topic({
    ros: ros,
    name: '/command',
    message: 'std_msgs/String'
})

//----------------------------------------------------NEW ROSR1R2STRATEGY------------------================
const rosStrategy = new ROSLIB.Topic({
    ros: ros,
    name: '/strategy',
    message: 'std_msgs/String'
})


const rosR1Locations = new ROSLIB.Topic({
    ros: ros,
    name: '/r1/locations',
    message: 'rsbuii_msgs/Locations'
})

const rosR2Locations = new ROSLIB.Topic({
    ros: ros,
    name: '/r2/locations',
    message: 'rsbuii_msgs/Locations'
})


function send_data() {
    rosLocationMessage.obstacles = []
    $.each(objects.bs.obstacles, function (i, val) {
        rosLocationMessage.obstacles.push(new ROSLIB.Message({
            x: obstacles[val].coordinate_x,
            y: obstacles[val].coordinate_y,
            z: 0
        }))
    })
    rosLocationMessage.kickoff.x = objects.bs.r1_positioning_1[0]
    rosLocationMessage.kickoff.y = objects.bs.r1_positioning_1[1]
    rosLocationMessage.passing.x = objects.bs.r1_positioning_2[0]
    rosLocationMessage.passing.y = objects.bs.r1_positioning_2[1]
    rosLocationMessage.cetak_goal.x = objects.bs.r1_positioning_3[0]
    rosLocationMessage.cetak_goal.y = objects.bs.r1_positioning_3[1]
    rosLocationMessage.goal_target.x = objects.bs.shoot_target.coordinate_x
    rosLocationMessage.goal_target.y = objects.bs.shoot_target.coordinate_y
    rosR1Locations.publish(rosLocationMessage)

    rosLocationMessage.obstacles = []
    $.each(objects.bs.obstacles, function (i, val) {
        rosLocationMessage.obstacles.push(new ROSLIB.Message({
            x: obstacles[val].coordinate_x,
            y: obstacles[val].coordinate_y,
            z: 0
        }))
    })

    rosLocationMessage.kickoff.x = objects.bs.r2_positioning_1[0]
    rosLocationMessage.kickoff.y = objects.bs.r2_positioning_1[1]
    rosLocationMessage.passing.x = objects.bs.r2_positioning_2[0]
    rosLocationMessage.passing.y = objects.bs.r2_positioning_2[1]
    rosLocationMessage.cetak_goal.x = objects.bs.r2_positioning_3[0]
    rosLocationMessage.cetak_goal.y = objects.bs.r2_positioning_3[1]
    rosLocationMessage.goal_target.x = objects.bs.shoot_target.coordinate_x
    rosLocationMessage.goal_target.y = objects.bs.shoot_target.coordinate_y

    rosR2Locations.publish(rosLocationMessage)
    console.log(rosLocationMessage)

    rosStrategyMessage = new ROSLIB.Message({ data: objects.bs.strategy })
    rosStrategy.publish(rosStrategyMessage)
}

function stop() {
    rosCommandMessage = new ROSLIB.Message({ data: 'STOP' })
    rosCommand.publish(rosCommandMessage)
    // if (timeInterval != null) {
    //     clearInterval(timeInterval);
    //     totalSeconds = 0;
    // }
}

function restart() {
    rosCommandMessage = new ROSLIB.Message({ data: 'RESTART' })
    rosCommand.publish(rosCommandMessage)
    posPosition = new ROSLIB.Message({ x: 127.0, y: 363, z: 0 })
    rosR1Position.publish(posPosition)
    posPosition = new ROSLIB.Message({ x: 674.0, y: 363, z: 0 })
    rosR2Position.publish(posPosition)
    // if (timeInterval != null) {
    //     clearInterval(timeInterval);
    //     totalSeconds = 0;
    // }
}

function start() {
    rosCommandMessage = new ROSLIB.Message({ data: 'START' })
    rosCommand.publish(rosCommandMessage)
    // timeInterval = setInterval(setTime, 1000);
}

function retry() {
    rosCommandMessage = new ROSLIB.Message({ data: 'RETRY' })
    rosCommand.publish(rosCommandMessage)
}
