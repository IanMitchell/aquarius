workflow "Lint" {
  on = "push"
  resolves = ["Lint"]
}

action "Install Dependencies" {
  uses = "Borales/actions-yarn@master"
  args = "install"
}

action "Lint" {
  uses = "hallee/eslint-action@master"
  secrets = ["GITHUB_TOKEN"]
  needs = ["Install Dependencies"]
}
