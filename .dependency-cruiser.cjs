/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "backend-no-frontend",
      severity: "error",
      from: { path: "^backend/" },
      to: { path: "^frontend/" },
    },
    {
      name: "frontend-no-backend-direct",
      severity: "error",
      from: { path: "^frontend/" },
      to: { path: "^backend/", pathNot: "^backend/src/router/index" },
    },
    {
      name: "packages-no-app",
      severity: "error",
      from: { path: "^packages/" },
      to: { path: "^(backend|frontend)/" },
    },
    {
      name: "dto-depends-only-on-schema",
      severity: "error",
      from: { path: "^packages/dto/" },
      to: { path: "^packages/", pathNot: "^packages/(schema|dto)/" },
    },
    {
      name: "fsd-layer-direction",
      comment: "FSD: 上位レイヤーは下位レイヤーにのみ依存可能",
      severity: "error",
      from: { path: "^frontend/src/shared/" },
      to: {
        path: "^frontend/src/(entities|features|widgets|pages|app)/",
      },
    },
    {
      name: "fsd-entities-no-features",
      severity: "error",
      from: { path: "^frontend/src/entities/" },
      to: {
        path: "^frontend/src/(features|widgets|pages|app)/",
      },
    },
    {
      name: "fsd-features-no-widgets",
      severity: "error",
      from: { path: "^frontend/src/features/" },
      to: {
        path: "^frontend/src/(widgets|pages|app)/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
    cache: true,
  },
};
