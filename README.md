# Eternity Touch - E-commerce Platform

Application e-commerce complète avec frontend React, backend Node.js/Express, et panel admin.

## 🚀 Déploiement Rapide

**Temps estimé: 30 minutes**

1. Lis le guide: `QUICK_START_DEPLOYMENT.md`
2. Vérifie que tout est prêt: `cd backend && npm run pre-deploy`
3. Suis les étapes du guide

## 📁 Structure

```
forever/
├── backend/          # API Node.js/Express
├── frontend/         # Site client React
├── admin/            # Panel admin React
├── DEPLOYMENT_GUIDE.md          # Guide détaillé
└── QUICK_START_DEPLOYMENT.md    # Guide rapide
```

## 🛠️ Développement Local

### Backend
```bash
cd backend
npm install
npm run server    # Port 4000
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # Port 5173
```

### Admin
```bash
cd admin
npm install
npm run dev      # Port 5174
```

## ✅ Tests

```bash
cd backend
npm test                    # Tous les tests (81)
npm run test:integration    # Tests d'intégration (12)
npm run test:critical       # Tests unitaires (69)
```

## 📊 Statut

- **Tests**: 81/81 passent ✅
- **Qualité**: 9.8/10
- **Production Ready**: Oui ✅

## 🔐 Sécurité

- Helmet, CORS, Rate Limiting
- JWT Authentication
- Password hashing (bcrypt)
- Input validation & sanitization
- XSS & MongoDB injection protection

## 🎯 Fonctionnalités

- Authentification (JWT, Google OAuth)
- Gestion produits avec stock
- Panier & Wishlist
- Commandes & Paiements (Stripe, COD)
- Coupons & Loyalty points
- Returns & Tracking
- Chat en temps réel
- Q&A avec AI (Gemini)
- Recommendations
- Email notifications
- Admin dashboard complet

## 📖 Documentation

- `DEPLOYMENT_GUIDE.md` - Guide de déploiement complet
- `QUICK_START_DEPLOYMENT.md` - Déploiement en 30 min
- `backend/TESTING.md` - Guide des tests
- `backend/EMAIL_SETUP.md` - Configuration email

## 💰 Coûts

**Gratuit:**
- Render.com (avec mise en veille)
- MongoDB Atlas (500MB)
- Cloudinary (images)

**Production ($7-16/mois):**
- Render.com Starter ($7)
- MongoDB Atlas M10 ($9, optionnel)

## 🆘 Support

Problèmes? Vérifie:
1. Les logs sur Render
2. MongoDB est accessible
3. Variables d'environnement correctes
4. Tests passent: `npm test`

## 📝 License

Propriétaire - Eternity Touch © 2026
