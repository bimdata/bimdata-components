<script setup>
import { watch } from "vue";
import GenericTreeNode from "./GenericTreeNode.vue";

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

watch(
  () => props.node,
  node => {
    if (node.children.length === 0) {
      node.disabledRef.value = true;
      node.selectedRef.value = false;
    }
  },
  { immediate: true }
);
</script>
<template>
  <GenericTreeNode v-bind="$props">
    <template #icon>
      <BIMDataIconZone2 v-if="node.id === 1" size="xxs" />
      <BIMDataIconPlan v-if="node.id === 2" size="xxs" />
    </template>

    <template #end>
      <div v-if="node.children?.length > 0" class="count">
        {{ node.children.length }}
      </div>
    </template>
  </GenericTreeNode>
</template>

<style scoped>
.count {
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 3px;
  background-color: var(--color-primary);
  font-size: 0.8rem;
  color: var(--color-white);

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
