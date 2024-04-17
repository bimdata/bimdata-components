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
  () => props.storeys,
  storeys => {
    if (
      selectedStorey.value &&
      storeys.every(s => s.uuid !== selectedStorey.value.uuid)
    ) {
      selectedStorey.value = null;
    }
  },
  { immediate: true }
);

watch(
  () => props.storey,
  storey => {
    if (
      !storey ||
      (props.storeys.some(s => s.uuid === storey.uuid) &&
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
      <span style="margin: 0 auto 0 var(--spacing-unit);">
        {{ selectedStorey?.name ?? $t("MetaBuildingStructure.StoreySelector.placeholder") }}
      </span>
    </template>
    <template #element="{ element }">
      {{ element.name }}
    </template>
  </BIMDataDropdownList>
</template>
