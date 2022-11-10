import judge
import os
import shutil
import random
import string

def test(file="main.cpp"):
    judge.compile(file)
    tests=os.listdir("tests")

    total_time=0
    total_score=0
    score=100/len(tests)

    for i in range(len(tests)):
        values=judge.judge(i+1).split("|")
        result=values[0]
        time=values[1]
        st_score=0.0
        if result=="PASS":
            total_score+=score
            st_score=score
        print("#"+str(i+1)+": "+str(result)+" ["+str("{:.2f}".format(st_score))+"/"+str("{:.2f}".format(score))+"] ("+str(round(float(time)*1000))+"ms)")
        total_time+=round(float(time)*1000)

    total_score="{:.2f}".format(total_score)
    print("Score: "+str(total_score)+"/100.00")
    print("Time: "+str(int(total_time))+"ms")
    os.remove("files/c++")

def addTestCase():
    tests=os.listdir("tests")
    i=input("INPUT: ")
    o=input("OUTPUT: ")
    path="tests/"+str(len(tests)+1)
    os.mkdir(path)
    with open(path+"/i.txt","w") as f:
        f.write(i)
    with open(path+"/o.txt","w") as f:
        f.write(o)
    f.close()
    print("Successfully added the test case.")

def removeTestCases():
    text=str(''.join(random.choice(string.ascii_letters) for i in range(10)))
    warning=input("Are you sure you want to continue? THIS ACTION CANNOT BE UNDONE. (Y/N)\n> ")
    if warning=="Y":
        confirm=input("Type the following text to confirm: "+text+"\n> ")
        if confirm==text:
            tests=os.listdir("tests")
            for i in range(len(tests)):
                path="tests/"+str(i+1)
                shutil.rmtree(path)
            print("Removed all test cases.")
        else:
            print("Incorrect text.")
    else:
        print("Cancelled.")

print("1. Run test cases")
print("2. Add a test case")
print("3. Delete all test cases (THIS CANNOT BE UNDONE)")
option=input("> ")
if option=="1":
    test()
elif option=="2":
    addTestCase()
elif option=="3":
    removeTestCases()
else:
    print("The option does not exist!")