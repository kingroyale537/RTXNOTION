// lib/formulas.ts
// Formulas 2.0 Calculation Engine for Voltaic Database properties.
// Evaluates mathematical, string, date, array, and logical expressions over database row items.

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
      if (Array.isArray(val)) return JSON.stringify(val);
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
      SUM: (...args: any[]) => {
        const flat = args.flat(Infinity);
        return flat.reduce((a, b) => Number(a || 0) + Number(b || 0), 0);
      },
      AVG: (...args: any[]) => {
        const flat = args.flat(Infinity);
        return flat.length ? formulaEnv.SUM(...flat) / flat.length : 0;
      },
      ROUND: (val: number) => Math.round(Number(val || 0)),
      ABS: (val: number) => Math.abs(Number(val || 0)),
      CEIL: (val: number) => Math.ceil(Number(val || 0)),
      FLOOR: (val: number) => Math.floor(Number(val || 0)),

      // Array / List Operations (Formulas 2.0)
      MAP: (arr: any[], fn: (item: any) => any) => (Array.isArray(arr) ? arr.map(fn) : []),
      FILTER: (arr: any[], fn: (item: any) => boolean) => (Array.isArray(arr) ? arr.filter(fn) : []),
      JOIN: (arr: any[], sep = ", ") => (Array.isArray(arr) ? arr.join(sep) : String(arr || "")),

      // Strings
      CONCAT: (...args: any[]) => args.map((a) => (a === null || a === undefined ? "" : String(a))).join(""),
      UPPER: (str: any) => String(str || "").toUpperCase(),
      LOWER: (str: any) => String(str || "").toLowerCase(),
      LENGTH: (str: any) => String(str || "").length,
      TRIM: (str: any) => String(str || "").trim(),
      REPLACE: (str: any, search: string, replacement: string) => String(str || "").replace(new RegExp(search, "g"), replacement),
      TEST: (str: any, pattern: string) => new RegExp(pattern, "i").test(String(str || "")),

      // Date & Utility
      NOW: () => new Date().toISOString(),
      TODAY: () => new Date().toLocaleDateString(),
      DATEBETWEEN: (date1: any, date2: any, unit: "days" | "hours" | "minutes" = "days") => {
        const d1 = new Date(date1).getTime();
        const d2 = new Date(date2).getTime();
        const diffMs = Math.abs(d1 - d2);
        if (unit === "hours") return Math.floor(diffMs / (1000 * 60 * 60));
        if (unit === "minutes") return Math.floor(diffMs / (1000 * 60));
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      },
      FORMAT: (val: any) => String(val ?? ""),
    };

    // Evaluate standard expressions using Function constructor in a constrained scope
    const keys = Object.keys(formulaEnv);
    const values = Object.values(formulaEnv);
    const evaluator = new Function(...keys, `return ${expr};`);
    const result = evaluator(...values);

    if (typeof result === "object" && result !== null) {
      return JSON.stringify(result);
    }
    return result;
  } catch {
    return `#ERROR!`;
  }
}
