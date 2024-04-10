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
        {{ $t("BuildingMaker.storeyForm.submitButton") }}
      </BIMDataButton>
      <BIMDataButton width="100px" fill radius @click="cancel">
        {{ $t("BuildingMaker.storeyForm.cancelButton") }}
      </BIMDataButton>
    </div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref, watch } from "vue";

export default {
  props: {
    storey: {
      type: Object,
    },
  },
  emits: [
    "close",
    "create-storey",
    "update-storey",
  ],
  setup(props, { emit }) {
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

    return {
      // References
      hasError,
      nameInput,
      storeyName,
      // Methods
      cancel,
      submit,
    };
  },
};
</script>

<style scoped lang="scss" src="./StoreyForm.scss"></style>
