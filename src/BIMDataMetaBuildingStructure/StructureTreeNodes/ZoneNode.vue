<template>
  <GenericTreeNode v-bind="$props">
    <template #icon>
      <BIMDataIconZone2 size="xxs" />
    </template>

    <template #end>
      <div
        v-if="node.zone.color && node.zone.color !== 'null'" class="color"
        :style="{ backgroundColor: cssColor(node.zone.color) }"
      ></div>
    </template>
  </GenericTreeNode>
</template>

<script setup>
import GenericTreeNode from "./GenericTreeNode.vue";

defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
});

const cssColor = color => `#${Number(color).toString(16).padStart(6, 0)}`;
</script>

<style scoped>
.color {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: solid var(--color-white) 2px;
  box-shadow: var(--box-shadow);
  margin: 0 calc(var(--spacing-unit) / 2);
}
</style>
