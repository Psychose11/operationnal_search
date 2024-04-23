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
  const [taskDetails, setTaskDetails] = useState([]);

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
  
    // Ajouter la durée des tâches antérieures à newData
    tasks.forEach((task, index) => {
      const predecessors = chipsValues[2][index + 1] || [];
      predecessors.forEach(predecessor => {
        newData[predecessor] = newData[predecessor] || {};
        newData[predecessor]['Durée'] = inputValues[index]; // Utiliser la durée de la tâche actuelle
      });
  
      newData[task] = {
        'T.ant': chipsValues[2][index + 1],
        'T_succ': successors[task] || [],
        'Durée': inputValues[index],
      };
    });
  
    // Remplacer les débuts par 0
    tasks.forEach(task => {
      if (newData[task]['T.ant'].includes('Début')) {
        newData[task]['Durée'] = '0';
      }
    });
  
    // Ajouter une tâche "Fin" avec ses tâches antérieures
    const finPredecessors = tasks.filter(task => !successors[task]);
    newData['Fin'] = {
      'T.ant': finPredecessors,
      'T_succ': [],
      'Durée': '',
    };
  
    console.log(newData);
  
    const newTaskDetails = tasks.map((task) => {
      // Obtenir les tâches antérieures et la durée pour la tâche actuelle
      const predecessors = newData[task]['T.ant'] || [];
      const duration = newData[task]['Durée'] || '';
  
      // Récupérer les durées des tâches antérieures
      const predecessorsData = predecessors.map(predecessor => {
        const predecessorDuration = newData[predecessor]['Durée'] || '';
        return { task: predecessor, duration: predecessorDuration };
      });
  
      // Calculer la soustraction pour la durée de la tâche
      let subtraction = '';
      if (!predecessors.includes('Début')) {
        subtraction = predecessorsData.reduce((total, data) => {
          return total - (parseInt(data.duration) || 0);
        }, parseInt(duration) || 0);
      }
  
      // Créer le tableau des détails de la tâche
      return (
        <div key={task}>
          <h3>{duration} {task}</h3>
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                <th style={{ border: "1px solid black", padding: "8px", textAlign: "center"}} colSpan={2}>{duration}</th>
                {/* <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{duration}</th> */}
                <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }} colSpan={2}>{task}</th>
                {/* <th style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{task}</th> */}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{duration}</td>
                <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{predecessorsData.map(data => data.task).join(", ")}</td>
                <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{predecessorsData.map(data => data.duration).join(", ")}</td>
                <td style={{ border: "1px solid black", padding: "8px", textAlign: "center" }}>{subtraction}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    });
  
    setTaskDetails(newTaskDetails);
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
  
      <Button onClick={addColumn} label='Nouvelle colonne' />
      <Button onClick={sendData} label='Date au plus tôt' />
      
    <div style={{ maxWidth: "100%", overflowX: "auto" }}id="newTableContainer"></div>
  <div>
    {taskDetails}
  </div>
    </div>
  );
};

export default DynamicTable;