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

defineEmits(["selection-changed"]);
</script>
<template>
  <GenericTreeNode v-bind="$props" @selection-changed="$emit('selection-changed', $event)">
    <template #icon>
      <BIMDataIconSpace2 size="xxs" />
    </template>
  </GenericTreeNode>
</template>
