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
            {{ $t("BuildingMaker.view.addStorey") }}
          </BIMDataButton>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
// Components
import StoreyNode from "./StoreyNode.vue";

defineProps({
  metaBuilding: {
    type: Object,
    required: true,
  },
  storeys: {
    type: Array,
    required: true,
  },
});

defineEmits([
  "create",
  "update",
  "delete",
  "add-plans",
  "delete-plan"
]);

const isOpenAction = ref(false);
</script>

<style scoped>
.storeys-tree {
  position: relative;
  display: flex;
  flex-direction: column;

  .storeys-tree__root {
    display: flex;
    align-items: center;
    gap: var(--spacing-unit);
    margin-bottom: calc(var(--spacing-unit) / 2);
  }

  .storeys-tree__leafs {
    display: flex;
    flex-direction: column;
    margin-left: calc(var(--spacing-unit) / 2);
    border-left: 1px solid var(--color-granite-light);
  }

  .storeys-tree__tail {
    margin-left: calc(var(--spacing-unit) / 2);

    .content {
      height: 32px;
      display: flex;
      align-items: center;
      gap: calc(var(--spacing-unit) / 2);

      &::before {
        content: "";
        position: relative;
        top: -25%;
        width: calc(var(--spacing-unit) / 2);
        height: 17px;
        border-left: 1px solid var(--color-granite-light);
        border-bottom: 1px solid var(--color-granite-light);
      }
    }
  }
}
</style>
