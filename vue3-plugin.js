import messages from "./src/i18n/index.js";
import * as Components from "./index.js";

/**
 * Register BIMData components globally.
 *
 * @param {
 *   {
 *     i18nPlugin: Object
 *   } 
 *  } [cfg]
 */
const pluginFactory = ({ i18nPlugin } = {}) => {
  return {
    install(app) {
      if (i18nPlugin) {
        Object.entries(messages).forEach(([locale, translations]) => {
          i18nPlugin.global.mergeLocaleMessage(locale, translations);
        });
      } else {
        console.warn(
          "[BIMData Components Plugin] No i18n instance provided. " +
            "You should either provide an i18n instance or define " +
            "your own translations in order have text displayed properly."
        );
      }

      Object.entries(Components).forEach(([componentName, component]) => {
          app.component(componentName, component);
      });
    },
  };
};

export default pluginFactory;
