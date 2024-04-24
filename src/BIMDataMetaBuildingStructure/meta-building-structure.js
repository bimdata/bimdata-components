import { ref } from "vue";

export function buildStructureTree(storey, zones) {
  return [
    {
      id: 1,
      text: "Zones",
      component: "StructureRootNode",
      children: buildZonesTree(zones),
    },
    {
      id: 2,
      text: "Plans",
      component: "StructureRootNode",
      children: buildPlansTree(storey),
    }
  ];
}

export function buildZonesTree(zones) {
  return zones.map(zoneNode);
}

export function buildPlansTree(storey) {
  return storey?.plans.map(planNode) ?? [];
}

export function setupTree(tree, parent) {
  if (Array.isArray(tree)) {
    tree = tree.map(t => setupTree(t, parent));
  } else {
    tree.visibleRef = ref(true);
    tree.disabledRef = ref(false);
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
