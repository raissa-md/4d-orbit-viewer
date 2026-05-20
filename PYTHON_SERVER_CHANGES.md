# Python Server Changes for MCP App Support

The following changes need to be applied to the Python MCP server in `../sscmcp/`.

## File: `src/py/app/tools/orbitviewer.py`

The complete updated file is located at:
`/Users/btharris/Projects/Spdf/sscmcp/src/py/app/tools/orbitviewer.py`

### Summary of Changes

1. **Added imports**:
   ```python
   from pathlib import Path
   ```

2. **Added constants**:
   ```python
   # Path to the bundled MCP App HTML file
   MCP_APP_HTML_PATH = Path(__file__).parent.parent.parent.parent.parent.parent / '4d-orbit-viewer' / 'dist-mcp' / 'mcp-app.html'
   MCP_APP_RESOURCE_URI = 'ui://ssc/4d-orbit-viewer'
   ```

3. **Added resource function**:
   ```python
   @mcp.resource(uri=MCP_APP_RESOURCE_URI)
   async def get_4d_orbit_viewer_ui() -> str:
       """
       Returns the 4D Orbit Viewer MCP App HTML.
       """
       if not MCP_APP_HTML_PATH.exists():
           logger.error('MCP App HTML not found at: %s', MCP_APP_HTML_PATH)
           raise ToolError(f'4D Orbit Viewer MCP App not built. Please run: cd ../4d-orbit-viewer && npm run build:mcp')

       logger.debug('Loading MCP App HTML from: %s', MCP_APP_HTML_PATH)
       return MCP_APP_HTML_PATH.read_text()
   ```

4. **Added new MCP App tool**:
   ```python
   @mcp.tool(
       name="show_4d_orbit_view",
       description="Displays an interactive 3D/4D orbit viewer showing spacecraft "
           "trajectories in space and time. This viewer allows you to explore "
           "the spacecraft's path, rotate the view, zoom, and animate the "
           "satellite's movement along its trajectory. The app renders inline "
           "within the conversation.",
       meta={
           "version": __version__,
           "author": "Bernie Harris",
           "ui": {
               "resourceUri": MCP_APP_RESOURCE_URI,
               "connectDomains": ["sscweb.gsfc.nasa.gov"],
           }
       }
   )
   async def show_4d_orbit_view(
       observatories: Annotated[List[str], ...],
       start: Annotated[datetime, ...],
       end: Annotated[datetime, ...],
   ):
       """Displays an interactive 4D orbit viewer application"""

       if start > end:
           raise ToolError('start time must be less than end time')

       start_str = start.strftime(MIN_ISO8601_FORMAT)
       end_str = end.strftime(MIN_ISO8601_FORMAT)

       # Fallback URL for non-MCP clients
       url = (
           f'https://sscweb.gsfc.nasa.gov/4dorbit/?'
           f'start={start_str}&stop={end_str}&'
           f'spacecraft={";".join(observatories)}'
       )

       logger.debug('show_4d_orbit_view: observatories=%s, start=%s, end=%s',
                    observatories, start_str, end_str)

       # Return both text content (fallback) and structured content (for MCP App)
       return {
           "content": [
               {
                   "type": "text",
                   "text": f"Displaying 4D orbit viewer for spacecraft: {', '.join(observatories)}\n"
                           f"Time range: {start_str} to {end_str}\n"
                           f"Fallback URL: {url}"
               }
           ],
           "structuredContent": {
               "spacecraft": ";".join(observatories),
               "start": start_str,
               "stop": end_str,
               "observatories": observatories
           }
       }
   ```

5. **Updated existing tool description**:
   The `get_4d_orbit_view` function description was updated to mention using `show_4d_orbit_view` for inline rendering.

## Applying the Changes

### Option 1: Copy the entire file
```bash
cd /Users/btharris/Projects/Spdf/sscmcp
# Backup the original
cp src/py/app/tools/orbitviewer.py src/py/app/tools/orbitviewer.py.backup

# The file has already been updated in place
# Verify the changes:
hg diff src/py/app/tools/orbitviewer.py
```

### Option 2: Mercurial commit
```bash
cd /Users/btharris/Projects/Spdf/sscmcp

# Add the modified file
hg add src/py/app/tools/orbitviewer.py

# Commit with a descriptive message
hg commit -m "Add MCP App support to 4D Orbit Viewer tool

- Add resource registration for ui://ssc/4d-orbit-viewer
- Add show_4d_orbit_view() tool for inline MCP App rendering
- Configure CSP connectDomains for sscweb.gsfc.nasa.gov
- Return structured content with spacecraft, start/stop parameters
- Maintain backward compatibility with get_4d_orbit_view()
- Add path resolution for bundled MCP App HTML"
```

## Testing the Changes

1. **Build the MCP App** (if not already done):
   ```bash
   cd /Users/btharris/Projects/Spdf/4d-orbit-viewer
   npm run build:mcp
   ```

2. **Verify the build**:
   ```bash
   ls -lh /Users/btharris/Projects/Spdf/4d-orbit-viewer/dist-mcp/mcp-app.html
   # Should show ~8.7MB file
   ```

3. **Test the Python server**:
   ```bash
   cd /Users/btharris/Projects/Spdf/sscmcp/src/py
   python -m app
   ```

4. **Test with MCP client**:
   - Use Claude Desktop or another MCP-enabled client
   - Call `show_4d_orbit_view` with sample parameters
   - Verify the inline viewer renders correctly

## Verification Checklist

- [ ] `orbitviewer.py` has been updated with all changes
- [ ] MCP App has been built (`dist-mcp/mcp-app.html` exists)
- [ ] Path to MCP App HTML is correct (`MCP_APP_HTML_PATH`)
- [ ] Python server starts without errors
- [ ] Resource `ui://ssc/4d-orbit-viewer` is registered
- [ ] Tool `show_4d_orbit_view` is available
- [ ] Tool `get_4d_orbit_view` still works (backward compatibility)
- [ ] MCP App renders inline in MCP-enabled clients

## Troubleshooting

### Error: "MCP App HTML not found"
- Build the MCP App: `cd ../4d-orbit-viewer && npm run build:mcp`
- Verify path: Check that `MCP_APP_HTML_PATH` points to the correct location

### Error: "CSP violation" in browser console
- Verify `connectDomains` includes `sscweb.gsfc.nasa.gov`
- Check that the SSC API endpoint is accessible

### MCP App doesn't render
- Check browser console for errors
- Verify the HTML file is being served correctly
- Confirm the resource URI matches in both tool and resource registration

## Dependencies

No new Python dependencies are required. The changes use:
- `fastmcp` (existing)
- `pathlib` (Python standard library)

The web app requires new npm packages (already installed in the 4d-orbit-viewer directory):
- `@modelcontextprotocol/ext-apps`
- `vite-plugin-singlefile`
