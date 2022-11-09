<template>
  <ParentLayout>
    <template #sidebar-top>
      <CarbonAds />
    </template>
    <template #page-bottom>
      <div class="wwads-cn wwads-vertical wwads-sticky" data-id="193" style="max-width:180px"></div>
    </template>
  </ParentLayout>
</template>

<script>
import ParentLayout from '@parent-theme/layouts/Layout.vue'
import CarbonAds from '@theme/components/CarbonAds.vue'

export default {
  name: 'Layout',

  components: {
    ParentLayout,
    CarbonAds,
  }
}
</script>
