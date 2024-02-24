const fs = require('fs');
const path = require('path');
const readline = require('readline');
const ProductSystem = require('./ProductSystem');
const Emitter = require('./emitter');
const events = require('./events');

// Chemin d'accès au fichier JSON
const productsFilePath = path.join(__dirname, 'data', 'products.json');

// Création d'une instance de l'émetteur personnalisé
const emitter = new Emitter();

// Création d'une instance du système de gestion de produits
const productSystem = new ProductSystem(productsFilePath, emitter);

// Ajout d'un écouteur pour l'événement "productadded"
productSystem.emitter.on(events.PRODUCT_ADDED, (product) => {
  console.log(`Produit ajouté: ${product.name} | Prix: ${product.price.toFixed(2)}`);
});

// Ajout d'un écouteur pour l'événement "productupdated"
productSystem.emitter.on(events.PRODUCT_UPDATED, (data) => {
  console.log(`Produit mis a jour:
  Valeur précédentes: ${JSON.stringify(data.previousValues)}
  Valeur mise a jour: ${JSON.stringify(data.updatedValues)}`);
});

// Ajout d'un écouteur pour l'événement "productdeleted"
productSystem.emitter.on(events.PRODUCT_DELETED, (product) => {
  console.log(`Produit éffacé: ${product.name} | Prix: ${product.price.toFixed(2)}`);
});

function displayMenu() {
  console.log('=========================================');
  console.log('1. Liste des produits');
  console.log('2. Ajouter un produit');
  console.log('3. Mise a jour d\'un produit');
  console.log('4. Suppression d\'un produit');
  console.log('5. Rechercher un produit par catégorie');
  console.log('6. Calculer le prix moyen');
  console.log('7. Trouver le plus haut prix');
  console.log('8. Calculer le prix total des produits');
  console.log('0. Sortie');
  console.log('=========================================');
}

// Initialisation du système en chargeant les données depuis le fichier JSON
function init(){
  productSystem.initialize((err) => {
    if (err) {
      console.error('Erreur dans l\'inatialisation du systeme:', err);
      return;
    }

    displayMenu();

    

    // Interface utilisateur en ligne de commande pour ajouter un produit
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });


    
      rl.question('Entrer une option: ', (option) => {
        switch (option) {
          case '1':
            productSystem.listProducts();
            rl.close()
            init();
            break;
          case '2':
            rl.question('Entrer le nom du produit :', (name) => {
              rl.question('Entrer le prix du produit: ', (price) => {
                productSystem.addProduct(name, price, (err) => {
                  if (err) {
                    console.error('Erreur dans l`ajout du produit:', err);
                  } else {
                    console.log('Produit ajouté avec succés.');
                  }
                  rl.close()
                  init();
                });
              });
            });
    
            break;
          case '3':
            rl.question('Entrer le nom du produit :', (name) => {
              rl.question('Entrer le nouveau prix : ', (newPrice) => {
                productSystem.updateProduct(name, { price: parseFloat(newPrice) }, (err) => {
                  if (err) {
                    console.error('Erreur de la mise a jour du produit:', err);
                  } else {
                    console.log('Le produit a été enregistrer correctement.');
                  }
                  rl.close()
                  init();
                });
              });
            });
            break;
          case '4':
            rl.question('Entrer le nom du produit a éffacer :', (name) => {
              productSystem.deleteProduct(name, (err) => {
                if(err) {
                  console.error('Erreur lors de la supression du produit', err);
                } else{
                  console.log('Le produit a bien été éffacé.')
                }
                rl.close()
                init();
              })
            })
            break;
          case '5':
            rl.question('Entre le nom d`une catégorie: ', (category) => {
              productSystem.searchProductsByCategory(category);
              rl.close()
              init();
            });
            
            break;
          case '6':
              productSystem.calculateAveragePrice();
              rl.close()
              init();
            break;
          case '7':
              productSystem.findHighestPriceProduct()
              rl.close()
              init();
            break;
          case '8':
            productSystem.calculateTotalPrice()
            rl.close()
            init();
            break;
          case '0':
            rl.close();
            console.log('Fermeture...');
            return;
          default:
            console.log('Option Invalide.');
            rl.close()
            init();
            break;
        }
      });
    
    
  });

}

init();
