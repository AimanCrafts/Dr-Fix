<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'customer_id',
        'technician_id',
        'service_category',
        'service_name',
        'price',
        'address',
        'date_label',
        'scheduled_date',
        'time_slot',
        'instructions',
        'payment_method',
        'payment_status',
        'payment_provider',
        'payment_transaction_id',
        'payment_phone',
        'status',
        'accepted_at',
        'started_at',
        'completed_at',
        'commission_rate',
        'platform_fee',
        'technician_earning',
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'scheduled_date' => 'date:Y-m-d',
        'commission_rate' => 'float',
    ];

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'technician_id');
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
