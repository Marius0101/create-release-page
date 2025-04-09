# :package: Changelog

v1.1.0 - New Features and Bug Fixes
 N/A

### :hammer_and_wrench: Fixed
- N/A

### :sparkles: Features
- N/A

### :wrench: Maintenance
- N/A

## v1.0.0 - Initial Release
:tada: First release of create-pull-request GitHub Action!\
This action automates the process of creating pull requests and offers customization through multiple input parameters.

### :sparkles: Features
- :white_check_mark: Automatically create pull requests from one branch to another.
- :bust_in_silhouette: Assign users to the pull request (up to 10).
- :eyes: Request reviews from:
    - Individual users.
    - GitHub teams.
### :gear: Inputs
- `token`: GitHub access token for authentication.
- `title`: Title of the pull request.
- `head`: Source branch.
- `base`: Target branch.
- `body`: Optional description (supports Markdown).
- `assignees`: List of usernames to assign.
- `user_reviewers`: Individual reviewers to request.
- `team_reviewers`: Team reviewers to request.

### :outbox_tray: Outputs
- `pr_number`: The number of the pull request that was created.