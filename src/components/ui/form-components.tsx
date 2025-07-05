import React, { useState } from 'react';
import { Trash2, Flame, Drumstick } from 'lucide-react';

// --- UI Components (moved outside to prevent re-renders) ---
export const FormSection = ({ title, icon, children }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            {icon}
            <span className="ml-3">{title}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

export const Input = ({ label, name, value, onChange, ...props }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1.5 text-sm font-medium text-gray-600">{label}</label>
        <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            {...props}
        />
    </div>
);

export const Select = ({ label, name, value, onChange, children, ...props }) => (
    <div className="flex flex-col">
        <label htmlFor={name} className="mb-1.5 text-sm font-medium text-gray-600">{label}</label>
        <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className="p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-white"
            {...props}
        >
            {children}
        </select>
    </div>
);

type ChipSelectProps = {
    label: string;
    options: string[];
    selected: string[];
    onChange: (option: string) => void;
    allowCustom?: boolean;
    customPlaceholder?: string;
};

export const ChipSelect = ({ 
    label, 
    options, 
    selected, 
    onChange, 
    allowCustom = false, 
    customPlaceholder = "Enter custom value..." 
}: ChipSelectProps) => {
    const [customValue, setCustomValue] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    const handleOptionClick = (option: string) => {
        if (option === 'Other' && allowCustom) {
            setShowCustomInput(true);
            return;
        }
        onChange(option);
    };

    const handleCustomSubmit = () => {
        const cleaned = customValue.trim();
        if (!cleaned) return;

        try {
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) {
                parsed.forEach((v) => {
                    if (typeof v === 'string') onChange(v);
                });
            } else {
                onChange(cleaned);
            }
        } catch {
            onChange(cleaned);
        }

        setCustomValue('');
        setShowCustomInput(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleCustomSubmit();
        }
    };

    const validSelected = Array.isArray(selected) ? selected : [];
    const customValues = validSelected.filter(item => !options.includes(item));
    const displayOptions = allowCustom ? [...options, ...customValues, 'Other'] : options;

    return (
        <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-gray-600">{label}</label>
            <div className="flex flex-wrap gap-2">
                {displayOptions.map(option => (
                    <button
                        type="button"
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className={`px-4 py-2 text-sm rounded-full transition-all duration-200 ${
                            validSelected.includes(option)
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {showCustomInput && (
                <div className="mt-3 flex gap-2">
                    <input
                        type="text"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={customPlaceholder}
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={handleCustomSubmit}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        Add
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowCustomInput(false);
                            setCustomValue('');
                        }}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm font-medium"
                    >
                        Cancel
                    </button>
                </div>
            )}

            {validSelected.length > 0 && (
                <div className="mt-2 text-sm text-gray-500">
                    Selected: {validSelected.join(', ')}
                </div>
            )}
        </div>
    );
};



  type RecipeCardProps = {
    r: any;
    onDelete: (recipeId: any) => void;
    onClick?: () => void;
  };

  export const RecipeCard = ({ r, onDelete, onClick }: RecipeCardProps) => (
    <div
      className="bg-white p-5 rounded-xl shadow-md border border-gray-200/80 hover:shadow-lg transition-shadow duration-300 relative cursor-pointer"
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); // prevent card click when delete is clicked
          onDelete(r.id);
        }}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition-colors"
      >
        <Trash2 size={18} />
      </button>
      <h3 className="text-xl font-bold text-indigo-700 mb-2">{r.recipeName}</h3>
      <p className="text-sm text-gray-500 mb-3">{r.cuisineType} | {r.courseType}</p>
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <Flame size={16} className="mr-2 text-orange-500" />
        <span>{r.nutrition.calories || 'N/A'} kcal</span>
        <span className="mx-2">|</span>
        <Drumstick size={16} className="mr-2 text-yellow-600" />
        <span>{r.ingredients.length} ingredients</span>
      </div>
      <div className="border-t border-gray-200 pt-3">
        <p className="text-xs text-gray-400">Saved: {new Date(r.createAt).toLocaleDateString()}</p>
      </div>
    </div>
  );