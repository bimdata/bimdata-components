<template>
  <div class="generic-tree-node">
    <slot name="icon"></slot>

    <BIMDataTextbox class="text" :text="node.text" />

    <div class="end">
      <slot name="end"></slot>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
});
</script>

<style scoped>
.generic-tree-node {
  width: 100%;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing-unit) / 2);

  .text {
    width: 0 !important;
    flex-grow: 1;
  }

  .end {
    margin-left: auto;
  }
}
</style>
