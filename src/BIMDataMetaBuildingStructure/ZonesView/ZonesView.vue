<script setup>
import { computed, shallowRef, triggerRef } from "vue";
import { buildZonesTree } from "../meta-building-structure.js";
import SpaceNode from "../StructureTreeNodes/SpaceNode.vue";
import ZoneNode from "../StructureTreeNodes/ZoneNode.vue";

defineOptions({
  components: {
    SpaceNode,
    ZoneNode,
  }
});

const props = defineProps({
  model: {
    type: Object,
    required: true,
  },
  storey: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["selection-changed"]);

const data = computed(() => buildZonesTree(props.model, props.storey));

const selection = shallowRef(new Set());

function isSelected(node) {
  return selection.value.has(node.id);
}

function onSelectionChanged(node) {
  if (selection.value.has(node.id)) {
    selection.value.delete(node.id);
  } else {
    selection.value.add(node.id);
  }
  triggerRef(selection);
  emit("selection-changed", node);
}

function getNodeComponent(node, depth) {
  if (node.zone) {
    return "ZoneNode";
  }
  if (node.space) {
    return "SpaceNode";
  }
}
</script>

<template>
  <div class="zones-view">
    <BIMDataTree :data="data">
      <template #node="{ node, depth }">
        <component
          :is="getNodeComponent(node, depth)"
          :node="node"
          :depth="depth"
          :selected="isSelected(node)"
          @selection-changed="onSelectionChanged(node)"
        />
      </template>
    </BIMDataTree>
  </div>
</template>

<style scoped>
.zones-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}
</style>
