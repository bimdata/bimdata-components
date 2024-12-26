<template>
  <div class="bimdata-building-maker">
    <div
      class="bimdata-building-maker__header"
      :style="{ visibility: currentView === VIEWS.LIST ? 'hidden' : 'visible' }"
    >
      <BIMDataButton
        class="bimdata-building-maker__header__btn-back"
        ghost
        radius
        :disabled="loading.value"
        @click="back"
      >
        <BIMDataIconArrow size="xxs" margin="0 6px 0 0" />
        <span>{{ $t("BIMDataComponents.t.back") }}</span>
      </BIMDataButton>
      <img :src="icon" />
      <span>{{ $t("BuildingMaker.title") }}</span>
    </div>

    <div class="bimdata-building-maker__body">
      <transition name="fade" mode="out-in">
        <template v-if="currentView === VIEWS.FORM">
          <BuildingForm
            :metaBuilding="currentMetaBuilding"
            @metaBuilding-created="onMetaBuildingCreated"
            @metaBuilding-updated="onMetaBuildingUpdated"
          />
        </template>

        <template v-else-if="currentView === VIEWS.VIEW && currentMetaBuilding">
          <BuildingView
            :apiClient="apiClient"
            :space="space"
            :project="project"
            :metaBuilding="currentMetaBuilding"
            @close="back"
          />
        </template>

        <template v-else>
          <BuildingsList
            :metaBuildings="metaBuildings"
            @open-metaBuilding="openMetaBuilding"
            @create-metaBuilding="openForm"
            @update-metaBuilding="openForm"
            @delete-metaBuilding="deleteMetaBuilding"
          />
        </template>
      </transition>
    </div>

    <transition name="fade">
      <div class="bimdata-building-maker__loader" v-show="loading">
        <BIMDataSpinner />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { onMounted, provide, ref, watch } from "vue";
import icon from "./icon.svg";
import { createService } from "./service.js";
// Components
import BuildingForm from "./BuildingForm/BuildingForm.vue";
import BuildingsList from "./BuildingsList/BuildingsList.vue";
import BuildingView from "./BuildingView/BuildingView.vue";

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
});

const emit = defineEmits([
  "metaBuilding-created",
  "metaBuilding-updated",
  "metaBuilding-deleted",
]);

const VIEWS = Object.freeze({
  FORM: "form",
  LIST: "list",
  VIEW: "view",
});

const service = createService(props.apiClient, props.space, props.project);
const loading = ref(false);

provide("service", service);
provide("loading", loading);

const currentView = ref(VIEWS.LIST);
const metaBuildings = ref([]);
const currentMetaBuilding = ref(null);

const loadMetaBuildings = async () => {
  loading.value = true;
  metaBuildings.value = await service.fetchMetaBuildings();
  loading.value = false;
};
const deleteMetaBuilding = async (metaBuilding) => {
  await service.deleteMetaBuilding(metaBuilding);
  loadMetaBuildings();
  emit("metaBuilding-deleted");
};
const openForm = (metaBuilding) => {
  currentMetaBuilding.value = metaBuilding ?? null;
  currentView.value = VIEWS.FORM;
};
const openMetaBuilding = (metaBuilding) => {
  currentMetaBuilding.value = metaBuilding;
  currentView.value = VIEWS.VIEW;
};
const onMetaBuildingCreated = async (metaBuilding) => {
  await loadMetaBuildings();
  openMetaBuilding(metaBuilding);
  emit("metaBuilding-created");
};
const onMetaBuildingUpdated = () => {
  loadMetaBuildings();
  currentView.value = VIEWS.LIST;
  emit("metaBuilding-updated");
};
const back = () => {
  currentView.value = VIEWS.LIST;
};

watch(
  () => props.model,
  model => { if (model) openMetaBuilding(model); },
  { immediate: true }
);

onMounted(() => loadMetaBuildings());
</script>

<style scoped src="./BIMDataBuildingMaker.css"></style>
