<script setup>
import { makeBIMDataApiClient } from "@bimdata/typescript-fetch-api-client";
import { computed, onBeforeUnmount, onMounted, ref, watch, watchEffect } from "vue";
import { useI18n } from "vue-i18n";
import { downloadFiles } from "./utils/files.js";
import getFlattenTree from "./utils/flattenTree.js";

import BIMDataPDFViewer from "../BIMDataPDFViewer/BIMDataPDFViewer.vue";
import FileCard from "./components/FileCard.vue";
import DeleteModal from "./components/modals/DeleteModal.vue";
import RenameModal from "./components/modals/RenameModal.vue";
import NewFolderButton from "./components/newFolder/NewFolderButton.vue";
import PdfPageSelector from "./components/PdfPageSelector.vue";
import UploadFileButton from "./components/UploadFileButton.vue";

const XS = 398;
const S = 468;
const M = 800;
const SUCCESS_TIME = 3000;

const props = defineProps({
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
});

const emit = defineEmits(["error", "selection-change", "success"]);

const { t } = useI18n();

const apiClient = makeBIMDataApiClient({
  apiUrl: props.apiUrl,
  accessToken: props.accessToken,
});

// Template refs
const root = ref(null);
const search = ref(null);

const currentFolder = ref(null);
const loadingFiles = ref([]);
const searchText = ref("");
const selectedFiles = ref([]);
const fileStructure = ref(null);
const width = ref(0);
const entityRenown = ref(false);
const entityDeletable = ref(false);
const successFileIds = ref([]);
const pdfToView = ref(null);
const pdfModel = ref(null);
const pdfModelSelectedPage = ref(null);
const pdfModelLoading = ref(null);
const pdfPageSelectorDisplayed = ref(false);

const modalDisplayed = computed(() => {
  return entityRenown.value || entityDeletable.value;
});
const navigationShown = computed(() => {
  return currentFolder.value !== fileStructure.value;
});
const xsLayout = computed(() => {
  return width.value < XS;
});
const sLayout = computed(() => {
  return width.value >= XS && width.value < S;
});
const mLayout = computed(() => {
  return width.value >= S && width.value < M;
});
const lLayout = computed(() => {
  return width.value >= M;
});
const itemWidth = computed(() => {
  return xsLayout.value ? "100%" : sLayout.value ? "180px" : "164px";
});
const files = ref([]);
watchEffect(() => {
  let _files = currentFolder.value?.children ?? [];
  let text = searchText.value.trim().toLowerCase();
  if (text) {
    _files = _files.filter(file => file.name.toLowerCase().includes(text));
  }

  _files.push(
    ...loadingFiles.value.filter(
      loadingFile =>
        loadingFile.folder.id === currentFolder.value.id &&
        !_files.find(file => file.id === loadingFile.id) // for multi file loading
    )
  );

  _files.sort((a, b) => (a.name || "").localeCompare(b.name));
  _files.sort((a, b) => {
    const aType = a.nature === "Folder" ? 1 : -1;
    const bType = b.nature === "Folder" ? 1 : -1;
    return bType - aType;
  });

  files.value = _files;
});

watch(() => props.accessToken, (token) => {
  apiClient.accessToken = token;
});
watch(() => props.multi, () => {
  selectedFiles.value = [];
  emit("selection-change", selectedFiles.value);
});
watch(() => props.select, () => {
  selectedFiles.value = [];
  emit("selection-change", selectedFiles.value);
});

