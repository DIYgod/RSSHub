# RSSHub 防封策略指南

## 平台风险等级与刷新建议

### 🔴 高风险平台（严格风控）

| 平台 | 建议刷新间隔 | 多账号建议 | 备注 |
|------|-------------|-----------|------|
| **Twitter/X** | 2-4 小时 | 3+ 账号 | 极易封号，使用非重要账号 |
| **Instagram** | 2-4 小时 | 2-3 账号 | 需要代理 |
| **小红书** | 2-4 小时 | 2-3 账号 | 风控严格，Cookie 易过期 |

### 🟡 中风险平台

| 平台 | 建议刷新间隔 | 多账号建议 | 备注 |
|------|-------------|-----------|------|
| **Bilibili** | 1-2 小时 | 1-2 账号 | 部分路由需要 Cookie |
| **微博** | 1-2 小时 | 1-2 账号 | 可能需要登录 |
| **知乎** | 1-2 小时 | 1 账号 | 关注时间线需要 Cookie |

### 🟢 低风险平台

| 平台 | 建议刷新间隔 | 配置方式 | 备注 |
|------|-------------|---------|------|
| **YouTube** | 30分钟-1小时 | API Key | 有配额限制，可多 Key |
| **GitHub** | 30分钟 | 无需配置 | 稳定 |
| **Telegram** | 30分钟 | Bot Token | 稳定 |

## RSS 阅读器配置建议

### 按平台分组设置刷新间隔

如果你的 RSS 阅读器支持分组，可以这样设置：

```
分组 1 - 高风险平台
├── Twitter 源（刷新间隔：4 小时）
├── Instagram 源（刷新间隔：4 小时）
└── 小红书源（刷新间隔：4 小时）

分组 2 - 中风险平台
├── Bilibili 源（刷新间隔：2 小时）
├── 微博源（刷新间隔：2 小时）
└── 知乎源（刷新间隔：2 小时）

分组 3 - 低风险平台
├── YouTube 源（刷新间隔：1 小时）
├── GitHub 源（刷新间隔：1 小时）
└── 其他源（刷新间隔：1 小时）
```

## 多账号配置方法

### Twitter/X 多账号

```env
# 账号 1
TWITTER_USERNAME_1=user1
TWITTER_PASSWORD_1=pass1

# 账号 2
TWITTER_USERNAME_2=user2
TWITTER_PASSWORD_2=pass2
```

### Bilibili 多账号

```env
# 账号 1（对应 uid）
BILIBILI_COOKIE_2267573=cookie1

# 账号 2
BILIBILI_COOKIE_1234567=cookie2
```

### YouTube 多 API Key

```env
# 多个 Key 用逗号分隔
YOUTUBE_KEY=key1,key2,key3
```

## Cookie 获取方法

### Bilibili
1. 登录 bilibili.com
2. F12 -> Application -> Cookies
3. 找到 `SESSDATA` 的值

### 小红书
1. 登录 xiaohongshu.com
2. F12 -> Network -> 刷新页面
3. 找任意请求，复制 Cookie

### 微博
1. 登录 weibo.cn（手机版更稳定）
2. F12 -> Network -> 刷新页面
3. 复制 Cookie

### Instagram
1. 登录 instagram.com
2. F12 -> Application -> Cookies
3. 复制全部 Cookie

## 监控与告警

### 检查服务状态

```bash
# 查看缓存命中率
curl -s http://localhost:1200/ | grep "Cache Hit Ratio"

# 查看错误日志
docker compose logs rsshub | grep -i error

# 查看 Redis 内存使用
docker exec rsshub-redis-1 redis-cli info memory | grep used_memory_human
```

### 设置告警

可以配置监控脚本，当错误率过高时发送通知。

## 应急处理

### 如果被封了怎么办？

1. **立即停止请求**：`docker compose stop rsshub`
2. **更换账号**：更新 `.env` 中的 Cookie/账号
3. **等待冷却**：等待几小时到几天
4. **降低频率**：增加缓存时间，减少刷新频率
5. **更换 IP**：如果有代理，更换代理节点

## 最佳实践总结

1. ✅ **缓存时间设置合理**：1-8 小时
2. ✅ **多账号轮换**：高风险平台准备 2-3 个账号
3. ✅ **代理配置**：外网平台必须配置代理
4. ✅ **访问密钥**：设置 ACCESS_KEY 防止滥用
5. ✅ **分组管理**：按风险等级设置不同刷新频率
6. ✅ **监控日志**：定期检查错误率和缓存命中率
