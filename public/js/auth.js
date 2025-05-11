document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTabs = document.querySelectorAll('#authTabs .nav-link');

    // Handle tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            
            // Update active tab
            authTabs.forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('show', 'active');
                if (pane.id === target) {
                    pane.classList.add('show', 'active');
                }
            });
        });
    });

    // Handle login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('password').value;
        const errorMessage = document.getElementById('login-error');

        try {
            console.log('Attempting login...');
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful:', data);
                window.location.href = '/dashboard.html';
            } else {
                // Show specific error message based on error type
                let message = 'Login failed. Please try again.';
                switch(data.type) {
                    case 'account_not_found':
                        message = 'Account does not exist. Please check your email or register.';
                        break;
                    case 'invalid_password':
                        message = 'Incorrect password. Please try again.';
                        break;
                    case 'server_error':
                        message = 'Server error. Please try again later.';
                        break;
                    case 'session_error':
                        message = 'Session error. Please try again.';
                        break;
                }
                errorMessage.textContent = message;
                errorMessage.style.display = 'block';
            }
        } catch (err) {
            console.error('Login error:', err);
            errorMessage.textContent = 'An unexpected error occurred. Please try again.';
            errorMessage.style.display = 'block';
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Registration form submitted');
        
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        console.log('Form data:', { email, password: '***', confirmPassword: '***' });

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        try {
            console.log('Sending registration request...');
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Registration response status:', response.status);
            
            if (response.ok) {
                alert('Registration successful! Please login.');
                document.querySelector('#authTabs .nav-link').click(); // Switch to login tab
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (err) {
            console.error('Registration error:', err);
            alert(err.message || 'Registration failed. Please try again.');
        }
    });
});