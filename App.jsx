import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContacts, setSearch } from '../store/contactsSlice';
import ContactCard from './ContactCard';
import ContactForm from './ContactForm';
import '../styles/app.css';

export default function App() {
  const dispatch = useDispatch();
  const { list, loading, error, searchQuery } = useSelector(s => s.contacts);
  const [showForm, setShowForm] = useState(false);
  const [editContact, setEditContact] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    dispatch(fetchContacts(''));
  }, [dispatch]);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setSearch(searchInput));
      dispatch(fetchContacts(searchInput));
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, dispatch]);

  const handleEdit = useCallback((contact) => {
    setEditContact(contact);
    setShowForm(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowForm(false);
    setEditContact(null);
  }, []);

  const handleAdd = () => {
    setEditContact(null);
    setShowForm(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo">M</div>
          <div className="brand-text">
            <span className="brand-title">MIRA</span>
            <span className="brand-sub">Contact Management</span>
          </div>
        </div>
        <div className="header-right">
          <div className="search-wrapper">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button className="search-clear" onClick={() => setSearchInput('')}>✕</button>
            )}
          </div>
          <button className="btn btn-primary add-btn" onClick={handleAdd}>
            <span>+</span> Add Contact
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-number">{list.length}</span>
            <span className="stat-label">{searchQuery ? 'Results Found' : 'Total Contacts'}</span>
          </div>
          {searchQuery && (
            <div className="search-tag">
              Searching: <strong>"{searchQuery}"</strong>
              <button onClick={() => setSearchInput('')}>✕</button>
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠</span> {error}
          </div>
        )}

        {loading && list.length === 0 ? (
          <div className="empty-state">
            <div className="loader-ring" />
            <p>Loading contacts...</p>
          </div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">◎</div>
            <h3>{searchQuery ? 'No contacts match your search.' : 'No contacts yet.'}</h3>
            <p>{searchQuery ? 'Try a different search term.' : 'Add your first contact to get started.'}</p>
            {!searchQuery && (
              <button className="btn btn-primary" onClick={handleAdd}>+ Add First Contact</button>
            )}
          </div>
        ) : (
          <div className="contacts-grid">
            {list.map(contact => (
              <ContactCard key={contact.id} contact={contact} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ContactForm editContact={editContact} onClose={handleClose} />
      )}
    </div>
  );
}
