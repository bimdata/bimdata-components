import { ref } from "vue";

export function setupTree(tree, parent) {
  if (Array.isArray(tree)) {
    tree = tree.map(t => setupTree(t, parent));
  } else {
    tree.expandedRef = ref(true);
    tree.parent = parent;

    tree.children = tree.children?.map(child => setupTree(child, tree)) ?? [];
  }
  return tree;
}

export function buildStructureTree(model, storeys, zones) {
  return [
    {
      id: 1,
      text: model.name,
      component: "StructureRootNode",
      children: storeys.map(storey => storeyNode(storey, zones)),
    }
  ];
}

const storeyNode = (storey, zones) => ({
  id: storey.uuid,
  text: storey.name,
  component: "StoreyNode",
  children: storey.plans?.map(plan => planNode(storey, plan)) ?? [],
  storey,
});

const zoneNode = zone => ({
  id: zone.id,
  text: zone.name,
  component: "ZoneNode",
  children: zone.zones.map(zoneNode),
  zone,
});

const planNode = (storey, plan) => ({
  id: plan.plan.id,
  text: plan.plan.name,
  component: "PlanNode",
  storey,
  plan,
});
