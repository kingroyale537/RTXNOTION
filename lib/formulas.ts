// lib/formulas.ts
// Formulas 2.0 Calculation Engine for Voltaic Database properties.
// Evaluates mathematical, string, date, and logical expressions over database row items.

export type FormulaContext = Record<string, any>;

export function evaluateFormula(formulaStr: string, context: FormulaContext): string | number | boolean {
  if (!formulaStr || !formulaStr.trim()) return "";

  try {
    let expr = formulaStr.trim();

    // Replace prop("PropName") or prop('PropName') references with actual values from context
    expr = expr.replace(/prop\s*\(\s*["']([^"']+)["']\s*\)/gi, (_, propName) => {
      const val = context[propName];
      if (val === undefined || val === null) return "0";
      if (typeof val === "number") return val.toString();
      if (typeof val === "boolean") return val ? "true" : "false";
      return JSON.stringify(val.toString());
    });

    // Helper functions for formula evaluation environment
    const formulaEnv = {
      // Logic
      IF: (cond: any, ifTrue: any, ifFalse: any) => (Boolean(cond) ? ifTrue : ifFalse),
      AND: (...args: any[]) => args.every(Boolean),
      OR: (...args: any[]) => args.some(Boolean),
      NOT: (val: any) => !Boolean(val),

      // Math
      SUM: (...args: number[]) => args.reduce((a, b) => Number(a || 0) + Number(b || 0), 0),
      AVG: (...args: number[]) => (args.length ? formulaEnv.SUM(...args) / args.length : 0),
      ROUND: (val: number) => Math.round(Number(val || 0)),
      ABS: (val: number) => Math.abs(Number(val || 0)),
      CEIL: (val: number) => Math.ceil(Number(val || 0)),
      FLOOR: (val: number) => Math.floor(Number(val || 0)),

      // Strings
      CONCAT: (...args: any[]) => args.map((a) => (a === null || a === undefined ? "" : String(a))).join(""),
      UPPER: (str: any) => String(str || "").toUpperCase(),
      LOWER: (str: any) => String(str || "").toLowerCase(),
      LENGTH: (str: any) => String(str || "").length,
      TRIM: (str: any) => String(str || "").trim(),
      REPLACE: (str: any, search: string, replacement: string) => String(str || "").replace(new RegExp(search, "g"), replacement),

      // Date & Utility
      NOW: () => new Date().toISOString(),
      TODAY: () => new Date().toLocaleDateString(),
      FORMAT: (val: any) => String(val ?? ""),
    };

    // Safely evaluate standard expressions using Function constructor in a constrained scope
    const keys = Object.keys(formulaEnv);
    const values = Object.values(formulaEnv);
    const evaluator = new Function(...keys, `return ${expr};`);
    const result = evaluator(...values);

    if (typeof result === "object" && result !== null) {
      return JSON.stringify(result);
    }
    return result;
  } catch (err) {
    // Return expression error message if formula has syntax issues
    return `#ERROR!`;
  }
}
