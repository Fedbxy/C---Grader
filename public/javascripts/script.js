async function displayProblem() {
    try {
        const response = await fetch('/api/problem');
        const problems = await response.json();

        const problemTable = document.getElementById('problemTable');
        const tbody = problemTable.querySelector('tbody');

        if (tbody) {
            problems.forEach(problem => {
                if (!problem.title.endsWith('.json')) {
                    const row = document.createElement('tr');
                    row.classList.add('hover:bg-gray-100', 'dark:hover:bg-gray-900');

                    // Problem ID
                    const idCell = document.createElement('td');
                    idCell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
                    idCell.textContent = `P-${problem.filename.replace('.json', '')}`;

                    // Problem Title
                    const titleCell = document.createElement('td');
                    titleCell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
                    titleCell.textContent = problem.title;

                    let second = 'second';
                    if (problem.time_limit != 1) second = 'seconds';

                    // Time Limit
                    const timeLimitCell = document.createElement('td');
                    timeLimitCell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
                    timeLimitCell.textContent = `${problem.time_limit} ${second}`;

                    // Memory Limit
                    const memoryLimitCell = document.createElement('td');
                    memoryLimitCell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
                    memoryLimitCell.textContent = `${problem.memory_limit} MB`;

                    // View Details Link
                    const detailsLinkCell = document.createElement('td');
                    detailsLinkCell.classList.add('py-2', 'px-4', 'border-b', 'text-center', 'border-gray-300', 'dark:border-gray-600');
                    const detailsLink = document.createElement('a');
                    detailsLink.href = `/problem/P-${problem.filename.replace('.json', '')}.pdf`;
                    detailsLink.target = '_blank';
                    detailsLink.classList.add('text-blue-500', 'hover:underline');
                    detailsLink.textContent = 'View Details';
                    detailsLinkCell.appendChild(detailsLink);

                    row.appendChild(idCell);
                    row.appendChild(titleCell);
                    row.appendChild(timeLimitCell);
                    row.appendChild(memoryLimitCell);
                    row.appendChild(detailsLinkCell);

                    tbody.appendChild(row);
                }
            });
        }
    } catch (error) {
        console.error('Error fetching problem:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayProblem();
});