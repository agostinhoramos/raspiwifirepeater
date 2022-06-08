#!/usr/bin/python3
import threading, time, json, sys, os

from dotenv import dotenv_values
_env = dotenv_values(".env.local")
sys.path.append( _env["ROOT_PATH"] )

from raspiwifirepeater.frontend import index as frontend
from raspiwifirepeater.backend import index as backend

def main():
    _ = "DEV"
    if _env["PROD_MOD"] == '1':
        _ = "PRD"

    if os.geteuid() == 0:
        print("Running as ROOT :)")

    ## RUN ALL THREADS ##
    func_threads = [
        [frontend.init, ([_])],
        [backend.init, ([_])],
    ]

    threads = []
    for fn in func_threads:
        th = threading.Thread(target=fn[0], args=fn[1], )
        th.start()
        threads.append(th)
    for thread in threads:
        thread.join()

if __name__ == "__main__":
    msg = """
    Starting website http://{}/
    Using API http://{}:{}/api
    """.format(_env["ROOT_HOST"], _env["ROOT_HOST"], _env["SERVER_BACKEND_PORT"])
    print(msg)
    main()