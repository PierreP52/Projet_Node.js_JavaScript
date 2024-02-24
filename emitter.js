// Fichier emitter.js : Implémentation de la classe Emitter pour créer un émetteur personnalisé

module.exports = class Emitter {
  constructor() {
    this.events = {};
  }

  // Méthode pour ajouter un écouteur pour un type d'événement donné
  on(type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push(listener);
  }

  // Méthode pour déclencher un événement donné avec des arguments optionnels
  emit(type, ...args) {
    if (this.events[type]) {
      this.events[type].forEach(listener => listener(...args));
    }
  }
};
