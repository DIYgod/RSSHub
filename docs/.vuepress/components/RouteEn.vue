<template>
<div class="routeBlock" :id="path">
  <p class="badge">
    <Badge text="Support BT" vertical="middle" type="tip" v-if="supportBT"/>
    <Badge text="Support Podcast" vertical="middle" type="tip" v-if="supportPodcast"/>
    <Badge text="Support Sci-Hub" vertical="middle" type="tip" v-if="supportScihub"/>
    <Badge text="Rely on Puppeteer" vertical="middle" type="warn" v-if="puppeteer"/>
    <a target="_blank" href="/en/faq.html" v-if="anticrawler"><Badge text="Strict anti-crawler policy" vertical="middle" type="warn"/></a>
    <a target="_blank" href="/en/install/" v-if="selfhost"><Badge text="Self-host only" vertical="middle" type="warn"/></a>
    <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar" v-if="radar"><Badge text="Support browser extension" vertical="middle" type="tip"/></a>
    <a target="_blank" href="https://github.com/Cay-Zhang/RSSBud" v-if="rssbud"><Badge text="Support RSSBud" vertical="middle" type="tip"/></a>
  </p>
  <p class="author">
    Author: <a v-for="uid in author.split(' ')" :href="`https://github.com/${uid}`" target="_blank"> @{{ uid }} </a>
  </p>
  <p  class="example">
    <span>Example:</span> <a :href="demoUrl" target="_blank">{{demoUrl}}</a> <!--<img :src="'https://img.shields.io/website?label=status&style=flat-square&cacheSeconds=86400&url=' + encodeURIComponent(encodeURI(demoUrl))">-->
  </p>
  <p class="path">
    Route: <code>{{ path }}</code>
  </p>
  <div v-if="path.match(/(?<=:).*?(?=\/|$)/g)">
  <p>
    Parameters:
  </p>
  <ul><li class="params" v-for="(item, index) in path.match(/(?<=:).*?(?=\/|$)/g)"><code>{{item.replace(/:|\?|\+|\*/g,'')}}</code>, {{{'?':'optional','*':'zero or more','+':'one or more'}[item[item.length-1]]||'required'}} - <span v-html="renderMarkdown(paramsDesc[index])"></span></li></ul>
  </div>
  <div v-else><p>Parameters: N/A</p></div>
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
      default: 'N/A'
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
    puppeteer: {
      type: String,
      default: null
    }
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
