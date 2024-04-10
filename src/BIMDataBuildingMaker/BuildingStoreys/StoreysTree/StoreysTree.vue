<template>
  <div class="storeys-tree">
    <div class="storeys-tree__root">
      <BIMDataIconBuilding size="s" fill color="primary" />
      <BIMDataTextbox :text="metaBuilding.name" />
    </div>
    <div class="storeys-tree__leafs">
      <StoreyNode
        v-for="storey of storeys"
        :key="storey.uuid"
        :storey="storey"
        @update="$emit('update', $event)"
        @delete="$emit('delete', $event)"
        @add-plans="$emit('add-plans', $event)"
        @delete-plan="$emit('delete-plan', $event)"
      />
    </div>
    <div class="storeys-tree__tail" v-click-away="() => (isOpenAction = false)">
      <Transition name="fade" mode="out-in">
        <div class="content" v-if="!isOpenAction">
          <BIMDataButton
            width="23px"
            height="23px"
            color="primary"
            fill
            radius
            icon
            @click="isOpenAction = true"
          >
            <BIMDataIconPlus :customSize="9" />
          </BIMDataButton>
        </div>
        <div class="content" v-else>
          <BIMDataButton
            width="23px"
            height="23px"
            color="high"
            fill
            radius
            icon
            @click="isOpenAction = false"
          >
            <BIMDataIconClose :customSize="9" />
          </BIMDataButton>

          <BIMDataButton width="100px" fill radius @click="$emit('create')">
            + {{ $t("BuildingMaker.storeys.addStoreyButton") }}
          </BIMDataButton>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
// Components
import StoreyNode from "./StoreyNode/StoreyNode.vue";
import StoreyPlans from "./StoreyPlans/StoreyPlans.vue";

export default {
  components: {
    StoreyNode,
    StoreyPlans,
  },
  props: {
    metaBuilding: {
      type: Object,
      required: true,
    },
    storeys: {
      type: Array,
      required: true,
    },
  },
  emits: [
    "create",
    "update",
    "delete",
    "add-plans",
    "delete-plan"
  ],
  setup() {
    const isOpenAction = ref(false);

    return {
      isOpenAction,
    };
  }
};
</script>

<style scoped lang="scss" src="./StoreysTree.scss"></style>
