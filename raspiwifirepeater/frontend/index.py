#!/usr/bin/python3
import sys, os

from dotenv import dotenv_values
_env = dotenv_values(".env.local")
sys.path.append( _env["ROOT_PATH"] )

def init(_arg):
    if _arg == 'PRD':
        os.system('npm run --prefix raspiwifirepeater/frontend/ build')
        os.system('npm --prefix raspiwifirepeater/frontend/ start')
    if _arg == 'DEV':
        os.system('npm --prefix raspiwifirepeater/frontend/ start')
        