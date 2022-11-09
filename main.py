import judge
import os
import shutil

def test(file="main.cpp"):
    judge.compile(file)

    tests=os.listdir("tests")

    total_time=0.0
    total_score=0.0
    score=100/len(tests)

    for i in range(len(tests)):
        values=judge.judge(i+1).split("|")
        result=values[0]
        time=values[1]
        print("#"+str(i+1)+": "+str(result)+" ("+str(int(float(time)*1000))+"ms)")
        if result=="PASS":
            total_score+=score
        total_time+=round(float(time)*1000)

    if total_score.is_integer():
        total_score=int(total_score)
    else:
        total_score="{:.2f}".format(total_score)
    print("Score: "+str(total_score)+"/100")
    print("Time: "+str(int(total_time))+"ms")

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
    warning=input("Are you sure you want to continue? THIS ACTION CANNOT BE UNDONE. (Y/N)\n> ")
    if warning=="Y":  
        tests=os.listdir("tests")
        for i in range(len(tests)):
            path="tests/"+str(i+1)
            shutil.rmtree(path)
        print("Removed all test cases.")
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