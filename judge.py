import subprocess
from subprocess import PIPE
from time import time

def compile(fileName):
    subprocess.run(["g++","-std=c++11","-O2","-Wall","./files/"+fileName,"-o","./files/c++"])


def judge(no,maxTime=1):
    p=subprocess.Popen(["files/c++"],shell=True,stdout=PIPE,stdin=PIPE,stderr=PIPE)

    f=open("tests/"+str(no)+"/i.txt","r")
    input=f.read()
    f.close()

    value=input+"\n"
    value=bytes(value,"UTF-8")
    startedTime=time()
    try:
        outs,err=p.communicate(input=value,timeout=maxTime)
    except:
        p.terminate()
        outs,err=p.communicate()
        err="Time limit exceeded"
    deltaTime=time()-startedTime
    result=outs
    err=err.decode(encoding="UTF-8")

    f=open("tests/"+str(no)+"/o.txt","r")
    output=f.read()+"\n"
    output=bytes(output,"UTF-8")
    f.close()

    if result==output:
        return "PASS"+"|"+str(deltaTime)
    else:
        if err:
            return err+"|"+str(deltaTime)
        return "FAILED"+"|"+str(deltaTime)