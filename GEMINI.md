# Project: Interactive Spanish Cheat Sheet

## Project Overview

This project is a single-page, front-end web application designed to be an interactive cheat sheet for Spanish verb tenses. It provides a visual and interactive way to study and reference verb conjugations. The interface consists of movable "cards," each representing a different tense (e.g., Presente, Indefinido, Futuro). Users can rearrange these cards on an infinite canvas, zoom in and out, and pan around to organize the information to their liking.

The application is built with plain HTML, CSS, and vanilla JavaScript, with the `interact.js` library providing the core drag-and-drop and gesture functionality. All user customizations, including card positions, zoom level, and the selected theme, are saved to the browser's `localStorage`, so the layout persists across sessions.

## Key Features

*   **Interactive Canvas:** Cards for each tense can be freely moved around.
*   **Pan and Zoom:** The entire canvas can be panned and zoomed, allowing for flexible organization of the cards.
*   **Persistent State:** Card positions, zoom/pan state, and the selected theme are saved in `localStorage`.
*   **Theming:** Includes multiple color themes (System, Light, Dark, Sakura, Mint, etc.) for user preference.
*   **Highlighting:** Hovering over a verb ending or an exception highlights corresponding forms across different tenses, helping to visualize connections.
*   **Responsive Design:** The layout is fluid and works on different screen sizes.

## Building and Running

This is a static web project with no build process.

*   **To run the project:** Simply open the `index.html` file in any modern web browser.
*   **To "build" or deploy:** Copy the `index.html`, `style.css`, and `script.js` files to any static web hosting service.

## Development Conventions

*   **Dependencies:** The only external dependency is `interact.js`, which is included via a CDN in `index.html`.
*   **State Management:** All application state (card positions, canvas transform, theme) is managed in the `script.js` file and persisted in `localStorage`. Keys for `localStorage` are prefixed with `spanishCheatsheet`.
*   **Styling:** The `style.css` file uses CSS variables for theming. Each theme is a class on the `<body>` element that overrides these variables.
*   **Interactivity:** All user interactions (dragging, panning, zooming, highlighting) are handled in `script.js`, primarily using the `interact.js` library and native browser events.
