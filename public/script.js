async function submitCode() {
    const language = document.getElementById('language').value;
    const problem = document.getElementById('problem').value;
    const selection = document.getElementById('selection').value;

    var code;

    if (selection === 'code') {
        code = codeEditor.getValue();
        var fileExtension = language;
        sendToServer(code, language, problem, Date.now(), fileExtension);
    } else if (selection === 'file') {
        const fileInput = document.getElementById('file');

        if (fileInput.files.length != 1) {
            if (fileInput.files.length == 0) setResult('No file selected.', true);
            else setResult('Please upload only one file at a time.', true);
            return;
        }

        const file = fileInput.files[0];

        var allowedExtensions = ['.c', '.cpp', '.py'];
        var fileExtension = file.name.split('.').pop();

        if (allowedExtensions.indexOf('.' + fileExtension) === -1) {
            setResult('Invalid file type. Please upload a C, C++, or Python file.', true);
            return;
        }

        const reader = new FileReader();

        reader.onload = async function (event) {
            code = event.target.result;
            sendToServer(code, language, problem, Date.now(), fileExtension);
        };

        reader.readAsText(file);
    }
}

async function sendToServer(code, language, problem, submit_epoch, file_extention) {
    showLoading(true);
    disableSubmitBtn(true, 'Submitted');
    setResult('In queue.', false);
    document.getElementById('result').classList.remove("hidden");

    const response = await fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            problem,
            lang: language,
            submit_epoch,
            source: code,
            file_extention,
        }),
    });
  
    const result = await response.json();
  
    showLoading(false);
    disableSubmitBtn(false, 'Submit');

    if (result.error) {
        setResult(result.error, true);
        return;
    }

    const date = new Date(result.submission_date)
  
    var resultMessage = `
        Submission: <b>${result.submission}</b><br>
        Submission Date: <b>${date.toLocaleDateString('en-GB')} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</b><br>
        Problem: <b>${problem.replace(".pdf", "")}</b><br>
        Language: <b>${language}</b><br>
        <br>
        Score: <b>${Math.round(result.score * 100)}</b><br>
        Result: <b>${result.verdict}</b><br>
        Total time: <b>${result.time}</b>ms<br>
        Average Memory Usage: <b>${result.avgmem.toFixed(2)}</b>kB
    `;
    setResult(resultMessage, false);
}

function showLoading(bool) {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        if (bool) {
            loadingOverlay.style.display = 'block';
        } else {
            loadingOverlay.style.display = 'none';
        }
    } else {
        console.error("Loading overlay not found");
    }
}

function disableSubmitBtn(bool, newText) {
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = bool;

        if (newText) {
            submitBtn.innerText = newText;
        }

        if (bool) {
            submitBtn.classList.add('bg-gray-500', 'cursor-not-allowed');
            submitBtn.classList.remove('bg-blue-500', 'hover:bg-blue-700', 'cursor-pointer');
        } else {
            submitBtn.classList.remove('bg-gray-500', 'cursor-not-allowed');
            submitBtn.classList.add('bg-blue-500', 'hover:bg-blue-700', 'cursor-pointer');
        }
    } else {
        console.error("Submit button not found");
    }
}

function setResult(message, isError) {
    document.getElementById('result').innerHTML = message;
    if (isError) {
        document.getElementById('result').classList.add("text-red-500");
    } else {
        document.getElementById('result').classList.remove("text-red-500");
    }
}

function toggleInputType() {
    var selection = document.getElementById("selection");
    var codeEditor = document.getElementById("codeEditor");
    var fileUpload = document.getElementById("fileUpload");
    const fileInput = document.getElementById('file');
    const submitBtn = document.getElementById('submitBtn');

    if (selection.value === "code") {
        codeEditor.classList.remove("hidden");
        fileUpload.classList.add("hidden");
        disableSubmitBtn(false, 'Submit');
    } else if (selection.value === "file") {
        codeEditor.classList.add("hidden");
        fileUpload.classList.remove("hidden");
        if (fileInput && submitBtn) {
            if (fileInput.files.length) {
                disableSubmitBtn(false, 'Submit');
            } else {
                disableSubmitBtn(true, 'Submit');
            }
        }
    }
}

async function displayProblemSelection() {
    const problemSelect = document.getElementById('problem');
    if (!problemSelect) return;

    try {
        const response = await fetch('/problem');
        const problem = await response.json();

        problem.forEach(problem => {
            const option = document.createElement('option');
            option.value = `P-${problem.filename.replace('.json', '')}`;
            option.textContent = `P-${problem.filename.replace('.json', '')} ${problem.title}`;

            problemSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching problem:', error);
    }
}

function readProblem() {
    const selectedProblem = document.getElementById('problem').value;
    window.location.href = `/problem/${selectedProblem}`;
}

async function displayProblem() {
    try {
        const response = await fetch('/problem');
        const problem = await response.json();

        const problemList = document.getElementById('problemList');
        if (problemList) {
            problem.forEach(problem => {
                if(!problem.title.endsWith('.json')) {
                    const listItem = document.createElement('li');
                    listItem.classList.add('border', 'p-4', 'rounded-lg', 'shadow-md', 'hover:bg-gray-50');

                    // Problem title
                    const title = document.createElement('h3');
                    title.classList.add('text-lg', 'font-semibold');
                    title.textContent = `P-${problem.filename.replace('.json', '')}`;

                    // Problem name
                    const name = document.createElement('p');
                    name.classList.add('text-gray-600', 'mb-1');
                    name.textContent = problem.title;

                    // Time Limit
                    const timeLimit = document.createElement('p');
                    timeLimit.classList.add('text-xs', 'text-gray-500');
                    timeLimit.textContent = `Time Limit: ${problem.time_limit} second(s)`;

                    // Memory Limit
                    const memoryLimit = document.createElement('p');
                    memoryLimit.classList.add('text-xs', 'text-gray-500');
                    memoryLimit.textContent = `Memory Limit: ${problem.memory_limit} MB`;

                    // View details link
                    const detailsLink = document.createElement('a');
                    detailsLink.href = `/problem/P-${problem.filename.replace('.json', '')}.pdf`;
                    detailsLink.target = '_blank';
                    detailsLink.classList.add('block', 'mt-2', 'text-blue-500', 'hover:underline');
                    detailsLink.textContent = 'View Details';

                    listItem.appendChild(title);
                    listItem.appendChild(name);
                    listItem.appendChild(timeLimit);
                    listItem.appendChild(memoryLimit);
                    listItem.appendChild(detailsLink);

                    problemList.appendChild(listItem);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching problem:', error);
    }
}

function handleFileSelect() {
    const fileInput = document.getElementById('file');
    const submitBtn = document.getElementById('submitBtn');

    if (fileInput && submitBtn) {
        if (fileInput.files.length == 1) {
            disableSubmitBtn(false, 'Submit');
        } else {
            disableSubmitBtn(true, 'Submit');
        }
    }
}


window.onload = () => {
    displayProblem();
    displayProblemSelection();
};