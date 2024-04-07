import os
import subprocess
import time
import json
import psutil

def compile_code(language, code_file):
    try:
        if language == "c":
            subprocess.run(["gcc", code_file, "-o", "grader/executable", "-std=c11", "-O2", "-lm", "-static"], check = True, stderr = subprocess.PIPE)
        elif language == "cpp":
            subprocess.run(["g++", code_file, "-o", "grader/executable", "-std=c++14", "-O2", "-lm", "-static"], check = True, stderr = subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"Compilation error:\n{e.stderr}")
        return False
    return True

def run_code(code_file, input_file, time_limit, memory_limit, language):
    start_time = time.time()
    memory_usage = 0
    
    if language == "py":
        process = subprocess.Popen(["python3", code_file], stdin=input_file, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text = True)
    else:
        process = subprocess.Popen(["grader/executable"], stdin=input_file, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text = True)

    try:
        while process.poll() is None:
            memory_usage = max(memory_usage, psutil.Process(process.pid).memory_info().rss / 1000)

            if memory_usage > memory_limit * 1000:
                process.terminate()
                return "", "Memory Limit Exceeded", round((time.time() - start_time) * 1000), memory_usage
            
            if (time.time() - start_time) > time_limit:
                process.terminate()
                return "", "Time Limit Exceeded", round((time.time() - start_time) * 1000), memory_usage
            
        stdout, stderr = process.communicate(timeout=time_limit)
        execution_time = round((time.time() - start_time) * 1000)

        if process.returncode != 0:
            return "", "Runtime Error", execution_time, memory_usage

        return stdout, stderr, execution_time, memory_usage
    except subprocess.TimeoutExpired:
        process.terminate()
        return "", "Time Limit Exceeded", execution_time, memory_usage
    except Exception as e:
        process.terminate()
        return "", "Runtime Error", round((time.time() - start_time) * 1000), memory_usage
        
    
def normalize_output(output):
    lines = output.split('\n')
    normalized_lines = [line.rstrip() for line in lines]
    return '\n'.join(normalized_lines)

def grade_submission(submission_info):
    result = ""
    total_time = 0
    max_memory = 0
    total_P = 0
    isCompiled = True

    problem = submission_info["file"].split(".")[0]
    testcases_path = os.getcwd() + f"/grader/testcases/{problem.replace('P-', '')}"

    config_file = open(f"{os.getcwd()}/public/problem/{problem}.json")
    config = json.load(config_file)

    language = submission_info["language"]
    if language == "py":
        code_file = os.path.join(submission_info["path"], submission_info["file"])
    else:
        if not compile_code(language, os.path.join(submission_info["path"], submission_info["file"])):
            result = "Compilation error"
            isCompiled = False
        code_file = "grader/executable"

    for i in range(int(len(os.listdir(testcases_path))/2)):
        if not isCompiled: break

        input_path = os.path.join(testcases_path, f"{i+1}.in")
        expected_output_path = os.path.join(testcases_path, f"{i+1}.out")

        with open(input_path, "r") as input_file, open(expected_output_path, "r") as expected_output_file:
            output, error, execution_time, memory_usage = run_code(code_file, input_file, config["time_limit"], config["memory_limit"], language)

            total_time += execution_time
            max_memory = max(max_memory, memory_usage)
            expected_output = normalize_output(expected_output_file.read())

            if error == "Time Limit Exceeded":
                result += "T"
                continue
            
            if error == "Memory Limit Exceeded":
                result += "X"
                continue
            
            if error == "Runtime Error":
                result += "X"
                continue

            if normalize_output(output).strip() == expected_output.strip():
                result += "P"
                total_P += 1
            else:
                result += "-"

    if os.path.isfile("grader/executable"):
        os.remove("grader/executable")

    result_data = {
        "score": total_P / (int(len(os.listdir(testcases_path)))/2),
        "verdict": result,
        "time": total_time,
        "submission": submission_info["path"].split("/")[-1],
        "max_memory": max_memory,
    }

    return result_data

def main():
    folder = os.getcwd() + "/grader/submission"

    for submission_folder in os.listdir(folder):
        submission_path = os.path.join(folder, submission_folder)

        if os.path.isdir(submission_path):
            submission_file = None
            language = None

            for file in os.listdir(submission_path):
                if file.endswith(".c") or file.endswith(".cpp") or file.endswith(".py"):
                    submission_file = file
                    language = file.split('.')[-1]
                    break

            if submission_file:
                print(f"Grading {submission_folder}'s solution...")

                submission_info = {
                    "path": submission_path,
                    "file": submission_file,
                    "language": language
                }

                result_data = grade_submission(submission_info)
                result_json = json.dumps(result_data)

                with open(f"{submission_info['path']}/result.json", "w") as file:
                    file.write(result_json)

if __name__ == "__main__":
    main()