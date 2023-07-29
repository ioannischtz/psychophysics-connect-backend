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
- [ ] Experiment
- [ ] Response
- [ ] Stimulus
- [ ] PerceptualDimension
- [ ] PerceptualCoordinate (derive on client-side = Response at each dimension)
- [ ] PerceptualSpace (derive on client-side = Responses at each dimension for
      all stimuli of experiment session)

- [x] Potential change names from `stimuli` and `category` to
      `independent variable` and `dependent variable`. Need to study the
      relevant psychophysics literature and nomenclature.

## CONTROLLERS

## SERVICES

## TESTS
