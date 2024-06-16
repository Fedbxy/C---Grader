async function submitCode() {
    const language = document.getElementById('language').value;
    const problem = document.getElementById('problem').value;
    const selection = document.getElementById('selection').value;

    var code;

    if (selection === 'code') {
        code = codeEditor.getValue();
        if (!code) {
            setResult('Cannot submit empty code.', true);
            return;
        }
        var fileExtension = language;
        submitToServer(code, language, problem, Date.now(), fileExtension);
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
            submitToServer(code, language, problem, Date.now(), fileExtension);
        };

        reader.readAsText(file);
    }
}

async function submitToServer(code, language, problem, submit_epoch, file_extention) {
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
        Submission Date: <b>${date.toLocaleDateString('en-GB')} ${('0'+date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}</b><br>
        Problem: <b>${problem.replace(".pdf", "")}</b><br>
        Language: <b>${language}</b><br>
        <br>
        Score: <b>${Math.round(result.score * 100)}</b><br>
        Result: <b>${result.verdict}</b><br>
        Total time: <b>${result.time}</b>ms<br>
        Memory Usage: <b>${result.max_memory.toFixed(2)}</b>kB
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
    const result = document.getElementById('result');
    result.classList.remove("hidden");
    result.innerHTML = message;
    if (isError) {
        result.classList.add("text-red-500");
    } else {
        result.classList.remove("text-red-500");
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
        const response = await fetch('/api/problem');
        const problem = await response.json();
        
        problem.sort((a, b) => {
            return a.filename.localeCompare(b.filename);
        });

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

document.addEventListener('DOMContentLoaded', () => {
    displayProblemSelection();
});