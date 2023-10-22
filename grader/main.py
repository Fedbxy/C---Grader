import os
import subprocess
import time
import resource
import json
from pathlib import Path

def compile_code(language, code_file):
    try:
        if language == "c":
            subprocess.run(["gcc", code_file, "-o", "grader/executable"], check = True, stderr = subprocess.PIPE)
        elif language == "cpp":
            subprocess.run(["g++", code_file, "-o", "grader/executable"], check = True, stderr = subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        print(f"Compilation error")
        return False
    return True

def run_code(code_file, input_file, timeout, memory_limit, language):
    start_time = time.time()
    memory_usage = 0
    
    if language == "py":
        process = subprocess.Popen(["python3", code_file], stdin=input_file, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text = True)
    else:
        process = subprocess.Popen(["grader/executable"], stdin=input_file, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text = True)

    try:
        stdout, stderr = process.communicate(timeout=timeout)
        execution_time = round((time.time() - start_time) * 1000)
        _, max_rss = resource.getrusage(resource.RUSAGE_CHILDREN)[:2]
        memory_usage = max_rss

        if memory_usage > memory_limit:
            process.terminate()
            return 1, "", "Memory Limit Exceeded", execution_time, memory_usage
        return process.returncode, stdout, stderr, execution_time, memory_usage
    except subprocess.TimeoutExpired:
        process.terminate()
        return 1, "", "Time Limit Exceeded", timeout*1000, memory_usage
    except subprocess.CalledProcessError as e:
        process.terminate()
        return 1, "", "Runtime Error", execution_time, memory_usage
    
def normalize_output(output):
    lines = output.split('\n')
    normalized_lines = [line.rstrip() for line in lines]
    return '\n'.join(normalized_lines)

def grade_submission(submission_info):
    result = ""
    total_time = 0
    total_mem = 0
    total_P = 0

    problem = submission_info["file"].split(".")[0]
    testcases_path = os.getcwd() + f"/grader/testcases/{problem.replace('P-', '')}"

    config_file = open(f"{os.getcwd()}/public/problem/{problem}.json")
    config = json.load(config_file)

    for i in range(int(len(os.listdir(testcases_path))/2)):
        input_path = os.path.join(testcases_path, f"{i+1}.in")
        expected_output_path = os.path.join(testcases_path, f"{i+1}.out")

        with open(input_path, "r") as input_file, open(expected_output_path, "r") as expected_output_file:
            language = submission_info["language"]
            if language == "py":
                code_file = os.path.join(submission_info["path"], submission_info["file"])
            else:
                if not compile_code(language, os.path.join(submission_info["path"], submission_info["file"])):
                    result = "Compilation error"
                    break
                code_file = "grader/executable"

            return_code, output, error, execution_time, memory_usage = run_code(code_file, input_file, config["time_limit"], config["memory_limit"], language)

            total_time += execution_time
            total_mem += memory_usage
            expected_output = normalize_output(expected_output_file.read())

            if normalize_output(output).strip() == expected_output.strip():
                result += "P"
                total_P += 1
            elif error == "Time Limit Exceeded":
                result += "T"
            elif error == "Memory Limit Exceeded":
                result += "X"
            elif error == "Runtime Error":
                result += "X"
            else:
                result += "-"

    if os.path.isfile("grader/executable"):
        os.remove("grader/executable")

    result_data = {
        "score": total_P / (int(len(os.listdir(testcases_path)))/2),
        "verdict": result,
        "time": total_time,
        "submission": submission_info["path"].split("/")[-1],
        "avgmem": total_mem * 1024 / int(len(os.listdir(testcases_path))/2),
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
                file_path = os.path.join(submission_path, file)
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
