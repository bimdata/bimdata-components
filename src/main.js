import { createApp } from "vue";
import BIMDataDesignSystem from "@bimdata/design-system/plugin-vue3.js";
import App from "./App.vue";

const app = createApp(App)
  .use(BIMDataDesignSystem())

app.mount("#app");