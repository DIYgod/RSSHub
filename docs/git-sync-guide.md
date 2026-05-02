# Git Fork 同步指南

## 概述

本文档说明如何保持与官方 RSSHub 同步，同时维护自己的修改。

## 架构说明

```
官方仓库 (DIYgod/RSSHub)
        ↓ upstream
    你的 Fork (your-username/RSSHub)
        ↓ origin
    本地仓库 (local)
```

## 初始配置

### 1. Fork 官方仓库

1. 访问 https://github.com/DIYgod/RSSHub
2. 点击右上角 **Fork** 按钮
3. 创建你自己的 Fork

### 2. 克隆你自己的 Fork

```bash
# 替换 YOUR_USERNAME 为你的 GitHub 用户名
git clone https://github.com/YOUR_USERNAME/RSSHub.git
cd RSSHub
```

### 3. 添加官方仓库为上游

```bash
# 添加官方仓库
git remote add upstream https://github.com/DIYgod/RSSHub.git

# 查看远程仓库
git remote -v
# 输出：
# origin    https://github.com/YOUR_USERNAME/RSSHub.git (fetch)
# origin    https://github.com/YOUR_USERNAME/RSSHub.git (push)
# upstream  https://github.com/DIYgod/RSSHub.git (fetch)
# upstream  https://github.com/DIYgod/RSSHub.git (push)
```

## 日常工作流程

### 同步官方更新

```bash
# 1. 获取官方最新代码
git fetch upstream

# 2. 切换到主分支
git checkout master

# 3. 合并官方更新
git merge upstream/master

# 4. 推送到你的 Fork
git push origin master
```

### 提交自己的修改

```bash
# 1. 创建新分支（推荐）
git checkout -b my-config

# 2. 修改文件
# ... 编辑 .env, docker-compose.yml, docs/ 等

# 3. 提交修改
git add .
git commit -m "feat: 自定义配置和文档"

# 4. 推送到你的 Fork
git push origin my-config
```

### 保持分支同步

```bash
# 切换到你的分支
git checkout my-config

# 合并官方最新更新
git merge upstream/master

# 解决冲突（如果有）
# ...

# 推送
git push origin my-config
```

## 推荐的分支策略

```
master          # 保持与官方同步，不修改
  └── my-config # 你的自定义配置分支
        └── docs # 文档分支（可选）
```

### 创建配置分支

```bash
# 从 master 创建配置分支
git checkout master
git checkout -b my-config

# 在这个分支上修改配置文件
# .env, docker-compose.yml, docs/ 等

# 提交并推送
git add .
git commit -m "feat: 自定义配置"
git push origin my-config
```

### 同步流程

```bash
# 切换到 master 同步官方更新
git checkout master
git fetch upstream
git merge upstream/master
git push origin master

# 切换到配置分支合并更新
git checkout my-config
git merge master
git push origin my-config
```

## 需要排除的文件

建议将敏感配置文件添加到 `.gitignore`：

```bash
# 添加到 .gitignore
.env
*.env.local
```

### 使用模板文件

```bash
# 创建模板文件
cp .env .env.example

# 修改 .env.example，移除敏感信息
# 提交模板文件
git add .env.example
git commit -m "docs: 添加配置模板"
```

## 快捷脚本

创建同步脚本 `sync.sh`：

```bash
#!/bin/bash
echo "=== 同步官方 RSSHub 更新 ==="

# 获取当前分支
current_branch=$(git branch --show-current)
echo "当前分支: $current_branch"

# 切换到 master
git checkout master

# 拉取官方更新
echo "正在获取官方更新..."
git fetch upstream
git merge upstream/master

# 推送到 Fork
echo "推送到 Fork..."
git push origin master

# 如果之前在其他分支，切换回去并合并
if [ "$current_branch" != "master" ]; then
    echo "切换回 $current_branch 并合并更新..."
    git checkout $current_branch
    git merge master
    git push origin $current_branch
fi

echo "=== 同步完成 ==="
```

使用方法：
```bash
chmod +x sync.sh
./sync.sh
```

## 常见问题

### Q: 如何查看差异？

```bash
# 查看与官方的差异
git log upstream/master..HEAD

# 查看文件差异
git diff upstream/master
```

### Q: 冲突怎么办？

```bash
# 查看冲突文件
git status

# 编辑冲突文件，选择保留的内容
# 然后提交
git add .
git commit -m "merge: 解决冲突"
```

### Q: 如何只同步特定文件？

```bash
# 从官方获取特定文件
git checkout upstream/master -- path/to/file
```

## 总结

| 操作 | 命令 |
|------|------|
| 获取官方更新 | `git fetch upstream` |
| 合并到 master | `git merge upstream/master` |
| 推送到 Fork | `git push origin master` |
| 创建配置分支 | `git checkout -b my-config` |
| 合并更新到分支 | `git merge master` |
