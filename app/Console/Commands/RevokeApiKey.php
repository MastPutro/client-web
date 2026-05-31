<?php

namespace App\Console\Commands;

use App\Models\ClientApplication;
use Illuminate\Console\Command;

class RevokeApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:revoke-api-key {name : Nama aplikasi atau API Key}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Revoke API key untuk aplikasi tertentu';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $identifier = $this->argument('name');

        $application = ClientApplication::where('name', $identifier)
            ->orWhere('api_key', $identifier)
            ->first();

        if (!$application) {
            $this->error("Aplikasi tidak ditemukan!");
            return 1;
        }

        if ($application->status === 'revoked') {
            $this->warn("API Key sudah di-revoke sebelumnya.");
            return 0;
        }

        if ($this->confirm("Apakah Anda yakin ingin me-revoke API key untuk '{$application->name}'?")) {
            $application->update(['status' => 'revoked']);
            $this->info("✓ API Key berhasil di-revoke!");
            return 0;
        }

        $this->warn("API Key tidak jadi di-revoke.");
        return 0;
    }
}
