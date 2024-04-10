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

<script>
import { ref } from "vue";
// Components
import StoreyPlans from "../StoreyPlans/StoreyPlans.vue";

export default {
  components: {
    StoreyPlans,
  },
  props: {
    storey: {
      type: Object,
      required: true,
    },
  },
  emits: [
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
  },
};
</script>

<style scoped lang="scss" src="./StoreyNode.scss"></style>
