<script lang="ts">
  import Layout from '../components/layout/Layout.svelte';

  let firstName: string = $state('');
  let lastName: string = $state('');
  let email: string = $state('');
  let password: string = $state('');
  let confirmPassword: string = $state('');
  let agreeToTerms: boolean = $state(false);
  let newsletter: boolean = $state(true);
  let isLoading: boolean = $state(false);
  let error: string = $state('');

  // Password strength indicator
  let passwordStrength = $derived(
    !password ? { score: 0, label: '', color: '' } :
    (() => {
      let score = 0;
      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/[0-9]/.test(password)) score++;
      if (/[^A-Za-z0-9]/.test(password)) score++;

      if (score <= 2) return { score, label: 'Weak', color: '#dc2626' };
      if (score <= 3) return { score, label: 'Fair', color: '#d97706' };
      if (score <= 4) return { score, label: 'Good', color: '#059669' };
      return { score, label: 'Strong', color: '#059669' };
    })()
  );

  async function handleRegister(e: Event) {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      error = 'Please fill in all required fields';
      return;
    }

    if (!email.includes('@')) {
      error = 'Please enter a valid email address';
      return;
    }

    if (password.length < 8) {
      error = 'Password must be at least 8 characters long';
      return;
    }

    if (password !== confirmPassword) {
      error = 'Passwords do not match';
      return;
    }

    if (!agreeToTerms) {
      error = 'Please agree to the Terms of Service and Privacy Policy';
      return;
    }

    isLoading = true;
    error = '';

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock registration logic
      if (email === 'existing@example.com') {
        error = 'An account with this email already exists';
      } else {
        // Success - redirect to login or dashboard
        window.location.href = '/login?registered=true';
      }
    } catch (err) {
      error = 'An error occurred during registration. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<Layout>
  {#snippet body()}
    <div class="register-page">
      <div class="register-container">
        <div class="register-header">
          <h1>Join Recipe Builder</h1>
          <p>Create your account and start sharing amazing recipes</p>
        </div>

        <form onsubmit={handleRegister} class="register-form">
          {#if error}
            <div class="error-message">
              {error}
            </div>
          {/if}

          <div class="name-group">
            <div class="form-group">
              <label for="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                bind:value={firstName}
                placeholder="First name"
                class="form-input"
                disabled={isLoading}
              />
            </div>

            <div class="form-group">
              <label for="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                bind:value={lastName}
                placeholder="Last name"
                class="form-input"
                disabled={isLoading}
              />
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email Address *</label>
            <input
              id="email"
              type="email"
              bind:value={email}
              placeholder="Enter your email"
              class="form-input"
              disabled={isLoading}
            />
          </div>

          <div class="form-group">
            <label for="password">Password *</label>
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Create a password"
              class="form-input"
              disabled={isLoading}
            />
            {#if password}
              <div class="password-strength">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    style="width: {(passwordStrength.score / 5) * 100}%; background-color: {passwordStrength.color}"
                  ></div>
                </div>
                <span class="strength-label" style="color: {passwordStrength.color}">
                  {passwordStrength.label}
                </span>
              </div>
            {/if}
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              bind:value={confirmPassword}
              placeholder="Confirm your password"
              class="form-input {confirmPassword && password !== confirmPassword ? 'error' : ''}"
              disabled={isLoading}
            />
            {#if confirmPassword && password !== confirmPassword}
              <span class="field-error">Passwords do not match</span>
            {/if}
          </div>

          <div class="checkbox-group">
            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:checked={agreeToTerms}
                disabled={isLoading}
              />
              I agree to the <a href="/terms" target="_blank">Terms of Service</a> and <a href="/privacy" target="_blank">Privacy Policy</a> *
            </label>

            <label class="checkbox-label">
              <input
                type="checkbox"
                bind:checked={newsletter}
                disabled={isLoading}
              />
              Send me recipe inspiration and updates via email
            </label>
          </div>

          <button type="submit" class="register-btn" disabled={isLoading || !agreeToTerms}>
            {#if isLoading}
              <span class="spinner"></span>
              Creating Account...
            {:else}
              Create Account
            {/if}
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn google" disabled={isLoading}>
              <span class="social-icon">G</span>
              Sign up with Google
            </button>

            <button type="button" class="social-btn facebook" disabled={isLoading}>
              <span class="social-icon">f</span>
              Sign up with Facebook
            </button>
          </div>

          <div class="login-prompt">
            <p>Already have an account? <a href="/login">Sign in here</a></p>
          </div>
        </form>
      </div>
    </div>
  {/snippet}
</Layout>

<style>
  .register-page {
    min-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .register-container {
    max-width: 500px;
    width: 100%;
    background: white;
    padding: 3rem;
    border-radius: 1rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .register-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .register-header h1 {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  .register-header p {
    color: #6b7280;
    font-size: 1rem;
  }

  .register-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .error-message {
    background: #fee2e2;
    color: #dc2626;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid #fecaca;
    font-size: 0.875rem;
    text-align: center;
  }

  .name-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-group label {
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  .form-input {
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .form-input:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  .form-input:disabled {
    background: #f9fafb;
    color: #6b7280;
  }

  .form-input.error {
    border-color: #dc2626;
  }

  .field-error {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: -0.25rem;
  }

  .password-strength {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .strength-bar {
    flex: 1;
    height: 0.25rem;
    background: #e5e7eb;
    border-radius: 0.125rem;
    overflow: hidden;
  }

  .strength-fill {
    height: 100%;
    transition: all 0.3s ease;
  }

  .strength-label {
    font-size: 0.75rem;
    font-weight: 500;
    min-width: 60px;
  }

  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: #374151;
    cursor: pointer;
    line-height: 1.4;
  }

  .checkbox-label input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    margin-top: 0.125rem;
    flex-shrink: 0;
  }

  .checkbox-label a {
    color: #2563eb;
    text-decoration: none;
  }

  .checkbox-label a:hover {
    text-decoration: underline;
  }

  .register-btn {
    background: #2563eb;
    color: white;
    padding: 0.875rem 1rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .register-btn:hover:not(:disabled) {
    background: #1d4ed8;
  }

  .register-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .divider {
    position: relative;
    text-align: center;
    margin: 1rem 0;
  }

  .divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e5e7eb;
  }

  .divider span {
    background: white;
    padding: 0 1rem;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .social-login {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: white;
    color: #374151;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .social-btn:hover:not(:disabled) {
    background: #f9fafb;
    border-color: #9ca3af;
  }

  .social-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .social-icon {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 0.75rem;
  }

  .google .social-icon {
    background: #4285f4;
    color: white;
  }

  .facebook .social-icon {
    background: #1877f2;
    color: white;
  }

  .login-prompt {
    text-align: center;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .login-prompt p {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .login-prompt a {
    color: #2563eb;
    text-decoration: none;
    font-weight: 500;
  }

  .login-prompt a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .name-group {
      grid-template-columns: 1fr;
    }

    .register-container {
      padding: 2rem;
    }
  }
</style>
