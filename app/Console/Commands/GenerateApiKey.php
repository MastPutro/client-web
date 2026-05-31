<?php

namespace App\Console\Commands;

use App\Models\ClientApplication;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class GenerateApiKey extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:generate-api-key
                            {name : Nama aplikasi klien}
                            {--description= : Deskripsi aplikasi}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate API key untuk aplikasi klien baru';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $name = $this->argument('name');
        $description = $this->option('description');

        // Cek apakah aplikasi sudah ada
        if (ClientApplication::where('name', $name)->exists()) {
            $this->error("Aplikasi dengan nama '{$name}' sudah terdaftar!");
            return 1;
        }

        // Generate API key unik
        $apiKey = Str::uuid();

        // Buat aplikasi baru
        $application = ClientApplication::create([
            'name' => $name,
            'api_key' => $apiKey,
            'description' => $description,
            'status' => 'active',
        ]);

        $this->info('✓ Aplikasi berhasil terdaftar!');
        $this->line('');
        $this->line('<fg=green>API Key:</>');
        $this->line("<fg=yellow>{$apiKey}</>");
        $this->line('');
        $this->line('<fg=cyan>Instruksi:</>');
        $this->line('1. Simpan API Key dengan aman');
        $this->line('2. Kirim API Key di header request: X-API-Key: ' . $apiKey);
        $this->line('');

        return 0;
    }
}
