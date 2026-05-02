# RSSHub 服务器部署指南

## 环境要求

- Ubuntu/Debian 服务器
- Docker 和 Docker Compose
- 公网 IP 或域名
- OpenClash 代理（多层机场架构）

## 部署步骤

### 1. 安装 Docker

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo apt install docker-compose-plugin -y

# 启动 Docker 并设置开机自启
sudo systemctl enable docker
sudo systemctl start docker

# 将当前用户加入 docker 组（可选，避免每次 sudo）
sudo usermod -aG docker $USER
```

### 2. 克隆 RSSHub

```bash
# 创建目录
mkdir -p ~/rsshub && cd ~/rsshub

# 克隆仓库
git clone --depth 1 https://github.com/DIYgod/RSSHub.git .
```

### 3. 创建配置文件

创建 `.env` 文件：

```bash
cat > .env << 'EOF'
# RSSHub 优化配置 - 1000+ 源、多层机场代理

# ========== 网络配置 ==========
PORT=1200
LISTEN_INADDR_ANY=1

# ========== 代理配置 ==========
# OpenClash 代理（修改为你的实际信息）
# 格式：socks5h://用户名:密码@OpenWrt_IP:端口
PROXY_URI=socks5h://username:password@192.168.1.1:7891

# ========== 缓存配置 ==========
CACHE_TYPE=redis
CACHE_EXPIRE=3600
CACHE_CONTENT_EXPIRE=28800
REDIS_URL=redis://redis:6379/

# ========== 请求控制 ==========
REQUEST_RETRY=1
REQUEST_TIMEOUT=10000

# ========== 跨域配置 ==========
ALLOW_ORIGIN=*

# ========== 安全配置 ==========
# 访问密钥（强烈建议设置）
# ACCESS_KEY=your_secret_key
DISALLOW_ROBOT=true

# ========== 平台配置 ==========
# YouTube（多个 Key 用逗号分隔）
# YOUTUBE_KEY=key1,key2

# Bilibili（多账号）
# BILIBILI_COOKIE_2267573=cookie1
# BILIBILI_COOKIE_1234567=cookie2

# Twitter/X（多账号轮换）
# TWITTER_USERNAME_1=account1
# TWITTER_PASSWORD_1=password1

# 小红书
# XIAOHONGSHU_COOKIE_1=cookie1

# Instagram
# IG_COOKIE=your_cookie
EOF
```

### 4. 创建 docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
services:
    rsshub:
        image: diygod/rsshub
        restart: always
        ports:
            - '1200:1200'
        environment:
            NODE_ENV: production
            CACHE_TYPE: redis
            REDIS_URL: 'redis://redis:6379/'
            PUPPETEER_WS_ENDPOINT: 'ws://browserless:3000'
        env_file:
            - .env
        depends_on:
            redis:
                condition: service_healthy
            browserless:
                condition: service_healthy
        extra_hosts:
            - "host.docker.internal:host-gateway"
        deploy:
            resources:
                limits:
                    memory: 2G
                reservations:
                    memory: 512M
        logging:
            driver: "json-file"
            options:
                max-size: "10m"
                max-file: "3"

    browserless:
        image: browserless/chrome
        restart: always
        environment:
            MAX_CONCURRENT_SESSIONS: 10
            PREBOOT_CHROME: true
        deploy:
            resources:
                limits:
                    memory: 2G
                reservations:
                    memory: 512M
        ulimits:
            core:
                hard: 0
                soft: 0
        healthcheck:
            test: ['CMD', 'curl', '-f', 'http://localhost:3000/pressure']
            interval: 30s
            timeout: 10s
            retries: 3

    redis:
        image: redis:alpine
        restart: always
        volumes:
            - redis-data:/data
        command: >
            redis-server
            --maxmemory 4gb
            --maxmemory-policy allkeys-lru
            --save 900 1
            --save 300 10
        healthcheck:
            test: ['CMD', 'redis-cli', 'ping']
            interval: 30s
            timeout: 10s
            retries: 5
        deploy:
            resources:
                limits:
                    memory: 5G
                reservations:
                    memory: 1G

volumes:
    redis-data:
EOF
```

### 5. 启动服务

```bash
docker compose up -d
```

### 6. 验证部署

```bash
# 检查服务状态
docker compose ps

# 测试访问
curl http://localhost:1200/

# 查看缓存配置
curl -s http://localhost:1200/ | grep "Cache Duration"
```

## 公网访问配置

### 方案 A：直接使用 IP + 端口

```bash
# 开放端口
sudo ufw allow 1200

# 访问地址
http://你的服务器IP:1200
```

### 方案 B：域名 + Nginx + HTTPS（推荐）

```bash
# 安装 Nginx
sudo apt install nginx certbot python3-certbot-nginx -y

# 创建配置
sudo tee /etc/nginx/sites-available/rsshub << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:1200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_read_timeout 300s;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/rsshub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 配置 HTTPS
sudo certbot --nginx -d your-domain.com
```

## 常用命令

```bash
# 查看日志
docker compose logs -f rsshub

# 查看错误日志
docker compose logs rsshub | grep -i error

# 重启服务
docker compose restart

# 更新镜像
docker compose pull && docker compose up -d

# 停止服务
docker compose down

# 查看缓存命中率
curl -s http://localhost:1200/ | grep "Cache Hit Ratio"

# 查看 Redis 内存
docker exec rsshub-redis-1 redis-cli info memory | grep used_memory_human
```

## 监控脚本

创建一个简单的监控脚本：

```bash
cat > ~/rsshub/monitor.sh << 'EOF'
#!/bin/bash
echo "=== RSSHub 状态监控 ==="
echo ""
echo "服务状态:"
docker compose ps
echo ""
echo "缓存命中率:"
curl -s http://localhost:1200/ | grep -E "Cache Hit Ratio|Cache Duration|Request Frequency|Health"
echo ""
echo "Redis 内存:"
docker exec rsshub-redis-1 redis-cli info memory | grep used_memory_human
echo ""
echo "最近错误:"
docker compose logs --tail=10 rsshub 2>&1 | grep -i error
EOF

chmod +x ~/rsshub/monitor.sh
```

运行监控：`./monitor.sh`
