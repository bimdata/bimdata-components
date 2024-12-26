<template>
  <div class="storey-form">
    <div class="storey-form__title">
      <BIMDataIconStorey size="s" />
      <span>{{ $t("BuildingMaker.storeyForm.title") }}</span>
    </div>
    <div class="storey-form__input">
      <BIMDataInput
        ref="nameInput"
        :placeholder="$t('BuildingMaker.storeyForm.input')"
        v-model="storeyName"
        :error="hasError"
        :errorMessage="$t('BuildingMaker.storeyForm.error')"
        @keyup.enter.stop="submit"
        @keyup.esc.stop="cancel"
      />
    </div>
    <div class="storey-form__actions">
      <BIMDataButton width="100px" color="primary" fill radius @click="submit">
        {{ $t("BIMDataComponents.t.validate") }}
      </BIMDataButton>
      <BIMDataButton width="100px" fill radius @click="cancel">
        {{ $t("BIMDataComponents.t.cancel") }}
      </BIMDataButton>
    </div>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps({
  storey: {
    type: Object,
  },
});

const emit = defineEmits([
  "close",
  "create-storey",
  "update-storey",
]);

const nameInput = ref(null);
const hasError = ref(false);
const storeyName = ref("");

// Reset error state when storey name changes
watch(storeyName, () => hasError.value = false);

onMounted(() => {
  nameInput.value.focus();
  storeyName.value = props.storey?.name ?? "";
});

const submit = async () => {
  if (!storeyName.value) {
    hasError.value = true;
    return;
  }
  if (storeyName.value === props.storey?.name) {
    emit("close");
  }

  if (props.storey) {
    emit("update-storey", { ...props.storey, name: storeyName.value });
  } else {
    emit("create-storey", { name: storeyName.value });
  }

  await nextTick();
  emit("close");
};

const cancel = () => {
  hasError.value = false;
  storeyName.value = "";
  emit("close");
};
</script>

<style scoped>
.storey-form {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing-unit) * 2);
  padding: var(--spacing-unit);

  box-shadow: var(--box-shadow);
  background-color: var(--color-white);

  .storey-form__title {
    display: flex;
    align-items: center;
    gap: var(--spacing-unit);
  }

  .storey-form__input {
    width: 100%;
  }

  .storey-form__actions {
    display: flex;
    flex-direction: row-reverse;
    gap: var(--spacing-unit);
  }
}
</style>
