# RSSHub 项目总结

## 项目概述

本项目是 RSSHub 的自部署版本，针对 1000+ RSS 源进行了优化配置。

## 环境信息

| 项目 | 配置 |
|------|------|
| 部署方式 | Docker Compose |
| 服务器内存 | 35GB 可用 |
| 代理 | OpenClash 多层机场（5个机场，3层故障转移） |
| RSS 源数量 | 1000+ |

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Compose                        │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   RSSHub    │───▶│    Redis    │    │  Browserless│  │
│  │  (Port 1200)│    │  (4GB缓存)  │    │ (Puppeteer) │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                                               │
│         ▼                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │              OpenClash 代理                       │   │
│  │  第一层: 机场A + 机场B → 第二层: 机场C + 机场D    │   │
│  │              → 第三层: 机场E                       │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 核心配置

### 缓存配置
- 路由缓存：1 小时
- 内容缓存：8 小时
- Redis 内存：4GB

### 内存分配
| 服务 | 内存限制 |
|------|---------|
| RSSHub | 2GB |
| Browserless | 2GB |
| Redis | 5GB |

### 防封策略
- 多账号轮换（Twitter、Instagram、小红书）
- 多 API Key 轮换（YouTube）
- 长缓存时间减少请求
- 多层机场分散风险

## 文件结构

```
rsshub/
├── .env                    # 主配置文件
├── docker-compose.yml      # Docker 配置
└── docs/
    ├── README.md           # 文档索引
    ├── server-deploy.md    # 服务器部署指南
    ├── anti-ban-guide.md   # 防封策略指南
    ├── config-reference.md # 配置参数详解
    ├── proxy-setup.md      # 代理配置指南
    └── faq.md              # 常见问题解答
```

## 快速命令

```bash
# 启动服务
docker compose up -d

# 查看状态
docker compose ps

# 查看日志
docker compose logs -f rsshub

# 查看缓存命中率
curl -s http://localhost:1200/ | grep "Cache Hit Ratio"

# 重启服务
docker compose restart

# 更新镜像
docker compose pull && docker compose up -d
```

## 平台配置清单

| 平台 | 风险等级 | 需要配置 | 状态 |
|------|---------|---------|------|
| YouTube | 🟢 低 | API Key | 待配置 |
| Bilibili | 🟡 中 | Cookie | 待配置 |
| Twitter/X | 🔴 高 | 账号密码 | 待配置 |
| Instagram | 🔴 高 | Cookie/账号 | 待配置 |
| 小红书 | 🔴 高 | Cookie | 待配置 |
| 微博 | 🟡 中 | Cookie | 待配置 |
| 知乎 | 🟡 中 | Cookie | 待配置 |

## 注意事项

1. **代理配置**：修改 `.env` 中的 `PROXY_URI` 为实际 OpenClash 地址
2. **访问密钥**：建议设置 `ACCESS_KEY` 防止滥用
3. **平台凭证**：根据需要配置各平台的 API Key 或 Cookie
4. **刷新频率**：RSS 阅读器建议设置 1-4 小时刷新间隔

## 相关链接

- RSSHub 官方文档：https://rsshub.netlify.app/zh/
- RSSHub 路由文档：https://rsshub.netlify.app/zh/routes/
- RSSHub GitHub：https://github.com/DIYgod/RSSHub
