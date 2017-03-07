#!/usr/bin/env python

import time
import asyncio
import websockets

in_host = 'localhost'
out_host = '192.168.0.26'
port = 9009


async def sniff(in_ws, path):
    out_url = 'ws://{}:{}'.format(out_host, port)

    async with websockets.connect(out_url) as out_ws:
        while True:
            msg = await in_ws.recv()
            print('{}:{}'.format(time.time(), msg))
            await out_ws.send(msg)


start_server = websockets.serve(sniff, in_host, port)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
