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

const { zones } = inject("BIMDataMetaBuildingStructure.state");

const tree = computed(() => buildZonesTree(zones.value));
</script>

<style scoped>
.zones-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-unit);
}
</style>
