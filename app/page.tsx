'use client';

import React, { useState, useEffect } from 'react';
import { generateRandomEvent } from './events';
import { Inventory } from './components/Inventory';
import { Enemy } from './types';
import { CombatState } from './types';
import { CombatScreen } from './components/CombatScreen';

interface InventoryItem {
  id: number;
  name: string;
  icon: string;
  quantity: number;
}

interface SpaceSystem {
  star: {
    x: number;
    y: number;
    radius: number;
  };
  planets: {
    radius: number;
    orbitRadius: number;
    angle: number;
    color: string;
  }[];
}

type ExplorationObject = '🛸 Станция' | '🏛️ Руины' | '🛸 Обломки' | '💎 Ресурсы' | '🌀 Аномалия' | '👾 Противники' | '❓ Неизвестное';

function generateSpaceSystem(mapSize: number): SpaceSystem {
  const starRadius = 20;
  const cellSize = mapSize / 10;
  const starX = cellSize * 5.5;
  const starY = cellSize * 5.5;

  const numPlanets = Math.floor(Math.random() * 5) + 1;
  const planets = [];
  for (let i = 0; i < numPlanets; i++) {
    const planetRadius = Math.random() * 10 + 5;
    const orbitRadius = Math.random() * (mapSize / 2 - planetRadius * 2) + planetRadius;
    const angle = Math.random() * 2 * Math.PI;
    const color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    planets.push({ radius: planetRadius, orbitRadius, angle, color });
  }

  return {
    star: { x: starX, y: starY, radius: starRadius },
    planets,
  };
}

