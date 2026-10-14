
"use strict";

// ========================================
// 1. Récupération des éléments HTML
// ========================================

const temperatureInput = document.getElementById("temperature");
const humidityInput = document.getElementById("humidite");

const temperatureRange = document.getElementById("temperature-range");
const humidityRange = document.getElementById("humidite-range");

const evaluateButton = document.getElementById("evaluer");
const errorMessage = document.getElementById("error-message");

// ========================================
// 2. Fonctions d'appartenance : température
// ========================================

function temperatureFroide(t) {
    if (t <= 10) return 1;
    if (t >= 20) return 0;

    return (20 - t) / 10;
}

function temperatureModeree(t) {
    if (t <= 15 || t >= 30) return 0;

    if (t <= 22.5) {
        return (t - 15) / 7.5;
    }

    return (30 - t) / 7.5;
}

function temperatureChaude(t) {
    if (t <= 20) return 0;
    if (t >= 30) return 1;

    return (t - 20) / 10;
}

// ========================================
// 3. Fonctions d'appartenance : humidité
// ========================================

function humiditeFaible(h) {
    if (h <= 20) return 1;
    if (h >= 40) return 0;

    return (40 - h) / 20;
}

function humiditeMoyenne(h) {
    if (h <= 30 || h >= 70) return 0;

    if (h <= 50) {
        return (h - 30) / 20;
    }

    return (70 - h) / 20;
}

function humiditeElevee(h) {
    if (h <= 60) return 0;
    if (h >= 70) return 1;

    return (h - 60) / 10;
}

// ========================================
// 4. Fonctions utiles pour la logique floue
// ========================================

function minimum(a, b) {
    return Math.min(a, b);
}

function maximum(...valeurs) {
    return Math.max(...valeurs);
}

function limiter(valeur, min, max) {
    return Math.min(Math.max(valeur, min), max);
}

function afficherNombre(valeur) {
    return valeur.toFixed(3).replace(".", ",");
}

// ========================================
// 5. Affichage des degrés d'appartenance
// ========================================

function afficherAppartenance(nom, valeur) {
    const valeurElement = document.getElementById(`${nom}-value`);
    const barreElement = document.getElementById(`${nom}-bar`);

    if (!valeurElement || !barreElement) return;

    const degre = limiter(valeur, 0, 1);

    valeurElement.textContent = afficherNombre(degre);
    barreElement.style.width = `${degre * 100}%`;
}

// ========================================
// 6. Application des règles floues
// ========================================

function evaluerRegles(temp, humidite) {
    const froide = temperatureFroide(temp);
    const moderee = temperatureModeree(temp);
    const chaude = temperatureChaude(temp);

    const faible = humiditeFaible(humidite);
    const moyenne = humiditeMoyenne(humidite);
    const elevee = humiditeElevee(humidite);

    // Règles :
    // Température froide + toute humidité -> Mauvais
    // Température chaude + toute humidité -> Mauvais
    // Température modérée + humidité faible -> Moyen
    // Température modérée + humidité moyenne -> Bon
    // Température modérée + humidité élevée -> Moyen

    const mauvais = maximum(
        minimum(froide, faible),
        minimum(froide, moyenne),
        minimum(froide, elevee),
        minimum(chaude, faible),
        minimum(chaude, moyenne),
        minimum(chaude, elevee)
    );

    const moyen = maximum(
        minimum(moderee, faible),
        minimum(moderee, elevee)
    );

    const bon = minimum(moderee, moyenne);

    return {
        temperature: {
            froide,
            moderee,
            chaude
        },
        humidite: {
            faible,
            moyenne,
            elevee
        },
        resultat: {
            mauvais,
            moyen,
            bon
        }
    };
}

// ========================================
// 7. Calcul du score de confort
// ========================================

function calculerScore(resultats) {
    const mauvais = resultats.mauvais;
    const moyen = resultats.moyen;
    const bon = resultats.bon;

    const somme = mauvais + moyen + bon;

    if (somme === 0) return 0;

    // Moyenne pondérée des résultats flous
    const score = (
        mauvais * 20 +
        moyen * 50 +
        bon * 100
    ) / somme;

    return Math.round(limiter(score, 0, 100));
}

// ========================================
// 8. Mise à jour du résultat et des couleurs
// ========================================

