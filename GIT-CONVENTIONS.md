## BRANCHES

- `main`: The main, production-ready branch
- `develop`: The development/integration branch
- `feature`: e.g. -> `feature/user-authentication`, `feature/pagination`
- `release`: A pre-release branch for versioning and final testing

### Flow

- create new `feature` branch from `develop`
- work on the `feature` branch
- regularly pull from remote `develop` branch
- when `feature` is ready, push to GitHub and open a Pull-Request
- after the PR is approved, merge the `feature` branch to `develop`
- when `develop` is ready, create new `release/x.x.x` branch from `develop`
- update the version numbers (in package.json)
- test the `release` branch
- merge the `release/x.x.x` branch into `main`
- create a tag for the release: 'git tag -a v1.0.0 -m "Version 1.0.0"'
- push `main` and update the remote ('git push origin main --tags')
- (Optional) merge `release` into `develop`

## COMMIT MESSAGE CONVENTIONS

- `feat:`: for new features | Example: - `feat: Add user authentication`
- `fix:`: for bug-fixes | Example: - `fix: Resolve database query bug`
- `docs:`: for documentation | Example: - `docs: Update API documentation`
- `chore:`: for build and tooling changes | Example: -
  `chore: Update .gitignore`
- `test:`: for tests | Example: - `test: Add unit tests for user service`
- `refactor:`: for code refactoring | Example: -
  `refactor: Use consistent variable naming conventions`
