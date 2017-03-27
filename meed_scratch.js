const walkTraj = JSON.parse('{"front_left_leg": {"front": [-101, -96, -91, -86, -81, -78, -76, -75, -74, -73, -72, -71, -69, -68, -65, -63, -60, -57, -55, -52, -48, -45, -42, -38, -35, -32, -29, -26, -23, -20, -17, -14, -11, -7, -3, 0, 3, 5, 5, 5, 3, 3, -1, -9, -22, -43, -64, -80, -95, -102], "back": [42, 38, 33, 30, 24, 21, 19, 17, 19, 20, 22, 24, 28, 31, 35, 40, 44, 48, 52, 55, 59, 62, 65, 68, 70, 73, 75, 77, 79, 81, 83, 84, 85, 87, 87, 89, 90, 93, 99, 105, 113, 120, 125, 128, 129, 122, 107, 88, 61, 44]}, "front_right_leg": {"front": [-66, -70, -72, -75, -78, -79, -81, -83, -84, -86, -86, -88, -89, -91, -95, -101, -110, -118, -125, -128, -129, -129, -117, -97, -75, -53, -43, -37, -32, -28, -23, -20, -18, -18, -19, -20, -22, -24, -27, -29, -32, -36, -39, -43, -46, -50, -54, -57, -61, -64], "back": [40, 36, 33, 29, 26, 23, 20, 18, 15, 12, 10, 6, 3, -1, -3, -3, -2, 0, 1, 5, 17, 32, 54, 75, 88, 98, 100, 97, 93, 87, 82, 78, 75, 74, 73, 73, 72, 71, 69, 67, 66, 64, 62, 59, 57, 54, 52, 49, 45, 42]}, "back_left_leg": {"front": [-75, -74, -73, -72, -70, -69, -67, -66, -63, -61, -59, -55, -52, -48, -44, -40, -36, -32, -28, -24, -20, -17, -13, -9, -6, -2, 0, 1, 0, -3, -5, -6, -12, -27, -47, -67, -84, -92, -96, -94, -88, -83, -79, -77, -76, -76, -77, -76, -76, -76], "back": [23, 26, 30, 34, 37, 40, 43, 45, 49, 52, 55, 59, 62, 66, 69, 72, 74, 77, 79, 80, 81, 82, 83, 84, 84, 85, 87, 92, 98, 105, 113, 118, 122, 118, 109, 91, 68, 49, 33, 25, 19, 13, 10, 8, 9, 11, 12, 15, 18, 20]}, "back_right_leg": {"front": [-83, -86, -90, -95, -104, -111, -118, -123, -122, -119, -107, -84, -60, -38, -25, -18, -12, -8, -6, -7, -8, -10, -13, -16, -19, -22, -25, -29, -33, -37, -41, -45, -49, -54, -58, -62, -65, -68, -71, -73, -76, -78, -79, -81, -82, -83, -83, -83, -84, -84], "back": [1, -2, -3, -3, -1, 3, 6, 10, 19, 32, 52, 72, 86, 95, 95, 90, 84, 79, 77, 77, 77, 77, 77, 77, 76, 75, 75, 73, 72, 71, 68, 66, 64, 60, 57, 54, 50, 47, 43, 40, 36, 32, 28, 24, 21, 17, 13, 10, 6, 3]}}')

const stepLength = walkTraj.front_left_leg.front.length

const walkSpeeds = {
    // Period (in ms) between each sample of the trajectory
    slow: 50,
    normal: 20,
    fast: 10,
}


