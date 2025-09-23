<template>
  <BIMDataDropdownList
    class="storey-selector"
    width="100%"
    :list="storeys"
    elementKey="uuid"
    :closeOnElementClick="true"
    @element-click="selectedStorey = $event"
  >
    <template #header>
      <BIMDataIconStorey size="xs" />
      <span class="placeholder">
        {{ selectedStorey?.name ?? $t("MetaBuildingStructure.StoreySelector.placeholder") }}
      </span>
    </template>
    <template #element="{ element }">
      <div class="list-item">
        <BIMDataTextbox class="text" :text="element.name" />
        <BIMDataIconZone2 size="xs" />
        <span class="count">{{ element.zones?.length ?? 0 }}</span>
        <span>|</span>
        <BIMDataIconPlan size="xs" />
        <span class="count">{{ element.plans.length }}</span>
      </div>
    </template>
  </BIMDataDropdownList>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  storeys: {
    type: Object,
    required: true,
  },
  storey: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["storey-selected"]);

const selectedStorey = ref(null);

watch(
  [() => props.storeys, () => props.storey],
  ([storeys, storey]) => {
    if (
      !storey ||
      (storeys.some(s => s.uuid === storey.uuid) &&
        storey.uuid !== selectedStorey.value?.uuid)
    ) {
      selectedStorey.value = storey;
    }
  },
  { immediate: true }
);

watch(
  selectedStorey,
  storey => emit("storey-selected", storey)
);
</script>

<style scoped>
.storey-selector {
  .placeholder {
    margin: 0 auto 0 var(--spacing-unit);
  }

  .list-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) / 2);

    .text {
      width: 0 !important;
      flex-grow: 1;
    }

    .count {
      min-width: 18px;
      height: 18px;
      padding: 0 4px;
      border-radius: 9px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 0.75rem;
      background-color: var(--color-silver);
      color: var(--color-primary);
    }
  }
}
</style>
