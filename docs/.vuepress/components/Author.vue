<template>
  <span class="badge">
    By <a :href="`https://github.com/${uid}`">@{{ uid }}</a>
  </span>
</template>

<script>
export default {
  props: {
    uid: {
      type: String,
      default: 'DIYgod'
    },
  }
}
</script>

<style lang="stylus" scoped>
.badge
  display inline-block
  font-size 14px
  height 18px
  line-height 18px
  border-radius 3px
  padding 0 6px
  color white
  margin-right 5px
  vertical-align top
  background-color #F5712C
a
  color #fff
</style>
