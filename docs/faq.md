# RSSHub 常见问题解答

## 缓存相关

### Q: 缓存 1 小时是什么意思？

**A**: RSSHub 在 1 小时内只会向目标网站请求 1 次，期间 RSS 阅读器的请求都返回缓存内容。

```
时间线示例：
08:00  第一次请求 → RSSHub 向目标网站获取数据 → 缓存 1 小时
08:08  RSS阅读器请求 → 直接返回缓存（不请求目标网站）
08:16  RSS阅读器请求 → 直接返回缓存（不请求目标网站）
09:00  缓存过期
09:08  RSS阅读器请求 → RSSHub 重新获取数据
```

### Q: Redis 4GB 缓存能存多少内容？

**A**: 约 4000-5000 个 RSS 源的最新内容。每个源缓存元数据 + 最新 10-20 条文章。

## 代理相关

### Q: 使用代理会导致我的 IP 被封吗？

**A**: 不会。目标网站看到的是代理服务器（机场节点）的 IP，不是你的真实 IP。

```
你的设备 → OpenClash → 机场节点 → 目标网站
(IP: A)    (路由器B)    (IP: C)

目标网站只能看到 IP: C
```

### Q: 机场节点被封了怎么办？

**A**: 
1. OpenClash 会自动切换到其他节点
2. 在 OpenClash 中移除被封节点
3. 等待一段时间后可能自动解封

### Q: 可以用日常使用的机场吗？

**A**: 可以，但建议：
- 少量抓取：风险低，可以用
- 大量抓取（1000+ 源）：建议单独购买便宜机场或自建

## 防封相关

### Q: 不同平台被封风险如何？

| 风险等级 | 平台 | 建议 |
|---------|------|------|
| 🔴 高风险 | Twitter/X、Instagram、小红书 | 必须配置账号/Cookie + 代理 |
| 🟡 中风险 | Bilibili、微博、知乎 | 需要 Cookie，控制频率 |
| 🟢 低风险 | YouTube、GitHub、Telegram | API 方式，相对稳定 |

### Q: RSS 阅读器刷新频率怎么设置？

**A**: 按平台风险等级设置：

| 平台类型 | 建议刷新间隔 |
|---------|-------------|
| 高风险平台 | 2-4 小时 |
| 中风险平台 | 1-2 小时 |
| 低风险平台 | 30分钟-1小时 |

### Q: 如何配置多账号？

**A**: 不同平台配置方式不同：

```env
# Twitter 多账号
TWITTER_USERNAME_1=account1
TWITTER_PASSWORD_1=password1
TWITTER_USERNAME_2=account2
TWITTER_PASSWORD_2=password2

# Bilibili 多账号
BILIBILI_COOKIE_2267573=cookie1
BILIBILI_COOKIE_1234567=cookie2

# YouTube 多 Key
YOUTUBE_KEY=key1,key2,key3
```

## 部署相关

### Q: 内存配置建议？

| 服务器内存 | RSSHub | Redis | Browserless |
|-----------|--------|-------|-------------|
| 4GB | 1G | 1G | 1G |
| 8GB | 2G | 2G | 2G |
| 16GB+ | 2G | 4G | 2G |

### Q: 如何查看服务状态？

```bash
# 服务状态
docker compose ps

# 缓存命中率
curl -s http://localhost:1200/ | grep "Cache Hit Ratio"

# 错误日志
docker compose logs rsshub | grep -i error

# Redis 内存
docker exec rsshub-redis-1 redis-cli info memory | grep used_memory_human
```

### Q: 如何更新 RSSHub？

```bash
docker compose pull && docker compose up -d
```

## 使用相关

### Q: 如何生成 RSS 订阅链接？

**A**: 根据路由文档拼接：

```
例子：订阅 Twitter 用户 DIYgod

路由文档：/twitter/user/:id
替换 :id 为用户名 → /twitter/user/DIYgod
加上你的域名 → http://你的IP:1200/twitter/user/DIYgod
```

### Q: 如何设置访问密钥？

**A**: 
1. 在 `.env` 中设置：`ACCESS_KEY=your_secret_key`
2. 访问时添加参数：`http://IP:1200/路由?key=your_secret_key`

### Q: Cookie 如何获取？

**A**: 通用方法：
1. 登录目标网站
2. F12 打开开发者工具
3. 切换到 Network 或 Application 标签
4. 刷新页面，找到请求中的 Cookie

不同平台详细方法见 [anti-ban-guide.md](anti-ban-guide.md#cookie-获取方法)
