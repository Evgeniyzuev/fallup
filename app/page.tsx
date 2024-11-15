'use client';

import React, { useState } from 'react';
import mapImage from '../public/map.jpg';
import { generateRandomEvent } from './events';
import { Inventory } from './components/Inventory';

// Add this interface before the inventory state declaration
interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  quantity: number;
}



function App() {
    const [inventory, setInventory] = useState<InventoryItem[]>([
        { id: 1, name: 'Медикаменты', icon: '💊', quantity: 3 },
        { id: 2, name: 'Энергетик', icon: '🥤', quantity: 2 },
    ]);
  const CELL_SIZE = 20;
  const GRID_SIZE = 20;
  const MAP_SIZE = CELL_SIZE * GRID_SIZE;
  const MARKER_SIZE = 10;
  const MAP_SCALE = 2;

  const [position, setPosition] = useState({ x: MARKER_SIZE/2, y: MARKER_SIZE/2 });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set(['0,0']));
  const [resources, setResources] = useState({
    bullets: 100,
    water: 100,
    food: 100,
    health: 100,
    energy: 100,
    money: 1000
  });
  const [messages, setMessages] = useState<string[]>([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  const moveMarker = (direction: string) => {
    const step = 5;
    
    // Check if game over
    if (resources.health <= 0) {
      setIsGameOver(true);
      setMessages(prev => ['GAME OVER! Вы погибли.', ...prev].slice(0, 5));
      return;
    }

    setPosition(prev => {
      let newX = prev.x;
      let newY = prev.y;

      switch (direction) {
        case 'up':
          newY = Math.max(MARKER_SIZE/2, prev.y - step);
          break;
        case 'down':
          newY = Math.min(MAP_SIZE - MARKER_SIZE/2, prev.y + step);
          break;
        case 'left':
          newX = Math.max(MARKER_SIZE/2, prev.x - step);
          break;
        case 'right':
          newX = Math.min(MAP_SIZE - MARKER_SIZE/2, prev.x + step);
          break;
      }

      // Generate random event
      const event = generateRandomEvent();
      setMessages(prev => [`${event.text}`, ...prev].slice(0, 5));
      
      // Apply event effect
      setResources(prev => ({
        ...prev,
        [event.effect.type]: Math.max(0, prev[event.effect.type as keyof typeof prev] + event.effect.value)
      }));

      // Decrease resources each turn
      setResources(prev => {
        const newResources = {
          ...prev,
          water: Math.max(0, prev.water - 1),
          food: Math.max(0, prev.food - 1),
          energy: Math.max(0, prev.energy - 1)
        };

        // If any resource is 0, decrease health
        let healthLoss = 0;
        if (newResources.water === 0) healthLoss += 1;
        if (newResources.food === 0) healthLoss += 1;
        if (newResources.energy === 0) healthLoss += 1;

        if (healthLoss > 0) {
          setMessages(prevMessages => [
            `Критическая нехватка ресурсов! (-${healthLoss} здоровья)`,
            ...prevMessages
          ].slice(0, 5));
        }

        return {
          ...newResources,
          health: Math.max(0, prev.health - healthLoss)
        };
      });

      const cellX = Math.floor(newX / CELL_SIZE);
      const cellY = Math.floor(newY / CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      setVisitedCells(prev => new Set([...prev, cellKey]));

      return { x: newX, y: newY };
    });
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.name === 'Медикаменты') {
        setResources(prev => ({
            ...prev,
            health: Math.min(100, prev.health + 25)
        }));
        setMessages(prev => [`Использованы медикаменты (+25 здоровья)`, ...prev].slice(0, 5));
    } else if (item.name === 'Энергетик') {
        setResources(prev => ({
            ...prev,
            energy: Math.min(100, prev.energy + 50)
        }));
        setMessages(prev => [`Выпит энергетик (+50 энергии)`, ...prev].slice(0, 5));
    }
    
    setInventory(prev => {
        const newInventory = prev.map(invItem => {
            if (invItem.id === item.id) {
                return {
                    ...invItem,
                    quantity: invItem.quantity - 1
                };
            }
            return invItem;
        }).filter(item => item.quantity > 0);
        
        return newInventory;
    });
  };

  if (resources.health <= 0) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img 
          src="/gameover.jpg" 
          alt="Game Over" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover'
          }} 
        />
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      padding: '5px',
      boxSizing: 'border-box',
      gap: '5px'
    }}>
      {/* Карта - верхняя половина */}
      <div style={{ 
        height: '60vh',
        overflow: 'auto',
        border: '1px solid #ccc',
        borderRadius: '4px',
        position: 'relative',
      }}>
        <div style={{ 
          position: 'relative',
          width: MAP_SIZE,
          height: MAP_SIZE,
          transform: `scale(${MAP_SCALE})`,
          transformOrigin: '0 0',
        }}>
          {/* Карта */}
          <img 
            src={mapImage.src} 
            alt={"Map"} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              display: 'block'
            }} 
          />

          {/* Сетка тумана */}
          {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, index) => {
            const x = (index % GRID_SIZE);
            const y = Math.floor(index / GRID_SIZE);
            const cellKey = `${x},${y}`;
            
            return (
              <div
                key={cellKey}
                style={{
                  position: 'absolute',
                  left: x * CELL_SIZE,
                  top: y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: 'black',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: visitedCells.has(cellKey) ? 'none' : 'block'
                }}
              />
            );
          })}

          {/* Маркер */}
          <div
            style={{
              position: 'absolute',
              left: position.x - MARKER_SIZE/2,
              top: position.y - MARKER_SIZE/2,
              width: MARKER_SIZE,
              height: MARKER_SIZE,
              backgroundColor: 'green',
              borderRadius: '50%',
              zIndex: 2,
            }}
          />
        </div>
      </div>

      {/* Текстовое окно - нижняя половина */}
      {inventoryOpen ? (
        <Inventory 
          isOpen={inventoryOpen} 
          onClose={() => setInventoryOpen(false)}
          onUseItem={handleUseItem}
          items={inventory}
        />
      ) : (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}>
          {/* Область для текста */}
          <div style={{
            flex: 1,
            padding: '10px',
            overflow: 'auto',
            backgroundColor: '#f8f8f8',
            fontFamily: 'monospace'
          }}>
            {messages.map((message, index) => (
              <div key={index} style={{
                padding: '8px',
                borderBottom: '1px solid #eee'
              }}>
                {message}
              </div>
            ))}
          </div>

          {/* Кнопки управления внизу текстового окна */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '15px',
            padding: '15px',
            backgroundColor: '#f5f5f5',
            borderRadius: '0 0 4px 4px'
          }}>
            {/* Панель ресурсов */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              fontSize: '0.6em',
              backgroundColor: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <span>💧 {resources.water}</span>
              <span>🍗 {resources.food}</span>
              {/* патроны */}
              <span>🔫 {resources.bullets}</span>
              <span>❤️ {resources.health}</span>
              <span>⚡️ {resources.energy}</span>
              <span>🪙 {resources.money}</span>
            </div>

            {/* Кнопки движения */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button style={{ padding: '10px 20px', fontSize: '1.2em' }} onClick={() => moveMarker('up')}>↑</button>
              <button style={{ padding: '10px 20px', fontSize: '1.2em' }} onClick={() => moveMarker('left')}>←</button>
              <button style={{ padding: '10px 20px', fontSize: '1.2em' }} onClick={() => moveMarker('right')}>→</button>
              <button style={{ padding: '10px 20px', fontSize: '1.2em' }} onClick={() => moveMarker('down')}>↓</button>
              {/* Кнопка инвентаря */}
              <button style={{ padding: '10px 20px', fontSize: '1.2em' }} onClick={() => setInventoryOpen(true)}>🎒</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App; 