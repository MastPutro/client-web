<?php

namespace App\Console\Commands;

use App\Models\ClientApplication;
use Illuminate\Console\Command;

class ListApiKeys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:list-api-keys';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'List semua API keys yang terdaftar';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $applications = ClientApplication::all();

        if ($applications->isEmpty()) {
            $this->info('Tidak ada aplikasi yang terdaftar.');
            return 0;
        }

        $this->table(
            ['ID', 'Nama', 'API Key', 'Status', 'Last Used', 'Created At'],
            $applications->map(fn ($app) => [
                $app->id,
                $app->name,
                $app->api_key,
                $app->status === 'active' ? '✓ Active' : '✗ ' . ucfirst($app->status),
                $app->last_used_at?->diffForHumans() ?? 'Never',
                $app->created_at->format('Y-m-d H:i'),
            ])
        );

        return 0;
    }
}
