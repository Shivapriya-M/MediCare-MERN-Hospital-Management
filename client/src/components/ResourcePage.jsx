import { useMemo, useState } from "react";
import { Search, Pencil, Trash2, Save, X } from "lucide-react";

export const configs = {
  patients: {
    title: "Patients",
    singular: "Patient",
    desc: "Register and manage patient information",
    fields: [
      ["name", "Patient name", "text", 1],
      ["age", "Age", "number", 1],
      ["gender", "Gender", "select", 1, ["Female", "Male", "Other"]],
      ["phone", "Phone number", "tel", 1],
      ["email", "Email", "email"],
      [
        "bloodGroup",
        "Blood group",
        "select",
        0,
        ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      ],
      ["address", "Address", "text"],
      ["disease", "Reason for visit", "text", 1],
    ],
    cols: [
      ["name", "Patient"],
      ["age", "Age"],
      ["gender", "Gender"],
      ["phone", "Phone"],
      ["disease", "Reason"],
    ],
  },

  doctors: {
    title: "Doctors & Employees",
    singular: "Doctor",
    desc: "Manage doctors, specializations and availability",
    fields: [
      ["name", "Doctor name", "text", 1],
      ["specialization", "Specialization", "text", 1],
      ["department", "Department", "text"],
      ["phone", "Phone number", "tel", 1],
      ["email", "Email", "email"],
      [
        "availability",
        "Availability",
        "select",
        1,
        ["Available", "Unavailable", "On Leave"],
      ],
      ["consultationFee", "Consultation fee (₹)", "number"],
    ],
    cols: [
      ["name", "Doctor"],
      ["specialization", "Specialization"],
      ["department", "Department"],
      ["phone", "Phone"],
      ["availability", "Availability"],
      ["consultationFee", "Fee"],
    ],
  },

  departments: {
    title: "Departments",
    singular: "Department",
    desc: "Manage hospital departments",
    fields: [
      ["name", "Department name", "text", 1],
      ["head", "Department head", "text"],
      ["location", "Location", "text"],
      ["phone", "Contact phone", "text"],
    ],
    cols: [
      ["name", "Department"],
      ["head", "Department head"],
      ["location", "Location"],
      ["phone", "Contact"],
    ],
  },

  appointments: {
    title: "Appointments",
    singular: "Appointment",
    desc: "Schedule and track patient appointments",
    fields: [
      ["patientId", "Patient ID", "text", 1],
      ["patientName", "Patient name", "text", 1],
      ["doctorId", "Doctor ID", "text", 1],
      ["doctorName", "Doctor name", "text", 1],
      ["department", "Department", "text"],
      ["date", "Date", "date", 1],
      ["time", "Time", "time", 1],
      ["reason", "Reason", "text"],
      [
        "status",
        "Status",
        "select",
        1,
        ["Scheduled", "Completed", "Cancelled"],
      ],
    ],
    cols: [
      ["patientName", "Patient"],
      ["doctorName", "Doctor"],
      ["department", "Department"],
      ["date", "Date"],
      ["time", "Time"],
      ["status", "Status"],
    ],
  },

  invoices: {
    title: "Billing & Invoices",
    singular: "Invoice",
    desc: "Create invoices and track payments",
    fields: [
      ["invoiceNumber", "Invoice number", "text", 1],
      ["patientId", "Patient ID", "text", 1],
      ["patientName", "Patient name", "text", 1],
      ["description", "Description", "text", 1],
      ["amount", "Amount (₹)", "number", 1],
      [
        "paymentStatus",
        "Payment status",
        "select",
        1,
        ["Pending", "Paid", "Overdue"],
      ],
      ["invoiceDate", "Invoice date", "date", 1],
    ],
    cols: [
      ["invoiceNumber", "Invoice"],
      ["patientName", "Patient"],
      ["description", "Description"],
      ["amount", "Amount"],
      ["paymentStatus", "Payment"],
      ["invoiceDate", "Date"],
    ],
  },

  "medical-history": {
    title: "Medical History",
    singular: "History record",
    desc: "Record visits, diagnoses and treatments",
    fields: [
      ["patientId", "Patient ID", "text", 1],
      ["patientName", "Patient name", "text", 1],
      ["visitDate", "Visit date", "date", 1],
      ["diagnosis", "Diagnosis", "text", 1],
      ["treatment", "Treatment", "text"],
      ["doctorName", "Doctor name", "text"],
      ["notes", "Notes", "textarea"],
    ],
    cols: [
      ["patientName", "Patient"],
      ["visitDate", "Visit date"],
      ["diagnosis", "Diagnosis"],
      ["treatment", "Treatment"],
      ["doctorName", "Doctor"],
    ],
  },

  prescriptions: {
    title: "Prescriptions",
    singular: "Prescription",
    desc: "Manage medicines and dosage instructions",
    fields: [
      ["patientId", "Patient ID", "text", 1],
      ["patientName", "Patient name", "text", 1],
      ["doctorName", "Doctor name", "text", 1],
      ["medicine", "Medicine", "text", 1],
      ["dosage", "Dosage", "text", 1],
      ["frequency", "Frequency", "text", 1],
      ["startDate", "Start date", "date", 1],
      ["instructions", "Instructions", "textarea"],
    ],
    cols: [
      ["patientName", "Patient"],
      ["doctorName", "Doctor"],
      ["medicine", "Medicine"],
      ["dosage", "Dosage"],
      ["frequency", "Frequency"],
      ["startDate", "Start date"],
    ],
  },
};

