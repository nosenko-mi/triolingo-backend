import express from 'express';
import {getBatch} from '@controllers/batchController';

const router = express.Router();

router.get('/', getBatch);

export default router;
