<?php

use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('ponudjac')->group(function () {
        Route::get('/moji-projekti', [ProjectController::class, 'showMyProjects']); 
        Route::post('/projekti', [ProjectController::class, 'store']); 
        Route::put('/projekti/{id}', [ProjectController::class, 'update']); 
        Route::patch('/projekti/{id}/budzet', [ProjectController::class, 'updateBudget']); 
        Route::delete('/projekti/{id}', [ProjectController::class, 'destroy']); 
    });

    Route::prefix('kupac')->group(function () {
        Route::get('/projekti', [ProjectController::class, 'index']); 
        Route::get('/projekti/{id}', [ProjectController::class, 'show']); 
        Route::get('/projekti/pretraga', [ProjectController::class, 'search']); 
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
});