const isDisabled = (file) => {
  if (file.nature === "Folder") return false;

  const extensionMatch = file.file_name?.match(/\.(\w+$)/);
  const fileExtension = extensionMatch && extensionMatch[1];

  return (
    props.select &&
    props.selectableFileTypes.length > 0 &&
    !(fileExtension && props.selectableFileTypes.includes(fileExtension))
  );
};
const isFileSucess = (id) => {
  return (
    successFileIds.value.includes(id) ||
    (props.select &&
      props.alreadySelectedIds &&
      props.alreadySelectedIds.includes(id))
  );
};
const onFileLoaded = (loadingFile, loadedFile) => {
  if (!loadingFile.folder.children) {
    loadingFile.folder.children = [];
  }
  loadingFile.folder.children = loadingFile.folder.children.filter(
    child => child.id !== loadingFile.id
  );
  loadingFile.folder.children.push(loadedFile);
  loadingFiles.value = loadingFiles.value.filter(
    child => child.id !== loadingFile.id
  );

  emit("success", {
    type: "fileCreated",
    message: t("FileManager.newFileSuccess"),
    content: loadedFile,
  });

  successFileIds.value.push(loadedFile.id);
  timeoutId = setTimeout(() => {
    successFileIds.value = successFileIds.value.filter(
      fileId => fileId !== loadedFile.id
    );
  }, SUCCESS_TIME);
};
const onDownload = async (entity) => {
  try {
    await downloadFiles(getFlattenTree(entity), {
      apiUrl: props.apiUrl,
      spaceId: props.spaceId,
      projectId: props.projectId,
      accessToken: props.accessToken,
    });
  } catch (error) {
    emit("error", error);
  }
};
const onDelete = (entity) => {
  entityDeletable.value = entity;
};
const onDeleteSuccess = () => {
  const parent = getParent(fileStructure.value, entityDeletable.value);
  if (parent) {
    parent.children = parent.children.filter(
      child => child.id !== entityDeletable.value.id
    );
  }

  const isFolder = entityDeletable.value.nature === "Folder";

  emit("success", {
    type: isFolder ? "folderDeleted" : "fileDeleted",
    message: isFolder
      ? t("FileManager.deleteFolderSuccess")
      : t("FileManager.deleteFileSuccess"),
    content: entityDeletable.value,
  });

  entityDeletable.value = null;
};
const onRename = (entity) => {
  entityRenown.value = entity;
};
const onRenameSuccess = () => {
  const isFolder = entityRenown.value.nature === "Folder";

  emit("success", {
    type: isFolder ? "folderRenamed" : "fileRenamed",
    message: isFolder
      ? t("FileManager.renameFolderSuccess")
      : t("FileManager.renameFileSuccess"),
    content: entityRenown.value,
  });

  entityRenown.value = null;
};
const onView = (file) => {
  pdfToView.value = file;
};
const onResize = (entries) => {
  entries.forEach(entry => {
    width.value = entry.target.clientWidth;
  });
};
/**
 * @param { File[] } files
 */
const uploadFiles = (files = []) => {
  loadingFiles.value.push(...formatFiles(files));
};
/**
 * @param { File[] } files
 */
