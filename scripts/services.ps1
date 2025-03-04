# Função para verificar se um processo está rodando
function Test-ProcessRunning {
    param (
        [string]$ProcessName
    )
    return Get-Process | Where-Object { $_.ProcessName -like "*$ProcessName*" }
}

# Função para parar serviços
function Stop-AllServices {
    Write-Host "🛑 Parando serviços..." -ForegroundColor Yellow
    
    # Parar todos os processos node
    if (Test-ProcessRunning "node") {
        Write-Host "⚡ Parando processos Node..." -ForegroundColor Yellow
        taskkill /F /IM node.exe 2>$null
    }
    
    Write-Host "✨ Todos os serviços foram parados!" -ForegroundColor Green
}

# Função para iniciar serviços
function Start-AllServices {
    Write-Host "🚀 Iniciando serviços..." -ForegroundColor Yellow
    
    # Iniciar servidor Node
    Write-Host "🌐 Iniciando servidor Node..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "npm run server" -WindowStyle Normal
    Start-Sleep -Seconds 2
    
    # Iniciar Vite
    Write-Host "⚡ Iniciando Vite..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "npm run dev" -WindowStyle Normal
    Start-Sleep -Seconds 2
    
    Write-Host "✨ Todos os serviços foram iniciados!" -ForegroundColor Green
}

# Função para mostrar status dos serviços
function Get-ServicesStatus {
    Write-Host "📊 Status dos serviços:" -ForegroundColor Yellow
    
    if (Test-ProcessRunning "node") {
        Write-Host "✅ Node está rodando" -ForegroundColor Green
    } else {
        Write-Host "❌ Node não está rodando" -ForegroundColor Red
    }
}

# Verificar argumentos
switch ($args[0]) {
    "start" {
        Start-AllServices
        break
    }
    "stop" {
        Stop-AllServices
        break
    }
    "restart" {
        Stop-AllServices
        Start-Sleep -Seconds 2
        Start-AllServices
        break
    }
    "status" {
        Get-ServicesStatus
        break
    }
    default {
        Write-Host "Uso: .\services.ps1 {start|stop|restart|status}" -ForegroundColor Yellow
        exit 1
    }
}

exit 0 