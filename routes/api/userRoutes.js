import express from 'express';
import { registerUser, verifyUser, resendVerificationEmail } from '../../controllers/userController.js';

const router = express.Router();

router.post('/register', registerUser);
router.get('/verify/:verificationToken', verifyUser);
router.post('/resend-verification', resendVerificationEmail);

export default router;
