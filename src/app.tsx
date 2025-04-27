import { createRoot } from 'react-dom/client';
import HomeScreen from './rendererArea/homeScreen';
import { ProjectProvider } from './rendererArea/components/contexts/projectContext';
import React from 'react';

const root = createRoot(document.body);
root.render(
    <React.StrictMode>
        <ProjectProvider>
            <HomeScreen />
        </ProjectProvider>
    </React.StrictMode>
);
