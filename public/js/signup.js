// signup.js

document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('register-form');
    
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Basic validation
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Store the token
                localStorage.setItem('auth_token', data.token);
                
                // Show success message
                showNotification('Registration successful! Welcome to Ink&Panels', 'success');
                
                // Close the auth modal
                const authModal = document.getElementById('auth-modal');
                authModal.style.display = 'none';
                
                // Update UI to show logged-in state
                updateUIForUser(data.user);
                
                // Reset form
                signupForm.reset();
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });
});