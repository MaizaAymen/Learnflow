import React, { useState } from "react";
import { Card, Button, Upload, message, Alert, Typography, Space, Divider } from 'antd';
import { UploadOutlined, FileExcelOutlined, FileDoneOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

function UploadStudents() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const handleFileChange = (info) => {
    if (info.file.status === 'removed') {
      setFile(null);
      setUploadResult(null);
      return;
    }
    setFile(info.file.originFileObj || info.file);
  };

  const handleUpload = async () => {
    if (!file) {
      message.error("Veuillez sélectionner un fichier CSV ou Excel d'abord!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadResult(null);

    try {
      const response = await fetch("http://localhost:4000/api/auth/upload-csv", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadResult({
          success: true,
          message: result.message,
          added: result.added,
          skipped: result.skipped,
          assigned: result.assigned,
          assignments: result.assignments || []
        });
        message.success(result.message);
        setFile(null);
      } else {
        const error = await response.json();
        setUploadResult({
          success: false,
          message: error.error || "Erreur lors de l'importation"
        });
        message.error(error.error || "Erreur lors de l'importation");
      }
    } catch (err) {
      setUploadResult({
        success: false,
        message: "Échec du téléchargement: " + err.message
      });
      message.error("Échec du téléchargement: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file) => {
      const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
      const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                      file.type === 'application/vnd.ms-excel' ||
                      file.name.endsWith('.xlsx') || 
                      file.name.endsWith('.xls');
      
      if (!isCSV && !isExcel) {
        message.error('Vous ne pouvez télécharger que des fichiers CSV ou Excel!');
        return false;
      }
      return false; // Prevent automatic upload
    },
    onChange: handleFileChange,
    maxCount: 1,
    accept: '.csv,.xlsx,.xls',
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff', marginBottom: 16 }} />
            <Title level={2}>Téléverser des Étudiants</Title>
            <Paragraph type="secondary">
              Importez un fichier CSV ou Excel contenant les informations des étudiants
            </Paragraph>
          </div>

          <Divider />

          <div>
            <Title level={4}>Format du fichier requis</Title>
            <Paragraph>
              Le fichier doit contenir les colonnes suivantes:
            </Paragraph>
            <ul>
              <li><strong>nom</strong> - Nom de famille de l'étudiant</li>
              <li><strong>prenom</strong> - Prénom de l'étudiant</li>
              <li><strong>email</strong> - Adresse email (obligatoire)</li>
              <li><strong>cin</strong> - Numéro CIN (obligatoire)</li>
              <li><strong>ville</strong> - Ville (optionnel)</li>
              <li><strong>specialite</strong> - Spécialité (optionnel)</li>
            </ul>
          </div>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />} size="large">
                Sélectionner un fichier CSV/Excel
              </Button>
            </Upload>
          </div>

          {file && (
            <Alert
              message="Fichier sélectionné"
              description={file.name}
              type="info"
              showIcon
              icon={<FileDoneOutlined />}
            />
          )}

          <div style={{ textAlign: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={handleUpload}
              loading={uploading}
              disabled={!file}
              icon={<UploadOutlined />}
            >
              {uploading ? 'Importation en cours...' : 'Importer les Étudiants'}
            </Button>
          </div>

          {uploadResult && (
            <div>
              <Alert
                message={uploadResult.success ? "Importation réussie!" : "Erreur d'importation"}
                description={
                  uploadResult.success ? (
                    <div>
                      <p>{uploadResult.message}</p>
                      <p>
                        <strong>{uploadResult.added}</strong> étudiants ajoutés, 
                        <strong> {uploadResult.skipped}</strong> ignorés (déjà existants ou données manquantes)
                        {uploadResult.assigned > 0 && (
                          <>, <strong>{uploadResult.assigned}</strong> assignés automatiquement aux classes</>
                        )}
                      </p>
                      {uploadResult.assignments && uploadResult.assignments.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <Divider style={{ margin: '8px 0' }} />
                          <strong>Assignations automatiques :</strong>
                          <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 20 }}>
                            {uploadResult.assignments.map((assign, index) => (
                              <li key={index}>
                                <strong>{assign.nom}</strong> → {assign.classe} ({assign.specialite})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    uploadResult.message
                  )
                }
                type={uploadResult.success ? "success" : "error"}
                showIcon
                closable
                onClose={() => setUploadResult(null)}
              />
              
              {uploadResult.success && uploadResult.added > 0 && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <Space direction="vertical" size="small">
                    <Button
                      type="primary"
                      size="large"
                      icon={<ArrowRightOutlined />}
                      onClick={() => navigate('/users?tab=ajuster-manuellement')}
                    >
                      Voir et Ajuster les Assignations
                    </Button>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      Vérifiez ou ajustez manuellement les assignations automatiques
                    </Paragraph>
                  </Space>
                </div>
              )}
            </div>
          )}

          <Divider />

          <Alert
            message="Remarques importantes"
            description={
              <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                <li>Les étudiants avec un email existant seront ignorés</li>
                <li>Un mot de passe temporaire sera généré et envoyé par email</li>
                <li>Les formats acceptés: .csv, .xlsx, .xls</li>
                <li>Les champs email et cin sont obligatoires</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </Space>
      </Card>
    </div>
  );
}

export default UploadStudents;
