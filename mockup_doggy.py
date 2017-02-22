from __future__ import division

import numpy
import time
import json

from collections import deque
from threading import Timer
from random import random

from tornado.ioloop import IOLoop
from tornado.web import Application
from tornado.websocket import WebSocketHandler


class RepeatedTimer(object):
    def __init__(self, interval, function, *args, **kwargs):
        self._timer = None
        self.interval = interval
        self.function = function
        self.args = args
        self.kwargs = kwargs
        self.is_running = False
        self.start()

    def _run(self):
        self.is_running = False
        self.function(*self.args, **self.kwargs)
        self.start()

    def start(self):
        if not self.is_running:
            self._timer = Timer(self.interval, self._run)
            self._timer.start()
            self.is_running = True

    def stop(self):
        self._timer.cancel()
        self.is_running = False


class WsSocketHandler(WebSocketHandler):
    time_step = 1 / 30

    def __init__(self, application, request, **kwargs):
        WebSocketHandler.__init__(self, application, request, **kwargs)
        self.timestamps = deque([], 100)

    def check_origin(self, origin):
        return True

    def open(self):
        print('WebSocket connection open.')

        self.rt = RepeatedTimer(self.time_step, self.publish_robot_state)
        self.logger = RepeatedTimer(1.0, self.log)

    def on_close(self):
        print('WebSocket connection closed: {0}'.format(self.close_reason))
        self.rt.stop()
        self.logger.stop()

    def on_message(self, message):
        self.timestamps.append(time.time())
        data = json.loads(message)

        if self.verbose:
            print('{}: Received {}'.format(time.time(), data))

    def publish_robot_state(self):
        state = {
            'imu': {
                'acc': {'x': random(), 'y': random() * 2, 'z': random() * 3},
                'gyro': [random() * 4, random() * 5, random() * 6],
            },
            'distance': {
                'front': random(),
                'left': random(),
                'right': random(),
            }
        }
        self.write_message(json.dumps(state))

        if self.verbose:
            print('{}: Sent {}'.format(time.time(), state))

    def log(self):
        if len(self.timestamps) < 2:
            return

        dt = numpy.diff(self.timestamps) * 1000
        print('Average time between messages: {}ms (STD={})'.format(numpy.mean(dt), numpy.std(dt)))


class WsRobotServer(object):
    def __init__(self, port, verbose):
        self.port = port

        WsSocketHandler.verbose = verbose

    def run(self):
        loop = IOLoop()
        app = Application([
            (r'/', WsSocketHandler)
        ])
        app.listen(self.port)
        loop.start()


if __name__ == '__main__':
    ws = WsRobotServer(port=9009, verbose=False)
    ws.run()
