import { createRoot } from 'react-dom/client';
import { BoringPreviewer } from './boringPreviewer';

document.body.innerHTML = '<div id="app"></div>';
const root = createRoot(document.getElementById('app'));
root.render(<BoringPreviewer boringName={'BH-01'} />);