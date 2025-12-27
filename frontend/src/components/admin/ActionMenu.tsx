'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface ActionMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  trigger: ReactNode;
  align?: 'left' | 'right';
}

export default function ActionMenu({
  items,
  trigger,
  align = 'right',
}: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: ActionMenuItem) => {
    if (!item.disabled) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute z-20 mt-2 w-48 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] shadow-xl ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${
                    item.disabled
                      ? 'text-[#555555] cursor-not-allowed'
                      : item.danger
                      ? 'text-[#ef4444] hover:bg-[#2a1a1a]'
                      : 'text-[#999999] hover:text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {item.icon && <span>{item.icon}</span>}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

