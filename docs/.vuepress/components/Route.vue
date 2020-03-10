<template>
<div class="routeBlock" :id="path">
  <p class="badge">
    <Badge text="支持 BT" type="tip" vertical="middle" v-if="supportBT"/> <Badge text="支持播客" type="tip" vertical="middle" v-if="supportPodcast"/> <Badge text="支持 Scihub" type="tip" vertical="middle" v-if="supportScihub"/>  <a target="_blank" href="/faq.html" v-if="anticrawler"><Badge text="反爬严格" vertical="middle" type="warn"/></a> <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar" v-if="radar"><Badge text="支持浏览器扩展" vertical="middle" type="tip"/></a>
  </p>
  <p class="author">
    作者: <a v-for="uid in author.split(' ')" :href="`https://github.com/${uid}`" target="_blank"> @{{ uid }} </a>
  </p>
  <p class="example">
    举例: <a :href="'https://rsshub.app'+ example " target="_blank">https://rsshub.app{{example}}</a>
  </p>
  <p class="path">
    路由: <code>{{ path }}</code>
  </p>
  <div v-if="path.match(/:.*?(\/|$)/g)">
  <p>
    参数:
  <ul><li class="params" v-for="(item, index) in path.match(/:.*?(\/|$)/g)">{{item.replace(':','').replace('/','').replace('?','')}}, {{(item.includes('?'))?'可选':'必选'}} - <span v-html="renderMarkdown(paramsDesc[index])"></span></li></ul> </p>
  </div>
  <div v-else><p>参数: 无</p></div>
  <slot></slot>
</div>
</template>
<script>
export default {
  props: {
    author: {
      type: String,
      default: 'DIYgod'
    },
    path: {
      type: String,
      required: true
    },
    example: {
      type: String,
      required: true
    },
    paramsDesc: {
      type: [Array, String],
      default: '无'
    },
    anticrawler: {
      type: String,
      default: null
    },
    supportBT: {
      type: String,
      default: null
    },
    supportPodcast: {
      type: String,
      default: null
    },
    supportScihub: {
      type: String,
      default: null
    },
    radar: {
      type: String,
      default: null
    },
  },
  methods: {
    renderMarkdown(item) {
    const md = require('markdown-it')({
            html: true,
    });
        return md.render(item);
    },
  }
}
</script>
<style>
li.params p {
  display: inline;
  }
.routeBlock {
  margin: 1rem 0 2rem;
}
#app .page .badge.tip {
  background-color: #FFB74D;
}
</style>
