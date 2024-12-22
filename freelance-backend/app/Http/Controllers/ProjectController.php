<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Resources\ProjectResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ProjectController extends Controller
{
    /**
     * Prikazuje sve projekte za autentifikovanog ponudjača.
     */
    public function showMyProjects()
    {
        $user = Auth::user();

        // Proverava da li je korisnik ponudjač
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo ponudjač može da vidi svoje projekte.'], 403);
        }

        $projects = Project::where('service_seller_id', $user->id)->get();

        return ProjectResource::collection($projects);
    }

    /**
     * Prikazuje sve projekte (za kupca).
     */
    public function index()
    {
        $user = Auth::user();

        // Proverava da li je korisnik kupac
        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo kupac može da vidi sve projekte.'], 403);
        }

        $projects = Project::paginate(10);

        return ProjectResource::collection($projects);
    }

    /**
     * Prikazuje detalje određenog projekta (za kupca).
     */
    public function show($id)
    {
        $user = Auth::user();

        // Proverava da li je korisnik kupac
        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo kupac može da vidi detalje projekta.'], 403);
        }

        $project = Project::findOrFail($id);

        return new ProjectResource($project);
    }

    /**
     * Pretražuje projekte po imenu (za kupca).
     */
    public function search(Request $request)
    {
        $user = Auth::user();

        // Proverava da li je korisnik kupac
        if ($user->role !== 'kupac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo kupac može da pretražuje projekte.'], 403);
        }

        $projects = Project::where('title', 'LIKE', '%' . $request->input('query') . '%')->paginate(10);

        return ProjectResource::collection($projects);
    }

    /**
     * Kreira novi projekat (za ponudjača).
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Proverava da li je korisnik ponudjač
        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo ponudjač može da kreira projekte.'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string',
            'description' => 'required|string',
            'budget' => 'required|numeric|min:0',
            'deadline' => 'required|date|after:today',
            'priority' => 'required|in:low,medium,high',
        ]);

        $project = Project::create(array_merge($validated, [
            'service_seller_id' => $user->id,
            'status' => 'pending',
        ]));

        return response()->json(['message' => 'Projekat uspešno kreiran!', 'project' => new ProjectResource($project)]);
    }

    /**
     * Ažurira sve informacije o projektu (za ponudjača).
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();

        $project = Project::where('service_seller_id', $user->id)->findOrFail($id);

        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo ponudjač može da ažurira projekte.'], 403);
        }

        $validated = $request->validate([
            'category_id' => 'exists:categories,id',
            'title' => 'string',
            'description' => 'string',
            'budget' => 'numeric|min:0',
            'deadline' => 'date|after:today',
            'priority' => 'in:low,medium,high',
        ]);

        $project->update($validated);

        return response()->json(['message' => 'Projekat uspešno ažuriran!', 'project' => new ProjectResource($project)]);
    }

    /**
     * Ažurira samo budžet projekta (za ponudjača).
     */
    public function updateBudget(Request $request, $id)
    {
        $user = Auth::user();

        $project = Project::where('service_seller_id', $user->id)->findOrFail($id);

        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo ponudjač može da ažurira budžet.'], 403);
        }

        $validated = $request->validate([
            'budget' => 'required|numeric|min:0',
        ]);

        $project->update($validated);

        return response()->json(['message' => 'Budžet uspešno ažuriran!', 'project' => new ProjectResource($project)]);
    }

    /**
     * Briše projekat (za ponudjača).
     */
    public function destroy($id)
    {
        $user = Auth::user();

        $project = Project::where('service_seller_id', $user->id)->findOrFail($id);

        if ($user->role !== 'ponudjac') {
            return response()->json(['error' => 'Nedozvoljen pristup: Samo ponudjač može da briše projekte.'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Projekat uspešno obrisan!']);
    }
}
