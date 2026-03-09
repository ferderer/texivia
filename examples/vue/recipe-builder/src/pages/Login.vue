<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'
import { router } from '../router'

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')

async function handleLogin(e: Event) {
  e.preventDefault()

  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields'
    return
  }

  if (!email.value.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (email.value === 'demo@example.com' && password.value === 'password') {
      router.navigate('/dashboard')
    } else {
      error.value = 'Invalid email or password'
    }
  } catch {
    error.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="login-page">
      <div class="login-container">
        <div class="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Recipe Builder account</p>
        </div>

        <form @submit="handleLogin" class="login-form">
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              type="email"
              v-model="email"
              placeholder="Enter your email"
              class="form-input"
              :disabled="isLoading"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              v-model="password"
              placeholder="Enter your password"
              class="form-input"
              :disabled="isLoading"
            />
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="rememberMe"
                :disabled="isLoading"
              />
              Remember me
            </label>

            <a href="/forgot-password" class="forgot-link">
              Forgot password?
            </a>
          </div>

          <button type="submit" class="login-btn" :disabled="isLoading">
            <template v-if="isLoading">
              <span class="spinner"></span>
              Signing in...
            </template>
            <template v-else>
              Sign In
            </template>
          </button>

          <div class="divider">
            <span>or</span>
          </div>

          <div class="social-login">
            <button type="button" class="social-btn google" :disabled="isLoading">
              <span class="social-icon">G</span>
              Continue with Google
            </button>

            <button type="button" class="social-btn facebook" :disabled="isLoading">
              <span class="social-icon">f</span>
              Continue with Facebook
            </button>
          </div>

          <div class="signup-prompt">
            <p>Don't have an account? <a href="/register">Sign up here</a></p>
          </div>
        </form>

        <div class="demo-credentials">
          <h4>Demo Credentials</h4>
          <p><strong>Email:</strong> demo@example.com</p>
          <p><strong>Password:</strong> password</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #1f2937;
}

.login-header p {
  color: #6b7280;
  font-size: 1rem;
}

.login-form {
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

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1rem;
  height: 1rem;
}

.forgot-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}

.forgot-link:hover {
  text-decoration: underline;
}

.login-btn {
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

.login-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.login-btn:disabled {
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

.signup-prompt {
  text-align: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.signup-prompt p {
  color: #6b7280;
  font-size: 0.875rem;
}

.signup-prompt a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.signup-prompt a:hover {
  text-decoration: underline;
}

.demo-credentials {
  margin-top: 2rem;
  padding: 1rem;
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
}

.demo-credentials h4 {
  color: #0369a1;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.demo-credentials p {
  color: #0369a1;
  font-size: 0.75rem;
  margin: 0.25rem 0;
}
</style>
