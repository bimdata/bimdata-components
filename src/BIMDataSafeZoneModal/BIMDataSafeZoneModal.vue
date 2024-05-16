<template>
  <div class="overlay flex items-center justify-center">
    <div class="safe-zone p-18" :style="{ width }">
      <div class="safe-zone__icon">
        <BIMDataIcon :name="iconName" size="s" fill color="high" />
      </div>
      <h2 class="safe-zone__title"><slot name="title"></slot></h2>
      <div class="safe-zone__text"><slot name="text"></slot></div>
      <div class="safe-zone__actions flex">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    iconName: {
      type: String,
      default: "warning",
    },
    width: {
      type: String,
      default: "350px",
    },
  },
};
</script>

<style scoped lang="scss" src="./_BIMDataSafeZoneModal.scss"></style>