function App() {
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: 1, name: 'Нанобинты', icon: '🩹', quantity: 3 },
    { id: 2, name: 'Энергоячейка', icon: '🔋', quantity: 2 },
    { id: 3, name: 'Ремкомплект', icon: '🔧', quantity: 1 },
    { id: 4, name: 'Топливный картридж', icon: '⛽', quantity: 1 }
  ]);
  const GRID_SIZE = 10;
  const [MAP_SIZE, setMapSize] = useState(600);
  const CELL_SIZE = MAP_SIZE / GRID_SIZE;
  const MARKER_SIZE = CELL_SIZE / 2;
  const MAP_SCALE = 1;

  useEffect(() => {
    const updateMapSize = () => {
      setMapSize(Math.min(window.innerWidth, window.innerHeight * 0.6));
    };
    
    updateMapSize();
    window.addEventListener('resize', updateMapSize);
    
    return () => window.removeEventListener('resize', updateMapSize);
  }, []);

  const [position, setPosition] = useState({ x: MARKER_SIZE / 2, y: MARKER_SIZE / 2 });
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set(['0,0']));
  const [questionCells, setQuestionCells] = useState<Set<string>>(new Set(['0,0']));
  const [resources, setResources] = useState({
    bullets: 100,
    fuel: 100,
    parts: 100,
    health: 100,
    energy: 100,
    money: 1000
  });
  const [messages, setMessages] = useState<string[]>([]);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [explorationDialog, setExplorationDialog] = useState<{
    visible: boolean;
    position: { x: number, y: number };
    object: ExplorationObject | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    object: null
  });
  const [combat, setCombat] = useState<CombatState>({
    isActive: false,
    enemy: null,
    playerTurn: true,
    combatLog: []
  });

  const moveMarker = (direction: string) => {
    const step = 5;
    
    if (resources.health <= 0) {
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

      const event = generateRandomEvent(startCombat);
      setMessages(prev => [`${event.text}`, ...prev].slice(0, 5));
      
      setResources(prev => ({
        ...prev,
        [event.effect.type]: Math.max(0, prev[event.effect.type as keyof typeof prev] + (event.effect.value as number))
      }));

      setResources(prev => {
        const newResources = {
          ...prev,
          fuel: Math.max(0, prev.fuel - 1),
          parts: Math.max(0, prev.parts - 1),
          energy: Math.max(0, prev.energy - 1)
        };

        let healthLoss = 0;
        if (newResources.fuel === 0) healthLoss += 1;
        if (newResources.parts === 0) healthLoss += 1;
        if (newResources.energy === 0) healthLoss += 1;

        // if (healthLoss > 0) {
        //   setMessages(prevMessages => [
        //     `Критическая нехватка ресурсов! (-${healthLoss} здоровья)`,
        //     ...prevMessages
        //   ].slice(0, 5));
        // }

        return {
          ...newResources,
          health: Math.max(0, prev.health - healthLoss)
        };
      });

      const cellX = Math.floor(newX / CELL_SIZE);
      const cellY = Math.floor(newY / CELL_SIZE);
      const cellKey = `${cellX},${cellY}`;
      
      if (!visitedCells.has(cellKey)) {
        setVisitedCells(prev => new Set([...prev, cellKey]));
        setQuestionCells(prev => new Set([...prev, cellKey]));
      }

      if (questionCells.has(cellKey)) {
        const objects: ExplorationObject[] = [
          '🛸 Станция', '🏛️ Руины', '🛸 Обломки', '💎 Ресурсы', 
          '🌀 Аномалия', '👾 Противники', '❓ Неизвестное'
        ];
        setExplorationDialog({
          visible: true,
          position: { x: cellX, y: cellY },
          object: objects[Math.floor(Math.random() * objects.length)]
        });
      }

      return { x: newX, y: newY };
    });
  };

  const handleUseItem = (item: InventoryItem) => {
    if (item.name === 'Нанобинты') {
      setResources(prev => ({
        ...prev,
        health: Math.min(100, prev.health + 30)
      }));
      setMessages(prev => [`Использованы нанобинты (+30 здоровья)`, ...prev].slice(0, 5));
    } else if (item.name === 'Энергоячейка') {
      setResources(prev => ({
        ...prev,
        energy: Math.min(100, prev.energy + 50)
      }));
      setMessages(prev => [`Активирована энергоячейка (+50 энергии)`, ...prev].slice(0, 5));
    } else if (item.name === 'Ремкомплект') {
      setResources(prev => ({
        ...prev,
        parts: Math.min(100, prev.parts + 40)
      }));
      setMessages(prev => [`Использован ремкомплект (+40 запчастей)`, ...prev].slice(0, 5));
    } else if (item.name === 'Топливный картридж') {
      setResources(prev => ({
        ...prev,
        fuel: Math.min(100, prev.fuel + 35)
      }));
      setMessages(prev => [`Установлен топливный картридж (+35 топлива)`, ...prev].slice(0, 5));
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

  const handleExplore = () => {
    const event = generateRandomEvent(startCombat);
    setMessages(prev => [`${event.text}`, ...prev].slice(0, 5));
    
    setResources(prev => ({
      ...prev,
      [event.effect.type]: Math.max(0, prev[event.effect.type as keyof typeof prev] + (event.effect.value as number))
    }));

    // Удаляем только маркер вопроса, оставляя клетку посещенной
    if (explorationDialog.position) {
      const cellKey = `${explorationDialog.position.x},${explorationDialog.position.y}`;
      setQuestionCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(cellKey);
        return newSet;
      });
    }

    setExplorationDialog(prev => ({ ...prev, visible: false }));
  };

  const handleDecline = () => {
    setExplorationDialog(prev => ({ ...prev, visible: false }));
  };

  // Функции для боевой системы
  const startCombat = (enemy: Enemy) => {
    setCombat({
      isActive: true,
      enemy,
      playerTurn: true,
      combatLog: [`Начался бой с ${enemy.name}!`]
    });
  };

  const handleAttack = () => {
    if (!combat.enemy || !combat.playerTurn) return;

    const damage = Math.floor(Math.random() * 20) + 10;
    const newEnemyHealth = Math.max(0, combat.enemy.health - damage);

    setResources(prev => ({
      ...prev,
      bullets: prev.bullets - 1
    }));

    setCombat(prev => ({
      ...prev,
      enemy: { ...prev.enemy!, health: newEnemyHealth },
      playerTurn: false,
      combatLog: [`Вы нанесли ${damage} урона!`, ...prev.combatLog]
    }));

    // Проверка победы
    if (newEnemyHealth <= 0) {
      const reward = Math.floor(Math.random() * 100) + 50;
      setResources(prev => ({
        ...prev,
        money: prev.money + reward
      }));
      setCombat(prev => ({
        ...prev,
        isActive: false,
        combatLog: [`Победа! Получено ${reward} монет`, ...prev.combatLog]
      }));
      return;
    }

    // Ход противника
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * combat.enemy!.damage);
      setResources(prev => ({
        ...prev,
        health: Math.max(0, prev.health - enemyDamage)
      }));
      setCombat(prev => ({
        ...prev,
        playerTurn: true,
        combatLog: [`${combat.enemy!.name} наносит ${enemyDamage} урона!`, ...prev.combatLog]
      }));
    }, 1000);
  };

  const handleHeal = () => {
    if (!combat.playerTurn) return;

    const healAmount = 30;
    setResources(prev => ({
      ...prev,
      health: Math.min(100, prev.health + healAmount)
    }));

    setCombat(prev => ({
      ...prev,
      playerTurn: false,
      combatLog: [`Вы восстановили ${healAmount} здоровья!`, ...prev.combatLog]
    }));

    // Ход противника
    setTimeout(() => {
      const enemyDamage = Math.floor(Math.random() * combat.enemy!.damage);
      setResources(prev => ({
        ...prev,
        health: Math.max(0, prev.health - enemyDamage)
      }));
      setCombat(prev => ({
        ...prev,
        playerTurn: true,
        combatLog: [`${combat.enemy!.name} наносит ${enemyDamage} урона!`, ...prev.combatLog]
      }));
    }, 1000);
  };

  const handleRetreat = () => {
    const healthPenalty = 20;
    setResources(prev => ({
      ...prev,
      health: Math.max(0, prev.health - healthPenalty)
    }));
    setCombat(prev => ({
      ...prev,
      isActive: false,
      combatLog: [`Вы отступили, получив ${healthPenalty} урона`, ...prev.combatLog]
    }));
  };

  if (resources.health <= 0) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden',
        position: 'relative'
      }}>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      gap: '5px'
    }}>
      <div style={{ 
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        border: '1px solid #ccc',
        borderRadius: '4px',
        position: 'relative',
      }}>
        <div style={{ 
          position: 'relative',
          width: `${MAP_SIZE}px`,
          height: `${MAP_SIZE}px`,
          transform: `scale(${MAP_SCALE})`,
          transformOrigin: '0 0',
        }}>
          <canvas
            ref={(canvasRef) => {
              if (canvasRef) {
                const ctx = canvasRef.getContext('2d');
                if (ctx) {
                  ctx.clearRect(0, 0, MAP_SIZE, MAP_SIZE);

                  ctx.fillStyle = 'black';
                  ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

                  const starX = CELL_SIZE * 5;
                  const starY = CELL_SIZE * 5;
                  const starRadius = CELL_SIZE * 0.4;

                  ctx.beginPath();
                  ctx.arc(starX, starY, starRadius, 0, 2 * Math.PI);
                  ctx.fillStyle = 'yellow';
                  ctx.fill();

                  const numPlanets = 3;
                  for (let i = 0; i < numPlanets; i++) {
                    const orbitRadius = CELL_SIZE * (1 + i);
                    const angle = (Date.now() / 20000 + i * (Math.PI / 2)) % (2 * Math.PI);
                    const planetX = starX + orbitRadius * Math.cos(angle);
                    const planetY = starY + orbitRadius * Math.sin(angle);
                    const planetRadius = CELL_SIZE * 0.2;

                    ctx.beginPath();
                    ctx.arc(planetX, planetY, planetRadius, 0, 2 * Math.PI);
                    ctx.fillStyle = `hsl(${i * 120}, 100%, 50%)`;
                    ctx.fill();
                  }
                }
              }
            }}
            width={MAP_SIZE}
            height={MAP_SIZE}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />

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
                  backgroundColor: visitedCells.has(cellKey) ? 'rgba(128, 128, 128, 0.3)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: `${CELL_SIZE * 0.3}px`,
                  color: 'white',
                }}
              >
                {questionCells.has(cellKey) && "❔"}
              </div>
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
            {/* анель ресурсов */}
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              fontSize: '0.6em',
              backgroundColor: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              <span>⛽ {resources.fuel}</span>
              <span>🔧 {resources.parts}</span>
              {/* патроны */}
              <span>🔫 {resources.bullets}</span>
              <span>❤️ {resources.health}</span>
              <span>⚡️ {resources.energy}</span>
              <span>🪙 {resources.money}</span>
            </div>

            {/* Кнопки движения */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1.2em',
                  border: '2px solid #666',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => moveMarker('up')}
              >↑</button>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1.2em',
                  border: '2px solid #666',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => moveMarker('left')}
              >←</button>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1.2em',
                  border: '2px solid #666',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => moveMarker('right')}
              >→</button>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1.2em',
                  border: '2px solid #666',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => moveMarker('down')}
              >↓</button>
              <button 
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '1.2em',
                  border: '2px solid #666',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }} 
                onClick={() => setInventoryOpen(true)}
              >🎒</button>
            </div>
          </div>
        </div>
      )}

      {/* Добавляем диалог исследования */}
      {explorationDialog.visible && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid white',
          color: 'white',
          zIndex: 1000,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '15px' }}>
            Обнаружен объект: {explorationDialog.object}
            <br />
            Исследовать?
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={handleExplore}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Да
            </button>
            <button
              onClick={handleDecline}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                border: 'none',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Нет
            </button>
          </div>
        </div>
      )}

      {combat.isActive && combat.enemy && (
        <CombatScreen
          enemy={combat.enemy}
          playerHealth={resources.health}
          playerMaxHealth={100}
          playerBullets={resources.bullets}
          onAttack={handleAttack}
          onHeal={handleHeal}
          onRetreat={handleRetreat}
          combatLog={combat.combatLog}
          playerTurn={combat.playerTurn}
        />
      )}
    </div>
  );
}

export default App; 