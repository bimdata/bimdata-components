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
</script>
<template>
  <GenericTreeNode v-bind="$props">
    <template #icon>
      <BIMDataIconSpace2 size="xxs" />
    </template>
  </GenericTreeNode>
</template>
