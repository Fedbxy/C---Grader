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
      row.classList.add('hover:bg-gray-100', 'cursor-pointer');
      row.onclick = () => showSubmissionDetails(submission);
      console.log(submission);
      if (submission['score'] === 1) {
        row.classList.remove('hover:bg-gray-100');
        row.classList.add('bg-green-200', 'hover:bg-green-300');
      }

      const columns = ['submission', 'displayName', 'title', 'score', 'time'];
      columns.forEach((column) => {
          const cell = document.createElement('td');
          cell.classList.add('py-2', 'px-4', 'border-b', 'text-center');
          if (column == 'score') cell.innerText = submission[column]*100;
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
        Average Memory Usage: <b>${data.avgmem.toFixed(2)}</b>kB
    `;

    document.getElementById("submissionCode").innerText = data.source;
    document.getElementById("submissionDetails").classList.remove('opacity-0', 'scale-0');
    document.getElementById("submissionDetails").classList.add('opacity-100', 'scale-100');
}

function closeSubmissionDetails() {
    document.getElementById("submissionDetails").classList.remove('opacity-100', 'scale-100');
    document.getElementById("submissionDetails").classList.add('opacity-0', 'scale-0');
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