function afficherResultat(score) {
    const scoreElement = document.getElementById("score");
    const circle = document.getElementById("score-circle");
    const label = document.getElementById("comfort-label");
    const description = document.getElementById("result-description");

    scoreElement.textContent = score;

    let couleur;
    let titre;
    let texte;
    let conseilTitre;
    let conseilTexte;
    let icone;

    if (score >= 75) {
        couleur = "#27845d";
        titre = "Confort optimal";
        texte = "Les conditions mesurées sont favorables au confort thermique.";
        conseilTitre = "Conditions favorables";
        conseilTexte = "Les conditions mesurées sont compatibles avec un bon confort thermique.";
        icone = "🌿";
    } else if (score >= 50) {
        couleur = "#e6a23c";
        titre = "Confort moyen";
        texte = "Le confort est intermédiaire. Certaines conditions peuvent être améliorées.";
        conseilTitre = "Confort à améliorer";
        conseilTexte = "Une adaptation de la température ou de l'humidité peut améliorer le confort ressenti.";
        icone = "🌤️";
    } else {
        couleur = "#d95757";
        titre = "Confort faible";
        texte = "Les conditions mesurées sont peu favorables au confort thermique.";
        conseilTitre = "Attention aux conditions";
        conseilTexte = "Il est conseillé d'ajuster la température ou de mieux réguler l'humidité ambiante.";
        icone = "🌡️";
    }

    circle.style.setProperty("--score-color", couleur);
    circle.style.setProperty("--score-angle", `${score}%`);

    label.textContent = titre;
    label.style.color = couleur;
    label.style.backgroundColor = `${couleur}1A`;

    description.textContent = texte;

    const adviceCard = document.getElementById("advice-card");
    adviceCard.style.borderLeftColor = couleur;

    document.getElementById("advice-icon").textContent = icone;
    document.getElementById("advice-title").textContent = conseilTitre;
    document.getElementById("advice").textContent = conseilTexte;
}

// ========================================
// 9. Évaluation complète
// ========================================

function evaluerConfort() {
    const temp = Number(temperatureInput.value);
    const humidite = Number(humidityInput.value);

    errorMessage.hidden = true;
    errorMessage.textContent = "";

    if (
        temperatureInput.value.trim() === "" ||
        humidityInput.value.trim() === "" ||
        !Number.isFinite(temp) ||
        !Number.isFinite(humidite) ||
        temp < 0 || temp > 40 ||
        humidite < 0 || humidite > 100
    ) {
        errorMessage.textContent =
            "Veuillez saisir une température entre 0 et 40 °C et une humidité entre 0 et 100 %.";
        errorMessage.hidden = false;
        return;
    }

    const calcul = evaluerRegles(temp, humidite);

    // Affichage des degrés de température
    afficherAppartenance("froide", calcul.temperature.froide);
    afficherAppartenance("moderee", calcul.temperature.moderee);
    afficherAppartenance("chaude", calcul.temperature.chaude);

    // Affichage des degrés d'humidité
    afficherAppartenance("faible", calcul.humidite.faible);
    afficherAppartenance("moyenne", calcul.humidite.moyenne);
    afficherAppartenance("elevee", calcul.humidite.elevee);

    // Affichage des résultats des règles
    afficherAppartenance("mauvais", calcul.resultat.mauvais);
    afficherAppartenance("moyen", calcul.resultat.moyen);
    afficherAppartenance("bon", calcul.resultat.bon);

    // Calcul et affichage du score
    const score = calculerScore(calcul.resultat);
    afficherResultat(score);
}

// ========================================
// 10. Synchronisation des champs et curseurs
// ========================================

temperatureRange.addEventListener("input", () => {
    temperatureInput.value = temperatureRange.value;
    evaluerConfort();
});

humidityRange.addEventListener("input", () => {
    humidityInput.value = humidityRange.value;
    evaluerConfort();
});

temperatureInput.addEventListener("input", () => {
    const valeur = Number(temperatureInput.value);

    if (temperatureInput.value !== "" && valeur >= 0 && valeur <= 40) {
        temperatureRange.value = valeur;
        evaluerConfort();
    }
});

humidityInput.addEventListener("input", () => {
    const valeur = Number(humidityInput.value);

    if (humidityInput.value !== "" && valeur >= 0 && valeur <= 100) {
        humidityRange.value = valeur;
        evaluerConfort();
    }
});

evaluateButton.addEventListener("click", evaluerConfort);

// Calcul initial au chargement de la page
evaluerConfort();
