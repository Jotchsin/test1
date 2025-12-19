<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;
use App\Models\User;
use App\Mail\VerificationCode;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // For API, you might want to use Sanctum or Passport for tokens
        // For now, we'll just return user data
        return response()->json([
            'user' => $user,
            'message' => 'Login successful',
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // For API, return user data
        return response()->json([
            'user' => $user,
            'message' => 'Registration successful',
        ], 201);
    }

    public function sendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email|regex:/@gmail\.com$/',
        ]);

        $email = $request->email;
        $code = rand(100000, 999999);

        // Store the verification code in cache for 10 minutes
        Cache::put('verification_' . $email, $code, 600);

        try {
            // For now, we'll just return the code in the response
            // In production, you would send this via email
            // Mail::to($email)->send(new VerificationCode($code));

            return response()->json([
                'message' => 'Verification code sent successfully',
                'code' => $code, // Remove this in production
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send verification code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function verifyCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $email = $request->email;
        $code = $request->code;
        $storedCode = Cache::get('verification_' . $email);

        if (!$storedCode || $storedCode != $code) {
            return response()->json([
                'message' => 'Invalid verification code',
            ], 400);
        }

        // Clear the verification code
        Cache::forget('verification_' . $email);

        return response()->json([
            'message' => 'Email verified successfully',
        ]);
    }
}