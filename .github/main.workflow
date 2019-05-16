workflow "Lint" {
  on = "push"
  resolves = ["Eslint"]
}

workflow "PR Lint" {
  on = "pull_request"
  resolves = ["Eslint"]
}

action "Install" {
  uses = "Borales/actions-yarn@master"
  args = "install"
}

action "Eslint" {
  uses = "docker://rkusa/eslint-action:latest"
  secrets = ["GITHUB_TOKEN"]
  args = ""
  needs = ["Install"]
}
