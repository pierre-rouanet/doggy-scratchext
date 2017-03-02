(function (ext) {
    const wsHost = 'minidoggy.local';
    const wsPort = 9009;

    let ws = null;
    let robotState = {};

    let heartbeatTimestamp = null;
    const heartbeatTimeout = 1000; // in ms

    const startSocket = function(url) {
      if (ws) {
        console.log(`Socket already opened.`);
        return false;
      }

      ws = new WebSocket(url);

      ws.onmessage = function(e) {
        if (typeof e.data == 'string') {
            try {
                const data = JSON.parse(e.data);
                robotState = data;
            } catch(e) {
                console.error('Could not parse data ' + e.data);
            };
        }
        else {
            console.error('Binary data received not handled!');
        };
        const date = new Date();
        heartbeatTimestamp = date.getTime();
      }

      ws.onclose = function() {
        ws = null;
      }

      return ws;
  };

    ext._stop = function() {
        ext.stopAllMotors();
    };

    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
        ext.stopAllMotors();
        ws.close();
    };

    ext._getStatus = function() {
        const date = new Date();
        const t = date.getTime();

        const alive = (t - heartbeatTimestamp) < heartbeatTimeout;

        if (ws == null || ws.readyState === ws.CLOSED) {
            const url = 'ws://' + wsHost + ':' + wsPort;
            ws = startSocket(url);

            console.log('Connecting to ' + url);

            return { status: 0, msg: 'Not connected' };

        } else if (ws.readyState === ws.CONNECTING) {
            return { status: 1, msg: 'Connecting' };

        } else if (ws.readyState === ws.CLOSING) {
            return { status: 1, msg: 'Disconnecting' };

        } else if (!alive) {
            return { status: 1, msg: 'Lost connection...' };

        } else if (ws.readyState === ws.OPEN) {
            return { status: 2, msg: 'Ready' };

        };
    };

    // Motion commands

    ext.moveLeg = function(leg, x, y) {
        leg = leg + ' leg';

        const cmd = {
            [leg]: {
                x: x,
                y: y,
            }
        };
        ws.send(JSON.stringify(cmd));
    };

    ext.setMotorPos = function(motor, position) {
        const cmd = {
            [motor]: {
                'target position': position
            }
        };

        ws.send(JSON.stringify(cmd));
    };

    ext.moveForward = function(length, duration, callback) {
        // TODO:
        console.log('Should move ' + length + ' cm forward somehow!')

        window.setTimeout(function() {
            callback();
        }, duration * 1000);
    }

    ext.turn = function(angle) {
        // TODO:
        console.log('Should turn of ' + angle + ' degrees!');
    }

    ext.stopAllMotors = function() {
        // TODO:
        console.log('Should stop all motions!');
    }

    // Reporters

    ext.felt = function() {
        return robotState['imu']['acc']['x'] > 0.95
    };

    ext.getImuAcc = function(axis) {
        return robotState['imu']['acc'][axis];
    };

    ext.getDistance = function(loc) {
        return robotState['distance'][loc];
    }

    // Hat

    ext.whenFall = function() {
        return ext.felt();
    };

    ext.whenTilt = function(lessMore, tilt) {
        const angle = ext.getImuAcc('y');

        if (lessMore == '<') {
            return angle < tilt;
        }
        else {
            return angle > tilt;
        }
    }

    ext.whenObstacle = function(loc, lessMore, dist) {
        const d = ext.getDistance(loc);

        if (lessMore == '<') {
            return d < dist;
        }
        else {
            return d > dist;
        };
    };

    // Debug

    ext.connectToHost = function(host) {
        if (ws != null) {
            ws.close();
        }
        wsHost = host;
    }

    ext.debugLog = function() {
        console.log(robotState);
    }

    // Block and block menu descriptions
    let descriptor = {
        blocks: [
            // Block type, block name, function name

            // Motion commands
            [' ', 'move %m.legs to x: %n y: %n', 'moveLeg', 'front left', 0, 0],
            ['w', 'move %n cm in %n sec', 'moveForward', 10, 1],
            [' ', 'turn %n degrees', 'turn', 90],
            [' ', 'stop', 'stop'],

            // Reporters
            ['b', 'felt', 'felt'],
            ['r', 'imu acc %m.acc', 'getImuAcc', 'x'],
            ['r', 'distance to %m.distanceSensors', 'getDistance', 'front'],

            // Hat
            ['h', 'when doggy falls', 'whenFall'],
            ['h', 'when tilt %m.lessMore %n', 'whenTilt', '<', 0],
            ['h', 'when %m.distanceSensors distance %m.lessMore %n', 'whenObstacle', 'front', '<', 0.75],

            // Debug
            ['---'],
            [' ', 'set %m.motors position to %n', 'setMotorPos', 'm1', 0],
            [' ', 'log current state', 'debugLog'],
            [' ', 'connect to host %s', 'connectToHost'],

        ],
        menus: {
            legs: ['front left', 'front right', 'rear left', 'rear right'],
            motors: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8'],

            acc: ['x', 'y', 'z'],
            distanceSensors: ['front', 'left', 'right'],

            lessMore: ['<', '>'],
        },
        url: '',
    };

    // Register the extension
    ScratchExtensions.register('Doggy', descriptor, ext);
})({});
