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
        @manage-storeys="$emit('manage-storeys', model)"
        @update-metaBuilding="$emit('update-metaBuilding', model)"
        @delete-metaBuilding="$emit('delete-metaBuilding', model)"
      />
    </div>
  </div>
</template>

<script>
import icon from "../icon.svg";
// Components
import BuildingItem from "./BuildingItem/BuildingItem.vue";

export default {
  components: {
    BuildingItem,
  },
  props: {
    metaBuildings: {
      type: Array,
      default: () => [],
    },
  },
  emits: [
    "create-metaBuilding",
    "update-metaBuilding",
    "delete-metaBuilding",
    "manage-storeys",
  ],
  setup() {
    return {
      icon,
    };
  },
};
</script>

<style scoped lang="scss" src="./BuildingsList.scss"></style>
