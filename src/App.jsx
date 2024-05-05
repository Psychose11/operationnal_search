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
  
    tasks.forEach((task, index) => {
      newData[task] = {
        'T.ant': chipsValues[2][index + 1],
        'T_succ': successors[task] || [],
        'Durée': inputValues[index],
      };
    });
    delete newData['Tâches'];
    console.lo("Données initiaux :")
    console.log(newData);    

    const calculateEarliestDates = (newData) => {
      const earliestDates = {};
    
      // Find tasks without successors
      const tasksWithoutSuccessors = Object.keys(newData)
        .filter(task => !newData[task]['T_succ'].length);
    
      // Add a "fin" task with tasks without successors as predecessors
      newData['fin'] = {
        'T.ant': tasksWithoutSuccessors,
        'T_succ': [],
        'Durée': 0,
      };
    
      // Parcourir chaque tâche
      Object.keys(newData).forEach(task => {
        // Récupérer les tâches antérieures et leur durée
        const predecessors = newData[task]['T.ant'] || [];
        let predecessorDurations = [];
    
        // Si la tâche a des tâches antérieures
        if (predecessors.length > 0) {
          predecessorDurations = predecessors.map(predecessor => ({
            task: predecessor,
            duration: newData[predecessor]['Durée'] || 0 // Si la durée est absente, on met 0
          }));
        } else {
          // Si la tâche n'a pas de tâches antérieures, sa durée au plus tôt est 0
          predecessorDurations = [{ task: 'Début', duration: 0 }];
        }
    
        // Stocker les durées des tâches antérieures pour la tâche actuelle
        earliestDates[task] = predecessorDurations;
      });
    
      return earliestDates;
    };
    



  
    
    // Utilisation de la fonction avec newData
    const earliestDates = calculateEarliestDates(newData);
    console.log(earliestDates);
    
    
    const adjustTaskDurations = (newData, earliestDates) => {
      const updatedData = { ...newData };
    
      // Identify tasks with no initial tasks (predecessors)
      const tasksWithNoInitialTasks = Object.keys(earliestDates)
        .filter(task => earliestDates[task].some(predecessor => predecessor.task === 'Début'));
    
      // Set duration to 0 for tasks with no initial tasks
      tasksWithNoInitialTasks.forEach(task => {
        updatedData[task].Durée = 0;
      });
    
      // Iterate through all tasks to adjust durations
      Object.keys(updatedData).forEach(task => {
        let maxDuration = 0;
    
        // Iterate through the predecessors of the current task
        earliestDates[task].forEach(predecessor => {
          let duration = predecessor.duration;
    
          // Add the duration of the predecessor task to the current duration if the task has a duration defined
          const predecessorDuration = updatedData[predecessor.task]?.Durée;
          if (predecessorDuration !== undefined) {
            duration += predecessorDuration;
          }
    
          // Update maxDuration if necessary
          if (duration > maxDuration) {
            maxDuration = duration;
          }
        });
    
        // Update task duration if it is defined
        if (updatedData[task]?.Durée !== undefined) {
          updatedData[task].Durée = maxDuration;
        }
      });
    
      return updatedData;
    };
    
    
    
    
    // Call the function to adjust task durations
    const updatedData = adjustTaskDurations(newData, earliestDates);
    console.log("Données finaux :");
    console.log(updatedData); // Display updated data with adjusted durations
    


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
      
    
    </div>
  );
};

export default DynamicTable;