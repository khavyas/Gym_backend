import { Request, Response } from 'express';
import Meal from '../models/meal.model';

// Extended Request type to include user from auth middleware
interface AuthRequest extends Request {
  user?: {
    _id: string;
    name?: string;
    email?: string;
  };
}

// @desc Log a single meal entry
// @route POST /api/meals
// @access Private
export const logMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      mealType, 
      foodName, 
      calories, 
      protein, 
      carbs, 
      fats,
      servingSize,
      fiber,
      sugar,
      sodium,
      cholesterol,
      saturatedFat,
      potassium,
      imageId,
      metadata
    } = req.body;

    // Validate required fields
    if (!mealType || !foodName) {
      res.status(400).json({ 
        message: 'mealType and foodName are required' 
      });
      return;
    }

    // Validate mealType
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      res.status(400).json({ 
        message: 'Invalid mealType. Must be: breakfast, lunch, dinner, or snack' 
      });
      return;
    }

    const entry = await Meal.create({
      user: req.user!._id,
      mealType,
      foodName,
      calories: calories || 0,
      protein: protein || 0,
      carbs: carbs || 0,
      fats: fats || 0,
      servingSize: servingSize || 0,
      fiber: fiber || 0,
      sugar: sugar || 0,
      sodium: sodium || 0,
      cholesterol: cholesterol || 0,
      saturatedFat: saturatedFat || 0,
      potassium: potassium || 0,
      imageId,
      metadata,
    });

    res.status(201).json(entry);
  } catch (error: any) {
    console.error('Error logging meal:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Log multiple meal entries at once (for AI-detected foods)
// @route POST /api/meals/bulk
// @access Private
export const logBulkMeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { mealType, meals, imageId } = req.body;

    // Validate required fields
    if (!mealType || !meals || !Array.isArray(meals) || meals.length === 0) {
      res.status(400).json({ 
        message: 'mealType and meals array are required' 
      });
      return;
    }

    // Validate mealType
    const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMealTypes.includes(mealType)) {
      res.status(400).json({ 
        message: 'Invalid mealType. Must be: breakfast, lunch, dinner, or snack' 
      });
      return;
    }

    // Prepare meal entries
    const mealEntries = meals.map((meal: any) => ({
      user: req.user!._id,
      mealType,
      foodName: meal.name || meal.foodName,
      calories: meal.calories || 0,
      protein: meal.protein_g || meal.protein || 0,
      carbs: meal.carbohydrates_total_g || meal.carbs || 0,
      fats: meal.fat_total_g || meal.fats || 0,
      servingSize: meal.serving_size_g || meal.servingSize || 0,
      fiber: meal.fiber_g || meal.fiber || 0,
      sugar: meal.sugar_g || meal.sugar || 0,
      sodium: meal.sodium_mg || meal.sodium || 0,
      cholesterol: meal.cholesterol_mg || meal.cholesterol || 0,
      saturatedFat: meal.fat_saturated_g || meal.saturatedFat || 0,
      potassium: meal.potassium_mg || meal.potassium || 0,
      imageId: imageId || meal.imageId,
      metadata: meal.metadata,
    }));

    // Insert all meals at once
    const savedEntries = await Meal.insertMany(mealEntries);

    res.status(201).json({
      message: `Successfully logged ${savedEntries.length} meal(s)`,
      meals: savedEntries,
      count: savedEntries.length,
    });
  } catch (error: any) {
    console.error('Error logging bulk meals:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get all meals for logged-in user (with optional filters)
// @route GET /api/meals?date=YYYY-MM-DD&mealType=breakfast
// @access Private
export const getMyMeals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date, mealType, from, to } = req.query;
    
    const filter: any = { user: req.user!._id };

    // Filter by specific date (defaults to today)
    if (date || (!from && !to)) {
      const targetDate = date ? new Date(date as string) : new Date();
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }
    
    // Filter by date range
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    // Filter by meal type
    if (mealType) {
      const validMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
      if (!validMealTypes.includes(mealType as string)) {
        res.status(400).json({ 
          message: 'Invalid mealType. Must be: breakfast, lunch, dinner, or snack' 
        });
        return;
      }
      filter.mealType = mealType;
    }

    const meals = await Meal.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json(meals);
  } catch (error: any) {
    console.error('Error fetching meals:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single meal by ID
// @route GET /api/meals/:id
// @access Private
export const getMealById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const meal = await Meal.findById(req.params.id)
      .populate('user', 'name email');

    if (!meal) {
      res.status(404).json({ message: 'Meal not found' });
      return;
    }

    // Ensure user owns this meal
    if (meal.user._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this meal' });
      return;
    }

    res.json(meal);
  } catch (error: any) {
    console.error('Error fetching meal:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Update a meal entry
// @route PATCH /api/meals/:id
// @access Private
export const updateMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404).json({ message: 'Meal not found' });
      return;
    }

    // Ensure user owns this meal
    if (meal.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this meal' });
      return;
    }

    // Update allowed fields
    const allowedUpdates = [
      'mealType', 'foodName', 'calories', 'protein', 'carbs', 'fats',
      'servingSize', 'fiber', 'sugar', 'sodium', 'cholesterol', 
      'saturatedFat', 'potassium', 'metadata'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        (meal as any)[field] = req.body[field];
      }
    });

    await meal.save();

    res.json(meal);
  } catch (error: any) {
    console.error('Error updating meal:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete a meal entry
// @route DELETE /api/meals/:id
// @access Private
export const deleteMeal = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      res.status(404).json({ message: 'Meal not found' });
      return;
    }

    // Ensure user owns this meal
    if (meal.user.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to delete this meal' });
      return;
    }

    await meal.deleteOne();
    res.json({ message: 'Meal entry removed successfully' });
  } catch (error: any) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc Get nutrition summary for a date range
// @route GET /api/meals/summary
// @access Private
export const getMealSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    
    const filter: any = { user: req.user!._id };

    // Default to today if no date range provided
    if (!from && !to) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    } else {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from as string);
      if (to) filter.createdAt.$lte = new Date(to as string);
    }

    const summary = await Meal.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$mealType',
          totalCalories: { $sum: '$calories' },
          totalProtein: { $sum: '$protein' },
          totalCarbs: { $sum: '$carbs' },
          totalFats: { $sum: '$fats' },
          totalFiber: { $sum: '$fiber' },
          totalSugar: { $sum: '$sugar' },
          totalSodium: { $sum: '$sodium' },
          mealCount: { $sum: 1 },
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Calculate overall totals
    const overallTotals = summary.reduce((acc, curr) => ({
      calories: acc.calories + curr.totalCalories,
      protein: acc.protein + curr.totalProtein,
      carbs: acc.carbs + curr.totalCarbs,
      fats: acc.fats + curr.totalFats,
      fiber: acc.fiber + curr.totalFiber,
      sugar: acc.sugar + curr.totalSugar,
      sodium: acc.sodium + curr.totalSodium,
      meals: acc.meals + curr.mealCount,
    }), { 
      calories: 0, protein: 0, carbs: 0, fats: 0, 
      fiber: 0, sugar: 0, sodium: 0, meals: 0 
    });

    res.json({
      byMealType: summary,
      overall: overallTotals,
    });
  } catch (error: any) {
    console.error('Error getting meal summary:', error);
    res.status(500).json({ message: error.message });
  }
};