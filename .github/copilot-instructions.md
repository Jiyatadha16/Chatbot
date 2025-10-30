# AI Agent Instructions for Aesthetic To-Do App

## Project Overview
This is a visually appealing, client-side to-do application built with vanilla JavaScript, HTML, and CSS. The app features a modern, glassmorphic design with smooth animations and audio feedback.

## Key Architecture Patterns

### Component Structure
- **Single Page Application**: All functionality contained in `index.html`, `script.js`, and `style.css`
- **Local Storage**: Tasks persist using browser's localStorage API
- **Audio Integration**: Sound effects for task actions and background music

### UI/UX Design Principles
- **Glassmorphism**: Used throughout for modern, translucent UI elements
- **Animation-Rich**: Smooth transitions and effects for all user interactions
- **Responsive Design**: Adapts to different screen sizes with fluid layouts

## Critical Files and Their Purpose
- `index.html`: Core structure with minimal markup following semantic HTML principles
- `script.js`: Event handlers and task management logic
- `style.css`: Glassmorphic styles and animations (see detailed comments for design intentions)
- `sounds/`: Directory for audio assets:
  - `addTask.mp3`: Plays when adding new tasks
  - `completeTask.mp3`: Plays when marking tasks complete
  - `deleteTask.mp3`: Plays when removing tasks
  - `backgroundMusic.mp3`: Optional ambient background music

## Development Patterns

### State Management
```javascript
// State persists in localStorage
function saveData() {
    localStorage.setItem("data", listContainer.innerHTML);
}
```

### Animation Conventions
- Use CSS classes for state transitions (e.g., `checked`, `fade-out`)
- Standard animation duration: 0.3s for hovers, 0.5s for appearances, 0.7s for deletions
- All animations should use `ease` timing function for consistency

### CSS Architecture
- Mobile-first approach with fluid units
- CSS custom properties for theming (currently uses hardcoded values - area for improvement)
- Animation keyframes defined separately from their usage
- Detailed comments explaining design intentions

## Integration Points
1. **Audio System**: New sound effects should follow established pattern:
   ```javascript
   const newSound = new Audio('sounds/soundName.mp3');
   // Play on specific user action
   newSound.play();
   ```

2. **Local Storage**: Task data structure must match existing HTML format for compatibility with `saveData()` and `showTask()`

## Common Workflows
1. **Adding Features**:
   - Add HTML structure to `index.html`
   - Implement logic in `script.js`
   - Style in `style.css` following glassmorphic design pattern
   - Consider animation and sound feedback

2. **Testing**:
   - Test across different viewport sizes
   - Verify localStorage persistence
   - Check animation smoothness
   - Validate audio feedback timing

## Areas for Enhancement
1. Theme customization system
2. Task categories or tags
3. Due dates and reminders
4. Data export/import functionality
5. Accessibility improvements

## Known Conventions
- Button hover states use slightly lighter variants of base colors
- Glassmorphic elements use `rgba(255, 255, 255, 0.2)` as base
- Animation durations follow standardized timing scale
- All interactive elements have hover feedback