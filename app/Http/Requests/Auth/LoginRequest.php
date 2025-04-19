<?php

namespace App\Http\Requests\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            // Personnalisation du rate limiting pour MongoDB
            $this->incrementLoginAttempts();

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // Réinitialiser les tentatives en cas de succès
        $this->clearLoginAttempts();
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        $key = $this->throttleKey();
        $attempts = Cache::get($key, 0);

        if ($attempts >= 5) {
            $seconds = 60; // 1 minute lockout
            event(new Lockout($this));

            throw ValidationException::withMessages([
                'email' => __('auth.throttle', [
                    'seconds' => $seconds,
                    'minutes' => ceil($seconds / 60),
                ]),
            ]);
        }
    }

    /**
     * Increment the login attempts for the user.
     */
    protected function incrementLoginAttempts(): void
    {
        $key = $this->throttleKey();
        $attempts = Cache::get($key, 0);

        // Incrémenter et stocker pour 1 minute (60 secondes)
        Cache::put($key, $attempts + 1, 60);
    }

    /**
     * Clear the login attempts for the user.
     */
    protected function clearLoginAttempts(): void
    {
        Cache::forget($this->throttleKey());
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return 'login_' . Str::transliterate(Str::lower($this->string('email')) . '|' . $this->ip());
    }
}
