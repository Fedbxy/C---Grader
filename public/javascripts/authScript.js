// Function to send registration data to the server
function registerUser(displayName, username, password) {
    var serverRegisterEndpoint = '/register';

    var registrationData = {
        displayName: displayName,
        username: username,
        password: password
    };

    sendToServer(serverRegisterEndpoint, registrationData, 'Registration');
}

// Function to send login data to the server
function loginUser(username, password) {
    var serverLoginEndpoint = '/login';

    var loginData = {
        username: username,
        password: password
    };

    sendToServer(serverLoginEndpoint, loginData, 'Login');
}

function logout() {
    fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin',
    })
    .then(response => {
        if (response.status === 200) {
            showError('Logged out.');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
}

// Function to send data to the server
function sendToServer(endpoint, data, action) {
    fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log(`${action} Response:`, data);

        if (data.success) {
            if (data.user) {
                const { displayName, username, userID } = data.user;

                window.location.replace('/');
            } else {
                window.location.replace('/login');
            }
        } else {
            showError(data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showError(`An unexpected error occurred during ${action}. Please try again.`);
    });
}

// Function to validate the registration form
function validateRegisterForm() {
    var displayName = document.getElementById('displayName').value;
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (displayName.trim() === '') {
        showError('Display Name is required.');
        return false;
    }
    
    if (username.trim() === '') {
        showError('Username is required.');
        return false;
    }

    if (password.trim() === '') {
        showError('Password is required.');
        return false;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters long.');
        return false;
    }

    clearError();

    // If all validations pass, send data to the server for registration
    registerUser(displayName, username, password);

    // Prevent the form from submitting (since we're handling it with fetch)
    return false;
}

// Function to validate the login form
function validateLoginForm() {
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (username.trim() === '') {
        showError('Username is required.');
        return false;
    }

    if (password.trim() === '') {
        showError('Password is required.');
        return false;
    }

    clearError();

    // If all validations pass, send data to the server for login
    loginUser(username, password);

    // Prevent the form from submitting (since we're handling it with fetch)
    return false;
}

// Function to show an error message
function showError(message) {
    var errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = message;
}

// Function to clear any previous error messages
function clearError() {
    var errorMessageElement = document.getElementById('error-message');
    errorMessageElement.textContent = '';
}

// Function to update the navbar based on the user's authentication status
function updateNavbar() {
    const submitLink = document.getElementById('submitLink');
    const submissionLink = document.getElementById('submissionLink');
    const loginLink = document.getElementById('loginLink');
  
    if (document.cookie.includes('isLoggedIn=true')) {
        if (submitLink) submitLink.classList.remove('hidden');
        if (submissionLink) submissionLink.classList.remove('hidden');
        if (loginLink) {
            loginLink.textContent = 'Logout';
            loginLink.classList.add('text-red-500', 'font-semibold');
            loginLink.onclick = logout;
        }
    } else {
        if (submitLink) submitLink.classList.add('hidden');
        if (loginLink) {
            loginLink.textContent = 'Login';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNavbar();
});