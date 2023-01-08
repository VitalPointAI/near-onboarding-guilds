import React from 'react';
import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import { AppProvider } from './state/app.js'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
	<AppProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
	</AppProvider>
)
