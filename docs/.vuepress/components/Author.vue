<template>
  <span class="badge authors">
    By<a v-for="uid in uidList" :href="`https://github.com/${uid}`" target="_blank"> @{{ uid }}</a>
  </span>
</template>

<script>
export default {
  props: {
    uid: {
      type: String,
      default: 'DIYgod'
    },
  },
  computed: {
    uidList: function () {
      return this.uid.split(' ')
    }
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
