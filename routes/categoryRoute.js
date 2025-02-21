import express from 'express';
import { createCategory } from '../controllers/categoryController.js';
import { isAdmin, isAuthenticated } from './../middlewares/authMiddleware.js';

const categoryRoute = express.Router();

categoryRoute.post("/create-category",isAuthenticated, isAdmin, createCategory);

export default categoryRoute;
