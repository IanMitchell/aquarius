workflow "Lint" {
  on = "push"
  resolves = ["ESLint"]
}

action "Install Dependencies" {
  uses = "Borales/actions-yarn@master"
  args = "install"
}

action "ESLint" {
  uses = "hallee/eslint-action@master"
  secrets = ["GITHUB_TOKEN"]
  needs = ["Install Dependencies"]
}
