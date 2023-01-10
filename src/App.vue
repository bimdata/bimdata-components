<template>
  <main>
    <h1>BIMDataFileManager</h1>
    <BIMDataFileManager
      :spaceId="20145"
      :projectId="509621"
      apiUrl="https://api.bimdata.io"
      accessToken="ZrEuM1JwcPzWmEUcPgKvQjzpOhBpSGTQ"
      :select="false"
      :multi="false"
      style="resize: auto; overflow: hidden"
      :headerButtons="true"
      :headerSearch="true"
      :selectableFileTypes="['pdf', 'dwg']"
      :viewPdf="false"
    />
    <h1>BIMDataModelPreview</h1>
    <BIMDataModelPreview
      :type="'3d'"
      :previewUrl="imgUrl"
      :width="300"
      :height="300"
      :backgroundColor="'var(--color-silver-light)'"
      :zoomFactor="3"
    />
    <h1>BIMDataPDFViewer</h1>
    <BIMDataPDFViewer
      :pdf="pdfToView"
      header
      :style="{ position: 'relative', height: '200px' }"
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
          @click="onCloseClick"
        >
          <BIMDataIcon name="arrow" size="xxs" />
        </BIMDataButton>
      </template>
    </BIMDataPDFViewer>

    <h1>BIMDataSafeZoneModal</h1>
    <div :style="{ position: 'relative', height: '200px' }">
      <BIMDataButton
        color="primary"
        outline
        radius
        icon
        @click="isModalOpen = !isModalOpen"
        >i</BIMDataButton
      >
      <BIMDataSafeZoneModal
        v-if="isModalOpen"
        :width="modalWidth"
        :iconName="iconName"
      >
        <template #text> Your text here </template>
        <template #actions>
          <BIMDataButton color="high" fill radius class="m-r-12">
            Confirm
          </BIMDataButton>
          <BIMDataButton
            color="primary"
            outline
            radius
            @click="isModalOpen = false"
          >
            Close
          </BIMDataButton>
        </template>
      </BIMDataSafeZoneModal>
    </div>
  </main>
</template>

<script>
import BIMDataFileManager from "./components/BIMDataFileManager/BIMDataFileManager.vue";
import BIMDataModelPreview from "./components/BIMDataModelPreview/BIMDataModelPreview.vue";
import BIMDataPDFViewer from "./components/BIMDataPDFViewer/BIMDataPDFViewer.vue";
import BIMDataSafeZoneModal from "./components/BIMDataSafeZoneModal/BIMDataSafeZoneModal.vue";

import imgUrl from "./components/BIMDataModelPreview/preview-3d-example.png";

export default {
  components: {
    BIMDataFileManager,
    BIMDataModelPreview,
    BIMDataPDFViewer,
    BIMDataSafeZoneModal,
  },
  data() {
    return {
      isModalOpen: false,
      pdfToView: null,
    };
  },
  computed: {
    imgUrl() {
      return imgUrl;
    },
  },
};
</script>

<style lang="scss" src="./assets/global.scss"></style>
