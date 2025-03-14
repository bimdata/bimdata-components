<template>
  <div class="file-card" @click="onClick">
    <div
      class="file-card__content"
      :class="{
        'file-card__content--selected': selected,
        'file-card__content--disabled': disabled,
        'file-card__content--hover':
          (select && !success && !disabled) || isFolder,
      }"
    >
      <div class="file-card__content__header">
        <div class="file-card__content__header__btn-menu">
          <BIMDataIconSuccess
            v-if="success"
            size="s"
            fill
            color="success"
            class="file-card__content__header__btn-menu__success"
          />
          <PieProgressSpinner
            v-else-if="loading && !success"
            :progress="percentCompleted"
            class="file-card__content__header__btn-menu__spinner"
          />
          <BIMDataButton
            ghost
            rounded
            icon
            v-else-if="edit"
            @click.stop="toggleMenu"
            class="file-card__content__header__btn-menu__edit"
            :disabled="success"
          >
            <BIMDataIconEllipsis size="l" fill color="granite-light" />
          </BIMDataButton>
          <div v-else-if="!isFolder" class="selection-box">
            <template v-if="pdfModelLoading">
              <BIMDataSpinner style="margin: 6px" />
            </template>
            <template v-else>
              <BIMDataCheckbox
                :disabled="disabled"
                v-if="multiSelect"
                :modelValue="selected"
                class="file-card__content__header__btn-menu__checkbox"
              />
              <BIMDataRadio
                :disabled="disabled"
                v-else
                big
                :modelValue="selected"
                name="BIMDataFileCardRadio"
              />
            </template>
            <div v-if="pdfPage" class="selection-text">
              {{ `page ${pdfPage.page_number}` }}
            </div>
          </div>
        </div>
        <template v-if="file.nature === 'Folder'">
          <BIMDataIconFolder size="xl" fill color="primary" />
        </template>
        <template v-else>
          <BIMDataFileIcon :fileName="file.file_name" :size="25" />
        </template>
      </div>
      <div
        class="file-card__content__menu"
        v-if="menuDisplayed"
        v-click-away="away"
      >
        <BIMDataButton
          v-if="viewPdf && file.model_type === 'PDF'"
          color="default"
          ghost
          radius
          width="100%"
          @click.stop="onViewClick"
        >
          {{ $t("BIMDataComponents.t.view") }}
        </BIMDataButton>
        <BIMDataButton
          color="default"
          ghost
          radius
          width="100%"
          @click.stop="onRenameClick"
        >
          {{ $t("BIMDataComponents.t.rename") }}
        </BIMDataButton>
        <BIMDataButton
          color="default"
          ghost
          radius
          width="100%"
          @click.stop="onDownloadClick"
        >
          {{ $t("BIMDataComponents.t.download") }}
        </BIMDataButton>
        <BIMDataButton
          v-if="writeAccess"
          color="high"
          ghost
          radius
          width="100%"
          @click.stop="onDeleteClick"
        >
          {{ $t("BIMDataComponents.t.delete") }}
        </BIMDataButton>
      </div>
      <div class="file-card__content__footer">
        <MultiLineTextBox
          class="file-card__content__footer__name"
          :text="file.name"
        />
        <div class="file-card__content__footer__date">
          {{ file.updated_at.toLocaleDateString() }}
        </div>
        <template v-if="initials">
          <div class="file-card__content__footer__initials">
            {{ initials }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import PieProgressSpinner from "./PieProgressSpinner.vue";
import MultiLineTextBox from "./MultiLineTextBox/MultiLineTextBox.vue";

export default {
  components: {
    PieProgressSpinner,
    MultiLineTextBox,
  },
  props: {
    disabled: {
      type: Boolean,
      default: false,
    },
    writeAccess: {
      type: Boolean,
      default: false,
    },
    width: {
      type: String,
      default: "140px",
    },
    file: {
      type: Object,
      required: true,
    },
    projectId: {
      type: Number,
      required: true,
    },
    spaceId: {
      type: Number,
      required: true,
    },
    apiUrl: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    select: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: false,
    },
    multi: {
      type: Boolean,
      default: false,
    },
    success: {
      type: Boolean,
      default: false,
    },
    viewPdf: {
      type: Boolean,
      default: false,
    },
    pdfModelLoading: {
      type: Boolean,
      default: false,
    },
    pdfPage: {
      type: Object,
      default: null
    },
  },
  emits: [
    "rename",
    "delete",
    "download",
    "edit",
    "view",
    "open-folder",
    "toggle-select",
    "loaded",
    "load-error",
  ],
  data() {
    return {
      menuDisplayed: false,
      percentCompleted: 0,
    };
  },
  computed: {
    multiSelect() {
      return this.select && this.multi;
    },
    edit() {
      return !this.loading && !this.select;
    },
    isFolder() {
      return this.file.nature === "Folder";
    },
    loading() {
      return this.file.fileToLoad;
    },
    initials() {
      return (
        this.file.created_by &&
        (
          `${this.file.created_by.firstname[0] || ""}` +
          `${this.file.created_by.lastname[0] || ""}`
        ).toUpperCase()
      );
    },
  },
  async created() {
    document.addEventListener("keydown", this.onKeyDown);

    if (this.file.fileToLoad) {
      const formData = new FormData();
      formData.append("file", this.file.fileToLoad);
      formData.append("name", this.file.fileToLoad.name);
      formData.append("parent_id", this.file.folder.id);

      const request = new XMLHttpRequest();
      request.open(
        "POST",
        `${this.apiUrl}/cloud/${this.spaceId}/project/${this.projectId}/document`
      );
      request.setRequestHeader("authorization", `Bearer ${this.accessToken}`);

      request.addEventListener("progress", e => {
        this.percentCompleted = (e.loaded / e.total) * 100;
      });

      request.addEventListener("load", () => {
        if (request.status === 201) {
          const file = JSON.parse(request.response);
          file.updated_at = new Date(file.updated_at);
          this.$emit("loaded", file);
        } else {
          this.$emit("load-error", request.statusText);
        }
      });

      request.send(formData);
    }
  },
  destroyed() {
    document.removeEventListener("keydown", this.onKeyDown);
  },
  methods: {
    onKeyDown(e) {
      if (e.key === "Escape") {
        this.menuDisplayed = false;
      }
    },
    onRenameClick() {
      this.menuDisplayed = false;
      this.$emit("rename");
    },
    onDownloadClick() {
      this.menuDisplayed = false;
      this.$emit("download");
    },
    onDeleteClick() {
      this.menuDisplayed = false;
      this.$emit("delete");
    },
    onViewClick() {
      this.menuDisplayed = false;
      this.$emit("view");
    },
    onClick() {
      if (this.isFolder) {
        this.$emit("open-folder");
      } else if (!this.success && !this.disabled && !this.loading && this.select) {
        this.$emit("toggle-select", this.file);
      }
    },
    toggleMenu() {
      this.menuDisplayed = !this.menuDisplayed;
    },
    away() {
      setTimeout(() => {
        this.menuDisplayed = false;
      });
    },
  },
};
</script>

