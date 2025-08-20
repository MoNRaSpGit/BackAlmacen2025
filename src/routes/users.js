import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/users.js';

const router = Router();

router.post('/register', registerUser);  // POST /api/users/register
router.post('/login', loginUser);        // POST /api/users/login

export default router;