const formatFiles = (files) => {
  return files.map(file => ({
    name: file.name,
    updated_at: new Date(file.lastModified),
    nature: "Document",
    id: `loadingfile-${loadingFileId++}`,
    fileToLoad: file,
    folder: currentFolder.value,
  }));
};
const onNewFolder = (newFolder) => {
  if (!currentFolder.value.children) {
    currentFolder.value.children = [];
  }
  currentFolder.value.children.push(newFolder);
  emit("success", {
    type: "folderCreated",
    message: t("FileManager.newFolderSuccess"),
    content: newFolder,
  });
};
const onToggleFileSelect = async (file) => {
  let pdfPage = null;

  if (isFileSelected(file)) {
    const selectedPdfPage = selectedPdfPage(file);
    if (props.pdfPageSelect && file.model_type === "PDF" && selectedPdfPage) {
      selectedFiles.value = selectedFiles.value.filter(
        ({ document }) => document !== file
      );
      pdfModelLoading.value = file.id;
      const model = await apiClient.modelApi.getModel(
        props.spaceId,
        file.model_id,
        props.projectId
      );
      pdfModelLoading.value = null;
      if (model.children?.length > 0) {
        pdfPage = await openPdfPageSelector(model, selectedPdfPage);
        if (!pdfPage) return;
      }
      selectedFiles.value.push({ document: file, pdfPage });
    } else {
      selectedFiles.value = selectedFiles.value.filter(
        ({ document }) => document !== file
      );
    }
  } else {
    if (!props.multi) {
      selectedFiles.value = [];
    }

    if (props.pdfPageSelect && file.model_type === "PDF") {
      // If 'pdfPageSelect' mode is on and the selected file is a PDF model
      // fetch the corresponding model to check its children (pages)
      pdfModelLoading.value = file.id;
      const model = await apiClient.modelApi.getModel(
        props.spaceId,
        file.model_id,
        props.projectId
      );
      pdfModelLoading.value = null;
      if (model.children?.length > 0) {
        // If this is a multipage PDF open the page selector
        pdfPage = await openPdfPageSelector(model);
        if (!pdfPage) return; // If no page has been selected then the file is not selected
      }
    }

    selectedFiles.value.push({ document: file, pdfPage });
  }
  emit("selection-change", selectedFiles.value);
};
const isFileSelected = (file) => {
  return selectedFiles.value.some(({ document }) => file === document);
};
const openPdfPageSelector = async (model, page) => {
  pdfModel.value = model;
  pdfModelSelectedPage.value = page;
  pdfPageSelectorDisplayed.value = true;
  const pdfPage = await new Promise(res => (selectPdfPage = res));
  pdfPageSelectorDisplayed.value = false;
  pdfModelSelectedPage.value = null;
  pdfModel.value = null;
  return pdfPage;
};
const selectedPdfPage = (file) => {
  return selectedFiles.value.find(({ document }) => file === document)?.pdfPage;
};
const openFolder = (file) => {
  currentFolder.value = file;
};
const back = () => {
  const parent = getParent(fileStructure.value, currentFolder.value);

  if (parent) {
    currentFolder.value = parent;
  } else {
    currentFolder.value = fileStructure.value;
  }
};
const getParent = (parent, fileStructure) => {
  if (!Array.isArray(parent.children)) return;
  if (parent.children.includes(fileStructure)) {
    return parent;
  } else {
    for (let child of parent.children) {
      const newParent = getParent(child, fileStructure);
      if (newParent) {
        return newParent;
      }
    }
  }
};
const getFolder = (id, parent = fileStructure.value) => {
  if (parent.id === id) {
    return parent;
  } else {
    for (let child of parent.children || []) {
      const folder = getFolder(id, child);
      if (folder) {
        return folder;
      }
    }
  }
};

// Created
let loadingFileId = 0;
let resizeObserver;
let timeoutId;

apiClient.collaborationApi.getProjectDMSTree(props.spaceId, props.projectId)
  .then(response => {
    fileStructure.value = response;
    currentFolder.value = response;
  })
  .catch(error => emit("error", error));

onMounted(() => {
  resizeObserver = new ResizeObserver(onResize);
  resizeObserver.observe(root.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  clearTimeout(timeoutId);
});
</script>

<template>
  <div class="bimdata-file-manager" ref="root">
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
        {{ $t("FileManager.dmsRoot") }}
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
          <span>{{ $t("FileManager.emptyFolder") }}</span>
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
        v-if="entityRenown"
        :projectId="projectId"
        :spaceId="spaceId"
        :apiClient="apiClient"
        :entity="entityRenown"
        @close="entityRenown = null"
        @success="onRenameSuccess"
        @error="$emit('error', $event)"
      />
      <DeleteModal
        v-else-if="entityDeletable"
        :projectId="projectId"
        :spaceId="spaceId"
        :apiClient="apiClient"
        :entity="entityDeletable"
        @close="entityDeletable = null"
        @success="onDeleteSuccess"
        @error="$emit('error', $event)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./BIMDataFileManager.scss"></style>
