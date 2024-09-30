<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { PLAN_FILE_EXTENSIONS } from "../../BIMDataBuildingMaker/config.js";
import { buildStructureTree, setupTree } from "../photosphere-building-maker.js";
// Components
import StoreyForm from "../../BIMDataBuildingMaker/BuildingView/StoreyForm/StoreyForm.vue";
import PlanNode from "../StructureTreeNodes/PlanNode.vue";
import StoreyNode from "../StructureTreeNodes/StoreyNode.vue";
import StructureRootNode from "../StructureTreeNodes/StructureRootNode.vue";
import ZoneNode from "../StructureTreeNodes/ZoneNode.vue";

defineOptions({
  components: {
    PlanNode,
    StoreyNode,
    StructureRootNode,
    ZoneNode,
  }
});

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

const zones = ref([]);

const tree = computed(() => setupTree(buildStructureTree(props.model, storeys.value, zones.value)));

const loadStoreys = async () => {
  try {
    loading.value = true;
    storeys.value = await service.fetchStoreys(props.model);
  } finally {
    loading.value = false;
  }
};

const loadZones = async () => {
  try {
    loading.value = true;
    zones.value = await service.fetchZones(props.model);
  } finally {
    loading.value = false;
  }
};

const createStorey = async storey => {
  await service.createStorey(props.model, storey);
  loadStoreys();
};

const updateStorey = async storey => {
  await service.updateStorey(props.model, storey);
  loadStoreys();
};

const deleteStorey = async storey => {
  await service.deleteStorey(props.model, storey);
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
    props.model,
    currentStorey.value,
    planModels
  );

  loadStoreys();
  selectedFiles.value = [];
  currentStorey.value = null;
  isOpenDMS.value = false;
};

const deleteStoreyPlan = async ({ storey, plan }) => {
  await service.deleteStoreyPlan(props.model, storey, plan);
  loadStoreys();
};

onMounted(() => {
  Promise.all([
    loadStoreys(),
    loadZones(),
  ]);
});
</script>

<template>
  <div class="building-view">
    <transition name="fade" mode="out-in">
      <div class="content" v-if="isOpenDMS && apiUrl && accessToken && currentStorey">
        <BIMDataFileManager
          class="building-view__dms"
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
          {{ $t("BIMDataComponents.t.validate") }}
        </BIMDataButton>
      </div>

      <div class="content" v-else>
        <div class="building-view__tree">
          <BIMDataTree :data="tree">
            <template #node="{ node, depth }">
              <component
                :is="node.component"
                :node="node"
                :depth="depth"
                @create-storey="openForm"
                @update-storey="openForm"
                @delete-storey="deleteStorey"
                @add-plans="openFileManager"
                @delete-plan="deleteStoreyPlan"
              />
            </template>
          </BIMDataTree>
        </div>
        <BIMDataButton
          width="100%"
          color="primary"
          fill
          radius
          @click="$emit('close')"
        >
          {{ $t("BIMDataComponents.t.finish") }}
        </BIMDataButton>

        <transition name="fade">
          <StoreyForm
            v-if="isOpenForm"
            class="building-view__form"
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
.building-view {
  height: 100%;

  .content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .building-view__tree,
  .building-view__dms {
    flex-grow: 1;
    overflow-y: auto;
  }

  .building-view__form {
    position: absolute;
    top: calc(var(--spacing-unit) * 3);
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
