import { createContext, useContext, useState } from "react";

const BudgetContext = createContext({
  budgetMonthId: null,
  setBudgetMonthId: () => { },
});

export const BudgetProvider = ({ children }) => {
  const [budgetMonthId, setBudgetMonthId] = useState(null);

  return (
    <BudgetContext.Provider value={{ budgetMonthId, setBudgetMonthId }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);