export default function ResourcePage({
  resource,
  records = [],
  loading = false,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const cfg = configs[resource];

  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const blank = () =>
    Object.fromEntries(cfg.fields.map(([key]) => [key, ""]));

  function reset() {
    setEditing(null);
    setForm(blank());
    setError("");
  }

  function edit(record) {
    setEditing(record._id);

    setForm(
      Object.fromEntries(
        cfg.fields.map(([key]) => [
          key,
          record[key] == null ? "" : String(record[key]),
        ])
      )
    );

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  const filtered = useMemo(() => {
    const searchText = query.toLowerCase().trim();

    return records.filter((record) =>
      cfg.cols.some(([key]) =>
        String(record[key] ?? "")
          .toLowerCase()
          .includes(searchText)
      )
    );
  }, [records, query, cfg]);

  async function submit(event) {
    event.preventDefault();

    if (saving) return;

    setSaving(true);
    setError("");

    const payload = { ...form };

    cfg.fields.forEach(([key, , type]) => {
      if (type === "number" && payload[key] !== "") {
        payload[key] = Number(payload[key]);
      }
    });

    try {
      if (editing) {
        await onUpdate(resource, editing, payload);
      } else {
        await onCreate(resource, payload);
      }

      reset();
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          "Could not save record. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record) {
    const confirmed = window.confirm(
      `Are you sure you want to delete this ${cfg.singular.toLowerCase()}?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await onDelete(resource, record._id);

      if (editing === record._id) {
        reset();
      }
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          "Could not delete record. Please try again."
      );
    }
  }

  if (!cfg) {
    return (
      <div className="panel">
        <h2>Resource not found</h2>
        <p>
          The requested resource "{resource}" is not configured.
        </p>
      </div>
    );
  }

  return (
    <div className="resource-layout">
      {/* Page heading */}

      <div className="page-heading">
        <div>
          <span className="eyebrow">MANAGEMENT</span>
          <h2>{cfg.title}</h2>
          <p>{cfg.desc}</p>
        </div>

        <div className="record-count">
          <b>{records.length}</b>
          <span>Total records</span>
        </div>
      </div>

      {/* Registration form */}

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>
              {editing
                ? `Edit ${cfg.singular}`
                : `Register ${cfg.singular}`}
            </h3>

            <p>Complete the required fields marked *.</p>
          </div>

          {editing && (
            <button
              type="button"
              className="btn btn-light"
              onClick={reset}
            >
              <X size={15} />
              Cancel edit
            </button>
          )}
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form className="record-form" onSubmit={submit}>
          {cfg.fields.map(
            ([key, label, type, required, options]) => (
              <label
                className={
                  type === "textarea" ? "field full" : "field"
                }
                key={key}
              >
                <span>
                  {label}
                  {required ? " *" : ""}
                </span>

                {type === "select" ? (
                  <select
                    required={!!required}
                    value={form[key] ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [key]: event.target.value,
                      })
                    }
                  >
                    <option value="">
                      Select {label.toLowerCase()}
                    </option>

                    {options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : type === "textarea" ? (
                  <textarea
                    rows="3"
                    required={!!required}
                    value={form[key] ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [key]: event.target.value,
                      })
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type={type}
                    required={!!required}
                    min={type === "number" ? "0" : undefined}
                    max={key === "age" ? "130" : undefined}
                    step={type === "number" ? "any" : undefined}
                    pattern={
                      key === "phone" ? "[0-9]{10}" : undefined
                    }
                    maxLength={key === "phone" ? 10 : undefined}
                    value={form[key] ?? ""}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [key]: event.target.value,
                      })
                    }
                    placeholder={`Enter ${label.toLowerCase()}`}
                  />
                )}
              </label>
            )
          )}

          <div className="form-actions full">
            <button
              type="button"
              className="btn btn-light"
              onClick={reset}
              disabled={saving}
            >
              Clear
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Save size={15} />

              {saving
                ? "Saving..."
                : editing
                  ? "Update record"
                  : `Save ${cfg.singular}`}
            </button>
          </div>
        </form>
      </section>

      {/* Records table */}

      <section className="panel">
        <div className="panel-heading table-heading">
          <div>
            <h3>All {cfg.title}</h3>
            <p>Records stored in MongoDB</p>
          </div>

          <div className="search-box">
            <Search size={16} />

            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${cfg.title.toLowerCase()}...`}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {cfg.cols.map(([, label]) => (
                  <th key={label}>{label}</th>
                ))}

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    className="table-empty"
                    colSpan={cfg.cols.length + 1}
                  >
                    Loading records...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    className="table-empty"
                    colSpan={cfg.cols.length + 1}
                  >
                    No records found. Add your first record above.
                  </td>
                </tr>
              ) : (
                filtered.map((record) => (
                  <tr key={record._id}>
                    {cfg.cols.map(([key]) => (
                      <td key={key}>
                        {[
                          "availability",
                          "status",
                          "paymentStatus",
                        ].includes(key) ? (
                          <span
                            className={`pill ${String(
                              record[key] ?? ""
                            )
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {record[key] ?? "—"}
                          </span>
                        ) : [
                            "amount",
                            "consultationFee",
                          ].includes(key) ? (
                          `₹${Number(
                            record[key] || 0
                          ).toLocaleString("en-IN")}`
                        ) : (
                          String(record[key] ?? "—")
                        )}
                      </td>
                    ))}

                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-button edit"
                          title="Edit"
                          aria-label={`Edit ${cfg.singular}`}
                          onClick={() => edit(record)}
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          className="icon-button delete"
                          title="Delete"
                          aria-label={`Delete ${cfg.singular}`}
                          onClick={() => deleteRecord(record)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}