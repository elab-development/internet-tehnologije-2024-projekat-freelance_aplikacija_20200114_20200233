<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReviewController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('ponudjac')->group(function () {
        Route::resource('projekti', ProjectController::class)->except(['index', 'show']);
        Route::get('/projekti', [ProjectController::class, 'showMyProjects']);
    });

    Route::prefix('kupac')->group(function () {
        Route::get('/projekti', [ProjectController::class, 'index']); 
        Route::get('/projekti/{id}', [ProjectController::class, 'show']); 
        Route::post('/projekti/pretraga', [ProjectController::class, 'search']); 

        Route::post('/zahtevi/{projectId}', [RequestController::class, 'store']); 
        Route::put('/zahtevi/{id}', [RequestController::class, 'update']); 
        Route::patch('/zahtevi/{id}', [RequestController::class, 'updateStatus']); 
        Route::delete('/zahtevi/{id}', [RequestController::class, 'destroy']); 

        Route::post('/recenzije/{requestId}', [ReviewController::class, 'store']); 
        Route::put('/recenzije/{id}', [ReviewController::class, 'update']); 
        Route::delete('/recenzije/{id}', [ReviewController::class, 'destroy']); 
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
});
