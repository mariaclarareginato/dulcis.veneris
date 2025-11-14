export const money = (value) => {
  if (value === null || value === undefined) return "R$ 0,00";

  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};
