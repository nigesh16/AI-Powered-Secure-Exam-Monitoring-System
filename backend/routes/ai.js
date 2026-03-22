import { Router } from 'express';
import { protect, studentOnly } from '../middleware/auth.js';

const router = Router();

// In localHost we can use this real analyze!

// router.post('/analyze', protect, studentOnly, async (req, res) => {
//   try {
//     const { image } = req.body;
//     if (!image) return res.status(400).json({ message: 'Image is required' });
//     const aiUrl = process.env.AI_ENGINE_URL || 'http://localhost:8000';
//     const response = await fetch(`${aiUrl}/analyze`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image }),
//     });
//     const data = await response.json();
//     res.json(data);
//   } catch (error) {
//     res.status(502).json({
//       multiplePerson: false,
//       mobileDetected: false,
//       noFace: false,
//       notFocusing: false,
//       error: error.message,
//     });
//   }
// });

router.post('/analyze', protect, studentOnly, async (req, res) => {
  try {
    // no AI call, just dummy response
    return res.json({
      multiplePerson: false,
      mobileDetected: false,
      noFace: false,
      notFocusing: false,
      message: "AI disabled in deployed version"
    });
  } catch (error) {
    return res.status(500).json({
      multiplePerson: false,
      mobileDetected: false,
      noFace: false,
      notFocusing: false,
      error: error.message,
    });
  }
});

export default router;
