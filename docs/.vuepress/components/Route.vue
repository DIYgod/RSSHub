<template>
<div class="routeBlock" :id="path">
  <p class="badge">
    <Badge text="支持 BT" type="tip" vertical="middle" v-if="supportBT"/> <Badge text="支持播客" type="tip" vertical="middle" v-if="supportPodcast"/> <Badge text="支持 Scihub" type="tip" vertical="middle" v-if="supportScihub"/>  <a target="_blank" href="/faq.html" v-if="anticrawler"><Badge text="反爬严格" vertical="middle" type="warn"/></a> <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar" v-if="radar"><Badge text="支持浏览器扩展" vertical="middle" type="tip"/></a> <a target="_blank" href="https://github.com/Cay-Zhang/RSSBud" v-if="rssbud"><Badge text="支持 RSSBud" vertical="middle" type="tip"/></a> <a target="_blank" href="https://docs.rsshub.app/install/" v-if="selfhost"><Badge text="仅支持自建" vertical="middle" type="warn"/></a>
  </p>
  <p class="author">
    作者: <a v-for="uid in author.split(' ')" :href="`https://github.com/${uid}`" target="_blank"> @{{ uid }} </a>
  </p>
  <p class="example">
    <span>举例:</span> <a :href="demoUrl" target="_blank">{{demoUrl}}</a> <img :src="'https://img.shields.io/website?label=status&style=flat-square&url=' + encodeURIComponent(encodeURI(demoUrl))">
  </p>
  <p class="path">
    路由: <code>{{ path }}</code>
  </p>
  <div v-if="path.match(/:.*?(\/|$)/g)">
  <p>
    参数:
  </p>
  <ul><li class="params" v-for="(item, index) in path.match(/:.*?(\/|$)/g)"><code>{{item.replace(':','').replace('/','').replace('?','')}}</code>, {{(item.includes('?'))?'可选':'必选'}} - <span v-html="renderMarkdown(paramsDesc[index])"></span></li></ul>
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
    rssbud: {
      type: String,
      default: null
    },
    selfhost: {
      type: String,
      default: null
    },
  },
  methods: {
    renderMarkdown(item, inline = true) {
    const md = require('markdown-it')({
            html: true,
    });
        return inline ? md.renderInline(item) : md.render(item);
    },
  },
  computed: {
      demoUrl: function () {
          return 'https://rsshub.app'+ this.example
      }
  }
}
</script>
