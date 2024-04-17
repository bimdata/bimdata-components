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
        <BIMDataIconArrow
          size="xxs"
          margin="0 6px 0 0"
        />
        <span>{{ $t("BuildingMaker.back") }}</span>
      </BIMDataButton>
      <img :src="icon" />
      <span>{{ $t("BuildingMaker.title") }}</span>
    </div>

    <div class="bimdata-building-maker__body">
      <transition
        name="fade"
        mode="out-in"
      >
        <template v-if="currentView === VIEWS.FORM">
          <BuildingForm
            :metaBuilding="currentMetaBuilding"
            @metaBuilding-created="onMetaBuildingCreated"
            @metaBuilding-updated="onMetaBuildingUpdated"
          />
        </template>

        <template v-else-if="currentView === VIEWS.STOREYS && currentMetaBuilding">
          <BuildingStoreys
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
            @create-metaBuilding="openForm"
            @update-metaBuilding="openForm"
            @delete-metaBuilding="deleteMetaBuilding"
            @manage-storeys="openStoreys"
          />
        </template>
      </transition>
    </div>

    <transition name="fade">
      <div
        class="bimdata-building-maker__loader"
        v-show="loading.value"
      >
        <BIMDataSpinner />
      </div>
    </transition>
  </div>
</template>

<script>
import { onMounted, provide, ref } from "vue";
import icon from "./icon.svg";
import { createService } from "./service.js";
// Components
import BuildingForm from "./BuildingForm/BuildingForm.vue";
import BuildingsList from "./BuildingsList/BuildingsList.vue";
import BuildingStoreys from "./BuildingStoreys/BuildingStoreys.vue";

const VIEWS = Object.freeze({
  FORM: "form",
  LIST: "list",
  STOREYS: "storeys",
});

export default {
  components: {
    BuildingForm,
    BuildingsList,
    BuildingStoreys,
  },
  props: {
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
  },
  emits: [
    "metaBuilding-created",
    "metaBuilding-updated",
    "metaBuilding-deleted",
  ],
  setup(props, { emit }) {
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
      currentMetaBuilding.value = metaBuilding || null;
      currentView.value = VIEWS.FORM;
    };
    const openStoreys = (metaBuilding) => {
      currentMetaBuilding.value = metaBuilding;
      currentView.value = VIEWS.STOREYS;
    };
    const onMetaBuildingCreated = async (metaBuilding) => {
      await loadMetaBuildings();
      openStoreys(metaBuilding);
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
      model => { if (model) openStoreys(model); },
      { immediate: true }
    );

    onMounted(() => loadMetaBuildings());

    return {
      // References
      currentMetaBuilding,
      currentView,
      icon,
      loading,
      metaBuildings,
      VIEWS,
      // Methods
      back,
      deleteMetaBuilding,
      loadMetaBuildings,
      onMetaBuildingCreated,
      onMetaBuildingUpdated,
      openForm,
      openStoreys,
    };
  },
};
</script>

<style scoped lang="scss" src="./BIMDataBuildingMaker.scss"></style>
