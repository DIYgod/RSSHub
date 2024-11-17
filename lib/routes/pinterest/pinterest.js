// lib/routes/pinterest.js
const { Router } = require('express');
const router = Router();

router.get('/user/:username', async (req, res) => {
    const { username } = req.params;
    // 在此处添加抓取 Pinterest 用户数据的逻辑
    res.json({ message: `Fetching data for Pinterest user: ${username}` });
});

module.exports = router;
