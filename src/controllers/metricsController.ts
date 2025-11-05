import { Request, Response } from 'express';
import User from '../models/User.model';
import GymCenter from '../models/Gym.model';

/**
 * Get admin dashboard metrics
 * Returns real counts for users and gyms, dummy data for others
 */
export const getAdminMetrics = async (req: Request, res: Response) => {
    try {
        // Get real counts from database
        const totalUsers = await User.countDocuments({ role: 'user' });

        const totalConsultants = await User.countDocuments({ role: 'consultant' });

        const totalGyms = await GymCenter.countDocuments();

        // Prepare response with real and dummy data
        const metrics = {
            totalGyms,
            gymsGrowth: 12.5, // Dummy data - percentage growth
            totalUsers,
            usersGrowth: 8.3, // Dummy data - percentage growth
            totalConsultants,
            activeConsultants: 38, // Dummy data
            consultantsGrowth: 2.7, // Dummy data - percentage growth
            monthlyRevenue: 125000, // Dummy data - in currency units
            revenueGrowth: 22.4, // Dummy data - percentage growth
        };

        res.status(200).json(metrics);
    } catch (error: any) {
        console.error('Error fetching admin metrics:', error);
        res.status(500).json({
            message: 'Failed to fetch admin metrics',
            error: error.message,
        });
    }
};
