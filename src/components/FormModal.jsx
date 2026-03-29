import { useState, useEffect } from 'react';
import styles from './FormModal.module.css';

const FormModal = ({ icon, label, endpoint, fields, onClose, onSave, item, userId }) => {
  const defaults = {};
  for (const field of fields) {
    defaults[field.name] = field.defaultValue ?? '';
  }

  const [formData, setFormData] = useState(defaults);

  useEffect(() => {
    if (item?.id) {
      const populated = {};
      for (const field of fields) {
        const raw = item[field.name];
        if (field.type === 'checkbox') {
          populated[field.name] = raw === 1 || raw === true;
        } else {
          populated[field.name] = raw ?? field.defaultValue ?? '';
        }
      }
      setFormData(populated);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = item?.id ? 'PUT' : 'POST';
      const url = item?.id
        ? `/api/faith-milestones/${endpoint}/${item.id}`
        : `/api/faith-milestones/${endpoint}`;
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Failed to save ${label.toLowerCase()}`);
      onSave();
      onClose();
    } catch (err) {
      alert(`Error saving ${label.toLowerCase()}: ${err.message}`);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>
            {icon} {item?.id ? 'Edit' : 'Add'} {label}
          </h2>
          <button className={styles.close} onClick={onClose}>
            &#x2715;
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {fields.map((field) => (
            <div key={field.name} className={styles.group}>
              {field.type === 'checkbox' ? (
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!formData[field.name]}
                    onChange={handleChange}
                  />
                  <span>{field.label}</span>
                </label>
              ) : field.type === 'select' ? (
                <>
                  <label>{field.label}</label>
                  <select name={field.name} value={formData[field.name]} onChange={handleChange}>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </>
              ) : field.type === 'textarea' ? (
                <>
                  <label>{field.label}</label>
                  <textarea
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    rows={field.rows || 3}
                    required={field.required}
                  />
                </>
              ) : (
                <>
                  <label>{field.label}</label>
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </>
              )}
            </div>
          ))}

          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancel}>
              Cancel
            </button>
            <button type="submit" className={styles.submit}>
              {item?.id ? 'Update' : 'Add'} {label}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormModal;
