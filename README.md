# train-spotting

[![Frontend](https://github.com/ljhurst/train-spotting/actions/workflows/frontend.yml/badge.svg)](https://github.com/ljhurst/train-spotting/actions/workflows/frontend.yml)

## Website

<http://lj-train-spotting.s3-website-us-east-1.amazonaws.com>

## Tour

```tree
.
├── frontend/  # <-- Static website files
├── infra/     # <-- Terraform infrastructure as code
├── LICENSE
└── README.md
```

## Deployment

### Automatic Deployment

Deployments are automated via GitHub Actions:

- **Push to main**: Automatically deploy the frontend to S3

For manual deployments (useful for local testing), see the sections below.

### Authentication

Local access uses AWS IAM Identity Center (SSO) rather than static access
keys. One-time setup:

```bash
aws configure sso --profile train-spotting-deploy
```

Then, whenever you need to run Terraform or the AWS CLI:

```bash
aws sso login --profile train-spotting-deploy
export AWS_PROFILE=train-spotting-deploy
```

GitHub Actions deploys use OIDC federation (no stored AWS credentials); the
`Frontend` workflow can also be triggered manually from the Actions tab.

### Infrastructure

Infrastructure is managed by [Terraform](https://www.terraform.io/).

Go to `infra/` and initialize Terraform:

```bash
cd infra/
terraform init
```

Review the planned changes:

```bash
terraform plan
```

Apply the changes:

```bash
terraform apply
```

When making changes to the infrastructure be sure to format and validate:

```bash
terraform fmt
terraform validate
```

### Frontend

Upload these files from the `frontend/` directory to the S3 bucket

- `assets/`
- `index.html`
- `script.js`
- `style.css`

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
