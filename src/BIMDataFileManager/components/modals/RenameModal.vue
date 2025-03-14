<template>
  <div class="rename-modal" v-click-away="close">
    <BIMDataButton
      class="rename-modal__close"
      color="default"
      icon
      radius
      ghost
      width="21px"
      height="21px"
      @click="close"
    >
      <BIMDataIconClose />
    </BIMDataButton>
    <div class="rename-modal__content">
      <div class="rename-modal__content__title">
        {{ $t("BIMDataComponents.t.rename") }}
      </div>
      <BIMDataInput
        ref="nameInput"
        class="rename-modal__content__input"
        :placeholder="$t('FileManager.renameFormPlaceholder')"
        v-model="name"
        :error="hasError"
        :errorMessage="$t('FileManager.nameInputErrorMessage')"
        @keyup.esc.stop="close"
        @keyup.enter.stop="submit"
        margin="30px 0px"
        :loading="loading"
      />
      <div class="rename-modal__content__btn">
        <BIMDataButton
          class="rename-modal__content__btn-cancel"
          width="80px"
          ghost
          radius
          @click.stop="close"
        >
          {{ $t("BIMDataComponents.t.cancel") }}
        </BIMDataButton>
        <BIMDataButton
          class="rename-modal__content__btn-submit"
          width="80px"
          color="primary"
          fill
          radius
          @click.stop="submit"
        >
          {{ $t("BIMDataComponents.t.validate") }}
        </BIMDataButton>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    projectId: {
      type: Number,
      required: true,
    },
    spaceId: {
      type: Number,
      required: true,
    },
    apiClient: {
      type: Object,
      required: true,
    },
    entity: {
      type: Object,
    },
  },
  data() {
    return {
      name: "",
      hasError: false,
      loading: false,
    };
  },
  mounted() {
    this.name = this.entity.name;
    setTimeout(() => this.$refs.nameInput.focus(), 200);
  },
  methods: {
    reset() {
      this.name = "";
      this.hasError = false;
    },
    close() {
      this.reset();
      this.$emit("close");
    },
    async submit() {
      if (this.name) {
        this.loading = true;
        try {
          await this.renameDocument();
          this.entity.name = this.name;
          this.$emit("success");
        } catch (error) {
          this.$emit("error", error);
        } finally {
          this.reset();
          this.loading = false;
        }
      } else {
        this.$refs.nameInput.focus();
        this.hasError = true;
      }
    },
    renameDocument() {
      const params = [
        this.spaceId,
        this.entity.id,
        this.projectId,
        { name: this.name },
      ];
      if (this.entity.nature === "Folder") {
        return this.apiClient.collaborationApi.updateFolder(...params);
      } else {
        return this.apiClient.collaborationApi.updateDocument(...params);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.rename-modal {
  background-color: var(--color-white);

  display: flex;
  position: relative;

  width: 70%;

  &__close {
    position: absolute;
    right: var(--spacing-unit);
    top: var(--spacing-unit);
  }

  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin: 30px auto;

    width: 80%;
    max-width: 350px;

    &__title {
      font-weight: 700;
      font-size: 120%;
    }

    &__input {
      width: 100%;
    }
    &__btn {
      display: flex;
      width: 100%;
      justify-content: space-between;
      &-submit {
        margin-left: var(--spacing-unit);
      }
    }
  }
}
</style>
