# PetsCare Frontend (Angular)

Frontend Angular do sistema PetsCare — interface web para gerenciar pets, agendamentos e notificações. Este projeto é o front-end do backend disponível em: https://github.com/karineyasmin/petscare-microservices-dotnet

Links úteis no código
- Configuração e bootstrap: [src/main.ts](src/main.ts)
- Rotas da aplicação: [src/app/app.routes.ts](src/app/app.routes.ts)
- Configuração de providers: [`appConfig`](src/app/app.config.ts)
- Serviços principais:
  - [`PetService`](src/app/services/pet.service.ts)
  - [`AppointmentService`](src/app/services/appointment.service.ts)
  - [`PetsInfoService`](src/app/services/pets-info.service.ts)
- Componentes importantes:
  - [`PetRegistrationComponent`](src/app/components/pet-registration/pet-registration.component.ts)
  - [`PetListComponent`](src/app/components/pet-list/pet-list.component.ts)
  - [`PetDetailsDialog`](src/app/components/dialogs/pet-details/pet-details-dialog.component.ts)
  - [`NotificationFilterComponent`](src/app/components/notification-filter/notification-filter.component.ts)
- Arquivos de build / scripts:
  - [package.json](package.json)
  - [angular.json](angular.json)

Requisitos
- Node.js (v18+ recomendado)
- npm
- Angular CLI (opcional, para comandos ng)

Instalação e execução (desenvolvimento)
1. Instale dependências:
   ```sh
   npm install
   ```
2. Garanta que o backend esteja rodando. Repositório backend: https://github.com/karineyasmin/petscare-microservices-dotnet
   - Os serviços no frontend apontam para APIs em `http://localhost:5264` e `http://localhost:5000` conforme os serviços (ver [`PetService`](src/app/services/pet.service.ts) e [`AppointmentService`](src/app/services/appointment.service.ts)). Ajuste se necessário.
3. Inicie a aplicação:
   ```sh
   npm start
   ```
4. Abra http://localhost:4200

Build para produção
```sh
npm run build
```
Os artefatos serão gerados em `dist/`.


Configuração e variáveis
- URLs de API estão definidos nos serviços (`src/app/services/*.ts`) como `apiUrl`. Para alterar o endpoint do backend, edite os serviços correspondentes ou adicione um arquivo de ambiente conforme sua estratégia de deploy.

Estrutura principal
- src/app/components — componentes e diálogos (ex.: registro, lista e detalhes de pets)
- src/app/services — serviços HTTP para Pets, Agendamentos e Notificações
- src/app/models — tipos e interfaces (ex.: [src/app/models/notification.model.ts](src/app/models/notification.model.ts))
