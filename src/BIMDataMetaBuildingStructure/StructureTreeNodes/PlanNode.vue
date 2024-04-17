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

defineEmits(["selection-changed"]);

const plan = computed(() => props.node.plan);
</script>
<template>
  <GenericTreeNode v-bind="$props" @selection-changed="$emit('selection-changed', $event)">
    <template #icon>
      <BIMDataFileIcon
        :file-name="plan.plan.document?.file_name ?? plan.plan.name"
        :size="12"
      />
    </template>
  </GenericTreeNode>
</template>
