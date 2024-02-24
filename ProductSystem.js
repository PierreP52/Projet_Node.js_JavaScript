const fs = require('fs');
const events = require('./events');

class ProductSystem {
  constructor(filePath, emitter) {
    this.filePath = filePath;
    this.products = [];
    this.emitter = emitter;
  }

  // Méthode pour initialiser le système en chargeant les données depuis un fichier JSON
  initialize(callback) {
    fs.readFile(this.filePath, 'utf8', (err, data) => {
      if (err) {
        if (err.code === 'ENOENT') {
          // Le fichier n'existe pas encore, on crée un fichier vide
          fs.writeFile(this.filePath, '[]', 'utf8', (err) => {
            if (err) {
              return callback(err);
            }
            this.products = [];
            callback();
          });
        } else {
          return callback(err);
        }
      } else {
        this.products = JSON.parse(data);
        callback();
      }
    });
  }

  // Méthode pour afficher la liste des produits actuellement disponibles
  listProducts() {
    console.log('Liste des produits:');
    this.products.forEach((product) => {
      console.log(`- ${product.name} | Prix: ${product.price.toFixed(2)}`);
    });
  }

  // Méthode pour ajouter un produit avec déclenchement de l'événement personnalisé "productadded"
  addProduct(name, price, callback) {
    const newProduct = {
      name: name,
      price: parseFloat(price),
    };

    this.products.push(newProduct);
    this.saveProducts((err) => {
      if (err) {
        return callback(err);
      }

      // Émettre l'événement personnalisé "productadded" après l'ajout du produit
      this.emitter.emit(events.PRODUCT_ADDED, newProduct);
      callback();
    });
  }

  // Méthode pour enregistrer les produits dans le fichier JSON
  saveProducts(callback) {
    fs.writeFile(this.filePath, JSON.stringify(this.products, null, 2), 'utf8', callback);

  
  }

  updateProduct(name, price, callback) {
    // Rechercher le produit dans la liste des produits par son ID
    const productToUpdate = this.products.find(product => product.name === name);

    if (!productToUpdate) {
      return callback(new Error('Produit non trouvé.'));
    }

    // Sauvegarder les valeurs précédentes pour les événements personnalisés
    const previousValues = {
      name: productToUpdate.name,
      price: productToUpdate.price,
    };

    // Mettre à jour les champs du produit avec les nouvelles valeurs
    Object.assign(productToUpdate, price);

    // Enregistrer les produits mis à jour dans le fichier JSON
    this.saveProducts((err) => {
      if (err) {
        return callback(err);
      }

      // Émettre l'événement personnalisé "productupdated" après la mise à jour du produit
      this.emitter.emit(events.PRODUCT_UPDATED, {
        name: name,
        previousValues: previousValues,
        updatedValues: price.price,
      });

      // Appeler le callback pour indiquer que la mise à jour du produit s'est terminée avec succès
      callback();
    });
  }
  
  deleteProduct(name, callback) {
    // Rechercher l'index du produit dans la liste des produits par son ID
    const productIndex = this.products.findIndex(product => product.name === name);
  
    if (productIndex === -1) {
      return callback(new Error('Produit non trouvé.'));
    }
  
    // Sauvegarder le produit à supprimer pour les événements personnalisés
    const deletedProduct = this.products[productIndex];
  
    // Supprimer le produit de la liste
    this.products.splice(productIndex, 1);
  
    // Enregistrer les produits mis à jour (avec le produit supprimé) dans le fichier JSON
    this.saveProducts((err) => {
      if (err) {
        return callback(err);
      }
  
      // Émettre l'événement personnalisé "productdeleted" après la suppression du produit
      this.emitter.emit(events.PRODUCT_DELETED, deletedProduct);
  
      // Appeler le callback pour indiquer que la suppression du produit s'est terminée avec succès
      callback();
    });
  }
  calculateAveragePrice() {
    if (this.products.length === 0) {
      console.log('Pas de produit disponible.');
      return;
    }

    const totalPrices = this.products.reduce((sum, product) => sum + product.price, 0);
    const averagePrice = totalPrices / this.products.length;

    console.log(`Moyenne des prix des produits: ${averagePrice.toFixed(2)}`);
  }

  searchProductsByCategory(category) {
    const filteredProducts = this.products.filter((product) =>
      product.category === category
    );

    if (filteredProducts.length === 0) {
      console.log(`Aucun produit trouvé dans cette catégorie: ${category}`);
    } else {
      console.log(`Produit dans cette catègorie : "${category}":`);
      filteredProducts.forEach((product) => {
        console.log(`- ${product.name} | Prix: ${product.price.toFixed(2)}`);
      });
    }
  }

  findHighestPriceProduct() {
    if (this.products.length === 0) {
      console.log('Pas de produit disponible.');
      return;
    }
  
    let highestPriceProduct = this.products[0];
  
    for (let i = 1; i < this.products.length; i++) {
      if (this.products[i].price > highestPriceProduct.price) {
        highestPriceProduct = this.products[i];
      }
    }
  
    console.log('Produit avec le prix le plus élevé :');
    console.log(`- ${highestPriceProduct.name} | Prix: ${highestPriceProduct.price.toFixed(2)}`);
  }

  calculateTotalPrice() {
    if (this.products.length === 0) {
      console.log('Pas de produit disponible.');
      return;
    }
  
    const totalPrice = this.products.reduce((sum, product) => sum + product.price, 0);
  
    console.log(`Prix total de tous les produits: ${totalPrice.toFixed(2)}`);
  }
}

module.exports = ProductSystem;
