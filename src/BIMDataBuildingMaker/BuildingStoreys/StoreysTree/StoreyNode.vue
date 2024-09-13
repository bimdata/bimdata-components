<script setup>
import { ref } from "vue";
// Components
import StoreyPlans from "./StoreyPlans.vue";

defineProps({
  storey: {
    type: Object,
    required: true,
  },
});

defineEmits([
  "update",
  "delete",
  "add-plans",
  "delete-plan"
]);

const isOpenAction = ref(false);
</script>

<template>
  <div class="storey-node">
    <div
      class="storey-node__storey"
      v-click-away="() => (isOpenAction = false)"
    >
      <BIMDataIconStorey size="xs" />
      <div class="storey-node__storey__name">
        <BIMDataTextbox :text="storey.name" />
      </div>
      <BIMDataButton
        width="23px"
        height="23px"
        :color="isOpenAction ? 'high' : 'primary'"
        fill
        radius
        icon
        @click="isOpenAction = !isOpenAction"
      >
        <BIMDataIcon :name="isOpenAction ? 'close' : 'plus'" :customSize="9" />
      </BIMDataButton>

      <Transition name="fade">
        <div class="storey-node__storey__actions" v-show="isOpenAction">
          <BIMDataButton fill radius icon @click="$emit('delete', storey)">
            <BIMDataIconDelete size="xs" fill color="high" />
          </BIMDataButton>
          <BIMDataButton fill radius icon @click="$emit('update', storey)">
            <BIMDataIconEdit size="xs" />
          </BIMDataButton>
          <BIMDataButton
            width="100px"
            fill
            radius
            @click="$emit('add-plans', storey)"
          >
            {{ $t("BuildingMaker.storeys.addFileButton") }}
          </BIMDataButton>
        </div>
      </Transition>
    </div>

    <div class="storey-node__plans">
      <StoreyPlans
        :storey="storey"
        @delete-plan="$emit('delete-plan', { storey, plan: $event })"
      />
    </div>
  </div>
</template>

<style scoped>
.storey-node {
  .storey-node__storey {
    position: relative;
    display: flex;
    align-items: center;
    gap: var(--spacing-unit);
    margin-left: calc(var(--spacing-unit) / 2);
    padding: calc(var(--spacing-unit) / 3) calc(var(--spacing-unit) / 2);

    &::before {
      content: "";
      position: absolute;
      left: calc(0px - calc(var(--spacing-unit) / 2));
      width: calc(var(--spacing-unit) / 2);
      height: 1px;
      background-color: var(--color-granite-light);
    }

    &:hover {
      background-color: var(--color-silver-light);
    }

    .storey-node__storey__name {
      width: calc(100% - 2 * var(--spacing-unit) - 16px - 23px);
    }

    .storey-node__storey__actions {
      position: absolute;
      top: 50%;
      right: calc(23px + var(--spacing-unit) * 3 / 2);
      transform: translateY(-50%);

      display: flex;
      gap: calc(var(--spacing-unit) / 2);
    }
  }

  .storey-node__plans {
    position: relative;
    margin-left: 20px;

    &::before {
      content: "";
      position: absolute;
      top: -3px;
      left: -1px;
      width: 1px;
      height: calc(100% - 6px);
      background-color: var(--color-granite-light);
    }
  }
}
</style>
