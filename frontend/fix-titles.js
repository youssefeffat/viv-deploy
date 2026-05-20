
const fs = require('fs');
const path = require('path');

function replaceInFile(relativePath, replacements) {
    const file = path.join('frontend', 'src', 'components', relativePath);
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    for (const [search, replace] of Object.entries(replacements)) {
        content = content.replace(new RegExp(search, 'g'), replace);
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed ' + relativePath);
}

replaceInFile('DashboardPage.tsx', {
    '>Carbon Footprint<': '>Empreinte Carbone<',
    '>vs last month<': '>vs le mois dernier<',
    '>Daily Goal<': '>Objectif quotidien<',
    '>Remaining Goal<': '>Objectif restant<',
    '>Impact limit<': '>Limite d\\'impact<',
    '>Join our challenge !<': '>Rejoignez notre défi !<',
    '>Predict your carbon impact on specific actions<': '>Prédisez votre impact carbone sur des actions spécifiques<',
    '>Prediction<': '>Prédiction<',
    '>My Daily Challenge<': '>Mon défi quotidien<',
    '>Take a quiz to improve your knowledge about ecology !<': '>Faites un quiz pour améliorer vos connaissances sur l\\'écologie !<',
    '>Quiz<': '>Quiz<',
    '>Eco-Score<': '>Éco-Score<',
    '>Trees Planted<': '>Arbres Plantés<',
    '>Current Streak<': '>Série Actuelle<'
});

replaceInFile('LandingPage.tsx', {
    '>Your Daily Actions<': '>Vos Actions Quotidiennes<',
    '>Global Impact<': '>Impact Mondial<',
    'Join our community of eco-conscious individuals and start making a difference today.': 'Rejoignez notre communauté d\\'individus soucieux de l\\'écologie et commencez à faire la différence dès aujourd\\'hui.',
    '>Get Started<': '>Commencer<',
    '>Already have an account\\?<': '>Déjà un compte ?<',
    '>Login<': '>Se connecter<'
});

replaceInFile('LoginPage.tsx', {
    '>Welcome back<': '>Bon retour<',
    '>Your eco-journey continues here<': '>Votre voyage écologique continue ici<',
    '>Sign In<': '>Se connecter<',
    '>Email<': '>Email<',
    '>Password<': '>Mot de passe<',
    '>Don\\'t have an account\\?<': '>Vous n\\'avez pas de compte ?<',
    '>Sign up here<': '>Inscrivez-vous ici<',
    '>Enter your email<': '>Entrez votre email<',
    '>Enter your password<': '>Entrez votre mot de passe<'
});

replaceInFile('SignupPage.tsx', {
    '>Create an account<': '>Créer un compte<',
    '>Join the eco-community<': '>Rejoignez la communauté écologique<',
    '>Name<': '>Nom<',
    '>Enter your name<': '>Entrez votre nom<',
    '>Sign Up<': '>S\\'inscrire<',
    '>Already have an account\\?<': '>Vous avez déjà un compte ?<',
    '>Login here<': '>Connectez-vous ici<'
});

