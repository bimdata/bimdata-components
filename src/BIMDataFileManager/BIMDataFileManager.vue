<template>
  <div class="bimdata-file-manager">
    <BIMDataPDFViewer
      class="bimdata-file-manager__pdf-viewer"
      v-if="pdfToView"
      :pdf="pdfToView"
      header
    >
      <template #header-left>
        <BIMDataButton
          class="m-l-12"
          width="32px"
          height="32px"
          color="primary"
          ghost
          radius
          icon
          @click="pdfToView = null"
        >
          <BIMDataIconArrow size="xxs" />
        </BIMDataButton>
      </template>
    </BIMDataPDFViewer>
    <div
      class="bimdata-file-manager__header"
      :class="{
        'bimdata-file-manager__header--xs': xsLayout,
        'bimdata-file-manager__header--s': sLayout,
        'bimdata-file-manager__header--m': mLayout,
        'bimdata-file-manager__header--l': lLayout,
      }"
      v-if="headerButtons || headerSearch"
    >
      <template v-if="headerButtons">
        <NewFolderButton
          :disabled="!currentFolder || currentFolder.user_permission < 100"
          :projectId="projectId"
          :spaceId="spaceId"
          :apiClient="apiClient"
          :folder="currentFolder"
          @success="onNewFolder"
          @error="$emit('error', $event)"
        />
        <UploadFileButton
          class="bimdata-file-manager__header__upload"
          width="25%"
          :disabled="!currentFolder || currentFolder.user_permission < 100"
          multiple
          @upload="uploadFiles"
        />
      </template>
      <BIMDataSearch
        v-if="headerSearch"
        :color="searchColor"
        class="bimdata-file-manager__search"
        width="100%"
        placeholder="Search"
        v-model="searchText"
        ref="search"
        clear
        radius
      />
    </div>
    <div class="bimdata-file-manager__navigation">
      <div
        v-if="navigationShown"
        class="bimdata-file-manager__navigation__content"
      >
        <BIMDataButton ghost radius icon @click="back">
          <BIMDataIconArrow size="xxs" />
        </BIMDataButton>
        <BIMDataTextbox
          :text="currentFolder.name"
          cutPosition="middle"
          tooltipPosition="bottom"
          tooltipColor="primary"
          width="calc(100% - 45px)"
        />
      </div>
      <div v-else class="bimdata-file-manager__navigation__content--empty">
        {{ translate("dmsRoot") }}
      </div>
    </div>
    <template v-if="fileStructure">
      <div class="bimdata-file-manager__container" v-if="files.length > 0">
        <BIMDataResponsiveGrid
          :itemWidth="itemWidth"
          rowGap="4px"
          columnGap="6px"
        >
          <FileCard
            :width="itemWidth"
            v-for="file of files"
            :key="file.id"
            :file="file"
            :projectId="projectId"
            :spaceId="spaceId"
            :apiUrl="apiUrl"
            :accessToken="accessToken"
            @open-folder="openFolder(file)"
            :select="select"
            :disabled="isDisabled(file)"
            :multi="multi"
            :selected="isFileSelected(file)"
            :success="isFileSucess(file.id)"
            @toggle-select="onToggleFileSelect(file)"
            @rename="onRename(file)"
            @delete="onDelete(file)"
            @view="onView(file)"
            @download="onDownload(file)"
            @loaded="onFileLoaded(file, $event)"
            :writeAccess="currentFolder.user_permission >= 100"
            :viewPdf="viewPdf"
            :pdfModelLoading="pdfModelLoading === file.id"
            :pdfPage="selectedPdfPage(file)"
          />
        </BIMDataResponsiveGrid>
      </div>
      <div v-else class="bimdata-file-manager__container--empty">
        <div>
          <BIMDataIconFolderOpen size="xxxl" fill color="silver" />
          <span>{{ translate("emptyFolder") }}</span>
        </div>
      </div>
    </template>
    <BIMDataLoading v-else />
    <div
      v-if="pdfPageSelectorDisplayed"
      class="bimdata-file-manager__pdf-page-selector"
    >
      <PdfPageSelector
        :model="pdfModel"
        :modelSelectedPage="pdfModelSelectedPage"
        @select="selectPdfPage"
        @close="selectPdfPage"
      />
    </div>
    <div class="bimdata-file-manager__modal" v-if="modalDisplayed">
      <RenameModal
        :projectId="projectId"
        :spaceId="spaceId"
        :apiClient="apiClient"
        :entity="entityRenown"
        v-if="entityRenown"
        @close="entityRenown = null"
        @success="onRenameSuccess"
        @error="$emit('error', $event)"
      />
      <DeleteModal
        :projectId="projectId"
        :spaceId="spaceId"
        :apiClient="apiClient"
        :entity="entityDeletable"
        v-else-if="entityDeletable"
        @close="entityDeletable = null"
        @success="onDeleteSuccess"
        @error="$emit('error', $event)"
      />
    </div>
  </div>
