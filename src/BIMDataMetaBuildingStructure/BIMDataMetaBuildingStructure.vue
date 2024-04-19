<script setup>
import { computed, markRaw, provide, readonly, ref, watch } from "vue";
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
  selectable: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits([
  "selection-changed",
  "storey-selected"
]);

const loading = ref(false);
const modelStoreys = ref([]);
const modelZones = ref([]);
const selectedStorey = ref(null);

watch(
  () => props.model,
  async model => {
    if (model) {
      try {
        loading.value = true;
        modelStoreys.value = await props.apiClient.modelApi.getStoreys(props.space.id, model.id, props.project.id);
        modelZones.value = await props.apiClient.modelApi.getZones(props.space.id, model.id, props.project.id);
        if (!modelStoreys.value.some(({ uuid }) => selectedStorey.value?.uuid === uuid)) {
          selectedStorey.value = modelStoreys.value[0] ?? null;
        }
      } finally {
        loading.value = false;
      }
    } else {
      modelStoreys.value = [];
      modelZones.value = [];
      selectedStorey.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => props.storey,
  storey => (selectedStorey.value = storey),
  { immediate: true }
);

const state = {
  model: computed(() => props.model),
  storeys: readonly(modelStoreys),
  storey: readonly(selectedStorey),
  zones: computed(() => modelZones.value.filter(zone => zone.storey_uuid === selectedStorey.value?.uuid) ?? []),
  selectable: computed(() => props.selectable),
  onStoreySelected: event => (selectedStorey.value = event, emit("storey-selected", event)),
  onSelectionChanged: event => emit("selection-changed", event),
};

provide("BIMDataMetaBuildingStructure.state", state);

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
    count: computed(() => state.zones.value.length)
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
        :storeys="state.storeys.value"
        :storey="state.storey.value"
        @storey-selected="state.onStoreySelected"
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
      <component :is="activeTab.view" />
    </div>

    <transition name="fade">
      <div class="loading" v-show="loading">
        <BIMDataSpinner />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.meta-building-structure {
  position: relative;
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

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;

    background-color: rgba(255, 255, 255, 0.75);

    .bimdata-spinner {
      transform: scale(2);
    }
  }
}
</style>
