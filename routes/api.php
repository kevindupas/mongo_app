<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/test-mongo', function (Request $request) {
    $connection = DB::connection('mongodb');
    $message = "MongoDB connection established successfully!";
    try {
        $connection->getMongoDB()->command(['ping' => 1]);
    } catch (\Exception $e) {
        $message = "Failed to connect to MongoDB: " . $e->getMessage();
    }
    return response()->json([
        'message' => $message,
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
