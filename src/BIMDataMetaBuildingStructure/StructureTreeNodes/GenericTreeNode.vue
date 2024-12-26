<template>
  <div class="generic-tree-node">
    <BIMDataCheckbox
      v-if="isSelectable"
      :disabled="isDisabled"
      :model-value="isSelected"
      @update:model-value="updateSelection"
    />

    <slot name="icon"></slot>

    <BIMDataTextbox class="text" :text="node.text" />

    <div class="end">
      <slot name="end"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, watch } from "vue";

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

const state = inject("BIMDataMetaBuildingStructure.state");

const isDisabled = computed(() => props.node.disabledRef.value);
const isSelectable = computed(() => state.selectable.value);
const isSelected = computed(() => props.node.selectedRef.value);

watch(isSelected, selected => state.onSelectionChanged({ node: props.node, selected }));

const updateSelection = selected => {
  props.node.selectedRef.value = selected;
  for (const x of props.node.ancestors()) {
    if (x.children.length < 2) {
      x.selectedRef.value = selected;
    } else {
      if (x.children.every(c => c.selectedRef.value === false)) {
        x.selectedRef.value = false;
      } else if (x.children.some(c => c.selectedRef.value === false)) {
        x.selectedRef.value = null;
      } else {
        x.selectedRef.value = true;
      }
    }
  } 
  for (const child of props.node.descendants()) {
    child.selectedRef.value = selected;
  }
};
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
