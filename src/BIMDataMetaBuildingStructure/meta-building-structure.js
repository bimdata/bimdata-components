import { ref } from "vue";

export function buildStructureTree(model, storey) {
  return [
    {
      id: 1,
      text: "Zones",
      component: "StructureRootNode",
      children: buildZonesTree(model, storey),
    },
    {
      id: 2,
      text: "Plans",
      component: "StructureRootNode",
      children: buildPlansTree(model, storey),
    }
  ];
}

export function buildZonesTree(model, storey) {
  if (!model || !storey) return [];

  const zones = model.zones.filter(zone => zone.storey_uuid === storey.uuid);

  return zones.map(zoneNode);
}

export function buildPlansTree(model, storey) {
  if (!model || !storey) return [];

  return storey.plans.map(planNode);
}

export function setupTree(tree, parent) {
  if (Array.isArray(tree)) {
    tree = tree.map(t => setupTree(t, parent));
  } else {
    tree.visibleRef = ref(true);
    tree.expandedRef = ref(true);
    tree.selectedRef = ref(true);
    tree.parent = parent;

    tree.ancestors = () => tree.parent ? [tree.parent].concat(tree.parent.ancestors()) : [];

    const children = () => tree.children ?? [];
    tree.descendants = () => children().concat(children().flatMap(child => child.descendants()));

    tree.children = tree.children?.map(child => setupTree(child, tree)) ?? [];
  }
  return tree;
}

export function flattenTree(tree) {
  if (Array.isArray(tree)) {
    return tree.flatMap(t => flattenTree(t));
  } else {
    return [tree].concat(tree.descendants());
  }
}

const zoneNode = zone => ({
  id: zone.id,
  text: zone.name,
  component: "ZoneNode",
  children: zone.zones.map(zoneNode).concat(zone.spaces.map(spaceNode)),
  zone,
});

const spaceNode = space => ({
  id: space.id,
  text: space.name,
  component: "SpaceNode",
  space,
});

const planNode = plan => ({
  id: plan.plan.id,
  text: plan.plan.name,
  component: "PlanNode",
  plan,
});
