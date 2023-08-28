## MIDDLEWARE

- [x] rateLimiter.ts
- [x] logger.ts
- [x] queryParser.ts
- [x] responseTime.ts
- [x] security.ts
- [x] session.ts
- [x] staticServe.ts

- [ ] remove `deepmerge-ts`, use same logic as `staticServe` for merging
      configs, where possible

## DB - MODELS

- [x] User
- [x] ExperimentSession
- [x] Experiment
- [x] MediaAsset
- [x] Response
- [x] Stimulus
- [x] PerceptualDimension
- [ ] PerceptualCoordinate (derive on client-side = Response at each dimension)
- [ ] PerceptualSpace (derive on client-side = Responses at each dimension for
      all stimuli of experiment session)

- [x] Potential change names from `stimuli` and `category` to
      `independent variable` and `dependent variable`. Need to study the
      relevant psychophysics literature and nomenclature.

## DB - DAOs

- [x] FIELDS constants: maybe return \_id as well? or is it returned
      automatically by default?

- [x] User
- [x] ExperimentSession
- [x] Experiment
- [x] MediaAsset
- [x] Response
- [x] Stimulus
- [x] PerceptualDimension

## CONTROLLERS

- [x]

## ROUTES

- [x] Users
- [x] Dashboard
- [x] Homepage

## SERVICES

- [x]

## TESTS

- [x] Unit tests for `experimentController`
- [x] Integration tests for `userRoutes`
- [x] Unit tests for `policies`
- [x] Unit tests for `generateShuffledIndexes` service
