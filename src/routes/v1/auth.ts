import express from 'express';
import {googleAuth, register} from "@controllers/authController";

const router = express.Router();

router.post('/register', register);
router.post('/login', register);
router.get('/google', googleAuth);

export default router;
