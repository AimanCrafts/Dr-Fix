<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Tiny key/value store for platform-wide settings
 * (currently only the commission percentage).
 */
class PlatformSetting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'value'];

    public static function commissionRate(): float
    {
        $value = static::where('key', 'commission_rate')->value('value');

        return $value === null ? 10.0 : (float) $value;
    }

    public static function setCommissionRate(float $rate): void
    {
        static::updateOrCreate(
            ['key' => 'commission_rate'],
            ['value' => (string) $rate]
        );
    }
}
