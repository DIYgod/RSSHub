<template>
  <ParentLayout>
    <template #sidebar-top>
      <CarbonAds />
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
