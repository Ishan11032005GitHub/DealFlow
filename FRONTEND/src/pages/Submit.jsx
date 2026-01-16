import React, { useMemo, useState } from "react";
import TopNav from "../components/TopNav.jsx";
import { createSubmission, SECTORS, STAGES } from "../api/submissions.js";

const initial = {
  founderName: "",
  startupName: "",
  pitchDescription: "",
  sector: "",
  stage: "",
  traction: "",
};

export default function Submit() {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null); // { id }

  const canSubmit = useMemo(() => !busy, [busy]);

  const onChange = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) return;

    try {
      setBusy(true);
      const res = await createSubmission(cleanPayload(form));
      // backend may return created doc or {id}. support both
      const id = res?._id || res?.id || res?.submission?._id || null;
      setSuccess({ id });
      setForm(initial);
    } catch (err) {
      setErrors((p) => ({ ...p, _global: err.message || "Failed to submit" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <TopNav />
      <div className="container">
        <div className="page-head">
          <h1>Submit your startup</h1>
          <p className="muted">Internal intake form (MVP). Keep it crisp and factual.</p>
        </div>

        {success && (
          <div className="alert success">
            <div className="strong">Submitted.</div>
            <div className="muted">
              {success.id ? (
                <>
                  Submission ID: <code>{success.id}</code>
                </>
              ) : (
                "Saved successfully."
              )}
            </div>
            <button className="btn secondary" onClick={() => setSuccess(null)}>
              Submit another
            </button>
          </div>
        )}

        {!success && (
          <form className="card form" onSubmit={onSubmit}>
            {errors._global && <div className="alert error">{errors._global}</div>}

            <div className="grid2">
              <Field
                label="Founder name"
                value={form.founderName}
                onChange={onChange("founderName")}
                error={errors.founderName}
                placeholder="e.g., Rahul Sharma"
              />
              <Field
                label="Startup name"
                value={form.startupName}
                onChange={onChange("startupName")}
                error={errors.startupName}
                placeholder="e.g., FlowPay"
              />
            </div>

            <div className="field">
              <label>Pitch description</label>
              <textarea
                rows={6}
                value={form.pitchDescription}
                onChange={onChange("pitchDescription")}
                placeholder="What do you do, for whom, and why now?"
              />
              {errors.pitchDescription && (
                <div className="error-text">{errors.pitchDescription}</div>
              )}
            </div>

            <div className="grid3">
              <div className="field">
                <label>Sector</label>
                <select value={form.sector} onChange={onChange("sector")}>
                  <option value="">Select</option>
                  {SECTORS.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {errors.sector && <div className="error-text">{errors.sector}</div>}
              </div>

              <div className="field">
                <label>Stage</label>
                <select value={form.stage} onChange={onChange("stage")}>
                  <option value="">Select</option>
                  {STAGES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
                {errors.stage && <div className="error-text">{errors.stage}</div>}
              </div>

              <div className="field">
                <label>Traction</label>
                <input
                  value={form.traction}
                  onChange={onChange("traction")}
                  placeholder="e.g., 200 WAUs, 5 pilots, $2k MRR"
                />
                {errors.traction && <div className="error-text">{errors.traction}</div>}
              </div>
            </div>

            <div className="form-actions">
              <button className="btn primary" disabled={!canSubmit} type="submit">
                {busy ? "Submitting..." : "Submit"}
              </button>
              <button
                className="btn secondary"
                type="button"
                onClick={() => {
                  setForm(initial);
                  setErrors({});
                }}
                disabled={busy}
              >
                Reset
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}

function Field({ label, value, onChange, error, placeholder }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input value={value} onChange={onChange} placeholder={placeholder} />
      {error && <div className="error-text">{error}</div>}
    </div>
  );
}

function cleanPayload(f) {
  return {
    founderName: f.founderName.trim(),
    startupName: f.startupName.trim(),
    pitch: f.pitchDescription.trim(), // ✅ MAP TO BACKEND FIELD
    sector: f.sector,
    stage: f.stage,
    traction: f.traction.trim(),
  };
}

function validate(f) {
  const e = {};
  if (!f.founderName.trim() || f.founderName.trim().length < 2)
    e.founderName = "Enter founder name (min 2 chars).";
  if (!f.startupName.trim() || f.startupName.trim().length < 2)
    e.startupName = "Enter startup name (min 2 chars).";
  if (!f.pitchDescription.trim() || f.pitchDescription.trim().length < 30)
    e.pitchDescription = "Pitch must be at least 30 characters.";
  if (!f.sector) e.sector = "Select a sector.";
  if (!f.stage) e.stage = "Select a stage.";
  if (!f.traction.trim() || f.traction.trim().length < 5)
    e.traction = "Enter traction (min 5 chars).";
  return e;
}
