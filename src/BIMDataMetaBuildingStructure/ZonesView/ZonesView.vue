<script setup>
import { computed, inject } from "vue";
import { buildZonesTree } from "../meta-building-structure.js";
import SpaceNode from "../StructureTreeNodes/SpaceNode.vue";
import ZoneNode from "../StructureTreeNodes/ZoneNode.vue";

defineOptions({
  components: {
    SpaceNode,
    ZoneNode,
  }
});

const { model, storey } = inject("BIMDataMetaBuildingStructure.state");

const tree = computed(() => buildZonesTree(model.value, storey.value));
</script>

<template>
  <div class="zones-view">
    <BIMDataTree :data="tree">
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

<style scoped>
.zones-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}
</style>
