import * as Components from "./index.js";

/**
 * Register BIMData components globally.
 *
 * @param {
*   {
*     includedComponents?: string[],
*     excludedComponents?: string[]
*   } 
*  } [cfg]
 */
const pluginFactory = (cfg) => {
  return {
    install(app) {
      // COMPONENTS
      Object.entries(Components).forEach(([componentName, component]) => {
        if (
          cfg &&
          cfg.excludedComponents &&
          cfg.excludedComponents.length > 0 &&
          cfg.excludedComponents.includes(componentName)
        ) {
          return;
        }

        if (
          !cfg ||
          !cfg.includedComponents ||
          cfg.includedComponents.includes(componentName)
        ) {
          app.component(componentName, component);
        }
      });
    },
  };
};

export default pluginFactory;
