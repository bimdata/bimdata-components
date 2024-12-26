<template>
  <GenericTreeNode class="storey-node" v-bind="$props">
    <template #icon>
      <BIMDataIconStorey size="xxs" />
    </template>

    <template #end>
      <BIMDataButton
        width="24px"
        height="24px"
        color="granite"
        ghost rounded icon
        @click="isOpenMenu = !isOpenMenu"
      >
        <BIMDataIconEllipsis customSize="24" />
      </BIMDataButton>

      <transition name="fade">
        <BIMDataMenu
          v-show="isOpenMenu"
          class="storey-node__menu"
          :menuItems="menuItems"
          width="180px"
        >
          <template #item="{ item }">
            <BIMDataIcon :name="item.icon" size="xs" margin="0 12px 0 0" />
            <span>{{ $t(item.text) }}</span>
          </template>
        </BIMDataMenu>
      </transition>
    </template>
  </GenericTreeNode>
</template>

<script setup>
import { ref } from "vue";
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

const emit = defineEmits([
  "add-plans",
  "delete-storey",
  "update-storey",
]);

const menuItems = [
  {
    key: 1,
    text: "BuildingMaker.view.addFile",
    icon: "plus",
    action: () => (isOpenMenu.value = false, emit("add-plans", props.node.storey)),
  },
  {
    key: 2,
    text: "BIMDataComponents.t.rename",
    icon: "edit",
    action: () => (isOpenMenu.value = false, emit("update-storey", props.node.storey)),
    divider: true,
  },
  {
    key: 3,
    text: "BIMDataComponents.t.delete",
    icon: "delete",
    color: "var(--color-high)",
    action: () => (isOpenMenu.value = false, emit("delete-storey", props.node.storey)),
  },
];

const isOpenMenu = ref(false);
</script>

<style scoped>
.storey-node {
  .storey-node__menu {
    position: absolute;
    z-index: 1;
    top: 30px;
    right: calc(var(--spacing-unit) / 2);
  }
}
</style>
