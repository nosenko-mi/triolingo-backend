import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.send({ message: 'API version 1' });
});

export default router;
