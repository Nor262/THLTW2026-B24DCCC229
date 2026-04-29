export interface WorkoutItem {
  id: string;
  name: string;
  date: string;
  type: 'Cardio' | 'Strength' | 'Yoga' | 'HIIT' | 'Other';
  duration: number; // minutes
  calories: number;
  notes?: string;
  status: 'Completed' | 'Missed';
}

export interface HealthMetricItem {
  id: string;
  date: string;
  weight: number; // kg
  height: number; // cm
  bmi: number;
  restingHeartRate: number; // bpm
  sleepHours: number;
}

export interface GoalItem {
  id: string;
  name: string;
  type: 'Weight Loss' | 'Muscle Gain' | 'Endurance' | 'Other';
  targetValue: number;
  currentValue: number;
  deadline: string;
  status: 'In Progress' | 'Achieved' | 'Cancelled';
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroups: string[]; // Chest, Back, Legs, etc.
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  averageCaloriesPerHour: number;
  instructions: string;
}
