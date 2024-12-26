<template>
  <div class="structure-view">
    <BIMDataSearch
      width="100%"
      color="primary"
      :placeholder="$t('BIMDataComponents.t.search')"
      v-model="searchText"
    />
    <BIMDataTree
      :data="tree"
      :highlighted-id="highlightedId"
      :selected-id="selectedId"
      @hover="onNodeHover"
      @click="onNodeClick"
    >
      <template #node="{ node, depth }">
        <component
          :is="node.component"
          :node="node"
          :depth="depth"
        />
      </template>
    </BIMDataTree>
  </div>
</template>

<script setup>
import { computed, inject, ref, watch } from "vue";
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

const state = inject("BIMDataMetaBuildingStructure.state");
const { storey, zones, highlightedId, selectedId } = state;

const tree = computed(() => setupTree(buildStructureTree(storey.value, zones.value)));
const nodes = computed(() => flattenTree(tree.value));

const searchText = ref("");

watch(searchText, value => {
  const text = value.trim().toLowerCase();

  nodes.value.forEach(node => {
    node.visibleRef.value = !text || node.text.toLowerCase().includes(text);
  });
});

watch(highlightedId, id => {
  let parent = nodes.value.find(x => x.id === id)?.parent;
  while (parent) {
    parent.expandedRef.value = true;
    parent = parent.parent;
  } 
});

const onNodeHover = node => {
  highlightedId.value = node?.id;
};

const onNodeClick = node => {
  if (selectedId.value === node?.id) {
    selectedId.value = null;
  } else {
    selectedId.value = node?.id;
  }
};
</script>

<style scoped>
.structure-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}
</style>
