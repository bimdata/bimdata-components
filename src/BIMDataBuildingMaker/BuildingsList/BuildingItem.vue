<script setup>
import { ref } from "vue";

defineProps({
  metaBuilding: {
    type: Object,
    required: true,
  },
});

defineEmits([
  "open-metaBuilding",
  "update-metaBuilding",
  "delete-metaBuilding"
]);

const isOpenAction = ref(false);
</script>

<template>
  <div class="building-item" @click="$emit('open-metaBuilding', metaBuilding)">
    <BIMDataIconBuilding size="m" fill color="primary" />
    <div class="building-item__name">
      <BIMDataTextbox :text="metaBuilding.name" />
    </div>

    <div
      class="building-item__actions"
      @click.stop="() => {}"
      v-click-away="() => (isOpenAction = false)"
    >
      <BIMDataButton ghost rounded icon @click="isOpenAction = !isOpenAction">
        <BIMDataIconEllipsis size="l" fill color="granite-light" />
      </BIMDataButton>

      <transition name="fade">
        <div class="building-item__actions__menu" v-show="isOpenAction">
          <BIMDataButton
            ghost
            square
            @click="$emit('update-metaBuilding', metaBuilding)"
          >
            {{ $t("BIMDataComponents.t.rename") }}
          </BIMDataButton>
          <BIMDataButton
            color="high"
            ghost
            square
            @click="$emit('delete-metaBuilding', metaBuilding)"
          >
            {{ $t("BIMDataComponents.t.delete") }}
          </BIMDataButton>
        </div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
.building-item {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  gap: var(--spacing-unit);
  padding: calc(var(--spacing-unit) / 2) var(--spacing-unit);
  border-radius: 4px;

  background-color: var(--color-silver-light);
  cursor: pointer;

  .building-item__name {
    width: calc(100% - 2 * var(--spacing-unit) - 22px - 32px);
  }

  .building-item__actions {
    position: relative;

    .building-item__actions__menu {
      width: 180px;
      position: absolute;
      z-index: 1;
      top: 30px;
      right: 0;
      display: flex;
      flex-direction: column;
      padding: calc(var(--spacing-unit) / 2) 0;

      box-shadow: var(--box-shadow);
      background-color: var(--color-white);
    }
  }
}
</style>
