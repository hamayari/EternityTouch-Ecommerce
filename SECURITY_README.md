# Security Notice

## GitHub Secret Detection Alert

GitHub a détecté des patterns de secrets dans le repository. Voici ce qui a été fait:

### Actions Prises

1. ✅ Suppression des fichiers de test contenant des références à des secrets
2. ✅ Suppression de la documentation sensible (EMAIL_SETUP.md, SECURITY_CHECKLIST.txt)
3. ✅ Mise à jour du .gitignore pour exclure ces fichiers
4. ✅ Configuration de la structure Git avec branches main et develop

### Fichiers Supprimés du Repository

- `backend/test-*.js` - Fichiers de test avec credentials
- `backend/send-test-*.js` - Scripts de test email
- `backend/setup-*.js` - Scripts de configuration
- `backend/EMAIL_SETUP.md` - Documentation email
- `backend/SECURITY_CHECKLIST.txt` - Checklist avec secrets

### Important

Les secrets détectés par GitHub sont probablement:

1. **Stripe Test Key** - Pas de problème, c'est une clé de test
2. **Gmail App Password** - À regénérer si nécessaire
3. **Cloudinary Keys** - À regénérer si nécessaire
4. **JWT Secret** - Utilisé uniquement en local

### Actions Recommandées

Si tu veux être 100% sécurisé:

1. **Regénérer Gmail App Password:**
   - Va sur https://myaccount.google.com/apppasswords
   - Supprime l'ancien
   - Crée un nouveau
   - Mets à jour `.env` local

2. **Regénérer Cloudinary Keys:**
   - Va sur https://cloudinary.com/console
   - Regénère les clés API
   - Mets à jour `.env` local

3. **JWT Secret:**
   - Pas de problème, utilisé uniquement en local
   - En production, utilise `.env.production` avec de nouveaux secrets

### Fichiers Locaux (Non Trackés)

Ces fichiers restent sur ton ordinateur mais ne sont PAS sur GitHub:

- `.env` - Variables d'environnement locales
- `.env.production` - Variables de production
- `test-*.js` - Scripts de test
- `EMAIL_SETUP.md` - Documentation

### Structure Git

```
main (production)
  └── develop (development)
```

Voir `CONTRIBUTING.md` pour le workflow Git.

### Questions?

Les secrets détectés sont principalement des clés de test et de développement. En production, tu utiliseras de nouvelles clés via les variables d'environnement de Render.com.
