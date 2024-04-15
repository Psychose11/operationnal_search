import React, { useState, useRef, useEffect } from 'react';
import { Chips } from 'primereact/chips';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import * as ReactDOM from 'react-dom';

const DynamicTable = () => {
  const [columns, setColumns] = useState([
    ['Tâches', 'A', 'B', 'C'],
    ['Durée', '', '', ''],
    ['T.ant', '', '', ''],
    ['T_succ', '', '', '']
  ]);

  const [chipsValues, setChipsValues] = useState([
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', ''],
    ['', '', '', '']
  ]);

  const [successors, setSuccessors] = useState({});
  const [data, setData] = useState({});

  const [inputValues, setInputValues] = useState(new Array(columns[0].length - 1).fill(''));


  const addColumn = () => {
    setColumns(prevColumns => {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const nextLetter = alphabet[prevColumns[0].length - 1];
      return prevColumns.map((column, index) => {
        const newColumn = index === 0 ? nextLetter : '';
        return [...column, newColumn];
      });
    });
    setChipsValues(prevChipsValues => {
      return prevChipsValues.map(row => {
        return [...row, ''];
      });
    });
    setData(prevData => {
      const newData = { ...prevData };
      columns[0].forEach((task, index) => {
        if (!newData[task]) {
          newData[task] = { 'Durée': '' };
        }
      });
      return newData;
    });
  };


  const handleChange = (index, value) => {
    const newValues = [...inputValues];
    newValues[index] = value;
    setInputValues(newValues);
  };

  
  const sendData = () => {
    const tasks = columns[0].slice(1);
    const newData = { ...data };
  
    tasks.forEach((task, index) => {
      newData[task] = {
        'T.ant': chipsValues[2][index + 1],
        'T_succ': successors[task] || [],
        'Durée': inputValues[index],
      };
    });
  
    console.log(newData);
  
    // Génération des lignes vides pour chaque en-tête de colonne
    const emptyRows = Array.from({ length: 0}).map((_, rowIndex) => (
      <tr key={`emptyRow-${rowIndex}`}>
        {tasks.map((task) => {
          const predecessors = newData[task]['T.ant'] || [];
          const duration = newData[task]['Durée'] || '';
  
          return (
            <React.Fragment key={`${task}-empty-${rowIndex}`}> 
              <td style={{ border: "0.5px solid black", padding: "5px", width: "1cm", textAlign: "center" }}></td>
              <td style={{ border: "0.5px solid black", padding: "5px", width: "1cm", textAlign: "center" }}>{predecessors[rowIndex]}</td>
            </React.Fragment>
          );
        })}
      </tr>
    ));
  
    const tableHeader = (
      <thead>
        <tr>
          {tasks.map((task) => (
            <React.Fragment key={task}>    
            <th style={{ border: "1px solid black", padding: "5px", textAlign: "center", width: "1cm" }}></th>
            <th style={{ border: "1px solid black", padding: "5px", textAlign: "center", width: "1cm" }}>{task}</th>
          
            </React.Fragment>
          ))}
        </tr>
      </thead>
    );
  
    // Création de la nouvelle table avec les lignes vides
    const newTable = (
      <div>
        <h2>Date au plus tôt</h2>
        <table style={{ borderCollapse: "collapse", width: "auto" }}>
          {tableHeader}
          <tbody>
            {emptyRows}
          </tbody>
        </table>
      </div>
    );
  
    // Affichage de la nouvelle table
    ReactDOM.render(newTable, document.getElementById('newTableContainer'));
  };
  
  
  

  const handleChipsChange = (rowIndex, colIndex, value) => {
    if (rowIndex === 2) {
      const task = columns[0][colIndex];
      if (value.includes(task)) {
        value = value.filter(item => item !== task);
      }
    }

    setChipsValues(prevChipsValues => {
      const updatedRow = [...prevChipsValues[rowIndex]];
      updatedRow[colIndex] = value;
      return prevChipsValues.map((row, index) => {
        return index === rowIndex ? updatedRow : row;
      });
    });

    if (rowIndex === 2) {
      setSuccessors(prevSuccessors => {
        const task = columns[0][colIndex];
        const updatedSuccessors = { ...prevSuccessors };

        Object.keys(updatedSuccessors).forEach(predecessor => {
          if (!value.includes(predecessor)) {
            updatedSuccessors[predecessor] = updatedSuccessors[predecessor].filter(successor => successor !== task);
          }
        });

        value.forEach(predecessor => {
          if (updatedSuccessors[predecessor]) {
            updatedSuccessors[predecessor] = Array.from(new Set([...updatedSuccessors[predecessor], task]));
          } else {
            updatedSuccessors[predecessor] = [task];
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
                  {colIndex === 0 ? (
                    <th style={{ minWidth: "1.5cm", maxWidth: "1.5cm", border: "1px solid grey" }}>{cell}</th>
                  ) : (
                    <td style={{ minWidth: "1.5cm", maxWidth: "1.5cm", height: "0.5cm", border: "1px solid grey" }}>
                      {rowIndex === 0 ? (
                        cell
                      ) : rowIndex === 1 ? (
                        
                        <InputNumber
                        key={colIndex}
                        style={{ width: "100%" }}
                        inputStyle={{ width: "100%", maxWidth: "1.5cm", maxHeight: "0.5cm", border: "none" }}
                        inputProps={{ maxLength: 3 }}
                        value={inputValues[colIndex - 1]}
                        onValueChange={(e) => handleChange(colIndex - 1, e.value)}
                      />
                      ) : null}

                      {rowIndex !== 1 && rowIndex !== 3 && rowIndex !== 0 ? (
                        <Chips value={chipsValues[rowIndex][colIndex]} onChange={(e) => handleChipsChange(rowIndex, colIndex, e.value)} />
                      ) : rowIndex === 3 ? (
                        <Chips value={successors[columns[0][colIndex]] || []} disabled />
                      ) : null}
                    </td>
                  )}
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>



      <div id="newTableContainer"></div>
      <Button onClick={addColumn} label='Nouvelle colonne' />
      <Button onClick={sendData} label='Date au plus tôt' />





    </div>
  );
};

export default DynamicTable;