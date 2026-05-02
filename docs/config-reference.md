# RSSHub 配置参数详解

本文档详细说明 RSSHub 的各项配置参数。

## 缓存配置

### CACHE_TYPE
- **说明**：缓存类型
- **可选值**：`redis`、`memory`、`null`
- **默认值**：`memory`
- **推荐**：`redis`（大流量场景）

### CACHE_EXPIRE
- **说明**：路由缓存时间（秒）
- **默认值**：`300`（5分钟）
- **推荐值**：
  - 少量源：`600`（10分钟）
  - 500+ 源：`1800`（30分钟）
  - 1000+ 源：`3600`（1小时）

### CACHE_CONTENT_EXPIRE
- **说明**：内容缓存时间（秒）
- **默认值**：`3600`（1小时）
- **推荐值**：
  - 低风险平台：`3600`（1小时）
  - 高风险平台：`14400`（4小时）或更长

### REDIS_URL
- **说明**：Redis 连接地址
- **格式**：`redis://host:port/`
- **Docker 环境**：`redis://redis:6379/`

## 代理配置

### PROXY_URI
- **说明**：代理服务器地址
- **格式**：
  - 无密码：`socks5h://IP:端口`
  - 有密码：`socks5h://用户名:密码@IP:端口`
- **示例**：
  ```
  socks5h://192.168.1.1:7891
  socks5h://user:pass@192.168.1.1:7891
  ```

### PROXY_URL_REGEX
- **说明**：启用代理的 URL 正则表达式
- **默认值**：`.*`（全部启用）
- **示例**：只对特定网站使用代理
  ```
  PROXY_URL_REGEX=twitter\.com|instagram\.com|youtube\.com
  ```

## 请求控制

### REQUEST_RETRY
- **说明**：请求失败重试次数
- **默认值**：`2`
- **推荐值**：`1`（减少触发风控）

### REQUEST_TIMEOUT
- **说明**：请求超时时间（毫秒）
- **默认值**：`3000`
- **推荐值**：`10000`（网络不稳定时）

## 安全配置

### ACCESS_KEY
- **说明**：访问密钥，防止他人滥用
- **使用方式**：`http://IP:1200/路由?key=your_key`
- **推荐**：设置一个复杂字符串

### DISALLOW_ROBOT
- **说明**：禁止搜索引擎收录
- **默认值**：`true`

## 平台配置

### YouTube
```env
# 单个 Key
YOUTUBE_KEY=your_api_key

# 多个 Key 轮换（推荐）
YOUTUBE_KEY=key1,key2,key3
```

### Bilibili
```env
# 单账号
BILIBILI_COOKIE_2267573=your_sessdata

# 多账号
BILIBILI_COOKIE_2267573=cookie1
BILIBILI_COOKIE_1234567=cookie2
```

### Twitter/X
```env
# 单账号
TWITTER_USERNAME=account
TWITTER_PASSWORD=password

# 多账号
TWITTER_USERNAME_1=account1
TWITTER_PASSWORD_1=password1
TWITTER_USERNAME_2=account2
TWITTER_PASSWORD_2=password2
```

### 小红书
```env
# 单账号
XIAOHONGSHU_COOKIE=your_cookie

# 多账号
XIAOHONGSHU_COOKIE_1=cookie1
XIAOHONGSHU_COOKIE_2=cookie2
```

### Instagram
```env
# 账号方式
IG_USERNAME=your_username
IG_PASSWORD=your_password

# Cookie 方式（更稳定）
IG_COOKIE=your_cookie
```

## 内存配置建议

| 服务器内存 | RSSHub | Redis | Browserless | 总计 |
|-----------|--------|-------|-------------|------|
| 4GB | 1G | 1G | 1G | 3G |
| 8GB | 2G | 2G | 2G | 6G |
| 16GB+ | 2G | 4G | 2G | 8G |

## Redis 优化参数

```bash
redis-server \
  --maxmemory 4gb \              # 最大内存
  --maxmemory-policy allkeys-lru \  # 内存淘汰策略
  --save 900 1 \                 # 15分钟内至少1次写入则保存
  --save 300 10 \                # 5分钟内至少10次写入则保存
  --save 60 10000                # 1分钟内至少10000次写入则保存
```

## 日志配置

### LOGGER_LEVEL
- **说明**：日志级别
- **可选值**：`error`、`warn`、`info`、`debug`
- **推荐**：`info`

### NO_LOGFILES
- **说明**：是否禁用日志文件
- **默认值**：`false`

### SHOW_LOGGER_TIMESTAMP
- **说明**：控制台显示时间戳
- **默认值**：`false`
