import React, { useState } from 'react';

const CustomChips = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onChange([...value, inputValue.trim()]);
      setInputValue('');
    }
  };

  const handleRemoveChip = (chipToRemove) => {
    onChange(value.filter((chip) => chip !== chipToRemove));
  };

  return (
    <div className="custom-chips">
      <div className="chip-list">
        {value.map((chip) => (
          <div key={chip} className="chip">
            <span>{chip}</span>
            <button onClick={() => handleRemoveChip(chip)} className="chip-remove">
              &times;
            </button>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ajouter un chip"
        className="chip-input"
      />
    </div>
  );
};

export default CustomChips;