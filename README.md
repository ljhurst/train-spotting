# train-spotting

[![Deploy](https://github.com/ljhurst/train-spotting/actions/workflows/deploy.yml/badge.svg)](https://github.com/ljhurst/train-spotting/actions/workflows/deploy.yml)
[![Check](https://github.com/ljhurst/train-spotting/actions/workflows/check.yml/badge.svg)](https://github.com/ljhurst/train-spotting/actions/workflows/check.yml)

## Website

<https://train-spotting.bylukehurst.com>

Served over HTTPS through CloudFront from a private S3 bucket.

## Tour

```tree
.
├── frontend/  # <-- Static website files
├── infra/     # <-- Terraform infrastructure as code
├── LICENSE
└── README.md
```

## Deployment

Merging to `main` deploys both the infrastructure (`infra/`) and the site
(`frontend/`, synced to the bucket root with `--delete`) through
[stych](https://github.com/ljhurst/stych)'s shared workflows. GitHub Actions
authenticates with OIDC; no AWS credentials are stored in the repo.

Every pull request to `main` gets a comment with the Terraform plan and a
preview of the site sync (uploads and deletes), so review those before
merging. Applies run in the `prod` environment, which only `main` can deploy
to.

### Break-glass local deploys

Deploy locally only when CI can't. Local access uses AWS IAM Identity Center
(SSO) through the `train-spotting-deploy` profile:

```bash
aws configure sso --profile train-spotting-deploy  # one-time setup
aws sso login --profile train-spotting-deploy
export AWS_PROFILE=train-spotting-deploy

terraform -chdir=infra init
terraform -chdir=infra plan
terraform -chdir=infra apply
aws s3 sync frontend/ s3://lj-train-spotting/ --delete
```

## Development

### Code Conventions

Code conventions are enforced via [pre-commit](https://pre-commit.com/).
To install the git hooks run:

```bash
pre-commit install
```

Then make sure everything is working with

```bash
pre-commit run --all-files
```

## Tech Stack

- Vanilla JavaScript
- HTML
- CSS
- Styling via [Bulma](https://bulma.io/)
- Charts by [Chart.js](https://www.chartjs.org/)
- Hosting via [AWS S3](https://aws.amazon.com/s3/)
- Infrastructure as Code via [Terraform](https://www.terraform.io/)
