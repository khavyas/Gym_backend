import axios from 'axios';

const API_NINJAS_KEY = process.env.API_NINJAS_KEY;

// Check if API key exists
if (!API_NINJAS_KEY) {
  console.error('❌ ERROR: API_NINJAS_KEY not found in environment variables!');
  console.error('Please add API_NINJAS_KEY to your .env file');
}

interface CalorieCalculationParams {
  activity: string;
  weightKg: number;
  durationMinutes: number;
}

interface ApiNinjasResponse {
  name: string;
  calories_per_hour: number;
  duration_minutes: number;
  total_calories: number;
}

/**
 * Calculate calories burned using API Ninjas
 */
export async function calculateCaloriesWithAPI(
  params: CalorieCalculationParams
): Promise<number> {
  const { activity, weightKg, durationMinutes } = params;
  
  try {
    // Convert kg to lbs (API Ninjas uses pounds)
    const weightLbs = Math.round(weightKg * 2.20462);
    
    console.log(`📊 Calling API Ninjas: ${activity}, ${weightLbs}lbs, ${durationMinutes}min`);
    
    const response = await axios.get<ApiNinjasResponse[]>(
      'https://api.api-ninjas.com/v1/caloriesburned',
      {
        params: {
          activity: activity.toLowerCase(),
          weight: weightLbs,
          duration: durationMinutes
        },
        headers: {
          'X-Api-Key': API_NINJAS_KEY
        },
        timeout: 5000 // 5 second timeout
      }
    );

    console.log('✅ API Ninjas response:', response.data);

    if (response.data && response.data.length > 0) {
      const caloriesBurned = Math.round(response.data[0].total_calories);
      console.log(`✅ Calculated: ${caloriesBurned} calories`);
      return caloriesBurned;
    }
    
    throw new Error('No data returned from API Ninjas');
    
  } catch (error: any) {
    console.error('❌ API Ninjas error:', error.message);
    throw new Error(`Failed to calculate calories: ${error.message}`);
  }
}

/**
 * Fallback MET-based calculation
 */
export function calculateCaloriesWithMET(
  metValue: number,
  weightKg: number,
  durationMinutes: number,
  gender: 'male' | 'female' = 'male'
): number {
  const genderMultiplier = gender === 'male' ? 1.0 : 0.9;
  return Math.round((metValue * 3.5 * weightKg / 200) * durationMinutes * genderMultiplier);
}

/**
 * Map exercise names to API Ninjas activity names
 * Add more mappings as needed
 */
export function mapExerciseToApiActivity(exerciseName: string): string {
  const activityMap: Record<string, string> = {
    // Your frontend sends specific exercise names
    // Map them to API Ninjas activity names
    'Running (Outdoor)': 'running',
    'Treadmill': 'running',
    'Cycling': 'cycling',
    'Rowing Machine': 'rowing',
    'Elliptical': 'elliptical',
    'Jump Rope': 'jump rope',
    'Swimming': 'swimming',
    'Stair Climbing': 'stair climbing',
    'Bench Press': 'weight lifting',
    'Squats': 'weight lifting',
    'Deadlifts': 'weight lifting',
    'Dumbbell Press': 'weight lifting',
    'Bicep Curls': 'weight lifting',
    'Shoulder Press': 'weight lifting',
    'Lat Pulldown': 'weight lifting',
    'Leg Press': 'weight lifting',
    'Hatha Yoga': 'yoga',
    'Vinyasa Flow': 'yoga',
    'Power Yoga': 'yoga',
    'Stretching': 'stretching',
    'Pilates': 'pilates',
    'HIIT Training': 'circuit training',
    'Circuit Training': 'circuit training',
    'CrossFit': 'crossfit',
    'Burpees': 'calisthenics',
    'Tabata': 'circuit training',
  };

  // If exercise name is in the map, return mapped value
  // Otherwise, return the original name (lowercase)
  return activityMap[exerciseName] || exerciseName.toLowerCase();
}

/**
 * Get MET values for fallback calculation
 */
export function getMETValue(intensity: string): number {
  const metValues: Record<string, number> = {
    'low': 4.0,
    'medium': 7.0,
    'high': 10.0,
  };
  return metValues[intensity] || 7.0;
}