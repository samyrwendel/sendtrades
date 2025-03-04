#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Função para verificar se um processo está rodando
check_process() {
    pgrep -f "$1" >/dev/null
    return $?
}

# Função para instalar Homebrew
install_homebrew() {
    echo -e "${YELLOW}⚙️ Homebrew não encontrado. Instalando...${NC}"
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    # Adicionar Homebrew ao PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
    eval "$(/opt/homebrew/bin/brew shellenv)"
}

# Função para configurar o banco de dados
setup_database() {
    echo -e "${YELLOW}🗄️ Configurando banco de dados...${NC}"
    
    # Criar banco de dados se não existir
    if ! psql -lqt | cut -d \| -f 1 | grep -qw tradingbot; then
        echo -e "${YELLOW}📦 Criando banco de dados tradingbot...${NC}"
        createdb tradingbot
    fi
    
    # Criar usuário se não existir
    if ! psql -t -c '\du' | cut -d \| -f 1 | grep -qw postgres; then
        echo -e "${YELLOW}👤 Criando usuário postgres...${NC}"
        psql -d tradingbot -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
    fi
    
    # Executar migrações
    echo -e "${YELLOW}🔄 Executando migrações...${NC}"
    npm run db:migrate
    
    # Executar seed se necessário
    echo -e "${YELLOW}🌱 Executando seed...${NC}"
    npm run db:seed
}

# Função para iniciar serviços
start_services() {
    echo -e "${YELLOW}🚀 Iniciando serviços...${NC}"
    
    # Verificar se Homebrew está instalado
    if ! command -v brew &> /dev/null; then
        install_homebrew
    fi
    
    # Verificar se PostgreSQL está instalado
    if ! command -v postgres &> /dev/null; then
        echo -e "${YELLOW}⚙️ PostgreSQL não encontrado. Instalando...${NC}"
        brew install postgresql@14
    fi
    
    # Verificar se Redis está instalado
    if ! command -v redis-server &> /dev/null; then
        echo -e "${YELLOW}⚙️ Redis não encontrado. Instalando...${NC}"
        brew install redis
    fi
    
    # Iniciar PostgreSQL (se não estiver rodando)
    if ! check_process "postgres"; then
        echo -e "${YELLOW}🗄️ Iniciando PostgreSQL...${NC}"
        brew services start postgresql@14
        sleep 3
        
        # Configurar banco de dados após iniciar
        setup_database
    else
        echo -e "${GREEN}✅ PostgreSQL já está rodando${NC}"
    fi
    
    # Iniciar Redis (se não estiver rodando)
    if ! check_process "redis-server"; then
        echo -e "${YELLOW}📦 Iniciando Redis...${NC}"
        brew services start redis
        sleep 2
    else
        echo -e "${GREEN}✅ Redis já está rodando${NC}"
    fi
    
    # Iniciar servidor Node
    if ! check_process "node.*server.ts"; then
        echo -e "${YELLOW}🌐 Iniciando servidor Node...${NC}"
        npm run server &
        sleep 2
    else
        echo -e "${GREEN}✅ Servidor Node já está rodando${NC}"
    fi
    
    # Iniciar Vite (desenvolvimento)
    if ! check_process "vite"; then
        echo -e "${YELLOW}⚡ Iniciando Vite...${NC}"
        npm run dev &
        sleep 2
    else
        echo -e "${GREEN}✅ Vite já está rodando${NC}"
    fi
    
    echo -e "${GREEN}✨ Todos os serviços foram iniciados!${NC}"
}

# Função para parar serviços
stop_services() {
    echo -e "${YELLOW}🛑 Parando serviços...${NC}"
    
    # Parar Vite
    if check_process "vite"; then
        echo -e "${YELLOW}⚡ Parando Vite...${NC}"
        pkill -f "vite"
    fi
    
    # Parar servidor Node
    if check_process "node.*server.ts"; then
        echo -e "${YELLOW}🌐 Parando servidor Node...${NC}"
        pkill -f "node.*server.ts"
    fi
    
    # Parar Redis
    if check_process "redis-server"; then
        echo -e "${YELLOW}📦 Parando Redis...${NC}"
        brew services stop redis
    fi
    
    # Parar PostgreSQL
    if check_process "postgres"; then
        echo -e "${YELLOW}🗄️ Parando PostgreSQL...${NC}"
        brew services stop postgresql@14
    fi
    
    echo -e "${GREEN}✨ Todos os serviços foram parados!${NC}"
}

# Função para mostrar status dos serviços
status_services() {
    echo -e "${YELLOW}📊 Status dos serviços:${NC}"
    
    if check_process "postgres"; then
        echo -e "${GREEN}✅ PostgreSQL está rodando${NC}"
    else
        echo -e "${RED}❌ PostgreSQL não está rodando${NC}"
    fi
    
    if check_process "redis-server"; then
        echo -e "${GREEN}✅ Redis está rodando${NC}"
    else
        echo -e "${RED}❌ Redis não está rodando${NC}"
    fi
    
    if check_process "node.*server.ts"; then
        echo -e "${GREEN}✅ Servidor Node está rodando${NC}"
    else
        echo -e "${RED}❌ Servidor Node não está rodando${NC}"
    fi
    
    if check_process "vite"; then
        echo -e "${GREEN}✅ Vite está rodando${NC}"
    else
        echo -e "${RED}❌ Vite não está rodando${NC}"
    fi
}

# Verificar argumentos
case "$1" in
    "start")
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        stop_services
        sleep 2
        start_services
        ;;
    "status")
        status_services
        ;;
    *)
        echo -e "${YELLOW}Uso: $0 {start|stop|restart|status}${NC}"
        exit 1
        ;;
esac

exit 0 