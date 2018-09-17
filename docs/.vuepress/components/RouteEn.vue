<template>
<div class="routeBlock" :id="path">
  <h4 :id=path class="name">{{name}} <Author :uid=author /> 
    <a :href="'#'+path" aria-hidden="true" class="header-anchor">#</a>
  </h4>
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
import Author from "./Author.vue"
export default {
  components:{
      'Author': Author
  },
  props: {
    author: {
      type: String,
      default: 'DIYgod'
    },
    name: {
      type: String,
      required: true 
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
    }
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
</style>
