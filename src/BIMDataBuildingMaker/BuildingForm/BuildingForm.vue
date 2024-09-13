<script setup>
import { inject, onMounted, ref, watch } from "vue";
import icon from "../icon.svg";

const props = defineProps({
    metaBuilding: {
    type: Object,
  },
});

const emit = defineEmits([
  "metaBuilding-created", 
  "metaBuilding-updated"
]);

const service = inject("service");

const nameInput = ref(null);
const hasError = ref(false);
const metaBuildingName = ref("");

// Reset error state when meta building name changes
watch(metaBuildingName, () => hasError.value = false);

onMounted(() => {
  nameInput.value.focus();
  metaBuildingName.value = props.metaBuilding?.name ?? "";
});

const submit = async () => {
  if (!metaBuildingName.value) {
    hasError.value = true;
    return;
  }
  if (metaBuildingName.value === props.metaBuilding?.name) {
    return;
  }

  let newBuilding = { name: metaBuildingName.value };
  if (props.metaBuilding) {
    newBuilding.id = props.metaBuilding.id;
    newBuilding = await service.updateMetaBuilding(newBuilding);
    emit("metaBuilding-updated", newBuilding);
  } else {
    newBuilding = await service.createMetaBuilding(newBuilding);
    emit("metaBuilding-created", newBuilding);
  }
};
</script>

<template>
  <div class="building-form">
    <img class="building-form__icon" :src="icon" />
    <h2 class="building-form__title">
      {{ $t("BuildingMaker.title") }}
    </h2>
    <div class="building-form__text">
      {{ $t("BuildingMaker.form.text") }}
    </div>
    <div class="building-form__controls">
      <BIMDataInput
        ref="nameInput"
        :placeholder="$t('BuildingMaker.form.input')"
        v-model="metaBuildingName"
        :error="hasError"
        :errorMessage="$t('BuildingMaker.form.error')"
        @keyup.enter.stop="submit"
      />
      <BIMDataButton width="120px" color="primary" fill radius @click="submit">
        {{ $t(`BuildingMaker.form.${metaBuilding ? 'updateButton' : 'createButton'}`) }}
      </BIMDataButton>
    </div>
  </div>
</template>

<style scoped>
.building-form {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(2 * var(--spacing-unit));

  .building-form__icon {
    width: 36px;
  }

  .building-form__title {
    margin: 0;
  }

  .building-form__text {
    text-align: center;
    color: var(--color-granite);
  }

  .building-form__controls {
    width: 100%;
    padding: 0 20%;

    .bimdata-input {
      width: 100%;
    }

    .bimdata-btn {
      margin-left: auto;
    }
  }
}
</style>
