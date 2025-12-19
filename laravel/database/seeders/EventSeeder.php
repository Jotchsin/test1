<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the database with sample event data.
     */
    public function run(): void
    {
        $events = [
            [
                'eventName' => 'Tech Conference 2025',
                'eventLocation' => 'San Francisco Convention Center',
                'eventDate' => '2025-03-15',
                'eventTime' => '09:00:00',
                'eventDuration' => '8 hours',
                'eventCapacity' => 500,
                'eventType' => 'Conference',
                'eventVisibility' => 'public',
                'eventDescription' => 'Annual technology conference featuring keynote speeches, workshops, and networking opportunities.',
                'eventOrganizer' => 'Tech Events Inc.',
            ],
            [
                'eventName' => 'Summer Music Festival',
                'eventLocation' => 'Central Park, New York',
                'eventDate' => '2025-06-20',
                'eventTime' => '17:00:00',
                'eventDuration' => '6 hours',
                'eventCapacity' => 1000,
                'eventType' => 'Festival',
                'eventVisibility' => 'public',
                'eventDescription' => 'A vibrant music festival featuring local and international artists across multiple stages.',
                'eventOrganizer' => 'City Entertainment',
            ],
            [
                'eventName' => 'Corporate Team Building',
                'eventLocation' => 'Downtown Hotel Ballroom',
                'eventDate' => '2025-02-10',
                'eventTime' => '18:30:00',
                'eventDuration' => '4 hours',
                'eventCapacity' => 150,
                'eventType' => 'Corporate',
                'eventVisibility' => 'private',
                'eventDescription' => 'Team building activities and networking dinner for company employees.',
                'eventOrganizer' => 'XYZ Corporation HR',
            ],
            [
                'eventName' => 'Art Exhibition Opening',
                'eventLocation' => 'Modern Art Gallery',
                'eventDate' => '2025-04-05',
                'eventTime' => '19:00:00',
                'eventDuration' => '3 hours',
                'eventCapacity' => 200,
                'eventType' => 'Exhibition',
                'eventVisibility' => 'public',
                'eventDescription' => 'Opening night of contemporary art exhibition with artist meet and greet.',
                'eventOrganizer' => 'Gallery Director',
            ],
            [
                'eventName' => 'Marathon 2025',
                'eventLocation' => 'City Streets Route',
                'eventDate' => '2025-05-12',
                'eventTime' => '07:00:00',
                'eventDuration' => '5 hours',
                'eventCapacity' => 2000,
                'eventType' => 'Sports',
                'eventVisibility' => 'public',
                'eventDescription' => 'Annual city marathon with 42.2km route. Register now for early bird discount.',
                'eventOrganizer' => 'City Sports Authority',
            ],
        ];

        foreach ($events as $event) {
            Event::create($event);
        }
    }
}
