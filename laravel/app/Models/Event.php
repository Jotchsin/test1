<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'eventName',
        'eventLocation',
        'eventDate',
        'eventTime',
        'eventDuration',
        'eventCapacity',
        'eventType',
        'eventVisibility',
        'eventDescription',
        'eventPhoto',
        'eventOrganizer',
    ];

    protected $appends = ['photoUrl'];

    public function getPhotoUrlAttribute()
    {
        if (!$this->eventPhoto) {
            return null;
        }
        
        return asset('storage/' . $this->eventPhoto);
    }

    // Optional: Delete file when event is deleted
    protected static function booted()
    {
        static::deleting(function ($event) {
            if ($event->eventPhoto) {
                \Storage::disk('public')->delete($event->eventPhoto);
            }
        });
    }
}
