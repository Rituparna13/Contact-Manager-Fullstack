import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createContact, updateContact, clearMessages } from './contactsSlice';

const EMPTY = { first_name: '', last_name: '', address: '', email: '', phone: '' };

export default function ContactForm({ editContact, onClose }) {
  const dispatch = useDispatch();
  const { loading, fieldErrors, successMessage } = useSelector(s => s.contacts);

  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [localErrors, setLocalErrors] = useState({}); 

  useEffect(() => {
    if (editContact) {
      setForm({
        first_name: editContact.first_name,
        last_name: editContact.last_name,
        address: editContact.address,
        email: editContact.email,
        phone: editContact.phone,
      });
    } else {
      setForm(EMPTY);
    }
    setTouched({});
    setLocalErrors({});
    dispatch(clearMessages());
  }, [editContact, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => {
        dispatch(clearMessages());
        onClose();
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [successMessage, dispatch, onClose]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errors = {};

    // First Name validation
    if (form.first_name.length > 25) {
      errors.first_name = "First name should not exceed 25 characters";
    }

    // Last Name validation
    if (form.last_name.length > 25) {
      errors.last_name = "Last name should not exceed 25 characters";
    }

    // Phone validation (+countrycode + 10 digits)
    if (!/^\+\d{1,3}\d{10}$/.test(form.phone)) {
      errors.phone = "Use format: +91XXXXXXXXXX";
    }

    // If errors → show in UI
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      setTouched({
        first_name: true,
        last_name: true,
        address: true,
        email: true,
        phone: true,
      });
      return;
    }

    // Clear errors
    setLocalErrors({});

    if (editContact) {
      dispatch(updateContact({ id: editContact.id, data: form }));
    } else {
      dispatch(createContact(form));
    }
  };

  const fields = [
    { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'e.g. Priya' },
    { name: 'last_name', label: 'Last Name', type: 'text', placeholder: 'e.g. Sharma' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'e.g. 12 MG Road, Bangalore' },
    { name: 'email', label: 'Email Address', type: 'email', placeholder: 'e.g. priya@gmail.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +919876543210' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-icon">{editContact ? '✎' : '+'}</div>
          <h2>{editContact ? 'Edit Contact' : 'New Contact'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {successMessage && (
          <div className="alert alert-success">
            <span className="alert-icon">✓</span> {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="contact-form" noValidate>
          <div className="form-grid">
            {fields.map(f => (
              <div key={f.name} className={`form-group ${f.name === 'address' ? 'full-width' : ''}`}>
                <label htmlFor={f.name}>{f.label}</label>
                <input
                  id={f.name}
                  name={f.name}
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.name]}
                  onChange={handleChange}
                  className={(fieldErrors[f.name] || localErrors[f.name]) && touched[f.name] ? 'input-error' : ''}
                />

                {(fieldErrors[f.name] || localErrors[f.name]) && touched[f.name] && (
                  <span className="field-error">
                    {localErrors[f.name] || fieldErrors[f.name]}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : (editContact ? 'Update Contact' : 'Save Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
