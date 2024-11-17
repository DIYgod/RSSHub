// lib/routes/pinterest/user.js

import { getUserPins } from '../../utils/pinterest'; // 示例导入
import { Router } from 'express';

const router = Router();

router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const pins = await getUserPins(username);
        res.json(pins);
    } catch {
        res.status(500).send('Error retrieving user pins');
    }
});

export default router;
