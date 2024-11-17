// lib/routes/pinterest/pinterest.js

import { getPinterestData } from '../../utils/pinterest'; // 示例导入，假设你有这个函数
import { Router } from 'express';

const router = Router();

// 你的路由处理逻辑
router.get('/:username', async (req, res) => {
    const { username } = req.params;
    try {
        const data = await getPinterestData(username);
        res.json(data);
    } catch {
        res.status(500).send('Error retrieving Pinterest data');
    }
});

export default router;
