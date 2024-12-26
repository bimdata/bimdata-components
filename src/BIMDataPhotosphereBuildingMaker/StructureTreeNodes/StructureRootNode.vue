<template>
  <GenericTreeNode v-bind="$props">
    <template #icon>
      <BIMDataIconBuilding size="xs" />
    </template>

    <template #end>
      <BIMDataButton
        width="23px"
        height="23px"
        color="primary"
        fill radius icon
        @click="$emit('create-storey')"
      >
        <BIMDataIconPlus size="xxs" />
      </BIMDataButton>
    </template>
  </GenericTreeNode>
</template>

<script setup>
import GenericTreeNode from "./GenericTreeNode.vue";

defineProps({
  node: {
    type: Object,
    required: true,
  },
  depth: {
    type: Number,
    required: true,
  },
});

defineEmits(["create-storey"]);
</script>