<style scoped lang="scss">
.file-card {
  height: 192px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;

  &__content {
    box-sizing: border-box;
    height: calc(100% - 24px);
    width: calc(100% - 24px);
    background-color: var(--color-white);
    box-shadow: var(--box-shadow);
    position: relative;

    &__menu {
      position: absolute;
      background-color: var(--color-white);
      z-index: 1;
      left: calc(var(--spacing-unit) / 3);
      right: calc(var(--spacing-unit) / 3);
      top: calc(var(--spacing-unit) * 3);
      box-shadow: var(--box-shadow);
    }

    &--selected {
      border: solid var(--color-primary) 3px;
    }

    &--disabled {
      .file-card__content__header {
        filter: grayscale(100%);
      }
    }

    &:not(.file-card__content--selected) {
      padding: 3px;
    }

    &--hover {
      cursor: pointer;
      &:hover {
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.3);
      }
    }

    &__header {
      box-sizing: border-box;
      height: 65px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: solid 1px var(--color-silver-light);

      &__btn-menu {
        position: absolute;
        top: 0px;
        right: 0px;

        &__checkbox {
          top: 6px;
          right: 6px;
        }

        .selection-box {
          position: relative;
          .selection-text {
            position: absolute;
            right: 0;
            margin-top: 12px;
            margin-right: 6px;
            font-size: 12px;
            white-space: nowrap;
          }
        }
      }
    }

    &__footer {
      height: calc(100% - 65px);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      box-sizing: border-box;
      font-size: 12px;

      padding: var(--spacing-unit);

      &__name {
        font-weight: bold;
        color: var(--color-granite);
      }

      &__date {
        color: var(--color-granite-light);
      }

      &__initials {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-primary);
        font-size: calc(var(--spacing-unit) / 1.1);
        color: var(--color-silver-light);
        line-height: 2px;
        border-radius: 50%;
        height: 20px;
        width: 20px;
        bottom: 9px;
        right: 18px;
      }
    }
  }
}
</style>
