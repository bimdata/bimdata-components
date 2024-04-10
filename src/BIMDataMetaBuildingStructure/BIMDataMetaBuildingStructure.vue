<script setup>
import { computed, markRaw, ref } from "vue";
import EquipmentsView from "./EquipmentsView/EquipmentsView.vue";
import StoreySelector from "./StoreySelector/StoreySelector.vue";
import StructureView from "./StructureView/StructureView.vue";
import ZonesView from "./ZonesView/ZonesView.vue";

const props = defineProps({
  apiClient: {
    type: Object,
    required: true,
  },
  space: {
    type: Object,
    required: true,
  },
  project: {
    type: Object,
    required: true,
  },
  model: {
    type: Object,
    default: null,
  },
  storey: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["selection-changed", "storey-selected"]);

const selectedStorey = ref(null);

const storeys = computed(() => props.model?.storeys ?? []);
const zones = computed(() => props.model?.zones.filter(zone => zone.storey_uuid === selectedStorey.value?.uuid) ?? []);

const tabs = [
  {
    id: 0,
    label: "Structure",
    view: markRaw(StructureView)
  },
  {
    id: 1,
    label: "Zones",
    view: markRaw(ZonesView),
    count: computed(() => zones.value.length)
  },
  {
    id: 2,
    label: "Equipments",
    view: markRaw(EquipmentsView)
  },
];
const activeTab = ref(tabs[0]);
</script>

<template>
  <div class="meta-building-structure">
    <div class="title">
      <BIMDataIconBuilding size="s" />
      <span>{{ $t("MetaBuildingStructure.title") }}</span>
    </div>
    <div class="head">
      <StoreySelector
        :storeys="storeys"
        :storey="storey"
        @storey-selected="selectedStorey = $event, emit('storey-selected', $event)"
      />
      <!-- 
      <BIMDataTabs
        :tabs="tabs"
        width="100%"
        height="36px"
        :tab-size="`calc(${100 / tabs.length}%)`"
        :selected="activeTab.id"
        @tab-selected="activeTab = $event"
      >
        <template #tab="{ tab }">
          <span>{{ tab.label }}</span>
          <span v-if="tab.count?.value" class="tab-count">{{ tab.count }}</span>
        </template>
      </BIMDataTabs>
      -->
    </div>

    <div class="body">
      <component
        :is="activeTab.view"
        :model="model"
        :storey="selectedStorey"
        @selection-changed="emit('selection-changed', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.meta-building-structure {
  height: 100%;

  .title {
    padding: var(--spacing-unit);
    background-color: var(--color-silver-light);
    display: flex;
    align-items: center;
    gap: var(--spacing-unit);
  }

  .head {
    padding: var(--spacing-unit);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-unit);
  }

  .body {
    height: calc(100% - 100px);
    padding: var(--spacing-unit);
  }

  .tab-count {
    min-width: 20px;
    height: 20px;
    margin-left: calc(var(--spacing-unit) / 2);
    padding: 0 4px;
    border-radius: 50%;
    background-color: var(--color-primary);
    font-size: 0.8rem;
    color: var(--color-white);

    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
