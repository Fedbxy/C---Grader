const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const queue = [];
let isProcessingQueue = false;
const dataPath = 'grader/data.json';

function readDatabase() {
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      return JSON.parse(data);
    } catch (err) {
      return { submissionCount: 0 };
    }
}
  
function writeDatabase(data) {
    fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
}

const processQueue = async () => {
    if (isProcessingQueue) {
        return;
    }

    isProcessingQueue = true;

    while (queue.length > 0) {
        const { req, res, dir } = queue.shift();
        await processSubmission(req, res, dir);
    }

    isProcessingQueue = false;
};

function getNextSubmissionId() {
    let database = readDatabase();
    const nextId = database.submissionCount + 1;
    database.submissionCount = nextId;
    writeDatabase(database);
    return nextId;
}

const processSubmission = (req, res, dir, callback) => {
    return new Promise((resolve, reject) => {
        const { problem, lang, submit_epoch, source, file_extention } = req.body;

        if (!problem || !lang || !source || !file_extention) {
            reject('Missing required fields.');
            res.status(400).json({ error: 'Missing required fields.' });
            return;
        }

        const allowedLanguages = ['c', 'cpp', 'py'];
        if (!allowedLanguages.includes(lang)) {
            reject('Invalid programming language.');
            res.status(400).json({ error: 'Invalid programming language.' });
            return;
        }

        const allowedFileExtensions = ['.c', '.cpp','.py'];
        const fileExtension = `.${file_extention}`;
        if (!allowedFileExtensions.includes(fileExtension)) {
            reject('Invalid file type.');
            res.status(400).json({ error: 'Invalid file type.' });
            return;
        }

        fs.mkdir(dir, { recursive: true }, (err) => {
            if (err) {
                reject(`Error creating directory: ${err.message}`);
                res.status(500).json({ error: 'Error creating directory. Please try again.' });
                return;
            }

            const filePath = path.join(dir, `${problem.replace(".pdf", "").replace("P-", "")}.${lang}`);
            fs.writeFile(filePath, source, 'binary', (err) => {
                if (err) {
                    reject(`Error writing file: ${err.message}`);
                    res.status(500).json({ error: 'Error writing file. Please try again.' });
                    return;
                }

                exec(`python3 grader/main.py`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing the code: ${error.message}`);
                        reject(`Error executing the code: ${error.message}`);
                        res.status(500).json({ error: 'Error executing the code. Please try again.' });
                        return;
                    }

                    fs.readFile(path.join(dir, 'result.json'), (err, data) => {
                        if (err) {
                            console.error(`Error reading result file: ${error.message}`);
                            reject(`Error reading result file: ${error.message}`);
                            res.status(500).json({ error: 'Error reading result file. Please try again.' });
                            return;
                        }

                        const resultData = JSON.parse(data.toString());
                        resultData.submission_date = submit_epoch;

                        fs.writeFile(path.join(dir, 'result.json'), JSON.stringify(resultData), (err) => {
                            if (err) {
                                console.error(`Error updating result file: ${error.message}`);
                                reject(`Error updating result file: ${error.message}`);
                                res.status(500).json({ error: 'Error updating result file. Please try again.' });
                                return;
                            }

                            res.json(resultData);
                            console.log(resultData);

                            fs.rename(dir, dir.replace(dir.split("/")[1], "archives"), (err) => {
                                if (err) {
                                    console.error(`Error moving to archive: ${err.message}`);
                                    reject(`Error moving to archive: ${err.message}`);
                                    res.status(500).json({ error: 'Error logging file. Please try again.' });
                                    return;
                                }

                                resolve();
                            });
                        });
                    });
                });
            });
        })
    });
};

module.exports = {
    getNextSubmissionId,
    processQueue,
    queue,
};