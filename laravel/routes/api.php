<?php

use App\Http\Controllers\PostController;
use App\Http\Controllers\EventController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::apiResource('posts', PostController::class);
Route::apiResource('events', \App\Http\Controllers\EventController::class);
