function createService(apiClient, space, project) {
  const spaceId = space.id;
  const projectId = project.id;
  const modelApi = apiClient.modelApi;

  function fetchMetaBuildings() {
    return modelApi.getModels(
      spaceId,
      projectId,
      undefined, // source
      undefined, // status
      "METABUILDING" // type
    );
  }

  function createMetaBuilding(model) {
    return modelApi.createMetaBuilding(spaceId, projectId, model);
  }

  function updateMetaBuilding(model) {
    return modelApi.updateModel(spaceId, model.id, projectId, model);
  }

  function deleteMetaBuilding(model) {
    return modelApi.deleteModel(spaceId, model.id, projectId);
  }

  // ---

  async function fetchStoreys(model) {
    return modelApi.getStoreys(spaceId, model.id, projectId);
  }

  function createStorey(model, storey) {
    return modelApi.createStorey(
      spaceId,
      model.id,
      projectId,
      storey
    );
  }

  function updateStorey(model, storey) {
    return modelApi.updateStorey(
      spaceId,
      model.id,
      projectId,
      storey.uuid,
      storey
    );
  }

  function deleteStorey(model, storey) {
    return modelApi.deleteStorey(
      spaceId,
      model.id,
      projectId,
      storey.uuid
    );
  }

  /**
   * Create a model for each given documents
   */
  function createPlanModels(documents) {
    return Promise.all(
      documents.map(doc =>
        doc.model_id
          ? Promise.resolve({ id: doc.model_id })
          : modelApi.createModel(
              spaceId,
              projectId,
              { document_id: doc.id }
            )
      )
    );
  }

  /**
   * Link a list of models to the given meta-building storey
   */
  function createStoreyPlans(model, storey, plans) {
    return Promise.all(
      plans.map(plan =>
        modelApi.createStoreyPlan(
          spaceId,
          model.id,
          projectId,
          storey.uuid,
          { id: plan.id }
        )
      )
    );
  }

  function deleteStoreyPlan(model, storey, plan) {
    return modelApi.deleteStoreyPlan(
      spaceId,
      plan.plan.id,
      model.id,
      projectId,
      storey.uuid
    );
  }

  return {
    fetchMetaBuildings,
    createMetaBuilding,
    updateMetaBuilding,
    deleteMetaBuilding,
    fetchStoreys,
    createStorey,
    updateStorey,
    deleteStorey,
    createPlanModels,
    createStoreyPlans,
    deleteStoreyPlan,
  };
}

export { createService };
