<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Task extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'status',
        'due_date',
    ];

    protected $casts = [
        'due_date' => 'date:Y-m-d',
    ];

    /**
     * Allowed status values.
     */
    const STATUS_PENDING     = 'pending';
    const STATUS_IN_PROGRESS = 'in-progress';
    const STATUS_COMPLETED   = 'completed';

    /**
     * The task belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
