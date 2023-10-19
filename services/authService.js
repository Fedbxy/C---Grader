const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const usersFilePath = path.join(__dirname, '../data/users.json');
const idFilePath = path.join(__dirname, '../data/count.json');

const generateRandomKey = (length) => {
    return crypto.randomBytes(length).toString('hex');
};

const secretKey = generateRandomKey(32);

function readDatabase(dataPath) {
    try {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading database at ${dataPath}: ${err.message}`);
        throw err;
    }
}
  
function writeDatabase(dataPath, data) {
    fs.writeFileSync(dataPath, JSON.stringify(data), 'utf8');
}

function getUserID() {
    let database = readDatabase(idFilePath);
    const nextId = database.userCount + 1;
    database.userCount = nextId;
    writeDatabase(idFilePath, database);
    return nextId;
}

const writeUsersToFile = async (users) => {
    fs.promises.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8', (err) => {
        console.log(err);
    });
};

const generateToken = (user) => {
    return jwt.sign({ userID: user.userID, username: user.username, displayName: user.displayName }, secretKey, { expiresIn: '1h' });
};

const registerUser = async ({ displayName, username, password }) => {
    const users = await readDatabase(usersFilePath);

    if (users.find(user => user.username === username)) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ userID: getUserID(), displayName, username, password: hashedPassword });

    await writeUsersToFile(users);
};

const loginUser = async ({ username, password }) => {
    const users = await readDatabase(usersFilePath);

    const user = users.find(user => user.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new Error('Incorrect username or password.');
    }

    const token = generateToken(user);

    return { token, userID: user.userID, displayName: user.displayName, username: user.username };
};

function authenticateToken(req, res, next) {
    const token = req.cookies.authToken;
    if (!token) {
        return res.redirect('/login');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.redirect('/logout');
        }

        req.user = decoded;
        next();
    });
}

function getUserData(userID) {
    const users = readDatabase(usersFilePath);

    const user = users.find(user => user.userID === userID);

    if (!user) {
        throw new Error('User not found');
    }

    return {
        userID: user.userID,
        displayName: user.displayName,
        username: user.username
    };
}

module.exports = { registerUser, loginUser, secretKey, authenticateToken, getUserData };