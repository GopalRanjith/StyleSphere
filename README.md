# StyleSphere

StyleSphere is a full-stack dress shopping platform built with:
- **Frontend**: Angular SPA (Single Page Application)
- **Backend/API**: Node.js & Azure Functions
- **API Gateway**: Kong Gateway OSS
- **Analytics**: Power BI Desktop / Streamlit Dashboard
- **Data Layer**: Apache Camel & Databricks
- **AI Recommendation Engine**: scikit-learn, PyCaret, and Gemini API

## Repository Directory Layout

- `client/` - Frontend Angular SPA.
- `server/` - Backend Azure Functions API.
- `data/` - ML models, PyCaret scripts, Apache Camel routes, Databricks sync configs.
- `docs/` - Project documentation, architectural diagrams, API endpoints definition.

## Branch Strategy

- `main` - Stable, production-ready release branch.
- `dev` - Collaborative development branch.
- `feature/client` - Feature branch for frontend (Angular) development.
- `feature/server` - Feature branch for backend (Azure Functions) development.
