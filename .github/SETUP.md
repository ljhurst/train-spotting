# GitHub Actions Deployment Setup

This guide explains how to configure GitHub Actions to deploy to AWS S3 using OIDC authentication (no long-lived credentials needed).

## Prerequisites

- AWS account with permissions to create IAM roles and policies
- GitHub repository with admin access
- Terraform already deployed (S3 bucket exists)

## Step 1: Create IAM OIDC Identity Provider

1. Go to AWS Console → IAM → Identity Providers
2. Click "Add provider"
3. Select "OpenID Connect"
4. Provider URL: `https://token.actions.githubusercontent.com`
5. Audience: `sts.amazonaws.com`
6. Click "Add provider"

## Step 2: Create IAM Policy for Deployment

Create a policy named `train-spotting-github-deploy-policy`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::lj-train-spotting",
        "arn:aws:s3:::lj-train-spotting/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "*"
    }
  ]
}
```

## Step 3: Create IAM Role for GitHub Actions

1. Go to IAM → Roles → Create role
2. Select "Web identity"
3. Identity provider: Select the OIDC provider created in Step 1
4. Audience: `sts.amazonaws.com`
5. GitHub organization: `ljhurst` (or your username)
6. GitHub repository: `train-spotting`
7. GitHub branch: `main`
8. Click "Next"
9. Attach the policy created in Step 2
10. Name the role: `train-spotting-github-actions-role`
11. Create the role

### Trust Policy Example

The role should have a trust policy like this:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:ljhurst/train-spotting:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

## Step 4: Add GitHub Secrets

1. Go to your GitHub repository
2. Settings → Secrets and variables → Actions
3. Add repository secret:
   - Name: `AWS_ROLE_ARN`
   - Value: `arn:aws:iam::YOUR_ACCOUNT_ID:role/train-spotting-github-actions-role`

4. (Optional) If using CloudFront:
   - Name: `CLOUDFRONT_DISTRIBUTION_ID`
   - Value: Your CloudFront distribution ID

## Step 5: Test the Workflow

1. Make a change to the `frontend/` directory
2. Commit and push to `main` branch
3. Go to Actions tab in GitHub to monitor the deployment
4. Verify files are updated in S3

## Troubleshooting

### "Not authorized to perform sts:AssumeRoleWithWebIdentity"

- Verify the OIDC provider is created correctly
- Check the trust policy includes the correct repository and branch
- Ensure the role ARN in GitHub secrets is correct

### "Access Denied" when syncing to S3

- Verify the IAM policy includes all necessary S3 permissions
- Check the bucket name matches in the policy
- Ensure the policy is attached to the role

### Workflow doesn't trigger

- Verify the workflow file is in `.github/workflows/` directory
- Check that you're pushing to the `main` branch
- Review the workflow syntax for errors

## Security Notes

- OIDC authentication is more secure than long-lived access keys
- The role can only be assumed by GitHub Actions from your specific repository
- Tokens are short-lived and automatically rotated
- No credentials are stored in GitHub (only the role ARN, which is not sensitive)
