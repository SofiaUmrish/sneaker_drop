import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

const Dropdown = ({ label, options, value, onSelect, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        setIsOpen(false);
        if (onSelect) onSelect(option);
    };

    const selectedOption = options.find(opt => {
        if (typeof opt === 'object') {
            return opt.id.toString() === value?.toString();
        }
        return opt === value;
    });

    const displayLabel = selectedOption
        ? (typeof selectedOption === 'object' ? selectedOption.name : selectedOption)
        : (placeholder || label);

    return (
        <div className="dropdown" ref={dropdownRef}>
            <button
                type="button"
                className={`dropdown-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span>{displayLabel}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16" height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="dropdown-chevron"
                    style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    {options.map((option, index) => {
                        const isObject = typeof option === 'object';
                        const optId = isObject ? option.id.toString() : option;
                        const optName = isObject ? option.name : option;
                        const isSelected = value?.toString() === optId.toString();

                        return (
                            <div
                                key={index}
                                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option)}
                            >
                                {optName}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
