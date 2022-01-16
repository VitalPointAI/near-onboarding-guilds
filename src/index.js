import React from 'react';
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import { AppProvider } from './state/app.js'

ReactDOM.render(
	<AppProvider>
		<BrowserRouter>
			<App />
		</BrowserRouter>
	</AppProvider>,
	document.getElementById('root')
);
