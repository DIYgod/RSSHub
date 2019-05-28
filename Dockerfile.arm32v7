FROM arm32v7/node:8.16-slim 
MAINTAINER junfeng <junfeng_pan96@qq.com>

# 使用163镜像，若不需要可以注释
RUN echo -e "deb http://mirrors.ustc.edu.cn/debian/ stretch main \ndeb http://mirrors.ustc.edu.cn/debian/ stretch-updates main " > /etc/apt/sources.list

# 复用缓存, 如果github文件下载失败，可以手动下载，放至项目根目录，注释下方ADD语句，改用下方COPY语句
ADD https://github.com/junfengP/dumb-init/releases/download/v1.2.0/dumb-init-armhf  /usr/local/bin/dumb-init
# COPY dumb-init-armhf  /usr/local/bin/dumb-init
RUN chmod +x /usr/local/bin/dumb-init

ARG USE_CHINA_NPM_REGISTRY=1;
ENV NODE_ENV production

WORKDIR /app

COPY package.json /app

RUN if [ "$USE_CHINA_NPM_REGISTRY" = 1 ]; then \
  echo 'use npm mirror'; npm config set registry https://registry.npm.taobao.org; \
  fi;

# 跳过Chromium下载，puppeteer不会下载chrome-arm
RUN export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
		&& npm install --production

COPY . /app

EXPOSE 1200
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start"]
