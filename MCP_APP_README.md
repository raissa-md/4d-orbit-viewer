# MCP App Conversion - 4D Orbit Viewer

This document describes the conversion of the 4D Orbit Viewer into a hybrid web + MCP App.

## Overview

The 4D Orbit Viewer has been converted to support both standalone web deployment and MCP (Model Context Protocol) App mode. This allows the app to:

1. **Standalone Mode**: Continue working as a regular web application (existing functionality preserved)
2. **MCP App Mode**: Render inline within MCP-enabled hosts like Claude Desktop

## Architecture

### Hybrid Detection

The app detects its runtime environment using the origin check:
```javascript
const isMcpApp = window.location.origin === 'null'
```

- **Sandboxed iframe** (MCP mode): origin is `'null'`
- **Regular browser** (standalone mode): origin is the actual domain

### Build System

Two separate build configurations:

1. **Standalone Build** (`npm run build`)
   - Uses `vite.config.js`
   - Outputs to `dist/`
   - Regular multi-file build

2. **MCP App Build** (`npm run build:mcp`)
   - Uses `vite.config.mcp.js`
   - Outputs to `dist-mcp/`
   - Single-file HTML bundle using `vite-plugin-singlefile`
   - All assets inlined (CSS, JS, fonts)

### Key Files

#### Web App (4d-orbit-viewer/)

- **`mcp-app.html`**: MCP App entry point
- **`src/mcp-main.jsx`**: Hybrid initialization logic
- **`vite.config.mcp.js`**: MCP App build configuration
- **`dist-mcp/mcp-app.html`**: Bundled MCP App (8.7MB single file)

#### Python Server (sscmcp/)

- **`src/py/app/tools/orbitviewer.py`**: Updated with:
  - `get_4d_orbit_viewer_ui()` resource function
  - `show_4d_orbit_view()` MCP App tool
  - `get_4d_orbit_view()` backward-compatible URL tool

## MCP App Initialization

The `src/mcp-main.jsx` file handles hybrid initialization:

```javascript
// Create MCP App instance
const app = new App({
  name: '4D Orbit Viewer',
  version: '1.0.0'
})

// Register lifecycle handlers
app.ontoolinput = (input) => { /* Handle tool arguments */ }
app.ontoolresult = (result) => { /* Handle tool results */ }
app.onhostcontextchanged = (ctx) => { /* Apply host styling */ }
app.onteardown = async () => { /* Cleanup */ }

// Connect to host
await app.connect(new PostMessageTransport())
```

### Host Styling Integration

The app integrates with MCP host styling:
- Theme detection (light/dark)
- Host CSS variables
- Custom fonts
- Safe area insets

## Python Server Integration

### Resource Registration

```python
@mcp.resource(uri='ui://ssc/4d-orbit-viewer')
async def get_4d_orbit_viewer_ui() -> str:
    """Returns the bundled MCP App HTML"""
    return MCP_APP_HTML_PATH.read_text()
```

### Tool Registration

```python
@mcp.tool(
    name="show_4d_orbit_view",
    meta={
        "ui": {
            "resourceUri": "ui://ssc/4d-orbit-viewer",
            "connectDomains": ["sscweb.gsfc.nasa.gov"],
        }
    }
)
async def show_4d_orbit_view(observatories, start, end):
    """Displays the MCP App with structured content"""
    return {
        "content": [{"type": "text", "text": "..."}],
        "structuredContent": {
            "spacecraft": ";".join(observatories),
            "start": start_str,
            "stop": end_str,
            "observatories": observatories
        }
    }
```

## CSP Configuration

The MCP App requires Content Security Policy (CSP) domain declarations:

- **`connectDomains`**: `["sscweb.gsfc.nasa.gov"]`
  - Required for SSC API calls to fetch orbit data
  - Configured in the tool's `meta.ui.connectDomains`

All fonts are bundled via `@fontsource` packages, eliminating the need for `resourceDomains`.

## Data Flow

