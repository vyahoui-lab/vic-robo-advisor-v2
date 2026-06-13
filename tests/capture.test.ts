import { describe, it, expect } from "vitest";
import { buildCapture } from "@/lib/capture";

const base = {
  age: 26, annual_income_chf: 85000, savings_goal: "house" as const,
  horizon_years: 5, risk_tolerance: 8, free_text_goal: "",
};

describe("buildCapture", () => {
  it("minimum necessary fields match the intake numerics", () => {
    const c = buildCapture(base, { time_on_form_seconds: 42, edits_made: 0 });
    expect(c.necessary).toMatchObject({
      age: 26, income_chf: 85000, risk: 8, horizon_years: 5,
    });
  });

  it("extended capture includes timing and tags", () => {
    const c = buildCapture(base, { time_on_form_seconds: 42, edits_made: 3 });
    expect(c.extended.time_on_form_seconds).toBe(42);
    expect(c.extended.edits_made).toBe(3);
    expect(c.extended.tagged_for).toEqual(["model_training", "cross_sell", "partner_sharing"]);
  });

  it("infers first_time_investor from free text", () => {
    const c = buildCapture({ ...base, free_text_goal: "I don't really understand stocks" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_first_time_investor).toBe(true);
  });

  it("infers sustainability preference", () => {
    const c = buildCapture({ ...base, free_text_goal: "I care about ESG and sustainability" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_sustainability_pref).toBe(true);
  });

  it("infers anxiety markers for 'safely', 'cautious'", () => {
    const c = buildCapture({ ...base, free_text_goal: "I want to invest safely and be cautious" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_anxiety_markers).toEqual(
      expect.arrayContaining(["safely", "cautious"])
    );
  });

  it("infers migration signal for 'moved', 'relocated'", () => {
    const c = buildCapture({ ...base, free_text_goal: "I moved to Switzerland for my degree" },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_migration_signal).toBe(true);
  });

  it("benign text produces no inferences", () => {
    const c = buildCapture({ ...base, free_text_goal: "Just want a balanced portfolio." },
      { time_on_form_seconds: 0, edits_made: 0 });
    expect(c.extended.inferred_first_time_investor).toBe(false);
    expect(c.extended.inferred_sustainability_pref).toBe(false);
    expect(c.extended.inferred_migration_signal).toBe(false);
    expect(c.extended.inferred_anxiety_markers).toEqual([]);
  });
});
