import React from 'react';

interface InventoryProps {
  isOpen: boolean;
  onClose: () => void;
  onUseItem: (item: InventoryItem) => void;
  items: InventoryItem[];
}

// Добавляем интерфейс для предмета инвентаря
interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  quantity: number;
}

export function Inventory({ isOpen, onClose, onUseItem, items }: InventoryProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #ccc',
      borderRadius: '4px',
      position: 'relative',
    }}>
      <button 
        onClick={onClose}
        style={{
          position: 'absolute',
          right: '0px',
          top: '0px',
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '0px',
        }}
      >
        ✕
      </button>
      <div style={{
        flex: 1,
        padding: '1px',
        overflow: 'auto',
        backgroundColor: '#f8f8f8',
      }}>
        {items.length > 0 ? (
          <div style={{ padding: '10px' }}>
            {items.map(item => (
              <div 
                key={item.id} 
                onClick={() => onUseItem(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px',
                  border: '1px solid #eee',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '64px',
                  height: '64px',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: 'pointer',
                }}
              >
                <span style={{ 
                  fontSize: '24px',
                  position: 'relative'
                }}>
                  {item.icon}
                  <span style={{ 
                    position: 'absolute',
                    bottom: '-4px',
                    right: '-4px',
                    fontSize: '12px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}>{item.quantity}</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '10px' }}>
            Инвентарь пуст
          </div>
        )}
      </div>
    </div>
  );
} 