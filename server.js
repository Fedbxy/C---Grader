const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');

const { getNextSubmissionId, processQueue, queue } = require('./services/submissionService');
const { authenticateToken } = require('./services/authService');
const authRoutes = require('./routes/authRoute');
const apiRoutes = require('./routes/apiRoute');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    const ip = req.header('x-forwarded-for') || req.socket.remoteAddress;
    console.log(`[${new Date().toISOString()}] ${ip} ${req.method} ${req.url}`);
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api', apiRoutes);
app.use(authRoutes);
app.use(express.static(path.join(__dirname, 'public'), {extensions: ['html', 'ejs'] }));

app.get('/submit', authenticateToken, (req, res) => {
    res.render('submit');
});

app.post('/submit', authenticateToken, (req, res) => {
    const submissionId = getNextSubmissionId();
    const dir = `grader/submission/${submissionId}`;

    queue.push({ req, res, dir });

    processQueue();
});

app.use((req, res, next) => {
    res.status(404).render('404');
});

app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err.name === 'UnauthorizedError') {
        res.status(401).send('Unauthorized');
    } else {
        res.status(500).send('Something went wrong!');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});