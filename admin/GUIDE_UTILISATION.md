# 🚀 Guide d'Utilisation - Forever E-Commerce Admin

## 📋 Accès Admin

### Connexion
- **URL**: http://localhost:5174
- **Email**: admin@forever.com
- **Mot de passe**: Admin@123

## 🎯 Fonctionnalités Principales

### 1️⃣ Dashboard (Page d'accueil)
**Accès**: Cliquez sur "Dashboard" dans le menu latéral

**Vous verrez**:
- 📊 4 cartes statistiques colorées:
  - Total Revenue (Revenu total)
  - Total Orders (Commandes totales)
  - Pending Orders (Commandes en attente)
  - Total Products (Produits totaux)

- 📈 3 graphiques interactifs:
  - Revenue Trend (Tendance des revenus par mois)
  - Orders by Month (Commandes par mois)
  - Order Status Distribution (Répartition des statuts)

- 📋 Tableau des commandes récentes
- ⚡ Boutons d'actions rapides

---

### 2️⃣ Ajouter un Produit
**Accès**: Menu → Products → Add Product

**Étapes**:
1. **Images**: Cliquez sur les 4 zones pour uploader des images
2. **Nom**: Entrez le nom du produit
3. **Description**: Décrivez le produit
4. **Catégorie**: Choisissez Men/Women/Kids
5. **Sous-catégorie**: Choisissez Topwear/Bottomwear/Winterwear
6. **Prix**: Entrez le prix en dollars
7. **Tailles**: Cliquez sur S, M, L, XL, XXL pour sélectionner
8. **Bestseller**: Cochez si c'est un bestseller
9. Cliquez sur **"Add Product"**

✅ **Résultat**: Toast de confirmation + produit ajouté

---

### 3️⃣ Liste des Produits
**Accès**: Menu → Products → Product List

**Vous verrez**:
- Tableau avec tous les produits
- Image miniature de chaque produit
- Nom et description courte
- Catégorie et sous-catégorie (badges colorés)
- Prix
- Statut Bestseller
- Boutons d'actions:
  - ✏️ **Edit**: Modifier le produit
  - 🗑️ **Delete**: Supprimer le produit

**Actions**:
- Cliquez sur **Edit** pour modifier un produit
- Cliquez sur **Delete** pour supprimer (confirmation demandée)

---

### 4️⃣ Modifier un Produit
**Accès**: Liste des produits → Bouton Edit

**Vous verrez**:
- Formulaire pré-rempli avec les données actuelles
- Images existantes affichées
- Possibilité d'uploader de nouvelles images (optionnel)

**Étapes**:
1. Modifiez les champs souhaités
2. Uploadez de nouvelles images si nécessaire
3. Cliquez sur **"Update Product"** pour sauvegarder
4. Ou **"Cancel"** pour annuler

✅ **Résultat**: Produit mis à jour + redirection vers la liste

---

### 5️⃣ Gestion des Commandes
**Accès**: Menu → Orders

**Vous verrez**:
- Tableau détaillé de toutes les commandes
- Pour chaque commande:
  - ID de commande
  - Nom du client
  - Téléphone et adresse
  - Liste des articles commandés
  - Montant total
  - Statut de paiement (Paid/Pending)
  - Méthode de paiement (Stripe/COD)
  - Date de commande
  - Statut de livraison

**Changer le statut d'une commande**:
1. Trouvez la commande dans le tableau
2. Cliquez sur le menu déroulant "Status"
3. Sélectionnez le nouveau statut:
   - 🔵 Order Placed (Commande passée)
   - 🟡 Packing (En préparation)
   - 🔵 Shipped (Expédiée)
   - ⚪ Out for delivery (En livraison)
   - 🟢 Delivered (Livrée)

✅ **Résultat**: Statut mis à jour + notification au client

---

## 🎨 Navigation

### Menu Latéral (Sidebar)
- 🏠 **Dashboard**: Vue d'ensemble
- 📦 **Products**: Gestion des produits
  - ➕ Add Product
  - 📋 Product List
- 🛒 **Orders**: Gestion des commandes

### Barre Supérieure (Navbar)
- 🔔 **Notifications**: Alertes système
- 💬 **Messages**: Chat (désactivé pour l'instant)
- 👤 **Profil Admin**: 
  - Cliquez pour voir le menu
  - **Logout**: Se déconnecter

---

## 📊 Statistiques Dashboard

### Cartes Colorées
- **Bleue**: Total Revenue (Revenu)
- **Verte**: Total Orders (Commandes)
- **Jaune**: Pending Orders (En attente)
- **Rouge**: Total Products (Produits)

### Graphiques
- **Revenue Trend**: Évolution du chiffre d'affaires
- **Orders by Month**: Nombre de commandes par mois
- **Order Status**: Répartition des statuts de commandes

### Métriques
- **Completion Rate**: Taux de commandes livrées
- **Avg Order Value**: Valeur moyenne des commandes
- **Total Users**: Nombre total d'utilisateurs

---

## ⚡ Raccourcis Rapides

Depuis le Dashboard, cliquez sur:
- **Add New Product** → Ajouter un produit
- **View All Products** → Voir tous les produits
- **Manage Orders** → Gérer les commandes

---

## 🔐 Déconnexion

1. Cliquez sur l'avatar en haut à droite
2. Cliquez sur **"Logout"**
3. Vous serez redirigé vers la page de connexion

---

## 💡 Conseils

✅ **Ajoutez des produits** avant de tester le site frontend
✅ **Uploadez 4 images** pour chaque produit (meilleur rendu)
✅ **Vérifiez les commandes** régulièrement
✅ **Mettez à jour les statuts** pour informer les clients
✅ **Utilisez les graphiques** pour analyser les ventes

---

## 🆘 Problèmes Courants

**Problème**: Impossible de se connecter
- ✅ Vérifiez l'email: admin@forever.com
- ✅ Vérifiez le mot de passe: Admin@123
- ✅ Vérifiez que le backend fonctionne (port 4000)

**Problème**: Images ne s'affichent pas
- ✅ Vérifiez la configuration Cloudinary dans backend/.env
- ✅ Vérifiez la connexion internet

**Problème**: Statistiques vides
- ✅ Ajoutez des produits et des commandes
- ✅ Vérifiez la connexion MongoDB

---

## 🌐 URLs Importantes

- **Admin Panel**: http://localhost:5174
- **Frontend Client**: http://localhost:5173
- **Backend API**: http://localhost:4000

---

## 📞 Support

Pour toute question ou problème, consultez:
- `TEMPLATE_INFO.md` - Informations techniques
- `README.md` - Documentation générale
- Backend logs - Erreurs API
