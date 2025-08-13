<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\CategoriesController;

Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']); 

Route::get('/categories', [CategoriesController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {

    Route::prefix('ponudjac')->group(function () {
        Route::resource('projekti', ProjectController::class)->except(['index', 'show']);
        Route::get('/projekti', [ProjectController::class, 'showMyProjects']);
        Route::get('/zahtevi', [RequestController::class, 'indexForSeller']);
        Route::patch('/zahtevi/{id}/status', [RequestController::class, 'updateStatus']); 
        Route::get('/zahtevi/statistika', [RequestController::class, 'statsForSeller']);
        Route::get('/zahtevi/export-pdf', [RequestController::class, 'exportPdf']);
    });

    Route::prefix('kupac')->group(function () {
        Route::get('/projekti', [ProjectController::class, 'index']); 
        Route::get('/projekti/{id}', [ProjectController::class, 'show']); 
        Route::post('/projekti/pretraga', [ProjectController::class, 'search']); 
        

        Route::post('/zahtevi/{projectId}', [RequestController::class, 'store']); 
        Route::patch('/zahtevi/{id}', [RequestController::class, 'update']); 
        Route::get('/zahtevi', [RequestController::class, 'indexForBuyer']);
        
        Route::delete('/zahtevi/{id}', [RequestController::class, 'destroy']); 
        Route::get('/projekti/{project}/requests', [RequestController::class, 'indexForProject']);
        
        Route::post('/recenzije/{requestId}', [ReviewController::class, 'store']); 
        Route::put('/recenzije/{id}', [ReviewController::class, 'update']); 
        Route::delete('/recenzije/{id}', [ReviewController::class, 'destroy']); 
        Route::get('/projekti/{project}/reviews', [ReviewController::class, 'indexForProject']);
    });
    
    Route::post('/logout', [AuthController::class, 'logout']);
});
