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

<script>
import { inject, onMounted, ref, watch } from "vue";
import icon from "../icon.svg";

export default {
  props: {
    metaBuilding: {
      type: Object,
    },
  },
  emits: [
    "metaBuilding-created", 
    "metaBuilding-updated"
  ],
  setup(props, { emit }) {
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

    return {
      // References
      hasError,
      icon,
      metaBuildingName,
      nameInput,
      // Methods
      submit,
    };
  },
};
</script>

<style scoped lang="scss" src="./BuildingForm.scss"></style>
