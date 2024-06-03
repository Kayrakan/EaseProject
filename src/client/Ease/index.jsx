import ReactDOM from 'react-dom';
import React from 'react';
// import SheetEditor from './components/SheetEditor';
import './styles.css';
import App from './App';

const EaseStart = () => {
  return (
    <>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </>
  );
};

ReactDOM.render(<EaseStart />, document.getElementById('index'));

// const root = ReactDOM.createRoot(document.getElementById('index'));
// root.render(
//     <React.StrictMode>
//         <App />
//     </React.StrictMode>
// );