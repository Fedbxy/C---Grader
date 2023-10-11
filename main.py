import judge
import os
import shutil
import random
import string

def test(file = "main.cpp"):
    if judge.compile(file):
        judge.judge(1)
        tests = os.listdir("tests")
        total_time = 0
        total_score = 0
        score = 100/len(tests)
        details = []
        results = []

        for i in range(len(tests)):
            values = judge.judge(i+1).split("|")
            result = values[0]
            time = values[1]
            st_score = 0.0
            if result == "PASS":
                total_score += score
                st_score = score
                results.append("P")
            elif result == "FAILED":
                results.append("-")
            elif result == "Time limit exceeded":
                results.append("T")
            else:
                results.append("X")
            details.append("#"+str(i+1)+": "+str(result)+" ["+str("{:.2f}".format(st_score))+"/"+str("{:.2f}".format(score))+"] ("+str(round(float(time)*1000))+"ms)")
            total_time += round(float(time)*1000)
        os.remove("files/c++")
        print()
        print("\n".join(details))
        print("\n===RESULT===")
        print("".join(results))
        total_score="{:.2f}".format(total_score)
        print("Score: "+str(total_score)+"/100.00")
        print("Time: "+str(int(total_time))+"ms\n===RESULT===\n")
    else:
        print("Compilation error.\n")
    main()

def addTestCase():
    tests = os.listdir("tests")
    i = input("INPUT: ")
    o = input("OUTPUT: ")
    path = "tests/"+str(len(tests)+1)
    os.mkdir(path)
    with open(path+"/i.txt","w") as f:
        f.write(i)
    with open(path+"/o.txt","w") as f:
        f.write(o)
    f.close()
    print("Successfully added the test case.\n")
    main()

def removeTestCases():
    warning = input("Are you sure you want to continue? THIS ACTION CANNOT BE UNDONE. (Y/N)\n> ")
    if warning == "Y":
        text = str(''.join(random.choice(string.ascii_letters) for i in range(10)))
        confirm = input("Type the following text to confirm: "+text+"\n> ")
        if confirm == text:
            tests = os.listdir("tests")
            for i in range(len(tests)):
                path = "tests/"+str(i+1)
                shutil.rmtree(path)
            print("Removed all test cases.")
        else:
            print("Incorrect text.")
    else:
        print("Cancelled.")
    main()

def main():
    print("1. Run test cases")
    print("2. Add a test case")
    print("3. Delete all test cases (THIS CANNOT BE UNDONE)")
    print("4. Exit")
    option = input("> ")
    print()
    if option == "1":
        fileName = input("File name (default: main.cpp): ")
        if not fileName:
            test()
        else:
            test(fileName)
    elif option == "2":
        addTestCase()
    elif option == "3":
        removeTestCases()
    elif option == "4":
        exit()
    else:
        print("The option does not exist!")

main()