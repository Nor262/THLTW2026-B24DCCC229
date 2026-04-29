import { WorkoutItem, HealthMetricItem, GoalItem, ExerciseItem } from '@/pages/FitnessTracker/data';

// --- MOCK DATA ---

const initialWorkouts: WorkoutItem[] = [
  { id: '1', name: 'Weightlifting', date: '2026-04-25', type: 'Strength', duration: 45, calories: 350, notes: 'Upper body focus', status: 'Completed' },
  { id: '2', name: 'Morning Jog', date: '2026-04-26', type: 'Cardio', duration: 30, calories: 300, notes: 'Morning run', status: 'Completed' },
  { id: '3', name: 'Hatha Yoga', date: '2026-04-27', type: 'Yoga', duration: 60, calories: 200, notes: 'Flexibility training', status: 'Completed' },
  { id: '4', name: 'Tabata', date: '2026-04-28', type: 'HIIT', duration: 25, calories: 400, notes: 'Intense interval', status: 'Completed' },
  { id: '5', name: 'Leg Day', date: '2026-04-29', type: 'Strength', duration: 50, calories: 380, notes: 'Lower body focus', status: 'Completed' },
];

const initialHealthMetrics: HealthMetricItem[] = [
  { id: '1', date: '2026-04-01', weight: 75, height: 175, bmi: 24.5, restingHeartRate: 65, sleepHours: 7 },
  { id: '2', date: '2026-04-08', weight: 74.5, height: 175, bmi: 24.3, restingHeartRate: 64, sleepHours: 7.5 },
  { id: '3', date: '2026-04-15', weight: 74, height: 175, bmi: 24.2, restingHeartRate: 63, sleepHours: 8 },
  { id: '4', date: '2026-04-22', weight: 73.5, height: 175, bmi: 24.0, restingHeartRate: 62, sleepHours: 7 },
  { id: '5', date: '2026-04-29', weight: 73, height: 175, bmi: 23.8, restingHeartRate: 61, sleepHours: 7.5 },
];

const initialGoals: GoalItem[] = [
  { id: '1', name: 'Lose 5kg', type: 'Weight Loss', targetValue: 70, currentValue: 73, deadline: '2026-06-01', status: 'In Progress' },
  { id: '2', name: 'Run 10km', type: 'Endurance', targetValue: 10, currentValue: 7, deadline: '2026-05-15', status: 'In Progress' },
];

const initialExercises: ExerciseItem[] = [
  {
    id: '1',
    name: 'Push-ups',
    muscleGroups: ['Chest', 'Shoulders', 'Arms'],
    difficulty: 'Medium',
    description: 'A classic bodyweight exercise for upper body strength.',
    averageCaloriesPerHour: 400,
    instructions: '1. Start in a plank position. 2. Lower your body until your chest nearly touches the floor. 3. Push back up to the starting position.'
  },
  {
    id: '2',
    name: 'Squats',
    muscleGroups: ['Legs', 'Core'],
    difficulty: 'Medium',
    description: 'Fundamental lower body exercise.',
    averageCaloriesPerHour: 500,
    instructions: '1. Stand with feet shoulder-width apart. 2. Lower your hips back and down. 3. Keep your chest up and back straight. 4. Return to standing.'
  },
  {
    id: '3',
    name: 'Running',
    muscleGroups: ['Full Body', 'Legs'],
    difficulty: 'Medium',
    description: 'Great for cardiovascular health.',
    averageCaloriesPerHour: 600,
    instructions: 'Maintain a steady pace and good posture.'
  },
  {
    id: '4',
    name: 'Plank',
    muscleGroups: ['Core'],
    difficulty: 'Easy',
    description: 'Excellent for core stability.',
    averageCaloriesPerHour: 150,
    instructions: 'Hold a push-up position with elbows on the ground.'
  }
];

// --- STORAGE HELPER ---

const STORAGE_KEYS = {
  WORKOUTS: 'fitness_workouts',
  HEALTH_METRICS: 'fitness_health_metrics',
  GOALS: 'fitness_goals',
  EXERCISES: 'fitness_exercises',
};

const getFromStorage = <T>(key: string, initialData: T[]): T[] => {
  if (typeof window === 'undefined') return initialData;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : initialData;
};

const saveToStorage = <T>(key: string, data: T[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// --- API SERVICES ---

export const workoutService = {
  query: async () => getFromStorage(STORAGE_KEYS.WORKOUTS, initialWorkouts),
  save: async (data: WorkoutItem[]) => saveToStorage(STORAGE_KEYS.WORKOUTS, data),
};

export const healthMetricService = {
  query: async () => getFromStorage(STORAGE_KEYS.HEALTH_METRICS, initialHealthMetrics),
  save: async (data: HealthMetricItem[]) => saveToStorage(STORAGE_KEYS.HEALTH_METRICS, data),
};

export const goalService = {
  query: async () => getFromStorage(STORAGE_KEYS.GOALS, initialGoals),
  save: async (data: GoalItem[]) => saveToStorage(STORAGE_KEYS.GOALS, data),
};

export const exerciseService = {
  query: async () => getFromStorage(STORAGE_KEYS.EXERCISES, initialExercises),
  save: async (data: ExerciseItem[]) => saveToStorage(STORAGE_KEYS.EXERCISES, data),
};
