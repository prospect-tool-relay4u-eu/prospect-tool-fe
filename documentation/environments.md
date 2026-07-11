# Environments

Angular's file-replacement mechanism (`angular.json` → `fileReplacements`) swaps `src/environments/environment.ts` for the right variant at build/serve time, based on the `--configuration` flag (see the root README's "Available scripts" table).

## Current values

| File | Configuration | `production` | `apiBase` | `authApiBase` |
|---|---|---|---|---|
| `environment.ts` | `development` (default) | `false` | `http://localhost:8080/api` | `http://localhost:8081/api` |
| `environment.sandbox.ts` | `sandbox` | `false` | `http://localhost:8080/api` | `http://localhost:8081/api` |
| `environment.staging.ts` | `staging` | `false` | `https://relay4u-be-staging-....run.app/api` | `https://relay4u-auth-be-staging-....run.app/api` |
| `environment.prod.ts` | `production` | `true` | `https://relay4u-be-prod-....run.app/api` | `https://relay4u-auth-be-prod-....run.app/api` |

## Note: staging/prod `authApiBase` values are predicted, not yet confirmed

`environment.staging.ts` and `environment.prod.ts` point at `relay4u-auth-be-staging`/`relay4u-auth-be-prod` (the Cloud Run service names declared in `relay4u-auth-service-be`'s deploy workflows), following the same GCP project (`942989865043`) and region (`europe-west1`) pattern as `apiBase`. These URLs haven't been confirmed against a real deploy yet — verify them after the first `relay4u-auth-service-be` staging/prod deployment and correct if the actual Cloud Run URL differs.