### Standalone Mode
```
Browser → URL params → App → SSC API → Orbit data → 3D visualization
```

### MCP Mode
```
MCP Host → Tool call → Python server → Tool result with structuredContent
         → MCP App initialization → App receives params → SSC API → Orbit data
         → 3D visualization rendered inline
```

## Parameters

### Tool Parameters

The `show_4d_orbit_view` tool accepts:

- **`observatories`**: List of spacecraft IDs (e.g., `['ace', 'wind']`)
- **`start`**: Start time (datetime object)
- **`end`**: End time (datetime object)

### Structured Content

Passed to the MCP App:

```javascript
{
  spacecraft: "ace;wind",      // Semicolon-separated
  start: "20240101T000000Z",   // ISO 8601 format
  stop: "20240102T000000Z",    // ISO 8601 format
  observatories: ["ace", "wind"] // Array format
}
```

## Building

### One-time Setup

```bash
npm install
```

### Build Commands

```bash
# Build standalone web app only
npm run build

# Build MCP App only
npm run build:mcp

# Build both
npm run build:all
```

### Build Output

- Standalone: `dist/` (~10MB multi-file)
- MCP App: `dist-mcp/mcp-app.html` (~8.7MB single file)

## Testing

### Standalone Mode

```bash
npm run build
npm run preview
# Open http://localhost:4173
```

### MCP Mode with basic-host

```bash
# Terminal 1: Build MCP App
cd /path/to/4d-orbit-viewer
npm run build:mcp

# Terminal 2: Start Python MCP server
cd /path/to/sscmcp/src/py
python -m app

# Terminal 3: Run basic-host (from MCP Apps SDK)
cd /tmp/mcp-ext-apps/examples/basic-host
npm install
SERVERS='["http://localhost:3001/mcp"]' npm run start
# Open http://localhost:8080
```

## Dependencies

### Added Dependencies

- **`@modelcontextprotocol/ext-apps`**: MCP Apps SDK for client-side initialization
- **`vite-plugin-singlefile`**: Bundles everything into a single HTML file

### Python Server

No new Python dependencies required. Uses existing `fastmcp` framework.

## Backward Compatibility

The original `get_4d_orbit_view()` tool is preserved for backward compatibility. It returns a URL string pointing to the standalone web app.

New MCP-enabled clients should use `show_4d_orbit_view()` for inline rendering.

## URL Parameter Parsing

The existing URL parameter parsing in standalone mode remains unchanged. Example URL:

```
http://localhost:4173/?spacecraft=ace;wind&start=20240101T000000Z&stop=20240102T000000Z
```

## Known Limitations

1. **File Size**: The MCP App bundle is 8.7MB due to Three.js, Ant Design, and all inlined assets
2. **Local Storage**: Not available in sandboxed MCP iframe - must use `structuredContent` for state
3. **Python SDK**: MCP Apps SDK is JavaScript-only; Python server manually implements resource/tool registration

## Future Enhancements

1. **App-only helper tools**: Add server-side tools for data fetching that UI can poll
2. **Streaming updates**: Use `ontoolinputpartial` for progress during LLM generation
3. **Fullscreen mode**: Add `requestDisplayMode()` support for fullscreen viewing
4. **State persistence**: Pass app state via `structuredContent` for session continuity

## File Structure

```
4d-orbit-viewer/
├── mcp-app.html              # MCP App entry point
├── vite.config.mcp.js        # MCP App build config
├── dist-mcp/
│   └── mcp-app.html          # Bundled MCP App (8.7MB)
├── src/
│   ├── mcp-main.jsx          # MCP App initialization
│   ├── main.jsx              # Standalone initialization (unchanged)
│   └── App.jsx               # Main app component (unchanged)
└── package.json              # Updated with build:mcp script

sscmcp/src/py/app/tools/
└── orbitviewer.py            # Updated with MCP App support
```

## References

- [MCP Apps SDK](https://github.com/modelcontextprotocol/ext-apps)
- [FastMCP Documentation](https://github.com/jlowin/fastmcp)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
