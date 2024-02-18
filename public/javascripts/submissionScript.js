async function fetchSubmissions() {
    try {
      const response = await fetch('/api/submission');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  }

async function displaySubmissions() {
  const submissions = await fetchSubmissions();
  const tableBody = document.querySelector('#submissionTableBody');

  submissions.forEach((submission, index) => {
      const row = document.createElement('tr');
      row.classList.add('hover:bg-gray-100', 'cursor-pointer', 'dark:hover:bg-gray-900');
      row.onclick = () => showSubmissionDetails(submission);
      if (submission['score'] === 1) {
        row.classList.remove('hover:bg-gray-100', 'dark:hover:bg-gray-900');
        row.classList.add('bg-green-200', 'hover:bg-green-300', 'dark:bg-green-700', 'dark:hover:bg-green-800');
      }

      const columns = ['submission', 'displayName', 'title', 'score', 'time'];
      columns.forEach((column) => {
          const cell = document.createElement('td');
          cell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
          if (column == 'score') cell.innerText = Math.round(submission[column] * 100);
          else cell.innerText = submission[column];
          if (column == 'time') cell.innerText += 'ms';
          row.appendChild(cell);
      });

      tableBody.appendChild(row);
  });

  sortTable();
}

function showSubmissionDetails(data) {
    const date = new Date(data.submission_date);

    const submissionTitle = document.getElementById("submissionTitle");
    submissionTitle.innerHTML = `<b>Submission ${data.submission}</b>`;

    const submissionDetailsContent = document.getElementById("submissionDetailsContent");
    submissionDetailsContent.innerHTML = `
        User: <b>${data.displayName}</b><br>
        Problem: <b>${data.title}</b><br>
        Submission Date: <b>${date.toLocaleDateString('en-GB')} ${('0'+date.getHours()).slice(-2)}:${('0'+date.getMinutes()).slice(-2)}:${('0'+date.getSeconds()).slice(-2)}</b><br>
        Language: <b>${data.lang}</b><br>
        Score: <b>${Math.round(data.score * 100)}</b><br>
        Result: <b>${data.verdict}</b><br>
        Total time: <b>${data.time}</b>ms<br>
        Memory Usage: <b>${data.max_memory.toFixed(2)}</b>kB
    `;

    const submissionCode = document.getElementById("submissionCode");
    submissionCode.textContent = data.source;
    submissionCode.classList.remove('language-c', 'language-cpp', 'language-py');
    submissionCode.classList.add('language-' + data.lang.toLowerCase());
    Prism.highlightElement(submissionCode);

    const submissionDetails = document.getElementById("submissionDetails");
    submissionDetails.classList.remove('scale-0');
    submissionDetails.classList.add('scale-100');
}

function closeSubmissionDetails() {
    const submissionDetails = document.getElementById("submissionDetails");
    submissionDetails.classList.remove('scale-100');
    submissionDetails.classList.add('scale-0');
}

function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("submissionTable");
  switching = true;

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 1; i < rows.length - 1; i++) {
      shouldSwitch = false;
      x = parseFloat(rows[i].cells[0].innerHTML.toLowerCase());
      y = parseFloat(rows[i + 1].cells[0].innerHTML.toLowerCase());

      if (x < y) {
        shouldSwitch = true;
        break;
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}

window.onload = displaySubmissions;