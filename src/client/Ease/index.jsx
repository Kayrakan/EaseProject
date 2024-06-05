// import ReactDOM from 'react-dom';
// import React from 'react';
// // import SheetEditor from './components/SheetEditor';
// import './styles.css';
// import App from './App';
//
// const EaseStart = () => {
//   return (
//     <>
//         <React.StrictMode>
//             <App />
//         </React.StrictMode>
//     </>
//   );
// };
//
// ReactDOM.render(<EaseStart />, document.getElementById('index'));

// const root = ReactDOM.createRoot(document.getElementById('index'));
// root.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// );

////////////////////////////////

import { createRoot } from 'react-dom/client';
import React from 'react';
import './styles.css';
import App from './App';

const EaseStart = () => {
    return (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

// Use the new createRoot API
const container = document.getElementById('index');
const root = createRoot(container);
root.render(<EaseStart />);
