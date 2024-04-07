const express = require('express');
const fs = require('fs');
const path = require('path');

const { getUserData } = require('../services/authService');

const router = express.Router();

router.get('/problem', async (req, res) => {
    const problemPath = path.join(__dirname, '../public', 'problem');

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

        const validProblem = problem.filter(problem => problem !== null);

        res.json(validProblem);
    } catch (error) {
        console.error('Error reading "problem" directory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/submission', async (req, res) => {
    const submissionPath = path.join(__dirname, '../grader', 'archives');
    const problemPath = path.join(__dirname, '../public', 'problem');

    try {
        const submissions = await fs.promises.readdir(submissionPath);
        const jsonSubmission = await Promise.all(submissions.map(processSubmission));

        res.json(jsonSubmission);
    } catch (error) {
        console.error('Error reading "archives" directory:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    async function processSubmission(dir) {
        try {
            const content = await fs.promises.readFile(path.join(submissionPath, dir, 'result.json'), 'utf-8');
            const dirPath = path.join(submissionPath, dir);
            const files = await fs.promises.readdir(dirPath);
            const problems = await fs.promises.readdir(problemPath);

            const sourcePromises = files.map(file => processSourceFile(file, dir));

            const sourceData = (await Promise.all(sourcePromises)).filter(data => data !== undefined)[0];
            const source = sourceData.content;
            const problemID = sourceData.problemID;
            const lang = sourceData.lang;

            const titlePromises = problems.map(file => processProblemFile(file, problemID));

            const title = (await Promise.all(titlePromises)).filter(item => item !== null).map(item => item.name)[0];
            
            const { submission, userID, submission_date, score, verdict, time, max_memory } = JSON.parse(content);

            const user = getUserData(userID);

            return {
                submission,
                userID,
                submission_date,
                score,
                verdict,
                time,
                max_memory,
                source,
                problemID,
                title,
                displayName: user.displayName,
                lang
            };
        } catch (error) {
            console.error(`Error reading or parsing JSON file "${dir}":`, error);
            return null;
        }
    }

    async function processSourceFile(file, dir) {
        if (['cpp', 'c', 'py'].includes(file.split('.')[1])) {
            try {
                const problemID = file.split('.')[0];
                const lang = file.split('.')[1];
                return {
                    problemID,
                    lang,
                    content: await fs.promises.readFile(path.join(submissionPath, dir, file), 'utf-8')
                };
            } catch (err) {
                console.error(`Error reading source file "${file}":`, err);
                throw new Error(`Error reading source file "${file}": ${err.message}`);
            }
        }
    }
    
    async function processProblemFile(file, problemID) {
        if (file.split('.')[1] === 'json' && file.split('.')[0] === problemID) {
            try {
                const content = await fs.promises.readFile(path.join(problemPath, file), 'utf-8');
                return JSON.parse(content);
            } catch (err) {
                console.error(`Error reading problem file "${file}":`, err);
                throw new Error(`Error reading problem file "${file}": ${err.message}`);
            }
        } else {
            return null;
        }
    }
});

module.exports = router;