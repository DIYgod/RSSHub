# RSSHub 服务器部署指南

## 环境要求

- Ubuntu/Debian 服务器
- Docker 和 Docker Compose
- 公网 IP 或域名
- 代理服务（用于访问外网平台）

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
# RSSHub 配置文件 - 1000+ 源优化版本

# ========== 网络配置 ==========
PORT=1200
LISTEN_INADDR_ANY=1

# ========== 代理配置 ==========
# 重要：修改为你的代理地址
# 格式：socks5h://host:port 或 http://host:port
PROXY_URI=socks5h://127.0.0.1:1080

# ========== 缓存配置 ==========
CACHE_TYPE=redis
CACHE_EXPIRE=3600
CACHE_CONTENT_EXPIRE=28800
REDIS_URL=redis://redis:6379/

# ========== 跨域配置 ==========
ALLOW_ORIGIN=*

# ========== 平台配置 ==========
# 根据需要取消注释并填入值

# YouTube
# YOUTUBE_KEY=your_api_key

# Bilibili
# BILIBILI_COOKIE_xxx=your_cookie

# Twitter/X
# TWITTER_USERNAME=your_username
# TWITTER_PASSWORD=your_password

# 小红书
# XIAOHONGSHU_COOKIE=your_cookie

# ========== 安全配置 ==========
# 访问密钥（可选，防止他人滥用）
# ACCESS_KEY=your_secret_key

# 禁止搜索引擎收录
DISALLOW_ROBOT=true
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
            - redis
            - browserless
        # 35GB 内存充裕，分配更多资源提升性能
        deploy:
            resources:
                limits:
                    memory: 4G
                reservations:
                    memory: 1G

    browserless:
        image: browserless/chrome
        restart: always
        deploy:
            resources:
                limits:
                    memory: 4G
                reservations:
                    memory: 1G
        ulimits:
            core:
                hard: 0
                soft: 0

    redis:
        image: redis:alpine
        restart: always
        volumes:
            - redis-data:/data
        # 8GB Redis 缓存，可存储大量 RSS 数据
        command: redis-server --maxmemory 8gb --maxmemory-policy allkeys-lru
        deploy:
            resources:
                limits:
                    memory: 10G
                reservations:
                    memory: 2G

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
```

## 公网访问配置

### 方案 A：直接使用 IP + 端口

如果服务器有公网 IP，可以直接访问：
```
http://你的服务器IP:1200
```

**注意**：需要在防火墙开放 1200 端口：
```bash
sudo ufw allow 1200
```

### 方案 B：使用域名 + Nginx 反向代理（推荐）

#### 1. 安装 Nginx

```bash
sudo apt install nginx -y
```

#### 2. 配置反向代理

```bash
sudo cat > /etc/nginx/sites-available/rsshub << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 改成你的域名

    location / {
        proxy_pass http://127.0.0.1:1200;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_read_timeout 300s;
    }
}
EOF

# 启用配置
sudo ln -s /etc/nginx/sites-available/rsshub /etc/nginx/sites-enabled/

# 测试并重启
sudo nginx -t && sudo systemctl reload nginx
```

#### 3. 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取证书
sudo certbot --nginx -d your-domain.com
```

## 常用命令

```bash
# 查看日志
docker compose logs -f rsshub

# 重启服务
docker compose restart

# 更新镜像
docker compose pull && docker compose up -d

# 停止服务
docker compose down

# 查看缓存命中率
curl -s http://localhost:1200/ | grep "Cache Hit Ratio"
```

## 安全建议

1. **设置访问密钥**：在 `.env` 中添加 `ACCESS_KEY=your_secret_key`
2. **使用 HTTPS**：防止流量被监听
3. **限制访问**：通过 Nginx 或防火墙限制访问来源
4. **定期更新**：保持 RSSHub 版本最新