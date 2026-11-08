@echo off
setlocal
cd /d "%~dp0"
set "SF_NEIGHBOR_NODE="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined SF_NEIGHBOR_NODE set "SF_NEIGHBOR_NODE=%%N"
if not defined SF_NEIGHBOR_NODE if exist "tools\local-node.txt" for /f "usebackq delims=" %%N in ("tools\local-node.txt") do if exist "%%N" set "SF_NEIGHBOR_NODE=%%N"
if not defined SF_NEIGHBOR_NODE for /d %%D in ("%ProgramFiles%\WindowsApps\OpenAI.CodexPrimaryRuntime.*") do if exist "%%D\dependencies\node\bin\node.exe" set "SF_NEIGHBOR_NODE=%%D\dependencies\node\bin\node.exe"
if not defined SF_NEIGHBOR_NODE (
  echo Node.js was not found. Install Node.js from https://nodejs.org or open index.html for the resource list.
  pause
  exit /b 1
)
echo Opening SF Neighbor at http://127.0.0.1:4173
echo Keep this window open while using the preview. Press Ctrl+C to stop.
start "" "http://127.0.0.1:4173"
"%SF_NEIGHBOR_NODE%" tools\serve.cjs
pause
