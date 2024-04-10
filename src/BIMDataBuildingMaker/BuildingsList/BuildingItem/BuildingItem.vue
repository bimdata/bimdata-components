<template>
  <div class="building-item" @click="$emit('manage-storeys', metaBuilding)">
    <BIMDataIconBuilding size="m" fill color="primary" />
    <div class="building-item__name">
      <BIMDataTextbox :text="metaBuilding.name" />
    </div>

    <div
      class="building-item__actions"
      @click.stop="() => {}"
      v-click-away="() => (isOpenAction = false)"
    >
      <BIMDataButton ghost rounded icon @click="isOpenAction = !isOpenAction">
        <BIMDataIconEllipsis size="l" fill color="granite-light" />
      </BIMDataButton>

      <transition name="fade">
        <div class="building-item__actions__menu" v-show="isOpenAction">
          <BIMDataButton
            ghost
            square
            @click="$emit('update-metaBuilding', metaBuilding)"
          >
            {{ $t("BuildingMaker.list.updateButton") }}
          </BIMDataButton>
          <BIMDataButton
            color="high"
            ghost
            square
            @click="$emit('delete-metaBuilding', metaBuilding)"
          >
            {{ $t("BuildingMaker.list.deleteButton") }}
          </BIMDataButton>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export default {
  props: {
    metaBuilding: {
      type: Object,
      required: true,
    },
  },
  emits: [
    "manage-storeys",
    "update-metaBuilding",
    "delete-metaBuilding"
  ],
  setup() {
    const isOpenAction = ref(false);
    
    return {
      isOpenAction,
    };
  },
};
</script>

<style scoped lang="scss" src="./BuildingItem.scss"></style>
