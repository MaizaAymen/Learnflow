import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Input, Select, Table, Modal, message, Spin, Empty, Tag, Rate, Grid } from 'antd';
import { SearchOutlined, BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { useBreakpoint } = Grid;

const LibraryDashboard = () => {
  const screens = useBreakpoint();
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowModal, setBorrowModal] = useState(false);

  // Get auth token from localStorage
  const getAuthToken = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    console.log('🔐 TOKEN CHECK - token:', token ? token.substring(0, 20) + '...' : 'NULL');
    console.log('🔐 TOKEN CHECK - user storage:', user ? 'exists' : 'null');
    if (token) {
      console.log('✅ Using token from localStorage');
      return token;
    }
    if (user) {
      const userData = JSON.parse(user);
      console.log('✅ Using token from user object');
      return userData.token;
    }
    console.log('❌ No token found!');
    return null;
  };

  const getHeaders = () => {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('📤 Headers with auth:', { ...headers, Authorization: headers.Authorization.substring(0, 20) + '...' });
    } else {
      console.warn('⚠️ No token available - request will be unauthorized');
    }
    return headers;
  };

  useEffect(() => {
    fetchBooks();
    fetchBorrowings();
    fetchReservations();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/library/books', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setBooks(await response.json());
      } else {
        // Mock data for demo
        setBooks([
          { id: 1, titre: 'JavaScript Avancé', auteur: 'Kyle Simpson', editeur: 'O\'Reilly', annee_publication: 2023, categorie: 'informatique', nombre_disponibles: 3, nombre_copies: 5, description: 'Deep dive into JavaScript' },
          { id: 2, titre: 'Python pour Scientifiques', auteur: 'Jake VanderPlas', editeur: 'O\'Reilly', annee_publication: 2022, categorie: 'informatique', nombre_disponibles: 2, nombre_copies: 4, description: 'Python data science' }
        ]);
      }
    } catch (error) {
      message.warning('Mode démo activé');
      setBooks([
        { id: 1, titre: 'JavaScript Avancé', auteur: 'Kyle Simpson', editeur: 'O\'Reilly', annee_publication: 2023, categorie: 'informatique', nombre_disponibles: 3, nombre_copies: 5 },
        { id: 2, titre: 'Python pour Scientifiques', auteur: 'Jake VanderPlas', editeur: 'O\'Reilly', annee_publication: 2022, categorie: 'informatique', nombre_disponibles: 2, nombre_copies: 4 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBorrowings = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/library/my-borrowings', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setBorrowings(await response.json());
      }
    } catch (error) {
      console.error('Erreur chargement emprunts:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/library/my-reservations', {
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        setReservations(await response.json());
      }
    } catch (error) {
      console.error('Erreur chargement réservations:', error);
    }
  };

  const handleBorrow = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/library/borrow/${bookId}`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        message.success('Livre emprunté avec succès');
        fetchBooks();
        fetchBorrowings();
        setBorrowModal(false);
      } else {
        message.error('Erreur lors de l\'emprunt');
      }
    } catch (error) {
      message.success('Livre emprunté (mode démo)');
      setBorrowModal(false);
    }
  };

  const handleReserve = async (bookId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/library/reserve/${bookId}`, {
        method: 'POST',
        headers: getHeaders(),
        credentials: 'include'
      });
      if (response.ok) {
        message.success('Livre réservé avec succès');
        fetchBooks();
        fetchReservations();
      } else {
        message.error('Erreur lors de la réservation');
      }
    } catch (error) {
      message.success('Livre réservé (mode démo)');
    }
  };

  const handleReturn = async (borrowingId) => {
    Modal.confirm({
      title: 'Confirmer le retour',
      content: 'Êtes-vous sûr de vouloir retourner ce livre ?',
      okText: 'Oui',
      cancelText: 'Non',
      onOk: async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/library/return/${borrowingId}`, {
            method: 'POST',
            credentials: 'include'
          });
          if (response.ok) {
            message.success('Livre retourné avec succès');
            fetchBooks();
            fetchBorrowings();
          }
        } catch (error) {
          message.success('Livre retourné (mode démo)');
        }
      }
    });
  };

  const filteredBooks = books.filter(book =>
    (book.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
     book.auteur.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter === '' || book.categorie === categoryFilter)
  );

  const borrowingColumns = [
    { title: 'Livre', dataIndex: 'titre', key: 'titre' },
    { title: 'Date d\'emprunt', dataIndex: 'date_emprunt', key: 'date_emprunt', render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A' },
    { title: 'Retour prévu', dataIndex: 'date_retour_prevue', key: 'retour', render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A' },
    {
      title: 'Statut',
      dataIndex: 'statut',
      key: 'statut',
      render: (statut) => {
        const colors = { emprunte: 'blue', retourne: 'green', perdu: 'red', endommage: 'orange' };
        return <Tag color={colors[statut] || 'blue'}>{statut || 'emprunte'}</Tag>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (record.statut === 'emprunte' || !record.statut) && (
        <Button size="small" onClick={() => handleReturn(record.id)}>Retourner</Button>
      )
    }
  ];

  if (loading) return <Spin />;

  return (
    <div className="library-dashboard">
      <h2><BookOutlined /> Bibliothèque</h2>

      {/* Tabs Navigation */}
      <div className="library-tabs" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Button onClick={() => setActiveTab('browse')} type={activeTab === 'browse' ? 'primary' : 'default'}>
          Parcourir
        </Button>
        <Button onClick={() => setActiveTab('borrowings')} type={activeTab === 'borrowings' ? 'primary' : 'default'}>
          Mes Emprunts ({borrowings.filter(b => b.statut === 'emprunte' || !b.statut).length})
        </Button>
        <Button onClick={() => setActiveTab('reservations')} type={activeTab === 'reservations' ? 'primary' : 'default'}>
          Mes Réservations ({reservations.filter(r => r.statut === 'en_attente' || !r.statut).length})
        </Button>
      </div>

      {/* Browse Books */}
      {activeTab === 'browse' && (
        <Card className="library-section">
          <div className="library-filters" style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Input
              placeholder="Chercher par titre ou auteur..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: screens.md ? '300px' : '100%' }}
            />
            <Select
              placeholder="Catégorie"
              value={categoryFilter}
              onChange={setCategoryFilter}
              style={{ width: screens.md ? '200px' : '100%' }}
              allowClear
            >
              <Select.Option value="informatique">Informatique</Select.Option>
              <Select.Option value="mecanique">Mécanique</Select.Option>
              <Select.Option value="electrique">Électrique</Select.Option>
              <Select.Option value="civil">Civil</Select.Option>
              <Select.Option value="general">Général</Select.Option>
            </Select>
          </div>

          {filteredBooks.length === 0 ? (
            <Empty description="Aucun livre trouvé" />
          ) : (
            <div className="books-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
              {filteredBooks.map(book => (
                <Card key={book.id} className="book-card" hoverable style={{ borderRadius: '8px' }}>
                  {book.image_couverture && (
                    <img src={book.image_couverture} alt={book.titre} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px', marginBottom: '10px' }} />
                  )}
                  <h4 style={{ margin: '10px 0' }}>{book.titre}</h4>
                  <p style={{ color: '#666', fontSize: '14px' }}>{book.auteur}</p>
                  <p style={{ color: '#999', fontSize: '12px' }}>{book.editeur} - {book.annee_publication}</p>
                  <Tag color="blue">{book.categorie}</Tag>
                  <p style={{ marginTop: '10px', color: '#555' }}>
                    Disponibles: <strong>{book.nombre_disponibles}/{book.nombre_copies}</strong>
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    {book.nombre_disponibles > 0 ? (
                      <Button type="primary" block onClick={() => {
                        setSelectedBook(book);
                        setBorrowModal(true);
                      }}>
                        Emprunter
                      </Button>
                    ) : (
                      <Button block onClick={() => handleReserve(book.id)}>Réserver</Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* My Borrowings */}
      {activeTab === 'borrowings' && (
        <Card className="library-section">
          {borrowings.length === 0 ? (
            <Empty description="Aucun emprunt en cours" />
          ) : (
            <Table
              columns={borrowingColumns}
              dataSource={borrowings}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </Card>
      )}

      {/* My Reservations */}
      {activeTab === 'reservations' && (
        <Card className="library-section">
          {reservations.length === 0 ? (
            <Empty description="Aucune réservation" />
          ) : (
            <Table
              columns={[
                { title: 'Livre', dataIndex: 'titre', key: 'titre' },
                { title: 'Date de réservation', dataIndex: 'date_reservation', key: 'date', render: (date) => date ? new Date(date).toLocaleDateString('fr-FR') : 'N/A' },
                { title: 'Position', dataIndex: 'position_queue', key: 'position', render: (pos) => pos ? `#${pos}` : 'N/A' },
                {
                  title: 'Statut',
                  dataIndex: 'statut',
                  key: 'statut',
                  render: (statut) => {
                    const colors = { en_attente: 'orange', prete: 'green', annulee: 'red' };
                    return <Tag color={colors[statut] || 'orange'}>{statut || 'en_attente'}</Tag>;
                  }
                }
              ]}
              dataSource={reservations}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              scroll={{ x: true }}
            />
          )}
        </Card>
      )}

      {/* Borrow Modal */}
      <Modal
        title={`Emprunter: ${selectedBook?.titre}`}
        open={borrowModal}
        onCancel={() => setBorrowModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setBorrowModal(false)}>Annuler</Button>,
          <Button key="submit" type="primary" onClick={() => handleBorrow(selectedBook?.id)}>
            Confirmer
          </Button>,
        ]}
      >
        <p><strong>Auteur:</strong> {selectedBook?.auteur}</p>
        <p><strong>Catégorie:</strong> {selectedBook?.categorie}</p>
        <p><strong>Durée d'emprunt:</strong> 30 jours</p>
        <p><strong>Disponibles:</strong> {selectedBook?.nombre_disponibles} exemplaires</p>
      </Modal>
    </div>
  );
};

export default LibraryDashboard;
