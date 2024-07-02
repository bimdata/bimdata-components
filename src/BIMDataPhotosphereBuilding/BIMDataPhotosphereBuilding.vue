<script setup>
import { computed, ref, watch } from "vue";
import StoreySelector from "./StoreySelector/StoreySelector.vue";

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
    default: false,
  },
});

const emit = defineEmits([
  "storey-selected",
  "plan-selected"
]);

const loading = ref(false);
const modelStoreys = ref([]);
const selectedStorey = ref(null);
const storeyPlans = computed(() => selectedStorey.value?.plans ?? []);
const selectedPlanId = ref(null);

watch(
  () => props.model,
  async model => {
    if (model) {
      try {
        loading.value = true;
        modelStoreys.value = await props.apiClient.modelApi.getStoreys(props.space.id, model.id, props.project.id);
        if (!modelStoreys.value.some(({ uuid }) => selectedStorey.value?.uuid === uuid)) {
          selectedStorey.value = modelStoreys.value[0] ?? null;
        }
      } finally {
        loading.value = false;
      }
    } else {
      modelStoreys.value = [];
      selectedStorey.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => props.storey,
  storey => {
    selectedStorey.value = storey;
  },
  { immediate: true }
);

watch(
  selectedStorey,
  storey => (selectedPlanId.value = storey?.plans?.[0]?.plan.id ?? null),
  { immediate: true }
);

const onStoreySelected = event => (selectedStorey.value = event, emit("storey-selected", event));
const onPlanSelected = event => emit("plan-selected", event);
</script>

<template>
  <div class="photosphere-building">
    <div class="title">
      <BIMDataIconBuilding size="s" />
      <span>{{ $t("PhotosphereBuilding.title") }}</span>
    </div>
    <div class="head">
      <StoreySelector
        :storeys="modelStoreys"
        :storey="selectedStorey"
        @storey-selected="onStoreySelected"
      />
    </div>

    <div class="body">
      <div class="list-item" v-for="plan of storeyPlans" :key="plan.plan.id">
        <BIMDataRadio
          v-if="selectable"
          :value="plan.plan.id"
          v-model="selectedPlanId"
          @update:modelValue="onPlanSelected(plan)"
        />
        <BIMDataFileIcon
          :fileName="plan.plan.document?.file_name ?? plan.plan.name"
          :size="14"
        />
        <BIMDataTextbox class="text" :text="plan.plan.name" />
      </div>
    </div>

    <transition name="fade">
      <div class="loading" v-show="loading">
        <BIMDataSpinner />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.photosphere-building {
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
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: calc(var(--spacing-unit) / 2);

    .list-item {
      padding: 0 calc(var(--spacing-unit) / 2);
      display: flex;
      align-items: center;
      gap: calc(var(--spacing-unit) / 2);

      .text {
        width: 0 !important;
        flex-grow: 1;
      }
    }
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
