import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App, PostMessageTransport, applyDocumentTheme, applyHostStyleVariables, applyHostFonts } from '@modelcontextprotocol/ext-apps'
import '@fontsource/sora/500.css'
import '@fontsource/sora/600.css'
import '@fontsource/sora/700.css'
import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/500.css'
import '@fontsource/source-sans-3/600.css'
import '@fontsource/source-sans-3/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './index.css'
import AppComponent from './App.jsx'

// Detect if we're running as an MCP App (sandboxed iframe with null origin)
const isMcpApp = window.location.origin === 'null'

async function initMcpApp() {
  const app = new App({
    name: '4D Orbit Viewer',
    version: '1.0.0'
  })

  // Store app parameters
  let appParams = {}

  // Register handlers BEFORE connect()
  app.ontoolinput = (input) => {
    console.log('MCP App: Received tool input', input)
    appParams = input.arguments || {}
    // Update the app with new parameters if needed
    if (window.updateOrbitViewerParams) {
      window.updateOrbitViewerParams(appParams)
    }
  }

  app.ontoolresult = (result) => {
    console.log('MCP App: Received tool result', result)
    if (result.structuredContent) {
      appParams = result.structuredContent
      if (window.updateOrbitViewerParams) {
        window.updateOrbitViewerParams(appParams)
      }
    }
  }

  app.onhostcontextchanged = (ctx) => {
    console.log('MCP App: Host context changed', ctx)
    if (ctx.theme) {
      applyDocumentTheme(ctx.theme)
    }
    if (ctx.styles?.variables) {
      applyHostStyleVariables(ctx.styles.variables)
    }
    if (ctx.styles?.css?.fonts) {
      applyHostFonts(ctx.styles.css.fonts)
    }
    if (ctx.safeAreaInsets) {
      const { top, right, bottom, left } = ctx.safeAreaInsets
      document.body.style.padding = `${top}px ${right}px ${bottom}px ${left}px`
    }
  }

  app.onteardown = async () => {
    console.log('MCP App: Teardown requested')
    return {}
  }

  await app.connect(new PostMessageTransport())

  // Store the app instance globally for potential use
  window.mcpApp = app

  return appParams
}

async function initStandaloneApp() {
  // Parse URL parameters for standalone mode
  const params = Object.fromEntries(new URL(location.href).searchParams)
  return params
}

async function main() {
  try {
    console.log('4D Orbit Viewer initializing...', { isMcpApp })

    const params = isMcpApp ? await initMcpApp() : await initStandaloneApp()

    // Store params globally so the app can access them
    window.orbitViewerParams = params
    window.isMcpApp = isMcpApp

    console.log('4D Orbit Viewer initialized with params:', params)

    // Render the React app
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <AppComponent />
      </StrictMode>,
    )
  } catch (error) {
    console.error('Failed to initialize 4D Orbit Viewer:', error)
  }
}

main().catch(console.error)
