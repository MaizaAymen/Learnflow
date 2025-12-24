// API Service for Reference Data Management
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api') + '/reference';

class ReferenceAPI {
  // Generic API call method
  static async apiCall(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'API call failed');
      }
      
      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return { success: false, error: error.message };
    }
  }

  // SPECIALITES API METHODS
  static async getSpecialites() {
    return this.apiCall('/specialites');
  }

  static async getSpecialiteById(id) {
    return this.apiCall(`/specialites/${id}`);
  }

  static async createSpecialite(specialiteData) {
    return this.apiCall('/specialites', {
      method: 'POST',
      body: JSON.stringify(specialiteData),
    });
  }

  static async updateSpecialite(id, specialiteData) {
    return this.apiCall(`/specialites/${id}`, {
      method: 'PUT',
      body: JSON.stringify(specialiteData),
    });
  }

  static async deleteSpecialite(id) {
    return this.apiCall(`/specialites/${id}`, {
      method: 'DELETE',
    });
  }

  // DEPARTEMENTS API METHODS
  static async getDepartements() {
    return this.apiCall('/departements');
  }

  static async getDepartementById(id) {
    return this.apiCall(`/departements/${id}`);
  }

  static async createDepartement(departementData) {
    return this.apiCall('/adddepartements', {
      method: 'POST',
      body: JSON.stringify(departementData),
    });
  }

  static async updateDepartement(id, departementData) {
    return this.apiCall(`/departements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(departementData),
    });
  }

  static async deleteDepartement(id) {
    return this.apiCall(`/departements/${id}`, {
      method: 'DELETE',
    });
  }

  // NIVEAUX API METHODS
  static async getNiveaux() {
    return this.apiCall('/niveaux');
  }

  static async getNiveauById(id) {
    return this.apiCall(`/niveaux/${id}`);
  }

  static async createNiveau(niveauData) {
    return this.apiCall('/niveaux', {
      method: 'POST',
      body: JSON.stringify(niveauData),
    });
  }

  static async updateNiveau(id, niveauData) {
    return this.apiCall(`/niveaux/${id}`, {
      method: 'PUT',
      body: JSON.stringify(niveauData),
    });
  }

  static async deleteNiveau(id) {
    return this.apiCall(`/niveaux/${id}`, {
      method: 'DELETE',
    });
  }

  // CLASSES API METHODS
  static async getClasses() {
    return this.apiCall('/classes');
  }

  static async getClasseById(id) {
    return this.apiCall(`/classes/${id}`);
  }

  static async createClasse(classeData) {
    return this.apiCall('/classes', {
      method: 'POST',
      body: JSON.stringify(classeData),
    });
  }

  static async updateClasse(id, classeData) {
    return this.apiCall(`/classes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(classeData),
    });
  }

  static async deleteClasse(id) {
    return this.apiCall(`/classes/${id}`, {
      method: 'DELETE',
    });
  }

  // SALLES API METHODS
  static async getSalles() {
    return this.apiCall('/salles');
  }

  static async getSalleById(id) {
    return this.apiCall(`/salles/${id}`);
  }

  static async createSalle(salleData) {
    return this.apiCall('/salles', {
      method: 'POST',
      body: JSON.stringify(salleData),
    });
  }

  static async updateSalle(id, salleData) {
    return this.apiCall(`/salles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(salleData),
    });
  }

  static async deleteSalle(id) {
    return this.apiCall(`/salles/${id}`, {
      method: 'DELETE',
    });
  }

  // MATIERES API METHODS
  static async getMatieres() {
    return this.apiCall('/matieres');
  }

  static async getMatiereById(id) {
    return this.apiCall(`/matieres/${id}`);
  }

  static async createMatiere(matiereData) {
    return this.apiCall('/matieres', {
      method: 'POST',
      body: JSON.stringify(matiereData),
    });
  }

  static async updateMatiere(id, matiereData) {
    return this.apiCall(`/matieres/${id}`, {
      method: 'PUT',
      body: JSON.stringify(matiereData),
    });
  }

  static async deleteMatiere(id) {
    return this.apiCall(`/matieres/${id}`, {
      method: 'DELETE',
    });
  }

  // UTILITY METHODS
  static async getAllReferenceData() {
    const [
      specialitesResult,
      departementsResult,
      niveauxResult,
      classesResult,
      sallesResult,
      matieresResult
    ] = await Promise.all([
      this.getSpecialites(),
      this.getDepartements(),
      this.getNiveaux(),
      this.getClasses(),
      this.getSalles(),
      this.getMatieres()
    ]);

    return {
      specialites: specialitesResult.success ? specialitesResult.data : [],
      departements: departementsResult.success ? departementsResult.data : [],
      niveaux: niveauxResult.success ? niveauxResult.data : [],
      classes: classesResult.success ? classesResult.data : [],
      salles: sallesResult.success ? sallesResult.data : [],
      matieres: matieresResult.success ? matieresResult.data : []
    };
  }

  static async getStatistics() {
    const data = await this.getAllReferenceData();
    
    return {
      specialitesCount: data.specialites.length,
      departementsCount: data.departements.length,
      niveauxCount: data.niveaux.length,
      classesCount: data.classes.length,
      sallesCount: data.salles.length,
      matieresCount: data.matieres.length
    };
  }
}

export default ReferenceAPI;