import express from 'express';
import {getFragment} from "@controllers/fragmentController";

const router = express.Router();

router.post('/', getFragment);

export default router;
