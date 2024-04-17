<template>
  <div class="storey-plans">
    <div
      class="storey-plans__item"
      v-for="plan of plans"
      :key="plan.id"
      @mouseenter="hover = true"
      @mouseleave="hover = false"
    >
      <BIMDataFileIcon
        :size="10"
        :fileName="
          plan.plan.type === 'PDF'
            ? '.pdf' 
            : plan.plan.document.file_name
        " 
      />
      <div class="storey-plans__item__name">
        <BIMDataTextbox
          :text="
            plan.plan.type === 'PDF'
              ? `${plan.plan.name}${plan.plan.page_number > 1 ? ` (page ${plan.plan.page_number})` : ''}`
              : plan.plan.document.name
            "
        />
      </div>
      <BIMDataButton
        class="storey-plans__item__close-btn"
        v-show="hover"
        width="19px"
        height="19px"
        ghost
        rounded
        icon
        @click="$emit('delete-plan', plan)"
      >
        <BIMDataIconClose :customSize="10" fill color="granite" />
      </BIMDataButton>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";

export default {
  props: {
    storey: {
      type: Object,
    },
  },
  emits: [
    "delete-plan"
  ],
  setup(props) {
    const hover = ref(false);

    const plans = computed(
      () => props.storey?.plans ?? []
    );

    return {
      hover,
      plans,
    };
  },
};
</script>

<style scoped lang="scss" src="./StoreyPlans.scss"></style>
