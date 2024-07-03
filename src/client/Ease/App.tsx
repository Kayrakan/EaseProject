import React from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import EaseApp from './components/EaseApp';
import PlatformPage from './PlatformPage.tsx';
import AdjustConnect from './components/Platforms/Adjust/AdjustConnect.tsx';
import { css, Global } from '@emotion/react';

const App: React.FC = () => {
    console.log('App component is rendering');
    return (
        <>
            <Global
                styles={css`
          body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
          }
        `}
            />
        <Router>
            <Routes>
                <Route path="/" element={<EaseApp />} />
                <Route path="/platform/:id" element={<PlatformPage />} />
                <Route path="/adjust-connect" element={<AdjustConnect />} />
            </Routes>
        </Router>
        </>

    );
};

export default App;
