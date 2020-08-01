<template>
<div class="routeBlock" :id="path">
  <p class="badge">
    <Badge text="support BT" type="tip" vertical="middle" v-if="supportBT"/> <Badge text="support podcast" type="tip" vertical="middle" v-if="supportPodcast"/> <a target="_blank" href="/en/faq.html" v-if="anticrawler"><Badge text="strict anti-crawler policy" vertical="middle" type="warn"/></a> <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar" v-if="radar"><Badge text="support browser extension" vertical="middle" type="tip"/></a>
  </p>
  <p class="author">
    Author: <a v-for="uid in author.split(' ')" :href="`https://github.com/${uid}`" target="_blank"> @{{ uid }} </a>
  </p>
  <p  class="example">
    Example: <a :href="'https://rsshub.app'+ example " target="_blank">https://rsshub.app{{example}}</a>
  </p>
  <p class="path">
    Route: <code>{{ path }}</code>
  </p>
  <div v-if="path.match(/(?<=:).*?(?=\/|$)/g)">
  <p>
    Parameters:
  <ul><li class="params" v-for="(item, index) in path.match(/(?<=:).*?(?=\/|$)/g)">{{item.replace('?','')}}, {{(item.includes('?'))?'optional':'required'}} - <span v-html="renderMarkdown(paramsDesc[index])"></span></li></ul> </p>
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
