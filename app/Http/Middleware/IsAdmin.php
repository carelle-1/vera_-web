<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/');
        }

        if (auth()->user()->role !== 'admin') {
            return redirect('/tableau-de-bord')->with('error', 'Accès refusé. Vous n\'avez pas les permissions pour accéder à cette page.');
        }

        return $next($request);
    }
}
