/* global ScratchExtensions */

import createMeed from './meed'

import getLangKey from './lang/common.js'
import lang from './lang/fr.js'


let ext = function() {
  let host = '127.0.0.1'
  let port = 9009

  let meed = createMeed()

  ext._stop = function() {
    console.log('Should stop all motions.')
  }

  ext._shutdown = function() {
    meed.disconnect()
  }

  ext._getStatus = function() {
    if (meed.status == meed.CONNECTED) {
      if (meed.recentlyUpdated) {
        return { status: 2, msg: lang.status.ready }
      } else {
        // Forcing a disconnect should then trigger a
        // re-connection when the status is switched
        // to NOT_CONNECTED
        meed.disconnect()

        return { status: 1, msg: lang.status.lostConnection }
      }

    } else if (meed.status == meed.CONNECTING) {
      return { status: 1, msg: lang.status.connecting }

    } else if (meed.status == meed.NOT_CONNECTED){
      meed.connect(host, port)

      return { status: 0, msg: lang.status.notConnected }
    }
  }

  // Motion blocks

  ext.moveLeg = (leg, x, y) => {
    // The params x, y are exepected to be in the range [-1, 1]
    // They are mapped to the cartesian coordinates
    // of the end effector of the leg (in mm)
    // x € [-30, 30]
    // y € [15, 60]

    // Make sure x, y belong to [-1, 1]
    x = (x <= -1) ? -1 : ((x >= 1) ? 1 : x)
    y = (y <= -1) ? -1 : ((y >= 1) ? 1 : y)

    // Inverse axis to match Scratch one
    x = -x
    y = -y

    // Map the values to their cartesian coordinates
    x = 30 * x
    y = 37.5 + y * 22.5

    leg = getLangKey(lang.leg, leg) + '_leg'
    meed.moveLeg(leg, x, y)
  }

  ext.walk = (steps, direction, callback) => {
    direction = getLangKey(lang.direction, direction)
    meed.walk(steps, direction).then(callback)
  }

  ext.turn = (steps, side, callback) => {
    side = getLangKey(lang.side, side)
    meed.turn(steps, side).then(callback)
  }

  // LEDs

  ext.setColor = (led, color) => {
    led = getLangKey(lang.led, led)
    color = getLangKey(lang.color, color)
    meed.setLedColor(led, color)
  }
  }

  // Sensor

  ext.getDist = (sensor) => meed.state.distance[getLangKey(lang.distance, sensor)]

  // Debug block

  ext.setMotorPos = (motor, leg, position) => {
    motor = getLangKey(lang.motor, motor)
    leg = getLangKey(lang.leg, leg) + '_leg'

    meed.setMotorPosition(leg, motor, position)
  }

  ext.connectToHost = (_host) => {
    host = _host

    // Forcing the disconnection will automatically
    // triggers an attempt to re-connect to the new host
    meed.disconnect()
  }

  ext.getState = () => {
    console.log(meed.state)
  }

  let descriptor = {
    blocks: [
      // Walk
      ['w', lang.block.walk, 'walk', 1, lang.direction.forward ],
      ['w', lang.block.turn, 'turn', 1, lang.side.left],
      ['-'],

      // Motion
      [' ', lang.block.leg, 'moveLeg', lang.leg.front_left, 0, 0],
      ['-'],

      // LED
      [' ', lang.block.ledColor, 'setColor', lang.led.led_0, lang.color.red],

      // Sensing
      ['r', lang.block.distance, 'getDist', lang.distance.front],

      // Debug
      ['--'],
      [' ', lang.block.setMotor, 'setMotorPos', lang.motor.front, lang.leg.front_left, 0],
      [' ', lang.block.connect, 'connectToHost'],
      [' ', lang.block.state, 'getState'],
    ],
    menus: {
      dir: Object.values(lang.direction),
      side: Object.values(lang.side),
      leg: Object.values(lang.leg),
      color: Object.values(lang.color),
      distance: Object.values(lang.distance),
      motor: Object.values(lang.motor),
      led: Object.values(lang.led),
    },
    url: '',
  }

  // Register the extension
  ScratchExtensions.register('Meed', descriptor, ext)
}

ext({})
