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
        class="storey-plans__item__delete"
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

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  storey: {
    type: Object,
  },
});

defineEmits([
  "delete-plan"
]);

const hover = ref(false);
const plans = computed(() => props.storey?.plans ?? []);
</script>

<style scoped>
.storey-plans {
  .storey-plans__item {
    position: relative;
    display: flex;
    align-items: center;
    gap: calc(var(--spacing-unit) / 2);
    margin-left: calc(var(--spacing-unit) / 2);
    padding: 0 calc(var(--spacing-unit) / 2);

    &::before {
      content: "";
      position: absolute;
      left: calc(0px - calc(var(--spacing-unit) / 2));
      width: calc(var(--spacing-unit) / 2);
      height: 1px;
      background-color: var(--color-granite-light);
    }

    .storey-plans__item__name {
      width: 70%;
    }

    .storey-plans__item__delete {
      margin-left: auto;
      margin-right: 2px;
    }
  }
}
</style>
