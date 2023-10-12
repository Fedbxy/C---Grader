import subprocess
from subprocess import PIPE
from time import time

def compile(fileName):
    c = subprocess.run(["g++","-std=c++11","-O2","-Wall","./files/"+fileName,"-o","./files/c++"], capture_output = True)
    if c.returncode==0:
        return True
    else:
        return False

def judge(no, maxTime = 1):
    p = subprocess.Popen(["files/c++"], stdout = PIPE, stdin = PIPE, stderr = PIPE)

    f = open("tests/"+str(no)+"/i.txt", "r")
    input = f.read()
    f.close()

    value = input + "\n"
    value = bytes(value, "UTF-8")
    startedTime = time()
    try:
        outs, err = p.communicate(input = value, timeout = maxTime)
    except:
        p.terminate()
        outs,err = p.communicate()
        err = "Time limit exceeded"
    deltaTime = time() - startedTime
    result = outs

    f = open("tests/"+str(no)+"/o.txt", "r")
    output = f.read() + "\n"
    output = bytes(output, "UTF-8")
    f.close()

    if result.strip() == output.strip():
        return "PASS" + "|" + str(deltaTime)
    else:
        if err:
            return str(err) + "|" + str(deltaTime)
        return "FAILED" + "|" + str(deltaTime)