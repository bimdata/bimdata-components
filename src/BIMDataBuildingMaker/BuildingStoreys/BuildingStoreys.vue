<script setup>
import { inject, onMounted, ref } from "vue";
import { PLAN_FILE_EXTENSIONS } from "../config.js";
// Components
import StoreyForm from "./StoreyForm/StoreyForm.vue";
import StoreysTree from "./StoreysTree/StoreysTree.vue";

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
  metaBuilding: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const service = inject("service");
const loading = inject("loading");

const apiUrl = ref("");
const accessToken = ref("");

const isOpenDMS = ref(false);
const isOpenForm = ref(false);

const storeys = ref([]);
const currentStorey = ref(null);
const selectedFiles = ref([]);

const loadStoreys = async () => {
  try {
    loading.value = true;
    storeys.value = await service.fetchStoreys(props.metaBuilding);
  } finally {
    loading.value = false;
  }
};

const createStorey = async storey => {
  await service.createStorey(props.metaBuilding, storey);
  loadStoreys();
};

const updateStorey = async storey => {
  await service.updateStorey(props.metaBuilding, storey);
  loadStoreys();
};

const deleteStorey = async storey => {
  await service.deleteStorey(props.metaBuilding, storey);
  loadStoreys();
};

const openForm = storey => {
  currentStorey.value = storey;
  isOpenForm.value = true;
};

const closeForm = () => {
  currentStorey.value = null;
  isOpenForm.value = false;
};

const openFileManager = storey => {
  apiUrl.value = props.apiClient.config.configuration.basePath;
  accessToken.value = props.apiClient.accessToken;

  currentStorey.value = storey;
  isOpenDMS.value = true;
};

const closeFileManager = async () => {
  let docs = [], pdfs = [];
  for (const { document, pdfPage } of selectedFiles.value) {
    if (pdfPage) {
      pdfs.push(pdfPage);
    } else {
      docs.push(document);
    }
  }
  const planModels = (await service.createPlanModels(docs)).concat(pdfs);

  await service.createStoreyPlans(
    props.metaBuilding,
    currentStorey.value,
    planModels
  );

  loadStoreys();
  selectedFiles.value = [];
  currentStorey.value = null;
  isOpenDMS.value = false;
};

const deleteStoreyPlan = async ({ storey, plan }) => {
  await service.deleteStoreyPlan(props.metaBuilding, storey, plan);
  loadStoreys();
};

onMounted(() => {
  loadStoreys();
});
</script>

<template>
  <div class="building-storeys">
    <transition name="fade" mode="out-in">
      <div class="content" v-if="isOpenDMS && apiUrl && accessToken && currentStorey">
        <BIMDataFileManager
          class="building-storeys__dms"
          :spaceId="space.id"
          :projectId="project.id"
          :apiUrl="apiUrl"
          :archiveUrl="''"
          :accessToken="accessToken"
          :locale="$i18n.locale"
          :select="true"
          :pdfPageSelect="true"
          :multi="true"
          :headerButtons="false"
          :selectableFileTypes="PLAN_FILE_EXTENSIONS"
          @selection-change="selectedFiles = $event"
        />
        <BIMDataButton
          width="100%"
          color="primary"
          fill
          radius
          @click="closeFileManager"
        >
          {{ $t("BuildingMaker.view.submitFilesButton") }}
        </BIMDataButton>
      </div>

      <div class="content" v-else>
        <div class="building-storeys__tree">
          <StoreysTree
            :metaBuilding="metaBuilding"
            :storeys="storeys"
            @create="openForm"
            @update="openForm"
            @delete="deleteStorey"
            @add-plans="openFileManager"
            @delete-plan="deleteStoreyPlan"
          />
        </div>
        <BIMDataButton
          width="100%"
          color="primary"
          fill
          radius
          @click="$emit('close')"
        >
          {{ $t("BuildingMaker.view.closeButton") }}
        </BIMDataButton>

        <transition name="fade">
          <StoreyForm
            v-if="isOpenForm"
            class="building-storeys__form"
            :storey="currentStorey"
            @create-storey="createStorey"
            @update-storey="updateStorey"
            @close="closeForm"
          />
        </transition>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.building-storeys {
  height: 100%;

  .content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .building-storeys__tree,
  .building-storeys__dms {
    flex-grow: 1;
    overflow-y: auto;
  }

  .building-storeys__form {
    position: absolute;
    top: calc(var(--spacing-unit) * 2);
    left: 0;
    width: 100%;
  }

  &:deep(.bimdata-file-manager) {
    position: static;

    .bimdata-file-manager__pdf-page-selector {
      position: absolute;
      top: -12px;
      left: -12px;
      width: calc(100% + 24px);
      height: calc(100% + 24px);
    }
  }
}
</style>
