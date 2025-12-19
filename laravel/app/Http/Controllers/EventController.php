<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;


class EventController extends Controller
{
    
    public function index()
    {
        return Event::all();
    }

    public function store(Request $request)
    {
        $request->validate([
            'eventName' => 'required',
            'eventLocation' => 'required',
            'eventDate' => 'required|date',
            'eventTime' => 'required',
            'eventCapacity' => 'nullable|integer',
            'eventType' => 'required',
            'eventVisibility' => 'required',
            'eventDescription' => 'required',
            'eventPhoto' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'eventOrganizer' => 'nullable|string',
        ]);

        $data = $request->all();

        // Handle photo upload
        if ($request->hasFile('eventPhoto')) {
            $photoPath = $request->file('eventPhoto')->store('events', 'public');
            $data['eventPhoto'] = $photoPath;
        }

        return Event::create($data);
    }

    public function show(Event $event)
    {
        return $event;
    }

    public function update(Request $request, Event $event)
    {
        $request->validate([
            'eventName' => 'sometimes|required',
            'eventLocation' => 'sometimes|required',
            'eventDate' => 'sometimes|required|date',
            'eventTime' => 'sometimes|required',
            'eventCapacity' => 'nullable|integer',
            'eventType' => 'sometimes|required',
            'eventVisibility' => 'sometimes|required',
            'eventDescription' => 'sometimes|required',
            'eventPhoto' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $data = $request->all();

        // Handle photo upload and delete previous file if present
        if ($request->hasFile('eventPhoto')) {
            // store new photo
            $photoPath = $request->file('eventPhoto')->store('events', 'public');

            // delete old photo if exists
            if ($event->eventPhoto) {
                \Storage::disk('public')->delete($event->eventPhoto);
            }

            $data['eventPhoto'] = $photoPath;
        }

        $event->update($data);
        return $event;
    }

    public function destroy(Event $event)
    {
        $event->delete();
        return response()->noContent();
    }
}
