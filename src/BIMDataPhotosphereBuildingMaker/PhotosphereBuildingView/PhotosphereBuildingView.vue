<script setup>
const props = defineProps({
  apiClient: {
    type: Object,
    required: true,
  },
  space: {
    type: Object,
    required: true,
  },
  project: {
    type: Object,
    required: true,
  },
  building: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const tree = computed(() => {
  return [];
});
</script>

<template>
  <div class="photosphere-building-view">
    <!-- TODO -->
  </div>
</template>

<style scoped>
/* TODO */
</style>
