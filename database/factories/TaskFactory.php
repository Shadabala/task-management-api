<?php

namespace Database\Factories;

use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id'     => User::factory(),
            'title'       => $this->faker->sentence(4),
            'description' => $this->faker->optional()->paragraph(),
            'status'      => $this->faker->randomElement(['pending', 'in-progress', 'completed']),
            'due_date'    => $this->faker->optional()->dateTimeBetween('now', '+30 days')?->format('Y-m-d'),
        ];
    }

    /**
     * State: pending task.
     */
    public function pending(): static
    {
        return $this->state(fn () => ['status' => 'pending']);
    }

    /**
     * State: in-progress task.
     */
    public function inProgress(): static
    {
        return $this->state(fn () => ['status' => 'in-progress']);
    }

    /**
     * State: completed task.
     */
    public function completed(): static
    {
        return $this->state(fn () => ['status' => 'completed']);
    }
}
