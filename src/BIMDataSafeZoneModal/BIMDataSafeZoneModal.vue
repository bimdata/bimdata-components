<script setup>
defineProps({
  width: {
    type: String,
    default: "350px",
  },
  iconName: {
    type: String,
    default: "warning",
  },
});
</script>

<template>
  <div class="overlay">
    <div class="safe-zone" :style="{ width }">
      <div class="safe-zone__icon">
        <BIMDataIcon :name="iconName" size="s" fill color="high" />
      </div>
      <h2 class="safe-zone__title">
        <slot name="title"></slot>
      </h2>
      <div class="safe-zone__text">
        <slot name="text"></slot>
      </div>
      <div class="safe-zone__actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;

  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: var(--color-primary);
    opacity: 0.9;
  }

  .safe-zone {
    z-index: 1;
    padding: 18px;
    border-radius: 10px;
    background-color: var(--color-white);

    &__icon {
      width: 40px;
      height: 40px;
      margin: auto;
      border-radius: 50px;
      background-color: var(--color-high-lighter);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    &__title {
      text-align: center;
    }

    &__text {
      margin: calc(var(--spacing-unit) * 2) 0;
      text-align: center;
      color: var(--color-granite);
    }

    &__actions {
      display: flex;
      justify-content: center;
      gap: var(--spacing-unit);
    }
  }
}
</style>
