export type CategoryNode = {
  id: string;
  name: string;
  icon: string;
  color: string;
  kind: string;
  parentId: string | null;
  children?: CategoryNode[];
};

export type FlatCategoryOption = {
  id: string;
  label: string;
  depth: number;
  icon: string;
  color: string;
};

// Convierte el árbol de categorías en una lista plana para selects,
// indentando las subcategorías bajo su padre.
export function flattenCategories(tree: CategoryNode[]): FlatCategoryOption[] {
  const result: FlatCategoryOption[] = [];
  for (const node of tree) {
    result.push({
      id: node.id,
      label: node.name,
      depth: 0,
      icon: node.icon,
      color: node.color,
    });
    for (const child of node.children ?? []) {
      result.push({
        id: child.id,
        label: child.name,
        depth: 1,
        icon: child.icon,
        color: child.color,
      });
    }
  }
  return result;
}

// Busca el id de categoría de nivel superior cuyo nombre coincide
// (ignorando mayúsculas/acentos) con el nombre sugerido por el modelo.
export function findCategoryIdByName(
  tree: CategoryNode[],
  name: string | undefined | null,
): string | null {
  if (!name) return null;
  const normalized = normalize(name);
  const topMatch = tree.find((c) => normalize(c.name) === normalized);
  if (topMatch) return topMatch.id;

  for (const node of tree) {
    const childMatch = node.children?.find(
      (c) => normalize(c.name) === normalized,
    );
    if (childMatch) return childMatch.id;
  }
  return null;
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}
