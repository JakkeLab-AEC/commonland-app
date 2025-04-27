import { createRoot } from 'react-dom/client';
import HomeScreen from './rendererArea/homeScreen';
import { ProjectProvider } from './rendererArea/components/contexts/projectContext';

const root = createRoot(document.body);
root.render(
    <ProjectProvider>
        <HomeScreen />
    </ProjectProvider>
);
