<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Services\SnmpService;

class ResourceController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Dashboard');
    }

}
