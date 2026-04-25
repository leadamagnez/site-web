/* script pour le téléchager un fichier texte */
window.onload = function() {
    let fileInput = document.getElementById('fileInput');
    let fileDisplayArea = document.getElementById('fileDisplayArea');

   
    fileInput.addEventListener('change', function(e) {
      
        let file = fileInput.files[0];
        
        let textType = new RegExp("text.*");

        if (file.type.match(textType)) { 
            var reader = new FileReader();

           
            reader.onload = function(e) {
                fileDisplayArea.innerText = reader.result;
            }

           
            reader.readAsText(file);    

            document.getElementById("logger").innerHTML = '<span class="infolog">Fichier chargé avec succès</span>';
        } else { 
            fileDisplayArea.innerText = "";
            document.getElementById("logger").innerHTML = '<span class="errorlog">Type de fichier non supporté !</span>';
        }
    });
}



/*fonction pour la segmentation*/
function segText() {
    if (document.getElementById('fileDisplayArea').innerHTML==""){
        document.getElementById('logger').innerHTML="Il faut d'abord charger un fichier .txt !";
    } 
    else {
        if (document.getElementById("delimID").value === "") {
            document.getElementById("logger").innerHTML = '<span class="errorlog">Aucun délimiteur donné !</span>'
        }
        else{
            document.getElementById('logger').innerHTML="";
            let text = document.getElementById("fileDisplayArea").innerText;
            let delim = document.getElementById("delimID").value;
            let display = document.getElementById("page-analysis");
        
            let regex_delim = new RegExp(
                "["
                + delim
                    .replace("-", "\\-") // le tiret n'est pas à  la fin : il faut l'échapper, sinon erreur sur l'expression régulière
                    .replace("[", "\\[").replace("]", "\\]") // Ã  changer sinon regex fautive, exemple : [()[]{}] doit Ãªtre [()\[\]{}], on doit "Ã©chapper" les crochets, sinon on a un symbole ] qui arrive trop tÃ´t.
                + "\\s" // on ajoute tous les symboles d'espacement (retour Ã  la ligne, etc)
                + "]+" // on ajoute le + au cas oÃ¹ plusieurs dÃ©limiteurs sont prÃ©sents : Ã©vite les tokens vides
            );
        
            let tokens = text.split(regex_delim);
            tokens = tokens.filter(x => x.trim() != ""); // on s'assure de ne garder que des tokens "non vides"
            let lines = text.split(/\r?\n/g);
            lines = lines.filter(line => line.trim() != "");
        
            global_var_tokens = tokens; // dÃ©commenter pour vÃ©rifier l'Ã©tat des tokens dans la console dÃ©veloppeurs sur le navigateur
            global_var_lines = lines;
            display.innerHTML = tokens.join(" ");
        }
    }
}





/*fonction kujuj*/
function kujuj(text) {
    return text.replace(/\b([a-zA-ZÀ-ÿ]+)\b/g, "$1uj"); /*prend en compte tous les suites de caractères alphabétiques et ajoute uj */
}

/*affiche le résultat à droite et le txt original à gauche*/
function resultKujuj() {
    let text = document.getElementById("fileDisplayArea").innerText; /*prend le texte donné par l'utilsateur*/

    let result = kujuj(text); /*ajoute uj à chaque fin de mot*/

    document.getElementById("right").innerHTML = result; /*affiche le résultat à droite */
}





/*fonction concordancier*/
function concordancier() {
    let text = document.getElementById("fileDisplayArea").innerText; /* prend le texte qui a été télécharger*/
    let word = document.getElementById("poleID").value; /*prend la valeur qui a été donné dans la poleID, se que l'utilisateur a rentrer comme mot dans la case pôle */

    let tokens = text.split(/\s+/);
    let html = "<table border='1' style='width:100%; border-collapse:collapse;'>"; /* met dans un tableau les résultats*/

    html += "<tr><th>Contexte gauche</th><th>Mot</th><th>Contexte droit</th></tr>";

    for (let i = 0; i < tokens.length; i++) { /*on cherche le mot dans le texte si on trouve une correspondace alors on va prendre le contexte droit et gauche */
        if (tokens[i] === word) {

            let left = tokens.slice(i - 5, i).join(" "); /*prend les cinq mots avant i */
            let right = tokens.slice(i + 1, i + 6).join(" "); /*prend les cinq mots apres i (on saute i donc i+1)*/

           html += "<tr>" +
                "<td style='text-align:center;'>" + left + "</td>" + /*colonne de gauche a le contexte gauche */
                "<td style='text-align:center;'>" + tokens[i] + "</td>" + /*colonne de centrale a le mot rechercher */
                "<td style='text-align:center;'>" + right + "</td>" + /*colonne de droite a le contexte droit */
            "</tr>";
        }
    }

    html += "</table>"; /*fin du tableau */

    document.getElementById("page-analysis").innerHTML = html; /*renvoie le résultat dans la div page analysis de la page html */
}

/*dictionnaire */
function dictionnaire() {
    let text = document.getElementById("fileDisplayArea").innerText;

    let tokens = text.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, " ").split(/\s+/); /*prend seuleument en compte les mots qui sont formé par des lettres et les différencie par leur séparation*/ 
    let freq = {}; /*liste pour contenir les résultats de la boucle for*/

    for (let i = 0; i < tokens.length; i++) { /*boucle for qui va créé un nb de ligne dans le tableau en fontion du nombre de token, c'est à dire de mots dans le texte qu'on lui a donné */
        let mot = tokens[i];

        if (mot in freq) { /*si le mot est trouvé plusieurs fois alors on rajoute le nombre de fréquence qu'on a trouvé pour le mot  */
            freq[mot]++;
        } else { /*sinon la fréquence de mot est 1 */
            freq[mot] = 1;
        }
    }

    return freq;
}

function afficheDictionnaire() { /*met les résulats de la fonction dictionnaire dans un tableau qu'on renvoit à la div page analysis*/
    let freq = dictionnaire();
    let html = "<table border='1' style='width:100%; border-collapse:collapse;'>"; /*tableau pour afficher les résultats du dictionnaire*/
    html += "<tr><th>Mot</th><th>Fréquence</th></tr>";

    for (let mot in freq) {
        html += "<tr><td>" + mot + "</td><td>" + freq[mot] + "</td></tr>"; /*affiche bien le mot face à la fréquence ou on trouve le mot dans le texte*/
    }

    html += "</table>";

    document.getElementById("page-analysis").innerHTML = html;
}