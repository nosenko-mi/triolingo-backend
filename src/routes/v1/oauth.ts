import express from 'express';
import {googleAuth} from "@controllers/oauthController";

const router = express.Router();

router.post('/google', googleAuth);

export default router;
