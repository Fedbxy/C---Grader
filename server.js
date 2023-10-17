const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getNextSubmissionId, processQueue, queue } = require('./services/submissionService');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public'), {extensions: 'html'}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', (req, res) => {
    const submissionId = getNextSubmissionId();
    const dir = `grader/submission/${submissionId}`;

    queue.push({ req, res, dir });

    processQueue();
});

app.get('/problem', async (req, res) => {
    const problemPath = path.join(__dirname, 'public', 'problem');

    try {
        const files = await fs.promises.readdir(problemPath);

        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const problem = await Promise.all(jsonFiles.map(async file => {
            try {
                const content = await fs.promises.readFile(path.join(problemPath, file), 'utf-8');
                const { name, time_limit, memory_limit } = JSON.parse(content);

                return {
                    title: name,
                    time_limit,
                    memory_limit,
                    filename: file
                };
            } catch (error) {
                console.error(`Error reading or parsing JSON file "${file}":`, error);
                return null;
            }
        }));

        const validproblem = problem.filter(problem => problem !== null);

        res.json(validproblem);
    } catch (error) {
        console.error('Error reading "problem" directory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});