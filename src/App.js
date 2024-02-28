import React, { useState } from 'react';
import { Chips } from 'primereact/chips'; // Importer le composant Chips

const DynamicTable = () => {
  const [columns, setColumns] = useState([
    ['Tâches', 'A', 'B', 'C'], // Les titres des colonnes initiales
    ['Durée', '', '', ''],
    ['T.ant', '', '', ''],
    ['T_succ', '', '', '']
  ]);

  const [chipsValues, setChipsValues] = useState([ // Un état local pour stocker les valeurs des chips
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ]);

  const [successors, setSuccessors] = useState({}); // Un état local pour stocker les relations entre les tâches

  const addColumn = () => {
    setColumns(prevColumns => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nextLetter = alphabet[prevColumns[0].length - 1]; // La prochaine lettre à ajouter
      return prevColumns.map((column, index) => {
        const newColumn = index === 0 ? nextLetter : ''; // Nouvelle cellule avec la lettre ou vide
        return [...column, newColumn]; // Ajout de la nouvelle cellule à la fin de chaque ligne
      });
    });
    setChipsValues(prevChipsValues => { // Ajout d'une nouvelle cellule vide pour chaque ligne de chips
      return prevChipsValues.map(row => {
        return [...row, ''];
      });
    });
  };

  const handleChipsChange = (rowIndex, colIndex, value) => { // Une fonction pour gérer le changement de valeur des chips
    setChipsValues(prevChipsValues => { // Mise à jour de l'état local des chips
      const updatedRow = [...prevChipsValues[rowIndex]];
      updatedRow[colIndex] = value;
      return prevChipsValues.map((row, index) => {
        return index === rowIndex ? updatedRow : row;
      });
    });
    if (rowIndex === 2) { // Si la ligne modifiée est celle des tâches antérieures
      setSuccessors(prevSuccessors => { // Mise à jour de l'état local des successeurs
        const task = columns[0][colIndex]; // La tâche correspondante à la colonne
        const updatedSuccessors = { ...prevSuccessors };
        value.forEach(predecessor => { // Pour chaque tâche antérieure saisie
          if (updatedSuccessors[predecessor]) { // Si la tâche antérieure a déjà des successeurs
            updatedSuccessors[predecessor] = [...updatedSuccessors[predecessor], task]; // Ajout de la tâche courante aux successeurs
          } else { // Sinon
            updatedSuccessors[predecessor] = [task]; // Création d'un nouveau tableau de successeurs avec la tâche courante
          }
        });
        // Nouveau code pour supprimer les successeurs
        Object.keys(updatedSuccessors).forEach(predecessor => { // Pour chaque tâche antérieure existante
          if (!value.includes(predecessor)) { // Si la tâche antérieure n'est pas dans la valeur saisie
            updatedSuccessors[predecessor] = updatedSuccessors[predecessor].filter(successor => successor !== task); // Suppression de la tâche courante des successeurs
            if (updatedSuccessors[predecessor].length === 0) { // Si la tâche antérieure n'a plus de successeurs
              delete updatedSuccessors[predecessor]; // Suppression de la tâche antérieure de l'objet
            }
          }
        });
        return updatedSuccessors;
      });
    }
  };


  return (
    <div style={{ maxWidth: "100%", overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "auto" }}>
        <tbody>
          {columns.map((column, rowIndex) => (
            <tr key={rowIndex}>
              {column.map((cell, colIndex) => (
                <React.Fragment key={`${rowIndex}-${colIndex}`}>
                  {colIndex === 0 ? ( // En-tête à gauche
                    <th style={{ minWidth: "1.5cm", maxWidth: "1.5cm", border: "1px solid grey", }}>{cell}</th>
                  ) : (
                    <td style={{ minWidth: "1.5cm", maxWidth: "1.5cm", height: "0.5cm", border: "1px solid grey" }}>
                      {rowIndex === 3 ? ( // Si la ligne est celle des tâches successeurs
                        <Chips value={successors[columns[0][colIndex]] || []} disabled /> // Afficher les successeurs calculés et désactiver l'édition
                      ) : (
                        <Chips value={chipsValues[rowIndex][colIndex]} onChange={(e) => handleChipsChange(rowIndex, colIndex, e.value)} /> // Sinon, afficher les chips éditables
                      )}
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addColumn}>Add Column</button>
    </div>
  );
};

export default DynamicTable;
