<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        Schema::create('events', function (Blueprint $table){
            $table->id();
            $table->string('eventName');
            $table->string('eventLocation');
            $table->date('eventDate');
            $table->time('eventTime');
            $table->string('eventDuration');
            $table->integer('eventCapacity');
            $table->string('eventType');
            $table->string('eventVisibility');
            $table->text('eventDescription');
            $table->string('eventPhoto')->nullable();
            $table->string('eventOrganizer')->nullable();
        });

        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
        Schema::dropIfExists('events');
    }
};