let ext = function() {
    let wsHost = 'meed.local'
    const wsPort = 9009

    let ws = null
    let robotState = {}

    let heartbeatTimestamp = null
    const heartbeatTimeout = 1000 // in ms

    const startSocket = function(url) {
      if (ws) {
        console.log(`Socket already opened.`)
        return false
      }

      ws = new WebSocket(url)

      ws.onopen = function() {
          ext.send({
              refresh_ms: 30
          })
      }

      ws.onmessage = function(e) {
        if (typeof e.data == 'string') {
            try {
                const data = JSON.parse(e.data)
                robotState = data
            } catch(e) {
                console.error('Could not parse data ' + e.data)
            }
        }
        else {
            console.error('Binary data received not handled!')
        }
        const date = new Date()
        heartbeatTimestamp = date.getTime()
      }

      ws.onclose = function() {
        ws = null
      }

      return ws
  }

    ext._stop = function() {
        ext.stopAllMotors()
    }

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        ext.stopAllMotors()
        ws.close()
    }

    ext._getStatus = function() {
        const date = new Date()
        const t = date.getTime()

        const alive = (t - heartbeatTimestamp) < heartbeatTimeout

        if (ws == null || ws.readyState === ws.CLOSED) {
            const url = 'ws://' + wsHost + ':' + wsPort
            ws = startSocket(url)

            console.log('Connecting to ' + url)

            return { status: 0, msg: 'Not connected' }

        } else if (ws.readyState === ws.CONNECTING) {
            return { status: 1, msg: 'Connecting' }

        } else if (ws.readyState === ws.CLOSING) {
            return { status: 1, msg: 'Disconnecting' }

        } else if (!alive) {
            return { status: 1, msg: 'Lost connection...' }

        } else if (ws.readyState === ws.OPEN) {
            return { status: 2, msg: 'Ready' }

        }
    }

    // Motion commands

    ext.moveLeg = function(leg, x, y) {
        // The params x, y are exepected to be in the range [-1, 1]
        // They are mapped to the cartesian coordinates
        // of the end effector of the leg (in mm)
        // x € [-30, 30]
        // y € [15, 60]

        leg = leg + '_leg'

        // Make sure x, y belong to [-1, 1]
        x = (x <= -1) ? -1 : ((x >= 1) ? 1 : x)
        y = (y <= -1) ? -1 : ((y >= 1) ? 1 : y)

        // Inverse axis to match Scratch one
        x = -x
        y = -y

        // Map the values to their cartesian coordinates
        x = 30 * x
        y = 37.5 + y * 22.5

        const cmd = {
            [leg]: {
                x: x,
                y: y
            }
        }
        ext.send(cmd)
    }

    ext.setMotorPos = function(motor, leg, position) {
        leg = leg + '_leg'

        const cmd = {
            [leg]: {
                [motor]: {
                    target_position: position
                }
            }
        }

        ext.send(cmd)
    }

    ext.walk = function(steps, direction, callback) {
        let i = 0

        let _walk = () => {
            let j = direction === 'forward' ? i : stepLength - i - 1

            cmd = {};
            for (legName in walkTraj) {
                const leg = walkTraj[legName]

                cmd[legName] = {
                    front: {
                        target_position: leg['front'][j]
                    },
                    back: {
                        target_position: leg['back'][j]
                    }
                }
            }
            ext.send(cmd)
            console.log('Walk', direction)

            i++
            if (i >= stepLength) {
                i = 0
                steps--

                if (steps <= 0) {
                    callback()
                    return
                }
            }
            setTimeout(_walk, walkSpeeds.normal)
        }
        _walk()
    }

    ext.turn = function(angle) {
        // TODO:
        console.log('Should turn of ' + angle + ' degrees!')
    }

    ext.stopAllMotors = function() {
        console.log('Should stop all motions!')
    }

    // Reporters

    ext.felt = function() {
        return robotState.imu.acc.x > 0.95
    }

    ext.getImuAcc = function(axis) {
        return robotState.imu.acc.axis
    }

    ext.getDistance = function(loc) {
        return robotState.distance[loc]
    }

    // Hat

    ext.whenFall = function() {
        return ext.felt()
    }

    ext.whenTilt = function(lessMore, tilt) {
        const angle = ext.getImuAcc('y')

        if (lessMore == '<') {
            return angle < tilt
        }
        else {
            return angle > tilt
        }
    }

    ext.whenObstacle = function(loc, lessMore, dist) {
        const d = ext.getDistance(loc)

        if (lessMore == '<') {
            return d < dist
        }
        else {
            return d > dist
        }
    }

    // Debug

    ext.send = function(cmd) {
        console.log(cmd)
        ws.send(JSON.stringify(cmd))
    }

    ext.connectToHost = function(host) {
        if (ws != null) {
            ws.close()
        }
        wsHost = host
    }

    ext.debugLog = function() {
        console.log(robotState)
    }

    // Block and block menu descriptions
    let descriptor = {
        blocks: [
            // Block type, block name, function name

            // Walk
            ['w', 'marcher %n pas vers %m.dir', 'walk', 1, "l\'avant"],
            ['w', 'turn %m.leftOrRight', 'turn', 'left'],
            ['w', 'turn @turnLeft %n degrees', 'turn', 90],
            ['--'],

            // Motion commands
            [' ', 'move %m.legs leg to x: %n y: %n', 'moveLeg', 'front_left', 0, 0],

            // Reporters
            ['b', 'felt', 'felt'],
            ['r', 'imu acc %m.acc', 'getImuAcc', 'x'],
            ['r', 'distance to %m.distanceSensors', 'getDistance', 'front'],

            // Hat
            ['h', 'when meed falls', 'whenFall'],
            ['h', 'when tilt %m.lessMore %n', 'whenTilt', '<', 0],
            ['h', 'when %m.distanceSensors distance %m.lessMore %n', 'whenObstacle', 'front', '<', 0.75],

            // Debug
            ['---'],
            [' ', 'set %m.motors motor of the %m.legs  leg to position %n', 'setMotorPos', 'front', 'front_left', 0],
            [' ', 'log current state', 'debugLog'],
            [' ', 'connect to host %s', 'connectToHost'],

        ],
        menus: {
            legs: ['front_left', 'front_right',
                   'back_left', 'back_right'],
            motors: ['front', 'back'],

            dir: ['forward', 'backward'],
            speed: ['slow', 'normal', 'fast'],
            leftOrRight: ['left', 'right'],

            acc: ['x', 'y', 'z'],
            distanceSensors: ['front', 'left', 'right'],

            lessMore: ['<', '>'],
        },
        url: '',
    }

    // Register the extension
    ScratchExtensions.register('Meed', descriptor, ext)
}

ext({})
