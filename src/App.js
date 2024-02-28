import React, { useState } from 'react';

const DynamicTable = () => {
  const [columns, setColumns] = useState([
    ['Tâches', 'A', 'B', 'C'], // Les titres des colonnes initiales
    ['Durée', '', '', ''],
    ['Tâches antérieures', '', '', ''],
    ['Tâches successeurs', '', '', '']
  ]);

  const addColumn = () => {
    setColumns(prevColumns => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nextLetter = alphabet[prevColumns[0].length - 1]; // La prochaine lettre à ajouter
      return prevColumns.map((column, index) => {
        const newColumn = index === 0 ? nextLetter : ''; // Nouvelle cellule avec la lettre ou vide
        return [...column, newColumn]; // Ajout de la nouvelle cellule à la fin de chaque ligne
      });
    });
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
                    <th style={{ width: "0.1cm", border: "1px solid grey", }}>{cell}</th>
                  ) : (
                    <td style={{ width: "0.1cm", height: "0.5cm", border: "1px solid grey" }}>
                      <input type="text" placeholder={`Row ${rowIndex + 1}, Column ${colIndex + 1}`} value={cell} />
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
