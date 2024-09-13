<script setup>
import icon from "../icon.svg";
// Components
import BuildingItem from "./BuildingItem.vue";

defineProps({
  metaBuildings: {
    type: Array,
    default: () => [],
  },
});

defineEmits([
  "open-metaBuilding",
  "create-metaBuilding",
  "update-metaBuilding",
  "delete-metaBuilding",
]);
</script>

<template>
  <div class="buildings-list">
    <img class="buildings-list__icon" :src="icon" />
    <h2 class="buildings-list__title">
      {{ $t("BuildingMaker.title") }}
    </h2>
    <div class="buildings-list__text">
      {{ $t("BuildingMaker.list.text") }}
    </div>

    <BIMDataButton
      class="buildings-list__button"
      width="120px"
      color="primary"
      fill
      radius
      @click="$emit('create-metaBuilding')"
    >
      {{ $t("BuildingMaker.list.createButton") }}
    </BIMDataButton>

    <div class="buildings-list__list">
      <BuildingItem
        v-for="model of metaBuildings"
        :key="model.id"
        :metaBuilding="model"
        @open-metaBuilding="$emit('open-metaBuilding', model)"
        @update-metaBuilding="$emit('update-metaBuilding', model)"
        @delete-metaBuilding="$emit('delete-metaBuilding', model)"
      />
    </div>
  </div>
</template>

<style scoped>
.buildings-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: calc(2 * var(--spacing-unit));

  .buildings-list__icon {
    width: 36px;
  }

  .buildings-list__title {
    margin: 0;
  }

  .buildings-list__text {
    text-align: center;
    color: var(--color-granite);
  }

  .buildings-list__list {
    flex-grow: 1;
    position: relative;
    width: 100%;
    padding: calc(var(--spacing-unit) / 2);
    display: flex;
    flex-direction: column;
    gap: var(--spacing-unit);
    overflow: auto;
  }
}
</style>
