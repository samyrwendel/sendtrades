taskkill /F /IM node.exe
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "npm run server" -WindowStyle Normal
Start-Sleep -Seconds 2
Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal 