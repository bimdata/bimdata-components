<script setup>
import { computed, ref, watch } from "vue";
import { buildStructureTree, flattenTree, setupTree } from "../meta-building-structure.js";
import PlanNode from "../StructureTreeNodes/PlanNode.vue";
import SpaceNode from "../StructureTreeNodes/SpaceNode.vue";
import StructureRootNode from "../StructureTreeNodes/StructureRootNode.vue";
import ZoneNode from "../StructureTreeNodes/ZoneNode.vue";

defineOptions({
  components: {
    PlanNode,
    SpaceNode,
    StructureRootNode,
    ZoneNode,
  }
});

const props = defineProps({
  model: {
    type: Object,
    default: null,
  },
  storey: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["selection-changed"]);

const tree = computed(() => setupTree(buildStructureTree(props.model, props.storey)));
const nodes = computed(() => flattenTree(tree.value));

function getNodeComponent(node, depth) {
  if (depth === 0) {
    return "StructureRootNode";
  }
  if (node.zone) {
    return "ZoneNode";
  }
  if (node.space) {
    return "SpaceNode";
  }
  if (node.plan) {
    return "PlanNode";
  }
}

const searchText = ref("");

watch(searchText, value => {
  const text = value.trim().toLowerCase();

  nodes.value.forEach(node => {
    node.visibleRef.value = !text || node.text.toLowerCase().includes(text);
  });
});
</script>

<template>
  <div class="structure-view">
    <BIMDataSearch
      width="100%"
      color="primary"
      :placeholder="$t('MetaBuildingStructure.StructureView.search')"
      v-model="searchText"
    />
    <BIMDataTree :data="tree">
      <template #node="{ node, depth }">
        <component
          :is="getNodeComponent(node, depth)"
          :node="node"
          :depth="depth"
          @selection-changed="emit('selection-changed', $event)"
        />
      </template>
    </BIMDataTree>
  </div>
</template>

<style scoped>
.structure-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}
</style>
