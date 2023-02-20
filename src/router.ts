import { Router } from 'express';

const router = Router();

router.get('/movies', (req, res) => {
  console.log('hello from movies route');
  res.status(200);
  res.json({ message: 'hellow from movies' });
});
// router.get('/movie:id', () => {});
// router.put('/movie:id', () => {});
// router.post('/movie', () => {});
// router.delete('/movie:id', () => {});

export default router;
