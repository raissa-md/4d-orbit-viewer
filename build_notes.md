# Build Notes

These notes document specific package version freezes and the reasons behind them, to ensure future maintainers understand the constraints of this project.

## Version Freezes and Reasons

- **Ant Design (antd) @4.24.16**  
  Frozen at version 4 to avoid breaking changes introduced in version 5.

- **React @18.3.1**  
  Frozen at version 18 to maintain compatibility with Antd v4.

- **Vite @5.4.10**  
  Frozen at version 5 for stability and compatibility with React 18 and Antd v4.

- **Three.js @0.151.0**  
  Frozen at version 0.151.0 because later versions (r152+) introduced a new linear color workflow and renamed properties that break current usage, particularly with the meshline library.

## Contact

For questions about this configuration, please contact:  
**Raissa Woodland**  
📧 raissa.woodland@nasa.gov
