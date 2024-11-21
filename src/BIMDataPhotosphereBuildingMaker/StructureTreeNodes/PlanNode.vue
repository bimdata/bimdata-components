<script setup>
import { computed } from "vue";
import GenericTreeNode from "./GenericTreeNode.vue";

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
});

defineEmits(["delete-plan"]);

const storey = computed(() => props.node.storey);
const plan = computed(() => props.node.plan);
</script>
<template>
  <GenericTreeNode v-bind="$props">
    <template #icon>
      <BIMDataFileIcon
        :file-name="plan.plan.document?.file_name ?? plan.plan.name"
        :size="12"
      />
    </template>

    <template #end>
      <BIMDataButton
        width="24px"
        height="24px"
        color="high"
        ghost rounded icon
        @click="$emit('delete-plan', { storey, plan })"
      >
        <BIMDataIconDelete size="xxs" />
      </BIMDataButton>
    </template>
  </GenericTreeNode>
</template>
