<script setup lang="ts">
import { ref } from 'vue'
import AppLayout from '../components/layout/AppLayout.vue'

const email = ref('')
const isLoading = ref(false)
const isSubmitted = ref(false)
const error = ref('')

async function handleSubmit(e: Event) {
  e.preventDefault()

  if (!email.value) {
    error.value = 'Please enter your email address'
    return
  }

  if (!email.value.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await new Promise(resolve => setTimeout(resolve, 1500))
    isSubmitted.value = true
  } catch {
    error.value = 'An error occurred. Please try again.'
  } finally {
    isLoading.value = false
  }
}

function resendEmail() {
  isSubmitted.value = false
  error.value = ''
}
</script>

<template>
  <AppLayout>
    <div class="forgot-password-page">
      <div class="forgot-password-container">
        <template v-if="!isSubmitted">
          <!-- Reset Password Form -->
          <div class="form-header">
            <h1>Reset Your Password</h1>
            <p>Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          <form @submit="handleSubmit" class="forgot-password-form">
            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                id="email"
                type="email"
                v-model="email"
                placeholder="Enter your email address"
                class="form-input"
                :disabled="isLoading"
                autofocus
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="isLoading">
              <template v-if="isLoading">
                <span class="spinner"></span>
                Sending Reset Link...
              </template>
              <template v-else>
                Send Reset Link
              </template>
            </button>

            <div class="back-to-login">
              <a href="/login">← Back to Sign In</a>
            </div>
          </form>
        </template>

        <template v-else>
          <!-- Success Message -->
          <div class="success-container">
            <div class="success-icon">✓</div>

            <h1>Check Your Email</h1>

            <p class="success-message">
              We've sent a password reset link to <strong>{{ email }}</strong>
            </p>

            <div class="instructions">
              <h3>What's next?</h3>
              <ol>
                <li>Check your email inbox (and spam folder)</li>
                <li>Click the reset link in the email</li>
                <li>Create a new password</li>
                <li>Sign in with your new password</li>
              </ol>
            </div>

            <div class="help-text">
              <p>Didn't receive the email?</p>
              <ul>
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes for the email to arrive</li>
              </ul>
            </div>

            <div class="action-buttons">
              <button @click="resendEmail" class="resend-btn">
                Try Different Email
              </button>
              <a href="/login" class="back-btn">
                Back to Sign In
              </a>
            </div>
          </div>
        </template>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
.forgot-password-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.forgot-password-container {
  max-width: 480px;
  width: 100%;
  background: white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-header h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.form-header p {
  color: #6b7280;
  font-size: 1rem;
  line-height: 1.5;
}

.forgot-password-form {
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
  padding: 0.875rem 1rem;
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

.submit-btn {
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

.submit-btn:hover:not(:disabled) {
  background: #1d4ed8;
}

.submit-btn:disabled {
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

.back-to-login {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.back-to-login a {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.back-to-login a:hover {
  color: #2563eb;
}

/* Success State */
.success-container {
  text-align: center;
}

.success-icon {
  width: 4rem;
  height: 4rem;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto 2rem;
}

.success-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.success-message {
  color: #6b7280;
  font-size: 1rem;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.instructions {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.instructions h3 {
  color: #1f2937;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.instructions ol {
  color: #374151;
  padding-left: 1.5rem;
  line-height: 1.6;
}

.instructions li {
  margin-bottom: 0.5rem;
}

.help-text {
  text-align: left;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #fffbeb;
  border-radius: 0.5rem;
  border: 1px solid #fde68a;
}

.help-text p {
  color: #92400e;
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.help-text ul {
  color: #92400e;
  padding-left: 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}

.help-text li {
  margin-bottom: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.resend-btn, .back-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-block;
  text-align: center;
}

.resend-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.resend-btn:hover {
  background: #e5e7eb;
}

.back-btn {
  background: #2563eb;
  color: white;
}

.back-btn:hover {
  background: #1d4ed8;
}

@media (max-width: 640px) {
  .forgot-password-container {
    padding: 2rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .instructions {
    padding: 1rem;
  }
}
</style>
