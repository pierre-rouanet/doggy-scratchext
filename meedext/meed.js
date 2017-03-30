/*eslint no-unused-vars: ["error", { "argsIgnorePattern": "^_" }]*/

import * as walkAnim from './walk'

export default function createMeed() {
  const possibleStatus = {
    CONNECTED: 1,
    CONNECTING: 2,
    DISCONNECTING: 3,
    NOT_CONNECTED: 4,
  }

  let state = {}
  let status = possibleStatus.NOT_CONNECTED

  // Motion

  let setMotorPosition = (leg, motor, position) => {
    send({
      [leg]: {
        [motor]: {
          target_position: position
        }
      }
    })
  }

  let moveLeg = (leg, x, y) => {
    send({
      [leg]: {
        x,
        y
      }
    })
  }

  let walk = (steps, direction) => {
    return new Promise((resolve, _reject) => {

      let i = 0

      let _walk = () => {
        let j = (direction === 'forward' ?
                 i :
                 walkAnim.stepLength - i - 1)

        let cmd = {}
        for (let legName in walkAnim.traj) {
          const leg = walkAnim.traj[legName]

          cmd[legName] = {
            front: {
              target_position: leg.front[j]
            },
            back: {
              target_position: leg.back[j]
            }
          }
        }
        send(cmd)

        i++
        if (i >= walkAnim.stepLength) {
          i = 0
          steps--

          if (steps <= 0) {
            resolve()
            return
          }
        }
        setTimeout(_walk, walkAnim.speed.normal)
      }
      _walk()
    })
  }

  let turn = (steps, direction) => {
    return new Promise((resolve, _reject) => {
      // TODO:
      console.log('Should turn', steps, 'steps to the', direction)
      setTimeout(resolve, steps * 1000)
    })
  }

  // LEDs

  let setLedColor = (led, color) => {
    const colorTable = {
      black: {r: 0, g: 0, b: 0},
      red: {r: 255, g: 0, b: 0},
      blue: {r: 0, g: 0, b: 255},
      green: {r: 0, g: 255, b: 0},
      yellow: {r: 255, g: 255, b: 0},
      purple: {r: 255, g: 0, b: 255},
      cyan: {r: 0, g: 255, b: 255},
      white: {r: 255, g: 255, b: 255}
    }

    send({
      [led]: colorTable[color]
    })
  }

  // WS IO
  let ws = null

  let heartbeatId = null
  const heartbeatTimeout = 1000

  let wsTimeoutId = null
  const wsTimeout = 500

  let connect = (host, port) => {
    if (ws) {
      console.error('Socket already opened.')
      return false
    }

    status = possibleStatus.CONNECTING

    const url = 'ws://' + host + ':' + port
    ws = new WebSocket(url)

    ws.onopen = () => {
      status = possibleStatus.CONNECTED

      send({
        refresh_ms: 30
      })
    }

    ws.onmessage = (e) => {
      if (typeof e.data == 'string') {
        try {
          const data = JSON.parse(e.data)
          state = data
        } catch(e) {
          console.error('Could not parse data ' + e.data)
        }
      }
      else {
        console.error('Binary data received not handled!')
      }

      // Setup a timer, so if we don't received anything
      // for a long time, we know we are probably disconnected
      if (heartbeatId) {
        clearTimeout(heartbeatId)
        heartbeatId = null
      }
      heartbeatId = setTimeout(meed.disconnect, heartbeatTimeout)
    }

    ws.onclose = () => {
      if (wsTimeoutId) {
        clearTimeout(wsTimeoutId)
        wsTimeoutId = null
      }

      ws = null
      status = possibleStatus.NOT_CONNECTED
    }

    return ws
  }

  let disconnect = () => {
    if (ws == null) {
      console.error('Socket already closed.')
      return false
    }

    if (ws.readyState === ws.OPEN ||
        ws.readyState === ws.CONNECTING) {

      status = possibleStatus.DISCONNECTING
      ws.close()

      if (wsTimeoutId) {
        console.error('This should not have happened...')
      }
      // We force close the ws if the other side does not respond
      wsTimeoutId = setTimeout(() => {
        if (ws != null) {
          ws.onclose()
        }
      }, wsTimeout)
    }
  }

  let send = (data) => {
    console.log(data)
    ws.send(JSON.stringify(data))
  }

  let meed = Object.assign({},
    {
      setMotorPosition,
      moveLeg,

      walk,
      turn,

      setLedColor,

      connect,
      disconnect,
      send,
    },
    possibleStatus
  )

  return Object.defineProperties(meed,
    {
      state: {
        get: () => state
      },
      status: {
        get: () => status
      }
    }
  )
}
