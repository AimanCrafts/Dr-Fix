<?php

use Carbon\Carbon;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Three related changes, in one migration because they all touch booking
 * prices and dates:
 *
 *  1. services           - the single source of truth for service names/prices
 *  2. platform_settings  - key/value settings (currently: commission_rate)
 *  3. bookings           - real scheduled_date + commission snapshot columns
 *
 * The deploy script only runs "migrate" (never db:seed), so the 24 services
 * and the default 10% commission are inserted right here.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('services')) {
            Schema::create('services', function (Blueprint $table) {
                $table->id();
                $table->string('category', 40);
                $table->string('name', 150)->unique();
                $table->unsignedInteger('price');
                $table->unsignedSmallInteger('sort_order')->default(0);
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['category', 'sort_order']);
            });
        }

        if (! Schema::hasTable('platform_settings')) {
            Schema::create('platform_settings', function (Blueprint $table) {
                $table->string('key', 60)->primary();
                $table->string('value', 255);
                $table->timestamps();
            });
        }

        DB::table('platform_settings')->updateOrInsert(
            ['key' => 'commission_rate'],
            ['value' => '10', 'created_at' => now(), 'updated_at' => now()]
        );

        Schema::table('bookings', function (Blueprint $table) {
            if (! Schema::hasColumn('bookings', 'scheduled_date')) {
                $table->date('scheduled_date')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'commission_rate')) {
                $table->decimal('commission_rate', 5, 2)->nullable();
            }
            if (! Schema::hasColumn('bookings', 'platform_fee')) {
                $table->unsignedInteger('platform_fee')->nullable();
            }
            if (! Schema::hasColumn('bookings', 'technician_earning')) {
                $table->unsignedInteger('technician_earning')->nullable();
            }
        });

        // ---- seed the 24 services (category keys match the technician signup values)
        if (DB::table('services')->count() === 0) {
            $catalog = [
                'electric' => [
                    ['Switch/Socket Repair', 300], ['Light Installation', 450],
                    ['Ceiling Fan Installation', 500], ['MCB/Breaker Replacement', 650],
                ],
                'plumbing' => [
                    ['Tap/Faucet Repair', 350], ['Pipe Leak Fixing', 500],
                    ['Drain Blockage Cleaning', 800], ['Toilet Repair', 900],
                ],
                'ac_repair' => [
                    ['AC General Service', 800], ['AC Gas Refill', 1200],
                    ['AC Coil Cleaning', 900], ['AC Installation', 1500],
                ],
                'carpentry' => [
                    ['Door Repair', 600], ['Wardrobe Repair', 900],
                    ['Custom Shelf Installation', 1000], ['Wood Polishing', 700],
                ],
                'painting' => [
                    ['Single Wall Painting', 600], ['Full Room Painting', 3500],
                    ['Damp Wall Treatment', 900], ['Ceiling Painting', 800],
                ],
                'cleaning' => [
                    ['Deep Home Cleaning', 1800], ['Bathroom Deep Clean', 700],
                    ['Sofa/Carpet Cleaning', 900], ['Kitchen Deep Clean', 800],
                ],
            ];

            $rows = [];
            foreach ($catalog as $category => $items) {
                foreach ($items as $i => [$name, $price]) {
                    $rows[] = [
                        'category'   => $category,
                        'name'       => $name,
                        'price'      => $price,
                        'sort_order' => $i,
                        'is_active'  => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            DB::table('services')->insert($rows);
        }

        // ---- the old Services page used "ac-repair"; technicians signed up as "ac_repair",
        //      so AC bookings never matched any technician. Normalise.
        DB::table('bookings')->where('service_category', 'ac-repair')
            ->update(['service_category' => 'ac_repair']);

        // ---- old bookings stored the words "Today"/"Tomorrow". Turn them into real dates.
        DB::table('bookings')->whereNull('scheduled_date')->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    $base = Carbon::parse($row->created_at ?? now(), 'UTC')
                        ->setTimezone('Asia/Dhaka')
                        ->startOfDay();

                    if ($row->date_label === 'Tomorrow') {
                        $base->addDay();
                    }

                    DB::table('bookings')->where('id', $row->id)->update([
                        'scheduled_date' => $base->toDateString(),
                        'date_label'     => $base->format('D, j M'),
                    ]);
                }
            });

        // ---- already-completed jobs get the 10% split too, so earnings stay consistent
        DB::table('bookings')->where('status', 'completed')->whereNull('technician_earning')
            ->orderBy('id')->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    $fee = (int) round($row->price * 0.10);
                    DB::table('bookings')->where('id', $row->id)->update([
                        'commission_rate'    => 10,
                        'platform_fee'       => $fee,
                        'technician_earning' => $row->price - $fee,
                    ]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            foreach (['scheduled_date', 'commission_rate', 'platform_fee', 'technician_earning'] as $col) {
                if (Schema::hasColumn('bookings', $col)) {
                    $table->dropColumn($col);
                }
            }
        });

        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('services');
    }
};
