// Variable globale pour stocker les données du tableau
let currentAmortizationTable = [];

// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    
    // Récupérer les éléments
    document.querySelector('.calculate-button').addEventListener('click', function () {
        const loanAmount = parseFloat(document.getElementById('amount').value);
        const annualRate = parseFloat(document.getElementById('rate').value) / 100;
        const loanDuration = parseInt(document.getElementById('duration').value) * 12;
      
        if (isNaN(loanAmount) || isNaN(annualRate) || isNaN(loanDuration)) {
          alert('Veuillez entrer des valeurs valides pour tous les champs.');
          return;
        }

    // Formules mathématiques
    const monthlyRate = annualRate / 12;
    const monthlyPayment = loanAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -loanDuration));
  
    let remainingBalance = loanAmount;
    let amortizationTable = [];
    let month = 1;
  
    while (remainingBalance > 0) {
      const interest = remainingBalance * monthlyRate;
      const principal = Math.min(monthlyPayment - interest, remainingBalance);
      const newBalance = remainingBalance - principal;
  
      amortizationTable.push({
        month: month,
        initialBalance: remainingBalance,
        monthlyPayment: monthlyPayment,
        interest: interest,
        principal: principal,
        remainingBalance: newBalance,
      });
  
      remainingBalance = newBalance;
      month++;
      if (month > loanDuration) break;
    }
  
    // Stocker les données globalement pour le PDF
    currentAmortizationTable = amortizationTable;
    
    // Création tableau
    displayAmortizationTable(amortizationTable);
});

// Fonction d'affichage du tableau
function displayAmortizationTable(amortizationTable) {
    const tableBody = document.querySelector('#amortization-table tbody');
    tableBody.innerHTML = '';
  
    amortizationTable.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.month}</td>
        <td>${row.initialBalance.toFixed(2)} €</td>
        <td>${row.monthlyPayment.toFixed(2)} €</td>
        <td>${row.interest.toFixed(2)} €</td>
        <td>${row.principal.toFixed(2)} €</td>
        <td>${row.remainingBalance.toFixed(2)} €</td>
      `;
      tableBody.appendChild(tr);
    });

    // Afficher la section des résultats
    document.getElementById('result-section').style.display = 'block';
}

// Télécharger en PDF - VERSION SIMPLIFIÉE pour vos bibliothèques existantes
document.getElementById('download-pdf').addEventListener('click', function () {
    console.log('Clic sur télécharger PDF'); // Debug
    
    if (currentAmortizationTable.length === 0) {
        alert('Aucun tableau à télécharger. Veuillez d\'abord effectuer un calcul.');
        return;
    }

    try {
        console.log('Vérification de jsPDF:', typeof window.jspdf); // Debug
            
// Vérifier que jsPDF est chargé
if (typeof window.jspdf === 'undefined') {
    alert('Bibliothèque PDF non chargée. Veuillez actualiser la page.');
    return;
}

// Afficher un indicateur de chargement
const originalText = this.textContent;
this.textContent = 'Génération...';
this.disabled = true;

// Créer le PDF
const { jsPDF } = window.jspdf;
const doc = new jsPDF();

// Titre
doc.setFontSize(18);
doc.setFont(undefined, 'bold');
doc.text('Tableau d\'Amortissement', 105, 20, { align: 'center' });

// Informations du prêt
const loanAmount = parseFloat(document.getElementById('amount').value);
const annualRate = parseFloat(document.getElementById('rate').value);
const loanDuration = parseInt(document.getElementById('duration').value);

doc.setFontSize(12);
doc.setFont(undefined, 'normal');
doc.text(`Montant emprunté: ${loanAmount.toLocaleString('fr-FR')} €`, 20, 35);
doc.text(`Taux nominal: ${annualRate}%`, 20, 45);
doc.text(`Durée: ${loanDuration} an(s)`, 20, 55);

// Préparer les données pour le tableau
const tableData = currentAmortizationTable.map(row => [
    row.month.toString(),
    `${row.initialBalance.toFixed(2)} €`,
    `${row.monthlyPayment.toFixed(2)} €`,
    `${row.interest.toFixed(2)} €`,
    `${row.principal.toFixed(2)} €`,
    `${row.remainingBalance.toFixed(2)} €`
]);

console.log('Données du tableau:', tableData.length, 'lignes'); // Debug

// Créer le tableau avec autoTable
doc.autoTable({
    head: [['Mois', 'Solde Initial', 'Échéance', 'Intérêts', 'Amortissement', 'Solde Restant']],
    body: tableData,
    startY: 65,
    styles: {
        fontSize: 8,
        cellPadding: 2,
        halign: 'center',
    },
    headStyles: {
        fillColor: [44, 90, 160],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
    },
    alternateRowStyles: {
        fillColor: [248, 250, 255],
    },
    margin: { top: 65, left: 10, right: 10 },
});

console.log('PDF créé, tentative de sauvegarde...'); // Debug

            // Sauvegarder le PDF
            doc.save('tableau-amortissement.pdf');
            
            console.log('PDF sauvegardé avec succès'); // Debug

        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF: ' + error.message);
        } finally {
            // Restaurer le bouton
            this.textContent = originalText;
            this.disabled = false;
        }
    });

});