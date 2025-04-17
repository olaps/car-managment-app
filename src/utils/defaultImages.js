// src/utils/defaultImages.js
/**
 * Fournit des images par défaut pour différentes marques de véhicules
 * Ces URL pointent vers des images de placeholder pour la démo
 */
const defaultVehicleImages = {
    // Remplacer les chemins relatifs par des URLs en ligne
    'Renault': 'https://picsum.photos/id/111/400/300', // Utiliser des IDs différents pour des images différentes
    'Peugeot': 'https://picsum.photos/id/112/400/300',
    'Citroën': 'https://picsum.photos/id/113/400/300',
    'Volkswagen': 'https://picsum.photos/id/114/400/300',
    'BMW': 'https://picsum.photos/id/115/400/300',
    'Mercedes': 'https://picsum.photos/id/116/400/300',
    'Toyota': 'https://picsum.photos/id/117/400/300',
    // ... autres marques ...
    
    // Image générique
    'default': 'https://picsum.photos/id/133/400/300'
  };
  /**
   * Retourne l'URL de l'image par défaut pour une marque donnée
   * @param {string} brand - La marque du véhicule
   * @returns {string} URL de l'image
   */
  export const getDefaultVehicleImage = (brand) => {
    // Rechercher une correspondance directe
    if (brand && defaultVehicleImages[brand]) {
      return defaultVehicleImages[brand];
    }
    
    // Rechercher une correspondance partielle (par exemple, si "Mercedes-Benz" est fourni, retourner "Mercedes")
    if (brand) {
      const partialMatches = Object.keys(defaultVehicleImages).filter(key => 
        brand.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(brand.toLowerCase())
      );
      
      if (partialMatches.length > 0) {
        return defaultVehicleImages[partialMatches[0]];
      }
    }
    
    // Par défaut, retourner l'image générique
    return defaultVehicleImages.default;
  };
  
  export default defaultVehicleImages;