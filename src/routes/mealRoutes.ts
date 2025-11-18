import express from 'express';
import { protect } from '../middleware/authMiddleware';
import {
  logMeal,
  logBulkMeals,
  getMyMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getMealSummary,
} from '../controllers/mealController';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Meal:
 *       type: object
 *       required:
 *         - mealType
 *         - foodName
 *       properties:
 *         mealType:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *           description: Type of meal
 *         foodName:
 *           type: string
 *           description: Name of the food item
 *         calories:
 *           type: number
 *           description: Calories in kcal
 *         protein:
 *           type: number
 *           description: Protein in grams
 *         carbs:
 *           type: number
 *           description: Carbohydrates in grams
 *         fats:
 *           type: number
 *           description: Fats in grams
 *         servingSize:
 *           type: number
 *           description: Serving size in grams
 *         fiber:
 *           type: number
 *           description: Fiber in grams
 *         sugar:
 *           type: number
 *           description: Sugar in grams
 *         sodium:
 *           type: number
 *           description: Sodium in mg
 *         cholesterol:
 *           type: number
 *           description: Cholesterol in mg
 *         saturatedFat:
 *           type: number
 *           description: Saturated fat in grams
 *         potassium:
 *           type: number
 *           description: Potassium in mg
 */

// Protect all meal routes
router.use(protect);

/**
 * @swagger
 * /api/meals:
 *   post:
 *     tags: [Meals]
 *     summary: Log a single meal entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meal'
 *     responses:
 *       201:
 *         description: Meal logged successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/', logMeal);

/**
 * @swagger
 * /api/meals/bulk:
 *   post:
 *     tags: [Meals]
 *     summary: Log multiple meal entries at once (for AI-detected foods)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mealType
 *               - meals
 *             properties:
 *               mealType:
 *                 type: string
 *                 enum: [breakfast, lunch, dinner, snack]
 *               meals:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Meal'
 *               imageId:
 *                 type: string
 *                 description: Optional LogMeal image ID
 *     responses:
 *       201:
 *         description: Meals logged successfully
 *       400:
 *         description: Validation error
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/bulk', logBulkMeals);

/**
 * @swagger
 * /api/meals/summary:
 *   get:
 *     tags: [Meals]
 *     summary: Get nutrition summary for a date range
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (defaults to today)
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (defaults to today)
 *     responses:
 *       200:
 *         description: Nutrition summary
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/summary', getMealSummary);

/**
 * @swagger
 * /api/meals:
 *   get:
 *     tags: [Meals]
 *     summary: Get all meals with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by specific date (defaults to today)
 *       - in: query
 *         name: mealType
 *         schema:
 *           type: string
 *           enum: [breakfast, lunch, dinner, snack]
 *         description: Filter by meal type
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for range filter
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for range filter
 *     responses:
 *       200:
 *         description: List of meals
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Meal'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', getMyMeals);

/**
 * @swagger
 * /api/meals/{id}:
 *   get:
 *     tags: [Meals]
 *     summary: Get single meal by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal details
 *       404:
 *         description: Meal not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', getMealById);

/**
 * @swagger
 * /api/meals/{id}:
 *   patch:
 *     tags: [Meals]
 *     summary: Update a meal entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Meal'
 *     responses:
 *       200:
 *         description: Meal updated successfully
 *       404:
 *         description: Meal not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.patch('/:id', updateMeal);

/**
 * @swagger
 * /api/meals/{id}:
 *   delete:
 *     tags: [Meals]
 *     summary: Delete a meal entry
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal ID
 *     responses:
 *       200:
 *         description: Meal deleted successfully
 *       404:
 *         description: Meal not found
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/:id', deleteMeal);

export default router;