</template>

<script>
import { makeBIMDataApiClient } from "@bimdata/typescript-fetch-api-client";

import BIMDataPDFViewer from "../BIMDataPDFViewer/BIMDataPDFViewer.vue";
import FileCard from "./components/FileCard.vue";
import NewFolderButton from "./components/newFolder/NewFolderButton.vue";
import UploadFileButton from "./components/UploadFileButton.vue";
import RenameModal from "./components/modals/RenameModal.vue";
import DeleteModal from "./components/modals/DeleteModal.vue";
import PdfPageSelector from "./components/PdfPageSelector.vue";

import getFlattenTree from "./utils/flattenTree.js";
import { downloadFiles } from "./utils/files.js";

import trads from "./i18n.js";

const XS = 398;
const S = 468;
const M = 800;

const SUCCESS_TIME = 3000;

export default {
  components: {
    FileCard,
    NewFolderButton,
    UploadFileButton,
    RenameModal,
    DeleteModal,
    BIMDataPDFViewer,
    PdfPageSelector,
  },
  provide() {
    return {
      $translate: this.translate,
    };
  },
  props: {
    locale: {
      type: String,
      default: "en",
    },
    apiUrl: {
      type: String,
      default: "https://api.bimdata.io",
    },
    spaceId: {
      type: Number,
      required: true,
    },
    projectId: {
      type: Number,
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
    multi: {
      type: Boolean,
      default: false,
    },
    searchColor: {
      type: String,
      default: "primary",
    },
    headerButtons: {
      type: Boolean,
      default: true,
    },
    headerSearch: {
      type: Boolean,
      default: true,
    },
    alreadySelectedIds: {
      type: Array,
      defaut: () => [],
    },
    selectableFileTypes: {
      type: Array,
      default: () => [],
    },
    viewPdf: {
      type: Boolean,
      default: false,
    },
    pdfPageSelect: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      currentFolder: null,
      loadingFiles: [],
      searchText: "",
      selectedFiles: [],
      apiClient: null,
      fileStructure: null,
      width: 0,
      entityRenown: false,
      entityDeletable: false,
      successFileIds: [],
      pdfToView: null,
      pdfModel: null,
      pdfModelSelectedPage: null,
      pdfModelLoading: null,
      pdfPageSelectorDisplayed: false,
    };
  },
  computed: {
    modalDisplayed() {
      return this.entityRenown || this.entityDeletable;
    },
    navigationShown() {
      return this.currentFolder !== this.fileStructure;
    },
    itemWidth() {
      return this.xsLayout ? "100%" : this.sLayout ? "180px" : "164px";
    },
    xsLayout() {
      return this.width < XS;
    },
    sLayout() {
      return this.width >= XS && this.width < S;
    },
    mLayout() {
      return this.width >= S && this.width < M;
    },
    lLayout() {
      return this.width >= M;
    },
    multiSelect() {
      return this.select && this.multi;
    },
    files() {
      let files = null;
      if (this.searchText) {
        files = (
          (this.currentFolder && this.currentFolder.children) ||
          []
        ).filter(file => file.name.toLowerCase().includes(this.searchText));
      } else {
        files = (this.currentFolder && this.currentFolder.children) || [];
      }

      files.push(
        ...this.loadingFiles.filter(
          loadingFile =>
            loadingFile.folder.id === this.currentFolder.id &&
            !files.find(file => file.id === loadingFile.id) // for multi file loading
        )
      );

      files.sort((a, b) => (a.name || "").localeCompare(b.name));
      files.sort((a, b) => {
        const aType = a.nature === "Folder" ? 1 : -1;
        const bType = b.nature === "Folder" ? 1 : -1;

        return bType - aType;
      });
      return files;
    },
  },
  watch: {
    accessToken(token) {
      this.apiClient.accessToken = token;
    },
    multi() {
      this.selectedFiles = [];
      this.$emit("selection-change", this.selectedFiles);
    },
    select() {
      this.selectedFiles = [];
      this.$emit("selection-change", this.selectedFiles);
    },
  },
  mounted() {
    this.resizeObserver = new ResizeObserver(this.onResize);
    this.resizeObserver.observe(this.$el);
  },
  beforeDestroy() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    clearTimeout(this.timeoutId);

    document.removeEventListener("keydown", this.onKeyDown);
  },
  async created() {
    document.addEventListener("keydown", this.onKeyDown);

    this.loadingFileId = 0;

    try {
      this.apiClient = makeBIMDataApiClient({
        apiUrl: this.apiUrl,
        accessToken: this.accessToken,
      });
      this.fileStructure =
        await this.apiClient.collaborationApi.getProjectDMSTree(
          this.spaceId,
          this.projectId
        );
    } catch (error) {
      this.$emit("error", error);
    }

    this.currentFolder = this.fileStructure;
  },
  methods: {
    isDisabled(file) {
      if (file.nature === "Folder") return false;

      const extensionMatch = file.file_name?.match(/\.(\w+$)/);
      const fileExtension = extensionMatch && extensionMatch[1];

      return (
        this.select &&
        this.selectableFileTypes.length > 0 &&
        !(fileExtension && this.selectableFileTypes.includes(fileExtension))
      );
    },
    onKeyDown(e) {
      if (e.key === "Escape") {
        this.entityRenown = null;
        this.entityDeletable = null;
        if (
          this.$refs.search &&
          this.$refs.search.$refs.input === document.activeElement
        ) {
          this.searchText = "";
          this.$refs.search.blur();
        }
      }
    },
    translate(key) {
      return (trads[this.locale] || trads["en"])[key];
    },
    isFileSucess(id) {
      return (
        this.successFileIds.includes(id) ||
        (this.select &&
          this.alreadySelectedIds &&
          this.alreadySelectedIds.includes(id))
      );
    },
    onFileLoaded(loadingFile, loadedFile) {
      if (!loadingFile.folder.children) {
        this.$set(loadingFile.folder, "children", []);
      }
      loadingFile.folder.children = loadingFile.folder.children.filter(
        child => child.id !== loadingFile.id
      );
      loadingFile.folder.children.push(loadedFile);
      this.loadingFiles = this.loadingFiles.filter(
        child => child.id !== loadingFile.id
      );

      this.$emit("success", {
        type: "fileCreated",
        message: this.translate("newFileSuccess"),
        content: loadedFile,
      });

      this.successFileIds.push(loadedFile.id);
      this.timeoutId = setTimeout(() => {
        if (this.successFileIds) {
          this.successFileIds = this.successFileIds.filter(
            fileId => fileId !== loadedFile.id
          );
        }
      }, SUCCESS_TIME);
    },
    onDownload(entity) {
      try {
        downloadFiles(getFlattenTree(entity), {
          projectId: this.projectId,
          spaceId: this.spaceId,
          accessToken: this.accessToken,
          apiUrl: this.apiUrl,
        });
      } catch (error) {
        this.$emit("error", error);
      }
    },
    onDelete(entity) {
      this.entityDeletable = entity;
    },
    onDeleteSuccess() {
      const parent = this.getParent(this.fileStructure, this.entityDeletable);
      if (parent) {
        parent.children = parent.children.filter(
          child => child.id !== this.entityDeletable.id
        );
      }

      const isFolder = this.entityDeletable.nature === "Folder";

      this.$emit("success", {
        type: isFolder ? "folderDeleted" : "fileDeleted",
        message: isFolder
          ? this.translate("deleteFolderSuccess")
          : this.translate("deleteFileSuccess"),
        content: this.entityDeletable,
      });

      this.entityDeletable = null;
    },
    onRename(entity) {
      this.entityRenown = entity;
    },
    onRenameSuccess() {
      const isFolder = this.entityRenown.nature === "Folder";

      this.$emit("success", {
        type: isFolder ? "folderRenamed" : "fileRenamed",
        message: isFolder
          ? this.translate("renameFolderSuccess")
          : this.translate("renameFileSuccess"),
        content: this.entityRenown,
      });
      this.entityRenown = null;
    },
    onView(file) {
      this.pdfToView = file;
    },
    onResize(entries) {
      entries.forEach(entry => {
        this.width = entry.target.clientWidth;
      });
    },
    /**
     * @param { File[] } files
     */
    uploadFiles(files = []) {
      this.loadingFiles.push(...this.formatFiles(files));
    },
    /**
     * @param { File[] } files
     */
    formatFiles(files) {
      return files.map(file => ({
        name: file.name,
        updated_at: new Date(file.lastModified),
        nature: "Document",
        id: `loadingfile-${this.loadingFileId++}`,
        fileToLoad: file,
        folder: this.currentFolder,
      }));
    },
    onNewFolder(newFolder) {
      if (!this.currentFolder.children) {
        this.$set(this.currentFolder, "children", []);
      }
      this.currentFolder.children.push(newFolder);
      this.$emit("success", {
        type: "folderCreated",
        message: this.translate("newFolderSuccess"),
        content: newFolder,
      });
    },
    async onToggleFileSelect(file) {
      let pdfPage = null;

      if (this.isFileSelected(file)) {
        const selectedPdfPage = this.selectedPdfPage(file);
        if (this.pdfPageSelect && file.model_type === "PDF" && selectedPdfPage) {
          this.selectedFiles = this.selectedFiles.filter(
            ({ document }) => document !== file
          );
          this.pdfModelLoading = file.id;
          const model = await this.apiClient.modelApi.getModel(
            this.spaceId,
            file.model_id,
            this.projectId
          );
          this.pdfModelLoading = null;
          if (model.children?.length > 0) {
            pdfPage = await this.openPdfPageSelector(model, selectedPdfPage);
            if (!pdfPage) return;
          }
          this.selectedFiles.push({ document: file, pdfPage });
        } else {
          this.selectedFiles = this.selectedFiles.filter(
            ({ document }) => document !== file
          );
        }
      } else {
        if (!this.multi) {
          this.selectedFiles = [];
        }

        if (this.pdfPageSelect && file.model_type === "PDF") {
          // If 'pdfPageSelect' mode is on and the selected file is a PDF model
          // fetch the corresponding model to check its children (pages)
          this.pdfModelLoading = file.id;
          const model = await this.apiClient.modelApi.getModel(
            this.spaceId,
            file.model_id,
            this.projectId
          );
          this.pdfModelLoading = null;
          if (model.children?.length > 0) {
            // If this is a multipage PDF open the page selector
            pdfPage = await this.openPdfPageSelector(model);
            if (!pdfPage) return; // If no page has been selected then the file is not selected
          }
        }

        this.selectedFiles.push({ document: file, pdfPage });
      }
      this.$emit("selection-change", this.selectedFiles);
    },
    isFileSelected(file) {
      return this.selectedFiles.some(({ document }) => file === document);
    },
    async openPdfPageSelector(model, page) {
      this.pdfModel = model;
      this.pdfModelSelectedPage = page;
      this.pdfPageSelectorDisplayed = true;
      const pdfPage = await new Promise(res => (this.selectPdfPage = res));
      this.pdfPageSelectorDisplayed = false;
      this.pdfModelSelectedPage = null;
      this.pdfModel = null;
      return pdfPage;
    },
    selectedPdfPage(file) {
      return this.selectedFiles.find(({ document }) => file === document)?.pdfPage;
    },
    onBreadcrumClick(step) {
      this.currentFolder = step;
    },
    onBreadcrumBack() {
      const to = this.steps[this.steps.length - 2];
      if (to) {
        this.currentFolder = to;
      }
    },
    openFolder(file) {
      this.currentFolder = file;
    },
    back() {
      const parent = this.getParent(this.fileStructure, this.currentFolder);

      if (parent) {
        this.currentFolder = parent;
      } else {
        this.currentFolder = this.fileStructure;
      }
    },
    getParent(parent, fileStructure) {
      if (!Array.isArray(parent.children)) return;
      if (parent.children.includes(fileStructure)) {
        return parent;
      } else {
        for (let child of parent.children) {
          const newParent = this.getParent(child, fileStructure);
          if (newParent) {
            return newParent;
          }
        }
      }
    },
    getFolder(id, parent = this.fileStructure) {
      if (parent.id === id) {
        return parent;
      } else {
        for (let child of parent.children || []) {
          const folder = this.getFolder(id, child);
          if (folder) {
            return folder;
          }
        }
      }
    },
  },
};
</script>

<style scoped lang="scss" src="./BIMDataFileManager.scss"></style>
