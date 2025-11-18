import { Request, Response } from 'express';
import Workout from '../models/workout.model';

// @desc    Log a new workout
// @route   POST /api/workouts
// @access  Private
export const logWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { workoutType, duration, caloriesBurned, intensity, notes } = req.body;

    // Validation
    if (!workoutType || !duration || caloriesBurned === undefined || !intensity) {
      res.status(400).json({
        message: 'Please provide workoutType, duration, caloriesBurned, and intensity',
      });
      return;
    }

    // Validate workout type
    const validWorkoutTypes = ['Cardio', 'Strength', 'Yoga', 'HIIT'];
    if (!validWorkoutTypes.includes(workoutType)) {
      res.status(400).json({ message: 'Invalid workout type' });
      return;
    }

    // Validate intensity
    const validIntensities = ['low', 'medium', 'high'];
    if (!validIntensities.includes(intensity)) {
      res.status(400).json({ message: 'Invalid intensity level' });
      return;
    }

    // Validate duration
    if (duration < 1) {
      res.status(400).json({ message: 'Duration must be at least 1 minute' });
      return;
    }

    // Create workout entry
    const entry = await Workout.create({
      user: (req as any).user._id,   // from JWT middleware
      workoutType,
      duration,
      caloriesBurned,
      intensity,
      notes: notes || '',
    });

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workouts for logged-in user
// @route   GET /api/workouts
// @access  Private
export const getMyWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const workouts = await Workout.find({ user: (req as any).user._id })
      .sort({ createdAt: -1 });

    res.json(workouts);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get today's workouts for logged-in user
// @route   GET /api/workouts/today
// @access  Private
export const getTodayWorkouts = async (req: Request, res: Response): Promise<void> => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const workouts = await Workout.find({
      user: (req as any).user._id,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).sort({ createdAt: -1 });

    // Calculate today's stats
    const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);

    res.json({
      workouts,
      stats: {
        totalCalories,
        totalDuration,
        totalWorkouts: workouts.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get workout statistics
// @route   GET /api/workouts/stats?period=week
// @access  Private
export const getWorkoutStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = 'week' } = req.query;

    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const workouts = await Workout.find({
      user: (req as any).user._id,
      createdAt: { $gte: startDate },
    });

    // Calculate statistics
    const totalWorkouts = workouts.length;
    const totalCalories = workouts.reduce((sum, w) => sum + w.caloriesBurned, 0);
    const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
    const avgCaloriesPerWorkout = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0;
    const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

    // Group by workout type
    const workoutsByType: Record<string, { count: number; totalCalories: number; totalDuration: number }> = {};
    workouts.forEach(w => {
      if (!workoutsByType[w.workoutType]) {
        workoutsByType[w.workoutType] = {
          count: 0,
          totalCalories: 0,
          totalDuration: 0,
        };
      }
      workoutsByType[w.workoutType].count += 1;
      workoutsByType[w.workoutType].totalCalories += w.caloriesBurned;
      workoutsByType[w.workoutType].totalDuration += w.duration;
    });

    res.json({
      period,
      totalWorkouts,
      totalCalories,
      totalDuration,
      avgCaloriesPerWorkout: Math.round(avgCaloriesPerWorkout),
      avgDuration: Math.round(avgDuration),
      workoutsByType,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a workout
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Ensure user owns this workout
    if (workout.user.toString() !== (req as any).user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { workoutType, duration, caloriesBurned, intensity, notes } = req.body;

    // Update fields if provided
    if (workoutType) workout.workoutType = workoutType;
    if (duration) workout.duration = duration;
    if (caloriesBurned !== undefined) workout.caloriesBurned = caloriesBurned;
    if (intensity) workout.intensity = intensity;
    if (notes !== undefined) workout.notes = notes;

    await workout.save();

    res.json(workout);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a workout
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req: Request, res: Response): Promise<void> => {
  try {
    const workout = await Workout.findById(req.params.id);

    if (!workout) {
      res.status(404).json({ message: 'Workout not found' });
      return;
    }

    // Ensure user owns this workout
    if (workout.user.toString() !== (req as any).user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    await workout.deleteOne();
    res.json({ message: 'Workout removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};