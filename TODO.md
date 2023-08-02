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

!! - [ ] when returning a Promise, see if you have to await on the return

- [ ] FIELDS constants: maybe return \_id as well? or is it returned
      automatically by default?

- [ ] User
- [ ] ExperimentSession
- [ ] Experiment
- [ ] MediaAsset
- [ ] Response
- [ ] Stimulus
- [ ] PerceptualDimension

## CONTROLLERS

## ROUTES

- [x] Users
- [ ] Dashboard
- [ ] ExperimentSession
- [ ] MediaAssets

## SERVICES

## TESTS
