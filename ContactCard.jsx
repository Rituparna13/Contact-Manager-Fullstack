import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteContact } from '../store/contactsSlice';

export default function ContactCard({ contact, onEdit }) {
  const dispatch = useDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const initials = `${contact.first_name[0]}${contact.last_name[0]}`.toUpperCase();

  const colors = [
    '#e05c3a', '#3a7de0', '#3ac47d', '#a33ae0', '#e0a63a', '#3ac4e0'
  ];
  const color = colors[(contact.id - 1) % colors.length];

  return (
    <div className="contact-card">
      <div className="card-avatar" style={{ background: color }}>
        {initials}
      </div>
      <div className="card-body">
        <h3 className="card-name">{contact.first_name} {contact.last_name}</h3>
        <div className="card-details">
          <div className="card-detail">
            <span className="detail-icon">✉</span>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </div>
          <div className="card-detail">
            <span className="detail-icon">☎</span>
            <span>{contact.phone}</span>
          </div>
          <div className="card-detail">
            <span className="detail-icon">⌖</span>
            <span>{contact.address}</span>
          </div>
        </div>
      </div>
      <div className="card-actions">
        <button className="icon-btn edit-btn" onClick={() => onEdit(contact)} title="Edit">
          ✎
        </button>
        {!confirmDelete ? (
          <button className="icon-btn delete-btn" onClick={() => setConfirmDelete(true)} title="Delete">
            ✕
          </button>
        ) : (
          <div className="confirm-delete">
            <span>Delete?</span>
            <button className="icon-btn confirm-yes" onClick={() => dispatch(deleteContact(contact.id))}>Yes</button>
            <button className="icon-btn confirm-no" onClick={() => setConfirmDelete(false)}>No</button>
          </div>
        )}
      </div>
    </div>
  );
}
