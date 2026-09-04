export type CategorySeed = {
  name: string;
  icon: string;
  color: string;
  kind: "EXPENSE" | "INCOME" | "INVESTMENT";
  children?: { name: string; icon?: string }[];
};

// Árbol de categorías por defecto ("ramas") con el que arranca la app.
// El usuario puede editarlo desde /categories.
export const defaultCategories: CategorySeed[] = [
  {
    name: "Alimentación",
    icon: "🍽️",
    color: "#f97316",
    kind: "EXPENSE",
    children: [
      { name: "Supermercado" },
      { name: "Restaurantes" },
      { name: "Cafeterías" },
    ],
  },
  {
    name: "Transporte",
    icon: "🚗",
    color: "#3b82f6",
    kind: "EXPENSE",
    children: [
      { name: "Gasolina" },
      { name: "Transporte público" },
      { name: "Taxi / VTC" },
      { name: "Parking y peajes" },
    ],
  },
  {
    name: "Vivienda",
    icon: "🏠",
    color: "#8b5cf6",
    kind: "EXPENSE",
    children: [
      { name: "Alquiler / Hipoteca" },
      { name: "Suministros" },
      { name: "Mantenimiento" },
    ],
  },
  {
    name: "Salud",
    icon: "🏥",
    color: "#ef4444",
    kind: "EXPENSE",
    children: [
      { name: "Farmacia" },
      { name: "Médico" },
      { name: "Seguro médico" },
    ],
  },
  {
    name: "Ocio",
    icon: "🎉",
    color: "#ec4899",
    kind: "EXPENSE",
    children: [
      { name: "Suscripciones" },
      { name: "Cine y eventos" },
      { name: "Viajes" },
    ],
  },
  {
    name: "Compras",
    icon: "🛍️",
    color: "#eab308",
    kind: "EXPENSE",
    children: [
      { name: "Ropa" },
      { name: "Electrónica" },
      { name: "Hogar" },
    ],
  },
  {
    name: "Finanzas",
    icon: "💳",
    color: "#64748b",
    kind: "EXPENSE",
    children: [
      { name: "Comisiones bancarias" },
      { name: "Impuestos" },
      { name: "Transferencias" },
    ],
  },
  {
    name: "Ingresos",
    icon: "💰",
    color: "#16a34a",
    kind: "INCOME",
    children: [{ name: "Nómina" }, { name: "Otros ingresos" }],
  },
  {
    name: "Inversión",
    icon: "📈",
    color: "#0891b2",
    kind: "INVESTMENT",
    children: [{ name: "Aportaciones" }, { name: "Rendimientos" }],
  },
  {
    name: "Otros",
    icon: "❔",
    color: "#6b7280",
    kind: "EXPENSE",
  },
];
